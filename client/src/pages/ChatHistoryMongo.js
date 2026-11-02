import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import mongoService from '../mongodb-service';
import './ChatHistory.css';

function ChatHistoryMongo() {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [userId] = useState('demo_user'); // In real app, get from auth

  useEffect(() => {
    loadChatHistory();
  }, [filterType]);

  const loadChatHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await mongoService.getChatHistory(userId, filterType);
      if (response.success) {
        setChatHistory(response.chatHistory || []);
      } else {
        setError('Failed to load chat history');
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'text': return '💬';
      case 'voice': return '🎤';
      case 'avatar': return '🎭';
      case 'report_analysis': return '📋';
      default: return '💬';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'text': return '#4CAF50';
      case 'voice': return '#2196F3';
      case 'avatar': return '#FF9800';
      case 'report_analysis': return '#9C27B0';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <div className="chat-history-container">
        <div className="loading-spinner"></div>
        <p>Loading chat history...</p>
      </div>
    );
  }

  return (
    <div className="chat-history-container">
      <div className="chat-history-header">
        <Link to="/dashboard" className="back-button">
          ← Back to Dashboard
        </Link>
        <h1>📊 Chat History</h1>
        <p>Review your past conversations and medical report analyses.</p>
      </div>

      <div className="filter-section">
        <label htmlFor="filterType">Filter by:</label>
        <select
          id="filterType"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Chats</option>
          <option value="text">Text Chats</option>
          <option value="voice">Voice Chats</option>
          <option value="avatar">Avatar Chats</option>
          <option value="report_analysis">Report Analyses</option>
        </select>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="history-list">
        {chatHistory.length === 0 ? (
          <div className="no-chats">
            <p>No chat history found for the selected filter.</p>
            <p>Start a conversation with the AI doctor to see your history here!</p>
          </div>
        ) : (
          chatHistory
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map((chat) => (
              <div key={chat.id} className="chat-item">
                <div className="chat-meta">
                  <span 
                    className="chat-type"
                    style={{ color: getTypeColor(chat.type) }}
                  >
                    {getTypeIcon(chat.type)} {chat.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="chat-timestamp">
                    {new Date(chat.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div className="chat-content">
                  <div className="user-message">
                    <strong>You:</strong> {chat.message}
                  </div>
                  <div className="ai-response">
                    <strong>AI Doctor:</strong> {chat.response}
                  </div>
                  
                  {chat.reportId && (
                    <div className="report-link">
                      <Link to={`/medical-reports?reportId=${chat.reportId}`}>
                        📋 View Report Details
                      </Link>
                    </div>
                  )}
                  
                  {chat.language && chat.language !== 'en' && (
                    <div className="language-tag">
                      Language: {chat.language.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default ChatHistoryMongo;
