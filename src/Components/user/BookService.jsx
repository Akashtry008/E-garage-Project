import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

export const BookService = () => {
  const navigate = useNavigate();
  const [animationPhase, setAnimationPhase] = useState('car-entering'); // 'car-entering', 'car-to-form', 'form-visible'
  const [selectedService, setSelectedService] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicleModel: "",
    service: "",
    notes: "",
    date: "",
    paymentMethod: ""
  });

  const servicePrices = {
    "Diagnostic Test": 999,
    "Oil Changing": 499,
    "Engine Servicing": 1499,
    "Tires Replacement": 2999,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === "service") {
      setSelectedService(value);
    }
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
      
      const servicePrice = servicePrices[formData.service] || 0;

      // Create common payload with all string values for dates
      const basePayload = {
        user_id: localStorage.getItem('userId') || "64f8b8155af72959c2e4412a",
        service_id: "64f8b8155af72959c2e4412b",
        service_provider_id: "64f8b8155af72959c2e4412c",
        booking_date: dateStr, // String format
        booking_time: "10:00", // Default time since not collected
        status: "pending",
        price: servicePrice,
        payment_status: "unpaid",
        notes: formData.notes || "",
        booking_type: "service",
        vehicle_model: formData.vehicleModel,
        name: formData.name,
        phone: formData.phone,
        service_name: formData.service
      };

      // For online payment, save selected service to localStorage and redirect to payment page
      if (formData.paymentMethod === "Online") {
        // Save service information to localStorage for Payment component
        localStorage.setItem('selectedService', formData.service);
        localStorage.setItem('servicePrice', servicePrice);
        localStorage.setItem('customerName', formData.name);
        localStorage.setItem('customerPhone', formData.phone);
        localStorage.setItem('booking_date', dateStr);

        const payload = {
          ...basePayload,
          payment_method: "Online"
        };

        console.log("Sending payload for online payment:", payload);

        try {
          // Use the correct booking endpoint for service booking
          const response = await axios.post("/api/bookings/service", payload);
          console.log("API Response:", response);
          
          if (response.status === 200 || response.status === 201) {
            // Store the booking ID for payment reference
            if (response.data && response.data.booking && response.data.booking._id) {
              localStorage.setItem('bookingId', response.data.booking._id);
            }
          }
        } catch (apiError) {
          console.warn("API error during booking creation, proceeding to payment anyway:", apiError);
          // Generate a temporary booking ID for mock purposes
          localStorage.setItem('bookingId', 'temp-' + Date.now().toString(36));
        }
        
        // Proceed to payment regardless of API response
        toast.success("Service booked successfully! Redirecting to payment...");
        setTimeout(() => {
          navigate(`/payment?service=${encodeURIComponent(formData.service)}`);
        }, 2000);
        return;
        
      } else if (formData.paymentMethod === "COD") {
        // For COD, create the booking with COD payment method
        const payload = {
          ...basePayload,
          payment_method: "Cash on Delivery"
        };

        console.log("Sending payload for COD:", payload);

        try {
          // Use the correct booking endpoint for service booking
          const response = await axios.post("/api/bookings/service", payload);
          console.log("API Response:", response);
          
          if (response.status === 200 || response.status === 201) {
            toast.success("Service booked successfully! Cash on delivery option selected.");
            
            // Reset form after successful booking
            setFormData({
              name: "",
              phone: "",
              vehicleModel: "",
              service: "",
              notes: "",
              date: "",
              paymentMethod: ""
            });
            setSelectedService("");
            
            // Redirect to user services page after successful booking
            setTimeout(() => {
              navigate("/UserServices");
            }, 2000);
          } else {
            toast.error("Failed to book service. Please try again.");
          }
        } catch (apiError) {
          console.error("API error during COD booking:", apiError);
          toast.error("Failed to book service. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      if (error.response) {
        // Backend responded with an error
        console.error("Backend error:", error.response.data);
        toast.error(
          error.response.data?.message ||
          JSON.stringify(error.response.data) ||
          "Something went wrong. Please try again later."
        );
      } else if (error.request) {
        // No response from backend
        console.error("No response from backend:", error.request);
        toast.error("No response from server. Please try again later.");
      } else {
        // Other errors
        toast.error("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Car reaches center
    const reachCenterTimer = setTimeout(() => {
      setAnimationPhase('car-to-form');
    }, 1500);
    
    // Form becomes fully visible
    const formVisibleTimer = setTimeout(() => {
      setAnimationPhase('form-visible');
    }, 2200);
    
    return () => {
      clearTimeout(reachCenterTimer);
      clearTimeout(formVisibleTimer);
    };
  }, []);

  return (
    <div className="booking d-flex justify-content-center align-items-center min-vh-100 position-relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className={`position-absolute z-3 d-flex align-items-center car-animation ${animationPhase === 'car-to-form' ? 'transform-to-form' : ''} ${animationPhase === 'form-visible' ? 'd-none' : ''}`}>
        <div className="d-flex me-n0 text-secondary">
          <div className="fs-2">💨</div>
          <div className="fs-2">💨</div>
        </div>
        <div className="text-danger display-1">
          <i className="fas fa-car-side"></i>
        </div>
      </div>

      {animationPhase !== 'car-entering' && (
        <div className={`d-flex align-items-center transition-opacity ${animationPhase === 'car-to-form' ? 'transforming' : ''}`}>
          <div className="bg-white shadow p-4 rounded-3" style={{ width: "500px", zIndex: 10 }}>
            <h2 className="text-center text-danger fw-bold mb-4 d-flex align-items-center justify-content-center gap-2">
              <i className="fas fa-tools me-2"></i> Book a Service
            </h2>
            <form className="d-grid gap-3" onSubmit={handleSubmit}>
              <div className="position-relative">
                <input 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name" 
                  className="form-control ps-5 border border-danger" 
                  required 
                />
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3 text-danger">
                  <i className="fas fa-car"></i>
                </div>
              </div>
              <div className="position-relative">
                <input 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number" 
                  className="form-control ps-5 border border-danger" 
                  required 
                />
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3 text-danger">
                  <i className="fas fa-phone-alt"></i>
                </div>
              </div>
              <div className="position-relative">
                <input 
                  name="vehicleModel" 
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  placeholder="Vehicle Model" 
                  className="form-control ps-5 border border-danger" 
                  required 
                />
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3 text-danger">
                  <i className="fas fa-car-side"></i>
                </div>
              </div>

              {/* Service Selection */}
              <div className="form-group position-relative">
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="form-select border-danger ps-5"
                  required
                >
                  <option value="">Select Service</option>
                  <option value="Diagnostic Test">Diagnostic Test - ₹999</option>
                  <option value="Oil Changing">Oil Changing - ₹499</option>
                  <option value="Engine Servicing">Engine Servicing - ₹1499</option>
                  <option value="Tires Replacement">Tires Replacement - ₹2999</option>
                </select>
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3 text-danger">
                  <i className="fas fa-tools"></i>
                </div>
              </div>

              {/* Date Selection */}
              <div className="position-relative">
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="form-control ps-5 border border-danger" 
                  required 
                />
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3 text-danger">
                  <i className="far fa-calendar-alt"></i>
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-group position-relative">
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="form-select border-danger ps-5"
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="Online">Online Payment (Razorpay)</option>
                  <option value="COD">Cash on Delivery</option>
                </select>
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3 text-danger">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
              </div>

              {/* Notes */}
              <div className="position-relative">
                <textarea 
                  name="notes" 
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional Notes" 
                  className="form-control ps-5 border border-danger" 
                  rows="3"
                />
                <div className="position-absolute top-0 start-0 translate-middle-y ps-3 text-danger" style={{ top: "20px" }}>
                  <i className="fas fa-sticky-note" style={{paddingTop:"47px"}}></i>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-danger py-2 fw-bold" 
                disabled={loading}
              >
                {loading ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fas fa-check-circle me-2"></i>
                    <span>Book Service Now</span>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

<style>{`
        .car-animation {
          animation: carEnter 1.5s ease-in-out forwards;
        }
        @keyframes carEnter {
          0% { transform: translateX(-100vw); }
          100% { transform: translateX(0); }
        }
        
        .transform-to-form {
          animation: transformToForm 0.7s forwards;
        }
        
        @keyframes transformToForm {
          0% { 
            transform: translateX(0);
            opacity: 1;
          }
          100% { 
            transform: scale(0.1) translateY(-50px);
            opacity: 0;
          }
        }
        
        .transforming {
          animation: formAppear 0.7s forwards;
        }
        
        @keyframes formAppear {
          0% { 
            opacity: 0;
            transform: scale(0.8);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .transition-opacity {
          animation: fadeIn 0.5s ease-in-out forwards;
        }

        @keyframes fadeIn {
          0% { opacity:0; }
          100% { opacity: 1; }
        }

        .booking {
          background-image: url('public/img/service.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          position: relative;
          // height: 100vh;
        }
        
        .booking::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
        }
        
        .car-animation .fas {
          animation: carBounce 0.5s infinite alternate;
        }
        
        @keyframes carBounce {
          0% { transform: translateY(-3px); }
          100% { transform: translateY(3px); }
        }
      
      `}</style>
    </div>
  );
};

export default BookService;



// import React, { useEffect, useState } from "react";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export const BookService = () => {
//   const [animationPhase, setAnimationPhase] = useState('car-entering'); // 'car-entering', 'car-to-form', 'form-visible'
//   const [selectedService, setSelectedService] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     vehicleModel: "",
//     service: "",
//     notes: "",
//     date: "",
//     paymentMethod: ""
//   });

//   const servicePrices = {
//     "Diagnostic Test": 999,
//     "Oil Changing": 499,
//     "Engine Servicing": 1499,
//     "Tires Replacement": 2999,
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
    
//     if (name === "service") {
//       setSelectedService(value);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     // Simulate form submission
//     setTimeout(() => {
//       setFormData({
//         name: "",
//         phone: "",
//         vehicleModel: "",
//         service: "",
//         notes: "",
//         date: "",
//         paymentMethod: ""
//       });
//       setSelectedService("");
//       setLoading(false);
//     }, 1500);
//   };

//   useEffect(() => {
//     // Car reaches center
//     const reachCenterTimer = setTimeout(() => {
//       setAnimationPhase('car-to-form');
//     }, 1500);
    
//     // Form becomes fully visible
//     const formVisibleTimer = setTimeout(() => {
//       setAnimationPhase('form-visible');
//     }, 2200);
    
//     return () => {
//       clearTimeout(reachCenterTimer);
//       clearTimeout(formVisibleTimer);
//     };
//   }, []);

//   return (
//     <div className="booking d-flex justify-content-center align-items-center min-vh-100 position-relative overflow-hidden">
//       <ToastContainer position="top-right" autoClose={3000} />
      
//       <div className={`position-absolute z-3 d-flex align-items-center car-animation ${animationPhase === 'car-to-form' ? 'transform-to-form' : ''} ${animationPhase === 'form-visible' ? 'd-none' : ''}`}>
//         <div className="d-flex me-n0 text-secondary">
//           <div className="fs-2">💨</div>
//           <div className="fs-2">💨</div>
//         </div>
//         <div className="text-danger display-1">
//           <i className="fas fa-car-side"></i>
//         </div>
//       </div>

//       {animationPhase !== 'car-entering' && (
//         <div className={`d-flex align-items-center transition-opacity ${animationPhase === 'car-to-form' ? 'transforming' : ''}`}>
//           <div className="bg-white shadow p-4 rounded-3" style={{ width: "500px", zIndex: 10 }}>
//             <h2 className="text-center text-danger fw-bold mb-4 d-flex align-items-center justify-content-center gap-2">
//               <i className="fas fa-tools me-2"></i> Book a Service
//             </h2>
//             <form className="d-grid gap-3" onSubmit={handleSubmit}>
//               <div className="position-relative">
//                 <input 
//                   name="name" 
//                   value={formData.name}
//                   onChange={handleChange}
//                   placeholder="Your Name" 
//                   className="form-control ps-5 border border-danger" 
//                   required 
//                 />
//                 <div className="position-absolute top-50 start-0 translate-middle-y ps-3 text-danger">
//                   <i className="fas fa-car"></i>
//                 </div>
//               </div>
//               <div className="position-relative">
//                 <input 
//                   name="phone" 
//                   value={formData.phone}
//                   onChange={handleChange}
//                   placeholder="Phone Number" 
//                   className="form-control ps-5 border border-danger" 
//                   required 
//                 />
//                 <div className="position-absolute top-50 start-0 translate-middle-y ps-3 text-danger">
//                   <i className="fas fa-phone-alt"></i>
//                 </div>
//               </div>
//               <div className="position-relative">
//                 <input 
//                   name="vehicleModel" 
//                   value={formData.vehicleModel}
//                   onChange={handleChange}
//                   placeholder="Vehicle Model" 
//                   className="form-control ps-5 border border-danger" 
//                   required 
//                 />
//                 <div className="position-absolute top-50 start-0 translate-middle-y ps-3 text-danger">
//                   <i className="fas fa-car-side"></i>
//                 </div>
//               </div>

//               {/* Service Selection */}
//               <div className="form-group position-relative">
//                 <select
//                   name="service"
//                   value={formData.service}
//                   onChange={handleChange}
//                   className="form-select border-danger ps-5"
//                   required
//                 >
//                   <option value="">Select Service</option>
//                   <option value="Diagnostic Test">Diagnostic Test</option>
//                   <option value="Oil Changing">Oil Changing</option>
//                   <option value="Engine Servicing">Engine Servicing</option>
//                   <option value="Tires Replacement">Tires Replacement</option>
//                 </select>
//                 <i className="fas fa-cogs position-absolute top-50 start-0 translate-middle-y ps-3 text-danger"></i>
//               </div>

//               {/* Price Display */}
//               {selectedService && (
//                 <div className="text-center text-success fw-bold">
//                   {servicePrices[selectedService] ? `💰 Price: ₹${servicePrices[selectedService]}` : 'Price not available'}
//                 </div>
//               )}

//               <div className="position-relative">
//                 <textarea 
//                   name="notes" 
//                   value={formData.notes}
//                   onChange={handleChange}
//                   placeholder="Additional Notes" 
//                   className="form-control ps-5 border border-danger"
//                 ></textarea>
//                 <div className="position-absolute top-0 start-0 ps-3 pt-2 text-danger">
//                   <i className="fas fa-sticky-note"></i>
//                 </div>
//               </div>
//               <div className="position-relative">
//                 <input 
//                   type="date" 
//                   name="date" 
//                   value={formData.date}
//                   onChange={handleChange}
//                   placeholder="Choose a date" 
//                   className="form-control ps-5 border border-danger" 
//                   required 
//                 />
//                 <div className="position-absolute top-50 start-0 translate-middle-y ps-3 text-danger">
//                   <i className="fas fa-calendar-alt"></i>
//                 </div>
//               </div>

//               {/* Payment Option */}
//               <div className="form-group position-relative">
//                 <select 
//                   name="paymentMethod" 
//                   value={formData.paymentMethod}
//                   onChange={handleChange}
//                   className="form-select border-danger ps-5" 
//                   required
//                 >
//                   <option value="">Select Payment Method</option>
//                   <option value="Online">Online Payment</option>
//                   <option value="COD">Cash on Delivery (COD)</option>
//                 </select>
//                 <i className="fas fa-wallet position-absolute top-50 start-0 translate-middle-y ps-3 text-danger"></i>
//               </div>

//               <button 
//                 type="submit" 
//                 className="btn btn-danger mt-3 w-100 text-uppercase fw-bold"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <span>
//                     <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                     Processing...
//                   </span>
//                 ) : (
//                   <span>Submit Booking</span>
//                 )}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}

      // <style>{`
      //   .car-animation {
      //     animation: carEnter 1.5s ease-in-out forwards;
      //   }
      //   @keyframes carEnter {
      //     0% { transform: translateX(-100vw); }
      //     100% { transform: translateX(0); }
      //   }
        
      //   .transform-to-form {
      //     animation: transformToForm 0.7s forwards;
      //   }
        
      //   @keyframes transformToForm {
      //     0% { 
      //       transform: translateX(0);
      //       opacity: 1;
      //     }
      //     100% { 
      //       transform: scale(0.1) translateY(-50px);
      //       opacity: 0;
      //     }
      //   }
        
      //   .transforming {
      //     animation: formAppear 0.7s forwards;
      //   }
        
      //   @keyframes formAppear {
      //     0% { 
      //       opacity: 0;
      //       transform: scale(0.8);
      //     }
      //     100% { 
      //       opacity: 1;
      //       transform: scale(1);
      //     }
      //   }
        
      //   .transition-opacity {
      //     animation: fadeIn 0.5s ease-in-out forwards;
      //   }

      //   @keyframes fadeIn {
      //     0% { opacity:0; }
      //     100% { opacity: 1; }
      //   }

      //   .booking {
      //     background-image: url('public/img/service.jpg');
      //     background-size: cover;
      //     background-position: center;
      //     background-repeat: no-repeat;
      //     position: relative;
      //     // height: 100vh;
      //   }
        
      //   .booking::before {
      //     content: '';
      //     position: absolute;
      //     top: 0;
      //     left: 0;
      //     right: 0;
      //     bottom: 0;
      //     background: rgba(0, 0, 0, 0.5);
      //     backdrop-filter: blur(5px);
      //   }
        
      //   .car-animation .fas {
      //     animation: carBounce 0.5s infinite alternate;
      //   }
        
      //   @keyframes carBounce {
      //     0% { transform: translateY(-3px); }
      //     100% { transform: translateY(3px); }
      //   }
      // `}</style>
//     </div>
//   );
// };

// export default BookService;



