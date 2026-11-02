// streaming-client-api.js
'use strict';

class VideoAgent {
  constructor() {
    this.peerConnection = null;
    this.streamId = null;
    this.sessionId = null;
    this.statsIntervalId = null;
    this.API_CONFIG = null;
    this.DID_API_URL = 'https://api.d-id.com';
    this.lastBytesReceived = 0;
    this.videoIsPlaying = false;
    this.isConnected = false;
    this.currentAIMessage = '';
    this.currentAudio = null;

    this.idleVideo = document.getElementById('idle-video');
    this.talkVideo = document.getElementById('talk-video');

    // Language detection from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.lang = urlParams.get('lang') || 'en';

    this.hasDIDKey = false;
    this.init();
  }

  async init() {
    try {
      this.setupEventListeners();

      if (this.talkVideo) this.talkVideo.setAttribute('playsinline', '');
      if (this.idleVideo) {
        this.idleVideo.setAttribute('playsinline', '');
        this.idleVideo.play().catch(() => {});
      }

      // Safely load api.json without throwing on 404 HTML
      try {
        const response = await fetch('./api.json');
        if (response.ok) {
          const text = await response.text();
          try {
            this.API_CONFIG = JSON.parse(text);
            if (this.API_CONFIG?.url) this.DID_API_URL = this.API_CONFIG.url;
            if (this.API_CONFIG?.key && this.API_CONFIG.key.trim().length > 10 && !this.API_CONFIG.key.includes('your_d_id')) {
              this.hasDIDKey = true;
            }
          } catch (_) {}
        }
      } catch (e) {
        console.log('Using Medimitra direct AI consultation mode');
      }

      console.log('Video Agent Initialized. Live D-ID WebRTC:', this.hasDIDKey ? 'Available' : 'Direct AI Doctor Mode');
      
      const welcomeNotice = this.lang === 'hi'
        ? 'नमस्ते! मैं आपकी AI डॉक्टर अवतार हूँ। लाइव परामर्श शुरू करने के लिए **Connect** पर क्लिक करें या नीचे दिए गए लक्षणों में से चुनें।'
        : this.lang === 'mr'
        ? 'नमस्कार! मी तुमची AI डॉक्टर अवतार आहे. थेट सल्लामसलत सुरू करण्यासाठी **Connect** वर क्लिक करा किंवा खालील लक्षणांपैकी निवडा.'
        : 'Hello! I am your AI Doctor Avatar. Click **Connect** to start our live interactive consultation or pick a symptom chip below!';

      this.addMessage('system', `ℹ️ ${welcomeNotice}`);
    } catch (error) {
      console.warn(`Initialization notice: ${error.message}`);
    }
  }

  setupEventListeners() {
    const connectBtn = document.getElementById('connect-button');
    const destroyBtn = document.getElementById('destroy-button');
    const sendBtn = document.getElementById('send-button');
    const inputField = document.getElementById('user-input-field');

    if (connectBtn) connectBtn.addEventListener('click', () => this.handleConnect());
    if (destroyBtn) destroyBtn.addEventListener('click', () => this.handleDestroy());
    if (sendBtn) sendBtn.addEventListener('click', () => this.handleTalk());
    if (inputField) {
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleTalk();
      });
    }

    // Quick suggestion chips
    document.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', async (e) => {
        const msg = e.currentTarget.getAttribute('data-msg');
        if (!msg) return;

        if (!this.isConnected) {
          await this.handleConnect();
          // Short delay to let welcome play
          setTimeout(() => {
            if (inputField) inputField.value = msg;
            this.handleTalk();
          }, 1200);
        } else {
          if (inputField) inputField.value = msg;
          this.handleTalk();
        }
      });
    });
  }

  async handleConnect() {
    if (this.isConnected) return;

    const connectButton = document.getElementById('connect-button');
    const sendButton = document.getElementById('send-button');
    const inputField = document.getElementById('user-input-field');
    
    if (connectButton) {
      connectButton.innerHTML = '<div class="loading-spinner"></div> Connecting...';
      connectButton.disabled = true;
    }

    try {
      if (this.hasDIDKey) {
        // D-ID WebRTC Stream Mode
        this.cleanup();
        const response = await this.createStream();
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`D-ID API Error: ${response.status} - ${errorText}`);
        }
        
        const { id, offer, ice_servers, session_id } = await response.json();
        this.streamId = id;
        this.sessionId = session_id;

        const answer = await this.createPeerConnection(offer, ice_servers);
        await this.sendSDPAnswer(answer);
      } else {
        // Direct Medimitra AI Doctor Mode
        if (this.idleVideo) {
          this.idleVideo.style.display = 'block';
          this.idleVideo.play().catch(() => {});
        }
      }

      this.isConnected = true;
      this.updateConnectionStatus(true);
      this.updateUI(true);
      
      if (inputField) {
        inputField.disabled = false;
        inputField.focus();
      }
      if (sendButton) sendButton.disabled = false;
      
      const welcome = this.lang === 'hi'
        ? 'नमस्ते! मैं डॉ. एमी हूँ, आपकी AI डॉक्टर अवतार। मैं आपके लक्षणों, प्राथमिक चिकित्सा और स्वास्थ्य संबंधी सलाह के लिए तैयार हूँ। आज आपको क्या परेशानी है?'
        : this.lang === 'mr'
        ? 'नमस्कार! मी डॉ. एमी, तुमची AI डॉक्टर अवतार. मी लक्षणे, प्राथमिक उपचार आणि आरोग्य सल्ल्यासाठी सज्ज आहे. आज तुम्हाला काय त्रास होत आहे?'
        : 'Connected! I am Dr. Amy, your AI Doctor Avatar. I am ready to evaluate your symptoms, remedies, and medical questions. How can I help you today?';

      this.addMessage('ai', welcome);
      this.speakText(welcome);
    } catch (error) {
      console.warn(`Live WebRTC failed, falling back to Direct AI Doctor Mode: ${error.message}`);
      this.hasDIDKey = false;
      if (this.idleVideo) {
        this.idleVideo.style.display = 'block';
        this.idleVideo.play().catch(() => {});
      }
      this.isConnected = true;
      this.updateConnectionStatus(true);
      this.updateUI(true);
      if (inputField) {
        inputField.disabled = false;
        inputField.focus();
      }
      if (sendButton) sendButton.disabled = false;

      const fallbackWelcome = this.lang === 'hi'
        ? 'नमस्ते! मैं डॉ. एमी हूँ। आज आपके स्वास्थ्य से जुड़े क्या सवाल हैं?'
        : this.lang === 'mr'
        ? 'नमस्कार! मी डॉ. एमी. आज तुमच्या आरोग्याबद्दल काय प्रश्न आहेत?'
        : 'Connected! I am Dr. Amy, your AI Doctor Avatar. What medical questions can I assist you with today?';
      this.addMessage('ai', fallbackWelcome);
      this.speakText(fallbackWelcome);
    } finally {
      if (!this.isConnected && connectButton) {
        connectButton.innerHTML = '<i class="fas fa-play"></i> Connect';
        connectButton.disabled = false;
      }
    }
  }

  async handleTalk() {
    try {
      const inputField = document.getElementById('user-input-field');
      const sendButton = document.getElementById('send-button');
      if (!inputField) return;

      const userMessage = inputField.value.trim();
      if (!userMessage) return;

      // Add user message to chat
      this.addMessage('user', userMessage);
      inputField.value = '';
      inputField.disabled = true;
      if (sendButton) sendButton.disabled = true;
      
      // Show typing indicator
      this.showTypingIndicator();

      // 1. Fetch clinical medical response from Medimitra backend
      let aiResponse = "";
      try {
        const res = await fetch('http://localhost:5051/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, user_id: 'avatar_user', language: this.lang || 'en' })
        });
        if (res.ok) {
          const data = await res.json();
          aiResponse = data.reply || data.response || "";
        }
      } catch (beErr) {
        console.warn("Backend chat fetch error:", beErr.message);
      }

      if (!aiResponse) {
        try {
          const { fetchOpenAIResponse } = await import('./openai.js');
          aiResponse = await fetchOpenAIResponse(this.API_CONFIG?.openai_key, userMessage);
        } catch (_) {}
      }
      
      if (!aiResponse) {
        aiResponse = this.lang === 'hi'
          ? "मैं आपकी चिंता समझती हूँ। कृपया पर्याप्त मात्रा में पानी पिएं और आराम करें। यदि लक्षण गंभीर हों तो डॉक्टर से परामर्श लें।"
          : this.lang === 'mr'
          ? "मी तुमची चिंता समजू शकते. कृपया भरपूर पाणी प्या आणि विश्रांती घ्या. लक्षणे वाढल्यास डॉक्टरांचा सल्ला घ्या."
          : "I understand your symptoms. Please drink plenty of fluids and rest. If symptoms worsen, please consult a healthcare professional.";
      }

      const cleanResponse = this.cleanAIResponse(aiResponse);
      this.currentAIMessage = cleanResponse;

      // Hide typing indicator and show AI message
      this.hideTypingIndicator();
      this.addMessage('ai', cleanResponse);

      // If D-ID live stream is active, send talk command to D-ID
      if (this.hasDIDKey && this.streamId && this.sessionId) {
        try {
          const talkResponse = await fetch(`${this.DID_API_URL}/talks/streams/${this.streamId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(this.API_CONFIG.key + ':')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              script: {
                type: 'text',
                input: cleanResponse,
                provider: {
                  type: 'microsoft',
                  voice_id: this.API_CONFIG?.voice_id || 'en-US-JennyNeural'
                }
              },
              config: { fluent: true, stitch: true },
              driver_url: 'bank://lively/',
              session_id: this.sessionId
            })
          });

          if (talkResponse.ok) {
            this.updateAIStatus('speaking');
            inputField.disabled = false;
            if (sendButton) sendButton.disabled = false;
            inputField.focus();
            return;
          }
        } catch (dIdErr) {
          console.warn('D-ID talk request error, falling back to local voice:', dIdErr.message);
        }
      }

      // Direct Speech Output
      this.speakText(cleanResponse);

      inputField.disabled = false;
      if (sendButton) sendButton.disabled = false;
      inputField.focus();
    } catch (error) {
      console.error('Talk Error:', error);
      this.hideTypingIndicator();
      this.addMessage('ai', "I'm sorry, I had trouble processing your question. Please try rephrasing your symptoms.");
      this.updateAIStatus('ready');
      
      const inputField = document.getElementById('user-input-field');
      const sendButton = document.getElementById('send-button');
      if (inputField) inputField.disabled = false;
      if (sendButton) sendButton.disabled = false;
    }
  }

  async speakText(text) {
    if (!text) return;
    this.updateAIStatus('speaking');

    if (this.idleVideo) {
      this.idleVideo.style.filter = "brightness(1.08) drop-shadow(0 0 16px rgba(102, 126, 234, 0.6))";
      this.idleVideo.style.transform = "scale(1.03)";
      this.idleVideo.style.transition = "all 0.3s ease";
    }

    const resetAvatar = () => {
      this.updateAIStatus('ready');
      if (this.idleVideo) {
        this.idleVideo.style.filter = "none";
        this.idleVideo.style.transform = "scale(1)";
      }
    };

    const cleanSpoken = text
      .replace(/[*#`_~•\n\r]/g, ' ')
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    try {
      const res = await fetch('http://localhost:5051/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanSpoken, language: this.lang || 'en', gender: 'female' })
      });
      const data = await res.json();
      if (data.audioContent) {
        if (this.currentAudio) {
          try { this.currentAudio.pause(); } catch(e) {}
        }
        const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
        this.currentAudio = audio;
        audio.onended = resetAvatar;
        audio.onerror = () => this.browserSpeak(cleanSpoken, resetAvatar);
        await audio.play().catch(e => {
          console.warn("Audio autoplay policy prevented direct audio, using speech synthesis:", e);
          this.browserSpeak(cleanSpoken, resetAvatar);
        });
        return;
      }
    } catch (err) {
      console.warn("TTS server play error:", err.message);
    }

    this.browserSpeak(cleanSpoken, resetAvatar);
  }

  browserSpeak(text, onEnd) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap = { en: 'en-US', hi: 'hi-IN', mr: 'mr-IN' };
      utterance.lang = langMap[this.lang] || 'en-US';
      utterance.rate = 1.0;
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
      window.speechSynthesis.speak(utterance);
    } catch (_) {
      if (onEnd) onEnd();
    }
  }

  async handleDestroy() {
    const connectButton = document.getElementById('connect-button');
    const sendButton = document.getElementById('send-button');
    const inputField = document.getElementById('user-input-field');

    try {
      if (this.streamId) {
        await this.deleteStream();
      }
    } catch (error) {
      console.error('Destroy error:', error);
    } finally {
      this.cleanup();
      this.updateUI(false);
      this.updateConnectionStatus(false);
      this.updateAIStatus('ready');
      
      if (inputField) inputField.disabled = true;
      if (sendButton) sendButton.disabled = true;
      
      if (this.currentAudio) {
        try { this.currentAudio.pause(); } catch(e) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.addMessage('ai', 'Disconnected. Click Connect or choose a symptom chip to start a new consultation.');
    }
  }

  async createStream() {
    return fetch(`${this.DID_API_URL}/talks/streams`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(this.API_CONFIG.key + ':')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_url: "https://raw.githubusercontent.com/jjmlovesgit/D-id_Streaming_Chatgpt/main/oracle_pic.jpg",
        stream_warmup: true,
        config: {
          video_quality: "hd"
        }
      }),
    });
  }
  
  async createPeerConnection(offer, iceServers) {
    const RTCPeerConnection = (
      window.RTCPeerConnection ||
      window.webkitRTCPeerConnection ||
      window.mozRTCPeerConnection
    ).bind(window);

    this.peerConnection = new RTCPeerConnection({ iceServers });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        fetch(`${this.DID_API_URL}/talks/streams/${this.streamId}/ice`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(this.API_CONFIG.key + ':')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            session_id: this.sessionId,
          }),
        }).catch(console.error);
      }
    };

    this.peerConnection.ontrack = (event) => {
      if (event.track.kind === 'video') {
        this.statsIntervalId = setInterval(async () => {
          const stats = await this.peerConnection.getStats(event.track);
          stats.forEach((report) => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
              const isPlaying = report.bytesReceived > this.lastBytesReceived;
              if (isPlaying !== this.videoIsPlaying) {
                this.videoIsPlaying = isPlaying;

                if (isPlaying) {
                  if (this.idleVideo) this.idleVideo.style.display = 'none';
                  if (this.talkVideo) {
                    this.talkVideo.style.display = 'block';
                    this.talkVideo.srcObject = event.streams[0];
                    this.talkVideo.play().catch(console.error);
                  }
                  this.updateAIStatus('speaking');
                } else {
                  if (this.talkVideo) {
                    this.talkVideo.pause();
                    this.talkVideo.srcObject = null;
                    this.talkVideo.style.display = 'none';
                  }
                  if (this.idleVideo) this.idleVideo.style.display = 'block';
                  this.updateAIStatus('ready');
                }
              }
              this.lastBytesReceived = report.bytesReceived;
            }
          });
        }, 500);
      }
    };

    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }
  
  async sendSDPAnswer(answer) {
    return fetch(`${this.DID_API_URL}/talks/streams/${this.streamId}/sdp`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(this.API_CONFIG.key + ':')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        answer: answer,
        session_id: this.sessionId
      })
    });
  }

  async deleteStream() {
    return fetch(`${this.DID_API_URL}/talks/streams/${this.streamId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${btoa(this.API_CONFIG.key + ':')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ session_id: this.sessionId })
    });
  }
  
  cleanup() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.talkVideo) {
      this.talkVideo.pause();
      this.talkVideo.srcObject = null;
      this.talkVideo.style.display = 'none';
      if (this.talkVideo.srcObject) {
        this.talkVideo.srcObject.getTracks().forEach(track => track.stop());
        this.talkVideo.srcObject = null;
      }
    }
    if (this.idleVideo) this.idleVideo.style.display = 'block';

    if (this.statsIntervalId) {
      clearInterval(this.statsIntervalId);
      this.statsIntervalId = null;
    }

    this.isConnected = false;
    this.videoIsPlaying = false;
  }
  
  updateUI(connected) {
    const connectButton = document.getElementById('connect-button');
    const destroyButton = document.getElementById('destroy-button');
  
    if (destroyButton) destroyButton.disabled = !connected;
  
    if (connectButton) {
      if (connected) {
        connectButton.innerHTML = '<i class="fas fa-check"></i> Connected';
        connectButton.classList.add('connected');
        connectButton.disabled = true;
      } else {
        connectButton.innerHTML = '<i class="fas fa-play"></i> Connect';
        connectButton.classList.remove('connected');
        connectButton.disabled = false;
      }
    }
  }

  updateConnectionStatus(connected) {
    const statusDot = document.getElementById('connection-status');
    const statusText = document.getElementById('connection-text');
    
    if (statusDot) {
      if (connected) {
        statusDot.classList.add('connected');
      } else {
        statusDot.classList.remove('connected');
      }
    }
    if (statusText) {
      statusText.textContent = connected ? 'Connected' : 'Disconnected';
    }
  }

  updateAIStatus(status) {
    const statusDot = document.getElementById('ai-status-dot');
    const statusText = document.getElementById('ai-status-text');
    
    if (statusDot) {
      statusDot.className = 'ai-status-dot';
      if (status === 'speaking') {
        statusDot.classList.add('speaking');
      }
    }
    if (statusText) {
      statusText.textContent = status === 'speaking' ? 'Speaking' : 'Ready';
    }
  }

  addMessage(sender, content) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const time = new Date().toLocaleTimeString();
    
    messageDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
      </div>
      <div class="message-content">
        ${content}
        <div class="message-time">${time}</div>
      </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  showTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) typingIndicator.classList.add('show');
    
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) typingIndicator.classList.remove('show');
  }

  cleanAIResponse(text) {
    if (!text) return '';
    return text
      .replace(/[*_#`~•]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  showError(message) {
    this.addMessage('ai', `Notice: ${message}`);
    console.error(message);
  }
}

document.addEventListener('DOMContentLoaded', () => new VideoAgent());