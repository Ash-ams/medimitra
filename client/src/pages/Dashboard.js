// pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, signOut } from "../firebase";
import "../index.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate();

  // Translation dictionary for dashboard content
  const translations = {
    en: {
      welcome: "Welcome back,",
      title: "AI Consultation Options",
      subtitle: "Choose your preferred way to connect with our AI health assistant",
      chatTitle: "Chat with AI",
      chatDesc: "Text-based consultation with AI doctor",
      voiceTitle: "Voice Consultation",
      voiceDesc: "Speak with AI doctor using voice",
      avatarTitle: "Avatar Consultation",
      avatarDesc: "Interactive consultation with AI doctor avatar",
      appointmentTitle: "Book Appointment",
      appointmentDesc: "Schedule consultation with human doctor",
      shopsTitle: "Nearby Medical Shops",
      shopsDesc: "Find pharmacies and medical stores nearby",
      reportsTitle: "Medical Reports",
      reportsDesc: "Upload and analyze your medical reports with AI",
      historyTitle: "Chat History",
      historyDesc: "View your previous conversations with AI doctor",
      aboutTitle: "About Us",
      aboutDesc: "Learn more about MediMitra and our services",
      faqTitle: "FAQs",
      faqDesc: "Frequently asked questions about our services",
      startNow: "START NOW",
      findShops: "FIND SHOPS",
      learnMore: "LEARN MORE",
      logout: "Logout"
    },
    hi: {
      welcome: "वापस आने के लिए स्वागत है,",
      title: "AI परामर्श विकल्प",
      subtitle: "हमारे AI स्वास्थ्य सहायक से जुड़ने का अपना पसंदीदा तरीका चुनें",
      chatTitle: "AI के साथ चैट करें",
      chatDesc: "AI डॉक्टर के साथ टेक्स्ट-आधारित परामर्श",
      voiceTitle: "आवाज परामर्श",
      voiceDesc: "आवाज का उपयोग करके AI डॉक्टर से बात करें",
      avatarTitle: "अवतार परामर्श",
      avatarDesc: "AI डॉक्टर अवतार के साथ इंटरैक्टिव परामर्श",
      appointmentTitle: "अपॉइंटमेंट बुक करें",
      appointmentDesc: "मानव डॉक्टर के साथ परामर्श का समय निर्धारित करें",
      shopsTitle: "आस-पास के मेडिकल शॉप्स",
      shopsDesc: "आस-पास के फार्मेसी और मेडिकल स्टोर खोजें",
      reportsTitle: "मेडिकल रिपोर्ट्स",
      reportsDesc: "अपनी मेडिकल रिपोर्ट्स अपलोड करें और AI से विश्लेषण करवाएं",
      historyTitle: "चैट इतिहास",
      historyDesc: "AI डॉक्टर के साथ अपनी पिछली बातचीत देखें",
      aboutTitle: "हमारे बारे में",
      aboutDesc: "MediMitra और हमारी सेवाओं के बारे में अधिक जानें",
      faqTitle: "सामान्य प्रश्न",
      faqDesc: "हमारी सेवाओं के बारे में अक्सर पूछे जाने वाले प्रश्न",
      startNow: "अभी शुरू करें",
      findShops: "शॉप्स खोजें",
      learnMore: "और जानें",
      logout: "लॉगआउट"
    },
    mr: {
      welcome: "परत येण्याबद्दल स्वागत आहे,",
      title: "AI सल्लागार विकल्पे",
      subtitle: "आमच्या AI आरोग्य सहाय्यकाशी जोडण्याचा तुमचा पसंतीचा मार्ग निवडा",
      chatTitle: "AI सोबत चॅट करा",
      chatDesc: "AI डॉक्टर सोबत मजकूर-आधारित सल्लागार",
      voiceTitle: "आवाज सल्लागार",
      voiceDesc: "आवाज वापरून AI डॉक्टर सोबत बोला",
      avatarTitle: "अवतार सल्लागार",
      avatarDesc: "AI डॉक्टर अवतार सोबत इंटरॅक्टिव सल्लागार",
      appointmentTitle: "अपॉइंटमेंट बुक करा",
      appointmentDesc: "मानव डॉक्टर सोबत सल्लागारीची वेळ निश्चित करा",
      shopsTitle: "जवळचे मेडिकल दुकाने",
      shopsDesc: "जवळचे फार्मसी आणि मेडिकल स्टोअर्स शोधा",
      reportsTitle: "मेडिकल रिपोर्ट्स",
      reportsDesc: "तुमच्या मेडिकल रिपोर्ट्स अपलोड करा आणि AI सोबत विश्लेषण करा",
      historyTitle: "चॅट इतिहास",
      historyDesc: "AI डॉक्टर सोबत तुमच्या मागील संभाषण पहा",
      aboutTitle: "आमच्याबद्दल",
      aboutDesc: "MediMitra आणि आमच्या सेवांबद्दल अधिक जाणून घ्या",
      faqTitle: "सामान्य प्रश्न",
      faqDesc: "आमच्या सेवांबद्दल वारंवार विचारले जाणारे प्रश्न",
      startNow: "आता सुरू करा",
      findShops: "दुकाने शोधा",
      learnMore: "अधिक जाणून घ्या",
      logout: "लॉगआउट"
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your health dashboard...</p>
      </div>
    );
  }

  const t = translations[language] || translations.en;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🩺 MediMitra</h1>
          <p>{t.welcome} {user?.displayName || user?.email}</p>
        </div>
        <div className="header-right">
          <div className="language-selector">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
            </select>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            {t.logout}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>

        <div className="consultation-cards">
          {/* Chat with AI */}
          <div className="consultation-card">
            <div className="card-icon chat-icon">
              💬
            </div>
            <h3>{t.chatTitle}</h3>
            <p>{t.chatDesc}</p>
            <Link to="/text-chat" className="card-button chat-button">
              {t.startNow}
            </Link>
          </div>

          {/* Voice Consultation */}
          <div className="consultation-card">
            <div className="card-icon voice-icon">
              🎤
            </div>
            <h3>{t.voiceTitle}</h3>
            <p>{t.voiceDesc}</p>
            <Link to="/voice-chat" className="card-button voice-button">
              {t.startNow}
            </Link>
          </div>

          {/* Avatar Consultation */}
          <div className="consultation-card">
            <div className="card-icon avatar-icon">
              🤖
            </div>
            <h3>{t.avatarTitle}</h3>
            <p>{t.avatarDesc}</p>
            <Link to="/avatar-chat" className="card-button avatar-button">
              {t.startNow}
            </Link>
          </div>

          {/* Book Appointment */}
          <div className="consultation-card">
            <div className="card-icon appointment-icon">
              📅
            </div>
            <h3>{t.appointmentTitle}</h3>
            <p>{t.appointmentDesc}</p>
            <Link to="/appointment" className="card-button appointment-button">
              {t.startNow}
            </Link>
          </div>

          {/* Nearby Medical Shops */}
          <div className="consultation-card">
            <div className="card-icon shops-icon">
              🏥
            </div>
            <h3>{t.shopsTitle}</h3>
            <p>{t.shopsDesc}</p>
            <Link to="/medical-shops" className="card-button shops-button">
              {t.findShops}
            </Link>
          </div>

          {/* Medical Reports - REMOVED */}

          {/* Chat History */}
          <div className="consultation-card">
            <div className="card-icon history-icon">
              📊
            </div>
            <h3>{t.historyTitle}</h3>
            <p>{t.historyDesc}</p>
            <Link to="/chat-history" className="card-button history-button">
              {t.learnMore}
            </Link>
          </div>

          {/* About Us */}
          <div className="consultation-card">
            <div className="card-icon about-icon">
              ℹ️
            </div>
            <h3>{t.aboutTitle}</h3>
            <p>{t.aboutDesc}</p>
            <Link to="/about-us" className="card-button about-button">
              {t.learnMore}
            </Link>
          </div>

          {/* FAQs */}
          <div className="consultation-card">
            <div className="card-icon faq-icon">
              ❓
            </div>
            <h3>{t.faqTitle}</h3>
            <p>{t.faqDesc}</p>
            <Link to="/faqs" className="card-button faq-button">
              {t.learnMore}
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Available</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">AI</div>
            <div className="stat-label">Powered</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">3</div>
            <div className="stat-label">Languages</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
