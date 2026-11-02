// client/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import TextChat from "./pages/TextChat";
import VoiceChat from "./pages/VoiceChat";
import AvatarChat from "./pages/AvatarChat";
import FAQs from "./pages/FAQs";
import AboutUs from "./pages/AboutUs";
import MedicalShops from "./pages/MedicalShops";
import Appointment from "./pages/Appointment";
// MedicalReports - REMOVED
import ChatHistory from "./pages/ChatHistoryMongo";
import AvatarDemo from "./components/AvatarDemo";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/text-chat" element={<TextChat />} />
        <Route path="/voice-chat" element={<VoiceChat />} />
        <Route path="/avatar-chat" element={<AvatarChat />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/medical-shops" element={<MedicalShops />} />
        {/* Medical Reports route - REMOVED */}
        <Route path="/chat-history" element={<ChatHistory />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/avatar-demo" element={<AvatarDemo />} />
      </Routes>
    </Router>
  );
}

export default App;
