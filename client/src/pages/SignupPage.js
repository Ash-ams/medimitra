// client/src/pages/SignupPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });

      alert("Signup successful! Please log in.");
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please click 'Sign in' below.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters long.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connectivity.");
      } else {
        setError(err.message || "Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="brand-section">
          <h1 className="brand-title">🩺 MediMitra</h1>
          <p className="brand-subtitle">Join Your AI Health Companion</p>
        </div>
        
        <form onSubmit={handleSignup} className="login-form">
          <div className="input-group">
            <label>Full Name</label>
          <input
            type="text"
              placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          </div>
          
          <div className="input-group">
            <label>Email Address</label>
          <input
            type="email"
              placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          </div>
          
          <div className="input-group">
            <label>Create Password</label>
          <input
            type="password"
              placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
          
          <p className="switch-auth">
            Already have an account?{" "}
            <span onClick={() => navigate("/")}>Sign in</span>
          </p>
        </form>
      </div>

      <div className="login-right">
        <div className="language-dropdown">
          <select>
            <option value="en">🇺🇸 English</option>
            <option value="hi">🇮🇳 Hindi</option>
            <option value="mr">🇮🇳 Marathi</option>
          </select>
        </div>
        
        <div className="avatar-container">
          <div className="d-id-avatar">
            <div className="avatar-placeholder">
              <div className="avatar-icon">👩‍⚕️</div>
              <div className="avatar-pulse"></div>
              <div className="avatar-status">Online</div>
              <div className="avatar-waves">
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
              </div>
            </div>
            <p className="avatar-text">Welcome to MediMitra</p>
            <p className="avatar-subtitle">Click to interact</p>
          </div>
        </div>
        
        <div className="login-tagline">
          <h3>Empowering Wellness</h3>
          <p>Let MediMitra be your health companion</p>
          <div className="features-list">
            <div className="feature-item">✅ Instant AI Diagnosis</div>
            <div className="feature-item">✅ Personalized Care</div>
            <div className="feature-item">✅ Secure & Private</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
