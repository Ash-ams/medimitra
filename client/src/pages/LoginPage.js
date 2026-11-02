// pages/LoginPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import "../index.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate();

  // Translation dictionary for login page
  const translations = {
    en: {
      title: "Welcome to MediMitra",
      subtitle: "Your AI Health Assistant",
      email: "Email Address",
      password: "Password",
      login: "Sign In",
      signup: "Sign Up",
      switchToSignup: "Don't have an account? Sign Up",
      switchToLogin: "Already have an account? Sign In",
      error: "An error occurred. Please try again.",
      loading: "Signing In...",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      brandTitle: "🩺 MediMitra",
      brandSubtitle: "Your AI Health Companion",
      connectTitle: "Connect with AI Doctor",
      connectSubtitle: "Your Personal Health Assistant",
      feature1: "✅ 24/7 AI Consultation",
      feature2: "✅ Voice & Text Support",
      feature3: "✅ Multi-language Support",
      demoLogin: "⚡ Quick Demo Login",
      demoSubtitle: "Explore MediMitra instantly without signing up",
      demoCredentialsNotice: "Demo: demo@medimitra.com / password123"
    },
    hi: {
      title: "MediMitra में आपका स्वागत है",
      subtitle: "आपका AI स्वास्थ्य सहायक",
      email: "ईमेल पता",
      password: "पासवर्ड",
      login: "साइन इन करें",
      signup: "साइन अप करें",
      switchToSignup: "खाता नहीं है? साइन अप करें",
      switchToLogin: "पहले से खाता है? साइन इन करें",
      error: "एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
      loading: "साइन इन हो रहा है...",
      emailPlaceholder: "अपना ईमेल दर्ज करें",
      passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
      brandTitle: "🩺 MediMitra",
      brandSubtitle: "आपका AI स्वास्थ्य साथी",
      connectTitle: "AI डॉक्टर से जुड़ें",
      connectSubtitle: "आपका व्यक्तिगत स्वास्थ्य सहायक",
      feature1: "✅ 24/7 AI परामर्श",
      feature2: "✅ आवाज और टेक्स्ट सहायता",
      feature3: "✅ बहुभाषी सहायता",
      demoLogin: "⚡ त्वरित डेमो लॉगिन",
      demoSubtitle: "बिना साइन अप किए तुरंत एक्सप्लोर करें",
      demoCredentialsNotice: "डेमो: demo@medimitra.com / password123"
    },
    mr: {
      title: "MediMitra मध्ये आपले स्वागत आहे",
      subtitle: "तुमचा AI आरोग्य सहाय्यक",
      email: "ईमेल पत्ता",
      password: "पासवर्ड",
      login: "साइन इन करा",
      signup: "साइन अप करा",
      switchToSignup: "खाते नाही? साइन अप करा",
      switchToLogin: "आधीपासून खाते आहे? साइन इन करा",
      error: "एक त्रुटी आली। कृपया पुन्हा प्रयत्न करा।",
      loading: "साइन इन होत आहे...",
      emailPlaceholder: "तुमचा ईमेल टाका",
      passwordPlaceholder: "तुमचा पासवर्ड टाका",
      brandTitle: "🩺 MediMitra",
      brandSubtitle: "तुमचा AI आरोग्य साथी",
      connectTitle: "AI डॉक्टराशी जोडा",
      connectSubtitle: "तुमचा वैयक्तिक आरोग्य सहाय्यक",
      feature1: "✅ 24/7 AI सल्लागार",
      feature2: "✅ आवाज आणि मजकूर सहायता",
      feature3: "✅ बहुभाषी सहायता",
      demoLogin: "⚡ झटपट डेमो लॉगिन",
      demoSubtitle: "साइन अप न करता त्वरित एक्सप्लोर करा",
      demoCredentialsNotice: "डेमो: demo@medimitra.com / password123"
    }
  };

  const getFriendlyErrorMessage = (err, lang = "en") => {
    const code = err?.code || "";
    switch (code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return lang === "hi"
          ? "ईमेल या पासवर्ड गलत है। यदि आपने खाता नहीं बनाया है, तो नीचे 'साइन अप करें' पर क्लिक करें या डेमो लॉगिन का उपयोग करें।"
          : lang === "mr"
          ? "ईमेल किंवा पासवर्ड चुकीचा आहे. आपण अद्याप खाते तयार केले नसल्यास, खाली 'साइन अप करा' वर क्लिक करा किंवा डेमो लॉगिन वापरा."
          : "Invalid email or password. If you haven't created an account yet, click 'Sign Up' below or use Demo Login.";
      case "auth/email-already-in-use":
        return lang === "hi"
          ? "यह ईमेल पहले से पंजीकृत है। कृपया साइन इन करें।"
          : lang === "mr"
          ? "हा ईमेल आधीपासून नोंदणीकृत आहे. कृपया साइन इन करा."
          : "This email is already registered. Please sign in instead.";
      case "auth/weak-password":
        return lang === "hi"
          ? "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।"
          : lang === "mr"
          ? "पासवर्ड किमान 6 अक्षरांचा असावा."
          : "Password must be at least 6 characters long.";
      case "auth/invalid-email":
        return lang === "hi"
          ? "कृपया एक मान्य ईमेल पता दर्ज करें।"
          : lang === "mr"
          ? "कृपया वैध ईमेल पत्ता प्रविष्ट करा."
          : "Please enter a valid email address.";
      case "auth/network-request-failed":
        return lang === "hi"
          ? "नेटवर्क त्रुटि। कृपया अपने इंटरनेट कनेक्शन की जाँच करें।"
          : lang === "mr"
          ? "नेटवर्क त्रुटी. कृपया इंटरनेट कनेक्शन तपासा."
          : "Network error. Please check your internet connection.";
      case "auth/too-many-requests":
        return lang === "hi"
          ? "बहुत सारे असफल प्रयास। कृपया कुछ समय बाद पुनः प्रयास करें।"
          : lang === "mr"
          ? "खूप जास्त अयशस्वी प्रयत्न. कृपया थोड्या वेळाने प्रयत्न करा."
          : "Too many failed attempts. Please try again later.";
      default:
        return err?.message || translations[lang]?.error || translations.en.error;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Auth error:", error);
      setError(getFriendlyErrorMessage(error, language));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, "demo@medimitra.com", "password123");
      navigate("/dashboard");
    } catch (error) {
      console.error("Demo login error:", error);
      setError(getFriendlyErrorMessage(error, language));
    } finally {
      setLoading(false);
    }
  };

  const t = translations[language] || translations.en;

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="brand-section">
          <h1 className="brand-title">{t.brandTitle}</h1>
          <p className="brand-subtitle">{t.brandSubtitle}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>{t.email}</label>
            <input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label>{t.password}</label>
            <input
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? t.loading : (isSignUp ? t.signup : t.login)}
          </button>

          {!isSignUp && (
            <>
              <div className="demo-divider">
                <span>OR</span>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="demo-btn"
                title={t.demoSubtitle}
              >
                {t.demoLogin}
              </button>
            </>
          )}
          
          <p className="switch-auth">
            {isSignUp ? t.switchToLogin : t.switchToSignup}{" "}
            <span onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>
              {isSignUp ? t.login : t.signup}
            </span>
          </p>
        </form>
      </div>

      <div className="login-right">
        <div className="language-dropdown">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">🇺🇸 English</option>
            <option value="hi">🇮🇳 Hindi</option>
            <option value="mr">🇮🇳 Marathi</option>
          </select>
        </div>
        
        <div className="avatar-container">
          <div className="d-id-avatar">
            <div className="avatar-placeholder">
              <div className="avatar-icon">👨‍⚕️</div>
              <div className="avatar-pulse"></div>
              <div className="avatar-status">Online</div>
              <div className="avatar-waves">
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
              </div>
            </div>
            <p className="avatar-text">AI Doctor Ready</p>
            <p className="avatar-subtitle">Click to interact</p>
          </div>
        </div>
        
        <div className="login-tagline">
          <h3>{t.connectTitle}</h3>
          <p>{t.connectSubtitle}</p>
          <div className="features-list">
            <div className="feature-item">{t.feature1}</div>
            <div className="feature-item">{t.feature2}</div>
            <div className="feature-item">{t.feature3}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
