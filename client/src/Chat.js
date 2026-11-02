// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import TextChat from "./pages/TextChat";
import VoiceChat from "./pages/VoiceChat";
import MedicalShops from "./pages/MedicalShops";
import FAQs from "./pages/FAQs";
import AboutUs from "./pages/AboutUs";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/text-chat" element={<TextChat />} />
        <Route path="/voice-chat" element={<VoiceChat />} />
        <Route path="/medical-shops" element={<MedicalShops />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;
