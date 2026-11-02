import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import DidAvatar from "../components/DidAvatar";
import "../index.css";
import "./AvatarChat.css";

function AvatarChat() {
  const [language, setLanguage] = useState("en");
  const [activeTab, setActiveTab] = useState("interactive"); // "interactive" or "did-stream"
  const [inputMessage, setInputMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am Dr. Amy, your AI Doctor Avatar. You can ask me any medical questions, and I will speak with you directly!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const translations = {
    en: {
      title: "AI Doctor Avatar Consultation",
      subtitle: "Interactive consultation with animated AI doctor avatar and speech synthesis",
      backToDashboard: "Back to Dashboard",
      interactiveTab: "👩‍⚕️ Interactive AI Doctor",
      streamTab: "📹 D-ID Video Stream",
      inputPlaceholder: "Ask Dr. Amy about symptoms, medicines, or health advice...",
      send: "Send",
      speaking: "Speaking...",
      ready: "Ready",
      mute: "Mute Voice",
      unmute: "Enable Voice",
      suggestions: [
        "What are the early signs of fever and flu?",
        "I have a throbbing headache, what should I do?",
        "How can I improve my sleep and reduce anxiety?",
        "What home remedies help for sore throat?"
      ]
    },
    hi: {
      title: "AI डॉक्टर अवतार परामर्श",
      subtitle: "एनिमेटेड AI डॉक्टर अवतार और आवाज के साथ इंटरैक्टिव परामर्श",
      backToDashboard: "डैशबोर्ड पर वापस जाएं",
      interactiveTab: "👩‍⚕️ इंटरैक्टिव AI डॉक्टर",
      streamTab: "📹 D-ID वीडियो स्ट्रीम",
      inputPlaceholder: "डॉ. एमी से लक्षणों, दवाओं या स्वास्थ्य सलाह के बारे में पूछें...",
      send: "भेजें",
      speaking: "बोल रहे हैं...",
      ready: "तैयार",
      mute: "आवाज बंद करें",
      unmute: "आवाज चालू करें",
      suggestions: [
        "बुखार और फ्लू के शुरुआती लक्षण क्या हैं?",
        "मुझे तेज सिरदर्द है, मुझे क्या करना चाहिए?",
        "नींद सुधारने के उपाय क्या हैं?",
        "गले में खराश के घरेलू नुस्खे क्या हैं?"
      ]
    },
    mr: {
      title: "AI डॉक्टर अवतार सल्लागार",
      subtitle: "अ‍ॅनिमेटेड AI डॉक्टर अवतार आणि आवाजासह संवाद",
      backToDashboard: "डॅशबोर्डवर परत जा",
      interactiveTab: "👩‍⚕️ इंटरॅक्टिव्ह AI डॉक्टर",
      streamTab: "📹 D-ID व्हिडिओ स्ट्रीम",
      inputPlaceholder: "लक्षणे, औषधे किंवा आरोग्याबद्दल विचारा...",
      send: "पाठवा",
      speaking: "बोलत आहे...",
      ready: "तयार",
      mute: "आवाज बंद",
      unmute: "आवाज सुरू",
      suggestions: [
        "तापाची सुरुवातीची लक्षणे कोणती?",
        "मला तीव्र डोकेदुखी आहे, काय करावे?",
        "शांत झोप येण्यासाठी काय करावे?",
        "घसा खवखवण्यावर घरगुती उपाय काय आहेत?"
      ]
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSpeaking]);

  const speakText = async (text) => {
    if (!audioEnabled || !text) return;
    try {
      setIsSpeaking(true);
      setCurrentSpeakingText(text);

      const res = await fetch("http://localhost:5051/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language })
      });
      const data = await res.json();

      if (data.audioContent) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          setCurrentSpeakingText("");
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setCurrentSpeakingText("");
        };
        audio.play().catch(e => {
          console.log("Audio autoplay prevented by browser policy, using speech synthesis:", e);
          try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();
            const cleanText = text
              .replace(/[*#`_~•\n\r]/g, ' ')
              .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
              .replace(/\s+/g, ' ')
              .trim();
            const utterance = new SpeechSynthesisUtterance(cleanText);
            const langMap = { en: "en-US", hi: "hi-IN", mr: "mr-IN" };
            utterance.lang = langMap[language] || "en-US";
            utterance.onend = () => {
              setIsSpeaking(false);
              setCurrentSpeakingText("");
            };
            utterance.onerror = () => {
              setIsSpeaking(false);
              setCurrentSpeakingText("");
            };
            window.speechSynthesis.speak(utterance);
          } catch (_) {
            setIsSpeaking(false);
            setCurrentSpeakingText("");
          }
        });
      } else {
        setTimeout(() => {
          setIsSpeaking(false);
          setCurrentSpeakingText("");
        }, 3000);
      }
    } catch (err) {
      console.warn("TTS synthesis error:", err.message);
      setTimeout(() => {
        setIsSpeaking(false);
        setCurrentSpeakingText("");
      }, 3000);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentSpeakingText("");
  };

  const startListening = () => {
    stopAudio();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognition();
      const langMap = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };
      recognition.lang = langMap[language] || "en-IN";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInputMessage(transcript);
        }
      };

      recognition.onerror = (e) => {
        console.warn("Avatar speech recognition notice:", e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Could not start speech recognition:", e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5051/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, language })
      });

      const data = await response.json();
      const replyText = data.reply || data.response || "I have received your medical inquiry. Please ensure to rest and drink plenty of fluids.";

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      speakText(replyText);
    } catch (error) {
      console.error("Avatar chat error:", error);
      const fallbackReply = "I understand your concern. Please rest and stay hydrated. If your symptoms persist or worsen, please consult a certified physician.";
      const errorMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: fallbackReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      speakText(fallbackReply);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="avatar-chat-container">
      {/* Header */}
      <div className="avatar-chat-header">
        <div className="header-left">
          <Link to="/dashboard" className="back-button">
            ← {t.backToDashboard}
          </Link>
          <h1>🩺 {t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        <div className="header-right">
          <div className="tab-pill-group" style={{ display: "flex", gap: "8px", background: "#f1f5f9", padding: "4px", borderRadius: "10px" }}>
            <button
              onClick={() => setActiveTab("interactive")}
              style={{
                padding: "8px 14px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                background: activeTab === "interactive" ? "#667eea" : "transparent",
                color: activeTab === "interactive" ? "#ffffff" : "#475569",
                transition: "all 0.2s"
              }}
            >
              {t.interactiveTab}
            </button>
            <button
              onClick={() => setActiveTab("did-stream")}
              style={{
                padding: "8px 14px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                background: activeTab === "did-stream" ? "#667eea" : "transparent",
                color: activeTab === "did-stream" ? "#ffffff" : "#475569",
                transition: "all 0.2s"
              }}
            >
              {t.streamTab}
            </button>
          </div>
          <div className="language-selector">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">🇺🇸 English</option>
              <option value="hi">🇮🇳 Hindi</option>
              <option value="mr">🇮🇳 Marathi</option>
            </select>
          </div>
        </div>
      </div>

      {activeTab === "interactive" ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          gap: "20px",
          height: "calc(100vh - 160px)",
          minHeight: "560px"
        }}>
          {/* Left: Avatar Column */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                background: isSpeaking ? "#ecfdf5" : "#eff6ff",
                color: isSpeaking ? "#059669" : "#3b82f6",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isSpeaking ? "#10b981" : "#3b82f6",
                  animation: isSpeaking ? "pulse 1.2s infinite" : "none"
                }}></span>
                {isSpeaking ? t.speaking : t.ready}
              </span>

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                style={{
                  background: "transparent",
                  border: "1px solid #e2e8f0",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  color: "#475569"
                }}
              >
                {audioEnabled ? `🔊 ${t.mute}` : `🔇 ${t.unmute}`}
              </button>
            </div>

            <div style={{ margin: "20px 0", textAlign: "center", width: "100%" }}>
              <DidAvatar
                text={currentSpeakingText}
                isSpeaking={isSpeaking}
                onSpeakComplete={() => setIsSpeaking(false)}
              />
              <h3 style={{ margin: "15px 0 4px", color: "#1e293b", fontSize: "1.2rem" }}>Dr. Amy, MD</h3>
              <p style={{ margin: "0", color: "#64748b", fontSize: "0.9rem" }}>AI Chief Medical Officer</p>
            </div>

            <div style={{ width: "100%", background: "#f8fafc", padding: "12px", borderRadius: "12px", fontSize: "0.85rem", color: "#64748b" }}>
              💡 <strong>Tip:</strong> Dr. Amy speaks aloud with real-time lip synchronization. Try asking any medical question!
            </div>
          </div>

          {/* Right: Conversation & Input Column */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden"
          }}>
            {/* Messages list */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                    alignItems: "flex-end",
                    gap: "8px"
                  }}
                >
                  {msg.sender === "ai" && (
                    <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>👩‍⚕️</div>
                  )}
                  <div style={{
                    maxWidth: "75%",
                    padding: "12px 16px",
                    borderRadius: msg.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: msg.sender === "user" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#f1f5f9",
                    color: msg.sender === "user" ? "#ffffff" : "#1e293b",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    lineHeight: "1.5"
                  }}>
                    <p style={{ margin: "0", fontSize: "0.95rem" }}>{msg.text}</p>
                    <span style={{
                      display: "block",
                      fontSize: "0.75rem",
                      color: msg.sender === "user" ? "rgba(255,255,255,0.7)" : "#94a3b8",
                      marginTop: "4px",
                      textAlign: "right"
                    }}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "0.9rem" }}>
                  <span>👩‍⚕️ Dr. Amy is formulating clinical guidance...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div style={{ margin: "14px 0 10px", display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
              {t.suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug)}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    color: "#475569",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = "#667eea"; e.currentTarget.style.color = "#667eea"; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
                >
                  💬 {sug}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t.inputPlaceholder}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  borderRadius: "14px",
                  border: "2px solid #e2e8f0",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
              {/* Mic Speech Button */}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                title={isListening ? "Stop listening" : "Click to speak your symptoms"}
                style={{
                  padding: "14px 18px",
                  background: isListening ? "#ef4444" : "rgba(102, 126, 234, 0.12)",
                  color: isListening ? "#ffffff" : "#667eea",
                  border: isListening ? "2px solid #dc2626" : "2px solid rgba(102, 126, 234, 0.3)",
                  borderRadius: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {isListening ? "🛑" : "🎤"}
              </button>

              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                style={{
                  padding: "14px 24px",
                  background: loading || !inputMessage.trim() ? "#cbd5e1" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "14px",
                  fontWeight: "600",
                  cursor: loading || !inputMessage.trim() ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {loading ? "..." : `${t.send} →`}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* D-ID Streaming Interface */
        <div className="did-interface-wrapper" style={{ position: "relative" }}>
          <iframe
            key={language}
            src={`http://localhost:5051/did-streaming/index.html?lang=${language}&v=2.2.1`}
            title="D-ID Avatar Chat"
            className="did-iframe"
            allow="camera; microphone; autoplay"
          />
        </div>
      )}
    </div>
  );
}

export default AvatarChat;
