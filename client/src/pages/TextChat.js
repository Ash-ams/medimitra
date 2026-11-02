// pages/TextChat.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, addDoc, query, orderBy, where, getDocs, serverTimestamp } from "firebase/firestore";
import "../index.css";
import jsPDF from "jspdf";

function TextChat() {
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const chatRef = useRef();
  const navigate = useNavigate();

  // Translation dictionary for UI elements
  const translations = {
    en: {
      placeholder: "Describe your symptoms or ask a medical question...",
      send: "Send",
      newChat: "New Chat",
      chatHistory: "Chat History",
      clearChat: "Clear Chat",
      logout: "Logout",
      loading: "AI Doctor is thinking...",
      error: "Error connecting to AI Doctor. Please try again.",
      welcomeTitle: "Hello! I'm your AI Doctor",
      welcomeSubtitle: "I'm here to help you with your health concerns. Please describe your symptoms or ask any medical questions.",
      suggestion1: "I have a headache",
      suggestion2: "What are the symptoms of fever?",
      suggestion3: "How to treat a cold?",
      quickQuestion1: "⏰ Medication Duration",
      quickQuestion2: "🏥 When to See Doctor",
      quickQuestion3: "⚠️ Side Effects",
      quickQuestion4: "ℹ️ More Info",
      typingIndicator: "AI Doctor is typing...",
      switchToVoice: "🎤 Switch to Voice"
    },
    hi: {
      placeholder: "अपने लक्षण बताएं या कोई चिकित्सीय प्रश्न पूछें...",
      send: "भेजें",
      newChat: "नई चैट",
      chatHistory: "चैट इतिहास",
      clearChat: "चैट साफ़ करें",
      logout: "लॉगआउट",
      loading: "AI डॉक्टर सोच रहे हैं...",
      error: "AI डॉक्टर से कनेक्ट करने में त्रुटि। कृपया पुनः प्रयास करें।",
      welcomeTitle: "नमस्ते! मैं आपका AI डॉक्टर हूं",
      welcomeSubtitle: "मैं आपकी स्वास्थ्य संबंधी चिंताओं में मदद करने के लिए यहां हूं। कृपया अपने लक्षण बताएं या कोई चिकित्सीय प्रश्न पूछें।",
      suggestion1: "मुझे सिरदर्द है",
      suggestion2: "बुखार के लक्षण क्या हैं?",
      suggestion3: "सर्दी का इलाज कैसे करें?",
      quickQuestion1: "⏰ दवा की अवधि",
      quickQuestion2: "🏥 डॉक्टर से कब मिलें",
      quickQuestion3: "⚠️ साइड इफेक्ट्स",
      quickQuestion4: "ℹ️ अधिक माहिती",
      typingIndicator: "AI डॉक्टर टाइप कर रहे हैं...",
      switchToVoice: "🎤 आवाज पर स्विच करें"
    },
    mr: {
      placeholder: "तुमचे लक्षण सांगा किंवा कोणताही वैद्यकीय प्रश्न विचारा...",
      send: "पाठवा",
      newChat: "नवीन चॅट",
      chatHistory: "चॅट इतिहास",
      clearChat: "चॅट साफ करा",
      logout: "लॉगआउट",
      loading: "AI डॉक्टर विचार करत आहेत...",
      error: "AI डॉक्टरशी कनेक्ट करताना त्रुटी। कृपया पुन्हा प्रयत्न करा।",
      welcomeTitle: "नमस्कार! मी तुमचा AI डॉक्टर आहे",
      welcomeSubtitle: "मी तुमच्या आरोग्य संबंधी काळजीत मदत करण्यासाठी येथे आहे. कृपया तुमचे लक्षण सांगा किंवा कोणताही वैद्यकीय प्रश्न विचारा.",
      suggestion1: "मला डोकेदुखी आहे",
      suggestion2: "तापाचे लक्षण काय आहेत?",
      suggestion3: "सर्दीचा उपचार कसा करावा?",
      quickQuestion1: "⏰ औषधाचा कालावधी",
      quickQuestion2: "🏥 डॉक्टरांना कधी भेटावे",
      quickQuestion3: "⚠️ दुष्परिणाम",
      quickQuestion4: "ℹ️ अधिक माहिती",
      typingIndicator: "AI डॉक्टर टाइप करत आहेत...",
      switchToVoice: "🎤 आवाजावर स्विच करा"
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Ensure we start with current chat view
  useEffect(() => {
    setCurrentSessionId(Date.now()); // Create a new session ID for current chat
  }, []);

  // Scroll chat into view
  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [chat]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      // Save user message immediately
      await saveMessageToFirebase("user", userMessage);
      
      // Get AI response with translation
      const res = await fetch(`http://localhost:5051/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, language }),
      });

      if (res.ok) {
        const data = await res.json();
        await saveMessageToFirebase("ai", data.reply);
      } else {
        const errorMsg = translations[language]?.error || translations.en.error;
        await saveMessageToFirebase("ai", errorMsg);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg = translations[language]?.error || translations.en.error;
      await saveMessageToFirebase("ai", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const saveMessageToFirebase = async (role, text) => {
    // Always add message to local chat state first
    const newMessage = {
      id: Date.now(),
      role,
      text,
      time: new Date().toLocaleTimeString()
    };
    setChat(prev => [...prev, newMessage]);
    
    // Try to save to Firebase if user is authenticated
    if (!auth.currentUser) return;
    
    try {
      await addDoc(collection(db, "chatMessages"), {
        userId: auth.currentUser.uid,
        role,
        text,
        timestamp: serverTimestamp(),
        chatSession: currentSessionId,
        language
      });
    } catch (error) {
      console.error("Error saving message to Firebase:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatReply = (text) =>
    text
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

  const clearChat = () => {
    setChat([]);
    setCurrentSessionId(Date.now());
  };

  const loadChatHistory = async () => {
    if (!auth.currentUser) return;
    
    setHistoryLoading(true);
    try {
      const q = query(
        collection(db, "chatMessages"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const sessions = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const sessionId = data.chatSession;
        
        if (!sessions[sessionId]) {
          sessions[sessionId] = {
            id: sessionId,
            messages: [],
            lastMessage: data.timestamp,
            createdAt: data.timestamp
          };
        }
        sessions[sessionId].messages.push({
          id: doc.id,
          role: data.role,
          text: data.text,
          time: data.timestamp?.toDate?.()?.toLocaleTimeString() || new Date().toLocaleTimeString(),
          timestamp: data.timestamp
        });
      });
      
      // Sort messages within each session by timestamp (oldest first)
      Object.values(sessions).forEach(session => {
        session.messages.sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(0);
          const timeB = b.timestamp?.toDate?.() || new Date(0);
          return timeA - timeB;
        });
      });
      
      // Sort sessions by most recent first
      const sortedSessions = Object.values(sessions).sort((a, b) => {
        const timeA = a.lastMessage?.toDate?.() || new Date(0);
        const timeB = b.lastMessage?.toDate?.() || new Date(0);
        return timeB - timeA;
      });
      
      setChatHistory(sortedSessions);
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };


  // Add this function inside TextChat
  const exportChatToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("MediMitra Chat & AI Recommendations", 10, 15);
    let y = 25;
    chat.forEach((msg, i) => {
      const sender = msg.role === "user" ? "You" : "AI Doctor";
      doc.setFontSize(12);
      doc.setTextColor(msg.role === "user" ? 30 : 0, 0, 200);
      doc.text(`${sender} [${msg.time}]:`, 10, y);
      y += 7;
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      const lines = doc.splitTextToSize(msg.text, 180);
      lines.forEach(line => {
        doc.text(line, 14, y);
        y += 6;
      });
      y += 2;
      if (y > 270) {
        doc.addPage();
        y = 15;
      }
    });
    doc.save("MediMitra_Chat.pdf");
  };

  // Remove all chat history UI and logic
  // Remove showHistory, chatHistory, historyLoading, deletingSession, and any UI blocks for chat history
  // Only keep the current chat functionality and UI

  const t = translations[language] || translations.en;

  return (
    <div className="chat-container voice-chat">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <button onClick={() => navigate("/dashboard")} className="back-btn">
            ← Back to Dashboard
          </button>
          <h2>💬 Chat with AI Doctor</h2>
        </div>
        <div className="header-right">
          <div className="language-select">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">🇺🇸 English</option>
              <option value="hi">🇮🇳 Hindi</option>
              <option value="mr">🇮🇳 Marathi</option>
            </select>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            🚪 {t.logout}
          </button>
        </div>
      </div>


      {/* Chat History Button */}
      <div className="chat-history-controls">
        <button 
          onClick={() => {
            setShowHistory(!showHistory);
            if (!showHistory) {
              loadChatHistory();
            }
          }} 
          className="history-btn"
        >
          {showHistory ? "📝 Current Chat" : "📚 Chat History"}
        </button>
        {!showHistory && (
          <button onClick={clearChat} className="new-chat-btn">
            🆕 {t.newChat}
          </button>
        )}
      </div>

      {showHistory ? (
        /* Chat History View */
        <div className="chat-history-container">
          <div className="history-header">
            <h3>📚 Chat History</h3>
            <p>Select a conversation to view or delete unwanted ones</p>
          </div>
          
          {historyLoading ? (
            <div className="loading-spinner"></div>
          ) : chatHistory.length > 0 ? (
            <div className="history-list">
              {chatHistory.map((session, index) => (
                <div key={session.id} className="history-item">
                  <div className="session-info">
                    <h4>Session {index + 1}</h4>
                    <p>{session.messages.length} messages</p>
                    <small>{session.lastMessage?.toDate?.()?.toLocaleString() || 'Unknown date'}</small>
                  </div>
                  <div className="session-actions">
                    <button 
                      onClick={() => {
                        setChat(session.messages);
                        setShowHistory(false);
                      }}
                      className="view-btn"
                    >
                      👁️ View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-history">
              <p>No chat history found. Start a conversation to see it here!</p>
            </div>
          )}
        </div>
      ) : (
        /* Current Chat View */
        <>
        {/* Chat Window */}
        <div className="chat-window" ref={chatRef}>
          {chat.length === 0 && (
            <div className="welcome-message">
              <div className="ai-avatar">👨‍⚕️</div>
              <h3>{t.welcomeTitle}</h3>
              <p>{t.welcomeSubtitle}</p>
              <div className="suggestions">
                <button onClick={() => setInput(t.suggestion1)}>{t.suggestion1}</button>
                <button onClick={() => setInput(t.suggestion2)}>{t.suggestion2}</button>
                <button onClick={() => setInput(t.suggestion3)}>{t.suggestion3}</button>
              </div>
            </div>
          )}
          
          {chat.map((msg, i) => (
            <div key={msg.id || i} className={`chat-bubble ${msg.role}`}>
              <div className="message-content">
                <div className="message-avatar">
                  {msg.role === "user" ? "👤" : "👨‍⚕️"}
                </div>
                <div className="message-text">
                  <div dangerouslySetInnerHTML={{ __html: formatReply(msg.text) }}></div>
                  <span className="timestamp">[{msg.time || new Date().toLocaleTimeString()}]</span>
                </div>
              </div>
              {msg.role === "ai" && (
                <div className="quick-questions">
                  <button onClick={() => setInput("How long should I take this medication?")} className="quick-btn">
                    {t.quickQuestion1}
                  </button>
                  <button onClick={() => setInput("When should I see a doctor?")} className="quick-btn">
                    {t.quickQuestion2}
                  </button>
                  <button onClick={() => setInput("Are there any side effects?")} className="quick-btn">
                    {t.quickQuestion3}
                  </button>
                  <button onClick={() => setInput("What else should I know?")} className="quick-btn">
                    {t.quickQuestion4}
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>{t.typingIndicator}</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <div className="input-container">
            <textarea
              rows="2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              className="chat-input"
            />
            <button 
              onClick={sendMessage} 
              disabled={loading || !input.trim()}
              className="send-btn"
            >
              {loading ? "⏳" : "📤"}
            </button>
          </div>
          
          <div className="chat-controls">
            <button onClick={clearChat} className="clear-btn">
              🗑️ {t.clearChat}
            </button>
            <button onClick={exportChatToPDF} className="export-btn">
              📄 Export to PDF
            </button>
            <button onClick={() => navigate("/voice-chat")} className="voice-btn">
              {t.switchToVoice}
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

export default TextChat;
