// pages/FAQs.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "../index.css";

function FAQs() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const faqData = {
    general: [
      {
        question: "What is MediMitra?",
        answer: "MediMitra is an advanced AI-powered healthcare assistant designed to provide instant, reliable, and confidential medical guidance. Our platform leverages state-of-the-art language models to help users understand symptoms, receive health advice, and make informed decisions—all from the comfort of their home."
      },
      {
        question: "Is MediMitra free to use?",
        answer: "Yes, MediMitra offers its core AI consultation services completely free of charge. Our mission is to make quality healthcare information accessible to everyone, regardless of location or financial status."
      },
      {
        question: "How accurate are the AI’s responses?",
        answer: "MediMitra’s AI is built on leading medical language models and is regularly updated with the latest healthcare knowledge. While it provides helpful and context-aware guidance, it is not a substitute for a licensed medical professional. For urgent or serious health concerns, always consult a doctor in person."
      },
      {
        question: "Which languages does MediMitra support?",
        answer: "MediMitra currently supports English, Hindi, and Marathi for both text and voice interactions. We are actively working to expand our language offerings to better serve India’s diverse population."
      }
    ],
    technical: [
      {
        question: "How do I use the voice consultation feature?",
        answer: "Simply navigate to the Voice Chat section and tap the microphone icon. Speak clearly about your symptoms or questions. The AI will transcribe your speech, analyze your input, and respond with professional medical advice."
      },
      {
        question: "Is my health data secure on MediMitra?",
        answer: "Absolutely. MediMitra uses industry-standard encryption and follows strict privacy protocols. Your health information is never shared with third parties without your explicit consent."
      },
      {
        question: "What should I do if the AI does not understand my question?",
        answer: "If the AI response seems unclear, try rephrasing your question or providing more details. You can also switch between voice and text chat for better results. Our support team is available 24/7 for additional help."
      }
    ],
    medical: [
      {
        question: "Can MediMitra prescribe medication?",
        answer: "No, MediMitra does not prescribe medication. The platform provides general health information and recommendations. For prescriptions or treatment plans, please consult a licensed healthcare provider."
      },
      {
        question: "What should I do in a medical emergency?",
        answer: "In case of a medical emergency, call your local emergency number (e.g., 112 in India) or visit the nearest hospital immediately. MediMitra is not intended for emergency use."
      },
      {
        question: "Is MediMitra suitable for children?",
        answer: "MediMitra can be used for general health queries about children, but we recommend parental supervision for users under 13. For pediatric emergencies or specific concerns, consult a pediatrician directly."
      }
    ],
    features: [
      {
        question: "How can I find nearby medical shops?",
        answer: "Use the ‘Nearby Medical Shops’ feature on your dashboard. MediMitra will display a list of pharmacies and medical stores in your area, complete with contact information and directions."
      },
      {
        question: "Can I book appointments with real doctors through MediMitra?",
        answer: "We are working to integrate appointment booking with certified healthcare professionals. This feature will be available soon—stay tuned for updates!"
      },
      {
        question: "Can I export my health reports or chat history?",
        answer: "Yes, you can export your chat history and AI recommendations as PDF reports for your personal records or to share with your doctor."
      }
    ]
  };

  const categories = [
    { id: "general", name: "General", icon: "❓" },
    { id: "technical", name: "Technical", icon: "⚙️" },
    { id: "medical", name: "Medical", icon: "🏥" },
    { id: "features", name: "Features", icon: "✨" }
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="faqs-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate("/dashboard")} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>📚 Frequently Asked Questions</h1>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="categories-section">
        <div className="categories-grid">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="faqs-section">
        <div className="faqs-list">
          {faqData[activeCategory].map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                className={`faq-question ${expandedFaq === index ? 'expanded' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.question}</span>
                <span className="expand-icon">
                  {expandedFaq === index ? '−' : '+'}
                </span>
              </button>
              {expandedFaq === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="support-section">
        <div className="support-card">
          <div className="support-icon">💬</div>
          <h3>Still have questions?</h3>
          <p>Our support team is here to help you 24/7</p>
          <div className="support-actions">
            <button className="support-btn" onClick={() => navigate("/text-chat")}>
              💬 Chat with AI
            </button>
            <button className="support-btn" onClick={() => window.open("mailto:support@medimitra.com")}>
              📧 Email Support
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        <h3>Quick Links</h3>
        <div className="links-grid">
          <button onClick={() => navigate("/text-chat")} className="quick-link-btn">
            💬 Start AI Consultation
          </button>
          <button onClick={() => navigate("/voice-chat")} className="quick-link-btn">
            🎤 Voice Chat
          </button>
          <button onClick={() => navigate("/medical-shops")} className="quick-link-btn">
            🏥 Find Medical Shops
          </button>
          <button onClick={() => navigate("/about-us")} className="quick-link-btn">
            ℹ️ About Us
          </button>
        </div>
      </div>
    </div>
  );
}

export default FAQs;
