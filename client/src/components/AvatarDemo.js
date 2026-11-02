import React, { useState } from 'react';
import DidAvatar from './DidAvatar';
import './AvatarDemo.css';

const AvatarDemo = () => {
  const [demoText, setDemoText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const demoMessages = [
    "Hello! I'm Dr. Amy, your AI medical assistant. How can I help you today?",
    "Based on your symptoms, I recommend consulting with a healthcare provider for a proper diagnosis.",
    "Remember to take your medication as prescribed and maintain a healthy lifestyle.",
    "If you experience any severe symptoms, please seek immediate medical attention."
  ];

  const handleDemoClick = (text) => {
    setDemoText(text);
    setIsSpeaking(true);
  };

  const handleSpeakComplete = () => {
    setIsSpeaking(false);
    setDemoText('');
  };

  return (
    <div className="avatar-demo">
      <div className="demo-header">
        <h2>🎭 D-ID Avatar Demo</h2>
        <p>Test the AI Doctor avatar with different medical responses</p>
      </div>

      <div className="demo-content">
        <div className="avatar-container">
          <DidAvatar
            text={demoText}
            isSpeaking={isSpeaking}
            onSpeakComplete={handleSpeakComplete}
            avatarConfig={{
              presenter_id: "amy-Aq6OmG2srs",
              driver_id: "DAMKDrrPZac88itbSaLW",
              background: {
                type: "color",
                value: "#f8f9fa"
              }
            }}
          />
        </div>

        <div className="demo-controls">
          <h3>Try these responses:</h3>
          <div className="demo-buttons">
            {demoMessages.map((message, index) => (
              <button
                key={index}
                onClick={() => handleDemoClick(message)}
                disabled={isSpeaking}
                className="demo-btn"
              >
                {message.substring(0, 50)}...
              </button>
            ))}
          </div>

          <div className="demo-info">
            <h4>How it works:</h4>
            <ul>
              <li>Click any button to make the avatar speak</li>
              <li>The avatar will generate a video with synchronized speech</li>
              <li>Mouth movements match the spoken words exactly</li>
              <li>Natural facial expressions are included</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarDemo; 