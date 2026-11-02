// pages/Appointment.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "../index.css";

function Appointment() {
  const [userLocation, setUserLocation] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("in-person");
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [realDoctors, setRealDoctors] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
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

  const specialties = [
    { id: "cardiology", name: "Cardiology", icon: "❤️", color: "#FF6B6B" },
    { id: "dermatology", name: "Dermatology", icon: "🩺", color: "#4ECDC4" },
    { id: "orthopedics", name: "Orthopedics", icon: "🦴", color: "#45B7D1" },
    { id: "pediatrics", name: "Pediatrics", icon: "👶", color: "#96CEB4" },
    { id: "neurology", name: "Neurology", icon: "🧠", color: "#FFEAA7" },
    { id: "psychiatry", name: "Psychiatry", icon: "🧠", color: "#DDA0DD" },
    { id: "ophthalmology", name: "Ophthalmology", icon: "👁️", color: "#98D8C8" },
    { id: "dentistry", name: "Dentistry", icon: "🦷", color: "#F7DC6F" },
    { id: "gynecology", name: "Gynecology", icon: "👩", color: "#BB8FCE" },
    { id: "general", name: "General Physician", icon: "👨‍⚕️", color: "#85C1E9" }
  ];

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
  ];

  // Fetch real doctors from Practo/JustDial
  const fetchRealDoctors = async () => {
    if (!userLocation || !selectedSpecialty) {
      alert("Please enter your location and select a specialty first!");
      return;
    }
    
    setDoctorsLoading(true);
    try {
      const response = await fetch(`http://localhost:5051/doctors/${selectedSpecialty}?location=${userLocation}`);
      const data = await response.json();
      
      if (data.success && data.doctors.length > 0) {
        setRealDoctors(data.doctors);
        setCurrentStep(3); // Move to doctor selection
      } else {
        alert(`No doctors found for ${selectedSpecialty} in ${userLocation}. Please try a different location or specialty.`);
        setRealDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching real doctors:', error);
      alert('Failed to fetch doctors. Please check your internet connection and try again.');
      setRealDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userEmail = auth.currentUser?.email;
      const patientName = auth.currentUser?.displayName || 'Patient';

      const response = await fetch('http://localhost:5051/book-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          doctorName: selectedDoctor.name,
          specialtyName: selectedDoctor.specialty,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          appointmentType,
          symptoms,
          patientName,
          doctorEmail: selectedDoctor.email,
          doctorContact: selectedDoctor.contact,
          clinicName: selectedDoctor.clinic,
          consultationFee: selectedDoctor.consultationFee
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBookingSuccess(true);
      } else {
        alert('Failed to book appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Error booking appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUserLocation("");
    setSelectedSpecialty("");
    setSelectedDoctor(null);
    setSelectedDate("");
    setSelectedTime("");
    setAppointmentType("in-person");
    setSymptoms("");
    setBookingSuccess(false);
    setRealDoctors([]);
    setCurrentStep(1);
  };

  if (bookingSuccess) {
    return (
      <div className="appointment-container">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>Appointment Booked Successfully!</h2>
          <div className="appointment-details">
            <p><strong>Doctor:</strong> {selectedDoctor?.name}</p>
            <p><strong>Clinic:</strong> {selectedDoctor?.clinic}</p>
            <p><strong>Date:</strong> {selectedDate}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            <p><strong>Type:</strong> {appointmentType === "in-person" ? "In-Person" : "Video Call"}</p>
            <p><strong>Fee:</strong> {selectedDoctor?.consultationFee}</p>
          </div>
          <p>You will receive a confirmation email shortly.</p>
          <div className="success-actions">
            <button onClick={resetForm} className="book-another-btn">
              Book Another Appointment
            </button>
            <button onClick={() => navigate("/dashboard")} className="dashboard-btn">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => navigate("/dashboard")} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>📅 Book Appointment</h1>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Location & Specialty</div>
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Find Doctors</div>
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Select Doctor</div>
        </div>
        <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Book Appointment</div>
        </div>
      </div>

      {/* Step 1: Location & Specialty */}
      {currentStep === 1 && (
        <div className="step-container">
          <div className="step-header">
            <h2>📍 Tell us your location and what you need</h2>
            <p>We'll find the best doctors near you</p>
          </div>

          <div className="location-input-section">
            <div className="input-group">
              <label>📍 Your Location</label>
              <input
                type="text"
                value={userLocation}
                onChange={(e) => setUserLocation(e.target.value)}
                placeholder="Enter your city, area, or landmark (e.g., Mumbai, Andheri, Bandra)"
                className="location-input"
              />
              <small>We'll search for doctors in this area</small>
            </div>
          </div>

          <div className="specialty-selection">
            <h3>What type of doctor do you need?</h3>
            <div className="specialties-grid">
              {specialties.map(specialty => (
                <button
                  key={specialty.id}
                  type="button"
                  className={`specialty-card ${selectedSpecialty === specialty.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSpecialty(specialty.id)}
                  style={{ '--card-color': specialty.color }}
                >
                  <span className="specialty-icon">{specialty.icon}</span>
                  <span className="specialty-name">{specialty.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="step-actions">
            <button
              className="next-btn"
              onClick={() => {
                if (userLocation && selectedSpecialty) {
                  setCurrentStep(2);
                } else {
                  alert("Please enter your location and select a specialty!");
                }
              }}
              disabled={!userLocation || !selectedSpecialty}
            >
              Find Doctors Near Me →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Find Doctors */}
      {currentStep === 2 && (
        <div className="step-container">
          <div className="step-header">
            <h2>🔍 Finding Real Doctors in {userLocation}</h2>
            <p>Searching {selectedSpecialty} specialists near you...</p>
            <div className="disclaimer">
              <p>⚠️ <strong>Note:</strong> This is a demo. Real web scraping may be limited by website policies. Some data may be simulated for demonstration purposes.</p>
            </div>
          </div>

          <div className="search-summary">
            <div className="search-card">
              <div className="search-icon">📍</div>
              <div className="search-details">
                <h4>Location</h4>
                <p>{userLocation}</p>
              </div>
            </div>
            <div className="search-card">
              <div className="search-icon">🩺</div>
              <div className="search-details">
                <h4>Specialty</h4>
                <p>{specialties.find(s => s.id === selectedSpecialty)?.name}</p>
              </div>
            </div>
          </div>

          <div className="search-actions">
            <button
              className="search-doctors-btn"
              onClick={fetchRealDoctors}
              disabled={doctorsLoading}
            >
              {doctorsLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Searching Practo & JustDial...
                </>
              ) : (
                <>
                  🔍 Search Real Doctors
                </>
              )}
            </button>
            
            <button
              className="back-btn"
              onClick={() => setCurrentStep(1)}
            >
              ← Change Location/Specialty
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Select Doctor */}
      {currentStep === 3 && realDoctors.length > 0 && (
        <div className="step-container">
          <div className="step-header">
            <h2>👨‍⚕️ Choose Your Doctor</h2>
            <p>Found {realDoctors.length} {selectedSpecialty} doctors in {userLocation}</p>
          </div>

          <div className="doctors-grid">
            {realDoctors.map(doctor => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-image">
                  {doctor.image ? (
                    <img src={doctor.image} alt={doctor.name} onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }} />
                  ) : null}
                  <div className="doctor-avatar" style={{display: doctor.image ? 'none' : 'flex'}}>
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="doctor-info">
                  <h4>{doctor.name}</h4>
                  <p className="doctor-specialty">{doctor.specialty}</p>
                  <p className="doctor-clinic">📍 {doctor.clinic}</p>
                  <div className="doctor-rating">
                    <span className="rating-stars">⭐⭐⭐⭐⭐</span>
                    <span className="rating-value">{doctor.rating}/5</span>
                  </div>
                  <p className="doctor-experience">Experience: {doctor.experience}</p>
                  <p className="doctor-fee">💰 {doctor.consultationFee}</p>
                  <div className="doctor-languages">
                    <span className="languages-label">Languages:</span>
                    <span className="languages-list">{doctor.languages.join(', ')}</span>
                  </div>
                  <div className="doctor-contact">
                    <p>📞 {doctor.contact}</p>
                    <p>📧 {doctor.email}</p>
                  </div>
                </div>
                <div className="doctor-actions">
                  <button 
                    className="select-doctor-btn"
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setCurrentStep(4);
                    }}
                  >
                    Select This Doctor
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="step-actions">
            <button
              className="back-btn"
              onClick={() => setCurrentStep(2)}
            >
              ← Search Again
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Book Appointment */}
      {currentStep === 4 && selectedDoctor && (
        <div className="step-container">
          <div className="step-header">
            <h2>📅 Book Your Appointment</h2>
            <p>Complete your booking with {selectedDoctor.name}</p>
          </div>

          <div className="selected-doctor-summary">
            <div className="doctor-summary-card">
              {selectedDoctor.image ? (
                <img src={selectedDoctor.image} alt={selectedDoctor.name} onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }} />
              ) : null}
              <div className="doctor-avatar" style={{display: selectedDoctor.image ? 'none' : 'flex'}}>
                {selectedDoctor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="doctor-summary-info">
                <h4>{selectedDoctor.name}</h4>
                <p>📍 {selectedDoctor.clinic}</p>
                <p>⭐ {selectedDoctor.rating}/5 • {selectedDoctor.experience}</p>
                <p>💰 {selectedDoctor.consultationFee}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="appointment-form">
            <div className="form-section">
              <h4>📅 Select Date & Time</h4>
              <div className="datetime-selection">
                <div className="date-selection">
                  <label>Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="time-selection">
                  <label>Time:</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                  >
                    <option value="">Select time</option>
                    {selectedDoctor.availableSlots?.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>📱 Appointment Type</h4>
              <div className="appointment-type-selection">
                <label className="type-option">
                  <input
                    type="radio"
                    name="appointmentType"
                    value="in-person"
                    checked={appointmentType === "in-person"}
                    onChange={(e) => setAppointmentType(e.target.value)}
                  />
                  <span className="type-label">
                    <span className="type-icon">🏥</span>
                    <span>In-Person Consultation</span>
                  </span>
                </label>
                <label className="type-option">
                  <input
                    type="radio"
                    name="appointmentType"
                    value="video"
                    checked={appointmentType === "video"}
                    onChange={(e) => setAppointmentType(e.target.value)}
                  />
                  <span className="type-label">
                    <span className="type-icon">📹</span>
                    <span>Video Call Consultation</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h4>📝 Describe Your Symptoms</h4>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Please describe your symptoms, concerns, or reason for the appointment..."
                rows="4"
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading || !selectedDate || !selectedTime || !symptoms}
                className="book-appointment-btn"
              >
                {loading ? "Booking..." : `Book Appointment - ${selectedDoctor.consultationFee}`}
              </button>
              <button
                type="button"
                className="back-btn"
                onClick={() => setCurrentStep(3)}
              >
                ← Change Doctor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Need immediate help?</h3>
        <div className="action-buttons">
          <button onClick={() => navigate("/text-chat")} className="action-btn">
            💬 Chat with AI Doctor
          </button>
          <button onClick={() => navigate("/voice-chat")} className="action-btn">
            🎤 Voice Consultation
          </button>
          <button onClick={() => navigate("/medical-shops")} className="action-btn">
            🏥 Find Medical Shops
          </button>
        </div>
      </div>
    </div>
  );
}

export default Appointment;