import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';
import './ChatHistory.css';

function ChatHistory() {
  const [chatHistory, setChatHistory] = useState([]);
  const [filter, setFilter] = useState('all'); // all, text, voice, avatar
  const [loading, setLoading] = useState(true);
  const [userId] = useState('demo_user'); // In real app, get from auth

  useEffect(() => {
    loadChatHistory();
  }, [filter]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5051/chat-history/${userId}?type=${filter}`);
      const data = await response.json();
      
      if (data.success) {
        setChatHistory(data.chatHistory);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Fallback to sample data
      setChatHistory([
        {
          id: 'chat_1',
          type: 'text',
          timestamp: new Date(),
          message: 'I have a headache',
          response: 'I understand you have a headache. Let me help you with some guidance...',
          language: 'en'
        },
        {
          id: 'chat_2', 
          type: 'avatar',
          timestamp: new Date(Date.now() - 3600000),
          message: 'I feel feverish',
          response: 'I can see you\'re experiencing fever symptoms. Let me provide some recommendations...',
          language: 'en'
        },
        {
          id: 'chat_3',
          type: 'voice',
          timestamp: new Date(Date.now() - 7200000),
          message: 'Voice: I have chest pain',
          response: 'Chest pain is a serious symptom. Please seek immediate medical attention...',
          language: 'en'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'text': return '💬';
      case 'voice': return '🎤';
      case 'avatar': return '🤖';
      default: return '💬';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'text': return 'Text Chat';
      case 'voice': return 'Voice Chat';
      case 'avatar': return 'Avatar Chat';
      default: return 'Chat';
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="chat-history-container">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading your chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-history-container">
      {/* Header */}
      <div className="chat-history-header">
        <div className="header-left">
          <Link to="/dashboard" className="back-button">
            ← Back to Dashboard
          </Link>
          <h1>📊 Chat History</h1>
          <p>View your previous conversations with AI doctor</p>
        </div>
        <div className="header-right">
          <div className="filter-selector">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Chats</option>
              <option value="text">Text Chats</option>
              <option value="voice">Voice Chats</option>
              <option value="avatar">Avatar Chats</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat History List */}
      <div className="chat-history-content">
        {chatHistory.length === 0 ? (
          <div className="no-history">
            <div className="no-history-icon">📝</div>
            <h3>No chat history found</h3>
            <p>Start a conversation with our AI doctor to see your chat history here</p>
            <Link to="/text-chat" className="start-chat-btn">
              Start New Chat
            </Link>
          </div>
        ) : (
          <div className="chat-list">
            {chatHistory.map((chat) => (
              <div key={chat.id} className="chat-item">
                <div className="chat-header">
                  <div className="chat-type">
                    <span className="type-icon">{getTypeIcon(chat.type)}</span>
                    <span className="type-label">{getTypeLabel(chat.type)}</span>
                  </div>
                  <div className="chat-timestamp">
                    {formatDate(chat.timestamp)}
                  </div>
                </div>
                
                <div className="chat-content">
                  <div className="user-message">
                    <div className="message-label">You:</div>
                    <div className="message-text">{chat.message}</div>
                  </div>
                  
                  <div className="ai-response">
                    <div className="message-label">AI Doctor:</div>
                    <div className="message-text">{chat.response}</div>
                  </div>
                </div>
                
                <div className="chat-footer">
                  <span className="language-tag">
                    {chat.language === 'en' ? 'English' : 
                     chat.language === 'hi' ? 'Hindi' : 
                     chat.language === 'mr' ? 'Marathi' : 'English'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatHistory;
