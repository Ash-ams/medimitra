import React, { useState, useEffect, useRef } from 'react';
import './DidAvatar.css';

const DidAvatar = ({ 
  text, 
  isSpeaking, 
  onSpeakComplete, 
  className = "" 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const animationRef = useRef(null);

  useEffect(() => {
    if (text && isSpeaking) {
      startAnimation();
    }
  }, [text, isSpeaking]);

  const startAnimation = () => {
    if (!text.trim()) return;
    
    console.log('🎭 Starting simple avatar animation for:', text);
    setIsAnimating(true);
    setCurrentText(text);
    
    // Simulate speaking duration based on text length
    const duration = Math.max(3000, text.length * 100); // Minimum 3 seconds
    
    // Stop animation after duration
    animationRef.current = setTimeout(() => {
      setIsAnimating(false);
      setCurrentText('');
      if (onSpeakComplete) {
        onSpeakComplete();
      }
    }, duration);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`simple-avatar-container ${className}`}>
      <div className={`avatar-character ${isAnimating ? 'speaking' : ''}`}>
        <div className="avatar-face">
          <div className="avatar-eyes">
            <div className="eye left"></div>
            <div className="eye right"></div>
          </div>
          <div className={`avatar-mouth ${isAnimating ? 'speaking' : ''}`}></div>
        </div>
        <div className="avatar-body">
          <div className="avatar-stethoscope">🩺</div>
        </div>
      </div>
      
      {isAnimating && (
        <div className="speech-bubble">
          <div className="speech-text">
            {currentText.length > 100 ? currentText.substring(0, 100) + '...' : currentText}
          </div>
          <div className="speech-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      
      {!isAnimating && (
        <div className="avatar-status">
          <p>👩‍⚕️ AI Doctor Ready</p>
          <small>Send a message to see me speak!</small>
        </div>
      )}
    </div>
  );
};

export default DidAvatar; 