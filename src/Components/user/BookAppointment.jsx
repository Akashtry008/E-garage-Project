import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const BookAppointment = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        date: "",
        time: "",
        service: "",
        notes: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Ensure the date is in a simple YYYY-MM-DD string format
            const dateStr = formData.date;
            
            // Simple validation
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(dateStr)) {
                toast.error("Invalid date format. Please select a valid date.");
                setLoading(false);
                return;
            }
            
            // Create payload with all string values for dates
            const payload = {
                user_id: localStorage.getItem('userId') || "64f8b8155af72959c2e4412a",
                service_id: "64f8b8155af72959c2e4412b",
                service_provider_id: "64f8b8155af72959c2e4412c",
                booking_date: dateStr, // String format
                booking_time: formData.time,
                status: "pending",
                price: 0,
                payment_status: "unpaid",
                notes: formData.notes || "",
                booking_type: "appointment",
                email: formData.email,
                name: formData.name,
                phone: formData.phone,
                service_name: formData.service
            };
            
            console.log("Sending payload:", payload);
            
            // Send data to the appointment-specific endpoint
            const response = await axios.post("/api/bookings/appointment", payload);

            console.log("API Response:", response);

            if (response.status === 200 || response.status === 201) {
                toast.success("Appointment booked successfully!");
                // Reset form
                setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    date: "",
                    time: "",
                    service: "",
                    notes: ""
                });
                
                // Redirect to home page after 2 seconds
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            } else {
                console.error("Error response:", response);
                toast.error("Failed to book appointment. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting booking:", error);
            console.error("Error details:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="appointment-page d-flex align-items-center justify-content-center min-vh-100">
            <ToastContainer position="top-right" autoClose={3000} />
            <form className="appointment-form p-5 shadow-lg" onSubmit={handleSubmit}>
                <h2 className="mb-4 text-center text-dark fw-bold">Book an Appointment</h2>

                <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                        type="tel"
                        placeholder="Enter your phone number"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Preferred Date</label>
                    <input
                        type="date"
                        pattern="\d{4}-\d{2}-\d{2}"
                        placeholder="Select a date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Preferred Time</label>
                    <input
                        type="time"
                        className="form-control"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="form-label">Service Required</label>
                    <select
                        className="form-select"
                        placeholder="Select a service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a service</option>
                        <option value="Diagnostic Test">Diagnostic Test</option>
                        <option value="Engine Servicing">Engine Servicing</option>
                        <option value="Tires Replacement">Tires Replacement</option>
                        <option value="Battery Replacement">Battery Replacement</option>
                        <option value="Brake Inspection">Brake Inspection</option>
                        <option value="Transmission Repair">Transmission Repair</option>
                        <option value="Suspension Check">Suspension Check</option>
                        <option value="Exhaust System Repair">Exhaust System Repair</option>
                        <option value="Alignment Check">Alignment Check</option>
                        <option value="Fluid Check">Fluid Check</option>
                        <option value="Wiper Replacement">Wiper Replacement</option>
                        <option value="Car Wash">Car Wash</option>
                        <option value="Oil Change">Oil Change</option>
                        <option value="Brake Repair">Brake Repair</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="form-label">Special Notes</label>
                    <textarea
                        className="form-control"
                        placeholder="Any special requirements or additional information"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                    ></textarea>
                </div>

                <button 
                    type="submit" 
                    className="btn btn-danger w-100 fw-semibold text-white"
                    disabled={loading}
                >
                    {loading ? (
                        <span>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                        </span>
                    ) : (
                        <span>✅ Confirm Appointment</span>
                    )}
                </button>
            </form>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

        @keyframes sparkleBackground {
          0% { background-position: 0 0; }
          100% { background-position: 100% 100%; }
        }

        label {
          color: brown;
          font-family: 'Poppins', sans-serif;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .appointment-form {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          padding: 20px;
          max-width: 550px;
          width: 100%;
        }

        .appointment-form .mb-3 {
          margin-bottom: 15px;
        }

        .appointment-form .mb-4 {
        }

        @keyframes sparkleShadow {
          0%, 100% {
            box-shadow:
              0 0 10px #238628,
              0 0 20px rgba(7, 206, 67, 0.98),
              0 0 30px rgba(20, 250, 12, 0.85);
          }
          50% {
            box-shadow:
              0 0 15px rgba(255, 255, 255, 0.3),
              0 0 25px rgba(255, 255, 255, 0.5),
              0 0 40px rgba(255, 255, 255, 0.6);
          }
        }

        .appointment-page {
          background: linear-gradient(135deg,rgb(114, 9, 9),rgb(92, 11, 11));
          background-size: 200% 200%;
          animation: sparkleBackground 12s ease-in-out infinite;
          font-family: 'Poppins', sans-serif;
          padding: 20px;
        }

        .appointment-form {
          background: white;
          border-radius: 30px;
          animation: sparkleShadow 3s ease-in-out infinite, fadeIn 1.5s ease forwards;
          opacity: 0; /* start hidden, then animate to full visibility */;
        }
          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
      `}</style>
        </div>
    );
};

export default BookAppointment;
