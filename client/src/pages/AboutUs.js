// pages/AboutUs.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "../index.css";

function AboutUs() {
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

  return (
    <div className="about-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate("/dashboard")} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>ℹ️ About MediMitra</h1>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h2>Your AI Health Companion</h2>
          <p>Empowering millions with accessible, reliable, and intelligent healthcare solutions</p>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Availability</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">3</div>
            <div className="stat-label">Languages</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">AI</div>
            <div className="stat-label">Powered</div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="mission-section">
        <div className="section-content">
          <h3>Our Mission</h3>
          <p>
            At MediMitra, we believe that quality healthcare should be accessible to everyone, 
            anytime, anywhere. Our AI-powered platform bridges the gap between patients and 
            healthcare providers, offering instant medical guidance, symptom analysis, and 
            health recommendations.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h3>What We Offer</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h4>AI-Powered Diagnosis</h4>
            <p>Advanced AI algorithms provide accurate symptom analysis and health recommendations</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎤</div>
            <h4>Voice Consultation</h4>
            <p>Speak naturally with our AI doctor for hands-free medical consultation</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h4>Text Chat Support</h4>
            <p>Type your symptoms and get instant responses from our medical AI</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏥</div>
            <h4>Medical Shop Locator</h4>
            <p>Find nearby pharmacies and medical stores with detailed information</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h4>Multi-Language Support</h4>
            <p>Available in English, Hindi, and Marathi for better accessibility</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h4>Privacy & Security</h4>
            <p>Your health data is protected with industry-standard security measures</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <h3>Our Development Team</h3>
        <div className="team-grid">
          <div className="team-member">
            <div className="member-avatar">👨‍💻</div>
            <h4>Sheikh Mohammad Ashraf</h4>
            <p className="member-role">Roll No: A266 &bull; Full-Stack Architecture</p>
            <p className="member-bio">B.Tech Computer Engineering, STME, SVKM's NMIMS, Navi Mumbai</p>
          </div>
          <div className="team-member">
            <div className="member-avatar">👨‍💻</div>
            <h4>Samarth Srivastava</h4>
            <p className="member-role">Roll No: A255 &bull; Backend &amp; CDS Triage</p>
            <p className="member-bio">B.Tech Computer Engineering, STME, SVKM's NMIMS, Navi Mumbai</p>
          </div>
          <div className="team-member">
            <div className="member-avatar">👨‍💻</div>
            <h4>Aadit Doshi</h4>
            <p className="member-role">Roll No: A251 &bull; ML / NLP &amp; Speech</p>
            <p className="member-bio">B.Tech Computer Engineering, STME, SVKM's NMIMS, Navi Mumbai</p>
          </div>
          <div className="team-member">
            <div className="member-avatar">👨‍💻</div>
            <h4>Madhav Soni</h4>
            <p className="member-role">Roll No: A265 &bull; UI/UX &amp; WebRTC Avatar</p>
            <p className="member-bio">B.Tech Computer Engineering, STME, SVKM's NMIMS, Navi Mumbai</p>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="technology-section">
        <h3>Our Technology</h3>
        <div className="tech-grid">
          <div className="tech-item">
            <div className="tech-icon">🧠</div>
            <h4>Advanced AI &amp; NLP</h4>
            <p>Powered by ensemble Random Forest models (95.65% accuracy) and multilingual NLP</p>
          </div>
          <div className="tech-item">
            <div className="tech-icon">☁️</div>
            <h4>Full-Stack Telehealth</h4>
            <p>React 18 frontend, Node.js orchestration server, and MongoDB session persistence</p>
          </div>
          <div className="tech-item">
            <div className="tech-icon">🔐</div>
            <h4>Clinical Decision Support</h4>
            <p>Deterministic red-flag emergency screening and real-time pharmacy geolocation routing</p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="contact-section">
        <h3>Academic Institutional Affiliation</h3>
        <div className="contact-info">
          <div className="contact-item">
            <div className="contact-icon">📧</div>
            <div>
              <h4>Email</h4>
              <p>support@medimitra.com</p>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">🏛️</div>
            <div>
              <h4>Department</h4>
              <p>Department of Computer Engineering</p>
            </div>
          </div>
          <div className="contact-item">
            <div className="contact-icon">📍</div>
            <div>
              <h4>Institution</h4>
              <p>School of Technology Management and Engineering (STME), SVKM's NMIMS, Navi Mumbai, Maharashtra, India</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="about-footer">
        <p>&copy; 2024 MediMitra. All rights reserved.</p>
        <div className="footer-links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Cookie Policy</span>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;

