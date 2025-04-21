import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Load EmailJS script
const loadEmailJSScript = () => {
  return new Promise((resolve) => {
    if (window.emailjs) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.emailjs.com/dist/email.min.js';
    script.async = true;
    script.onload = () => {
      // Initialize with your user ID
      window.emailjs.init("user_Yourt1LavPhRcZ9zICb1V"); // Replace with your actual EmailJS user ID
      resolve(true);
    };
    script.onerror = () => {
      console.error("Failed to load EmailJS");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Service price mapping
const servicePrices = {
  "Diagnostic Test": 999,
  "Oil Changing": 499,
  "Engine Servicing": 1499,
  "Tires Replacement": 2999,
};

export const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  // Try to get service from URL parameters or localStorage
  const savedService = localStorage.getItem('selectedService');
  const initialService = searchParams.get('service') || savedService || 'Diagnostic Test';
  
  // Get customer data from localStorage if available
  const savedName = localStorage.getItem('customerName') || '';
  const savedPhone = localStorage.getItem('customerPhone') || '';
  const bookingId = localStorage.getItem('bookingId') || '';
  
  const [formData, setFormData] = useState({
    name: savedName,
    email: '',
    contact: savedPhone,
    service: initialService,
    amount: servicePrices[initialService] || 999,
  });
  
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  // For debugging
  useEffect(() => {
    console.log("Confirmation state changed:", showConfirmation);
    console.log("Payment info:", paymentInfo);
  }, [showConfirmation, paymentInfo]);

  // Load scripts on component mount
  useEffect(() => {
    Promise.all([
      loadRazorpayScript(),
      loadEmailJSScript()
    ]).then(([razorpayLoaded, emailjsLoaded]) => {
      if (!razorpayLoaded) {
        console.error("Failed to load Razorpay SDK");
      }
      if (!emailjsLoaded) {
        console.error("Failed to load EmailJS SDK");
      }
    });
  }, []);

  // Update amount when service changes
  useEffect(() => {
    if (formData.service && servicePrices[formData.service]) {
      setFormData(prev => ({
        ...prev,
        amount: servicePrices[formData.service]
      }));
    }
  }, [formData.service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update amount immediately when service changes
    if (name === 'service' && servicePrices[value]) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        amount: servicePrices[value]
      }));
    }
  };

  const sendConfirmationEmail = async (paymentId) => {
    try {
      if (!window.emailjs) {
        await loadEmailJSScript();
        if (!window.emailjs) {
          throw new Error("EmailJS not available");
        }
      }

      const gstAmount = formData.amount * 0.18;
      const totalAmount = formData.amount + gstAmount;
      
      const emailParams = {
        to_name: formData.name,
        to_email: formData.email,
        service_name: formData.service,
        payment_id: paymentId,
        amount: formData.amount.toFixed(2),
        gst: gstAmount.toFixed(2),
        total: totalAmount.toFixed(2),
        contact: formData.contact
      };

      const response = await window.emailjs.send(
        "service_0ac9j04", // Replace with your EmailJS service ID
        "template_q43wp5b", // Replace with your EmailJS template ID
        emailParams
      );

      console.log("Email sent successfully:", response);
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  };

  const updateBookingPaymentStatus = async (paymentId) => {
    // If we have a booking ID, update its payment status
    if (bookingId) {
      try {
        const response = await axios.patch(`/api/bookings/${bookingId}/payment`, {
          payment_status: "paid"
        });
        
        console.log("Booking payment status updated:", response.data);
        return true;
      } catch (error) {
        console.error("Failed to update booking payment status:", error);
        return false;
      }
    }
    return false;
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    // Clear localStorage items that we no longer need
    localStorage.removeItem('selectedService');
    localStorage.removeItem('servicePrice');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerPhone');
    localStorage.removeItem('bookingId');
    navigate('/');
  };

  const handlePaymentSuccess = async (response) => {
    try {
      console.log("Payment success handler called with:", response);
      
      // Calculate amounts
      const gstAmount = formData.amount * 0.18;
      const totalAmount = formData.amount + gstAmount;
      const formattedAmount = parseFloat(totalAmount.toFixed(2));
      
      // Save payment information for confirmation
      const paymentDetails = {
        id: response.razorpay_payment_id,
        service: formData.service,
        amount: formData.amount,
        gst: gstAmount.toFixed(2),
        total: formattedAmount.toFixed(2),
        date: new Date().toLocaleString(),
        customer: {
          name: formData.name,
          email: formData.email,
          contact: formData.contact
        }
      };
      
      console.log("Setting payment info:", paymentDetails);
      setPaymentInfo(paymentDetails);
      
      // Save payment to database
      try {
        console.log("Saving payment to database...");
        const paymentData = {
          payment_id: response.razorpay_payment_id,
          order_id: response.razorpay_order_id || "",
          signature: response.razorpay_signature || "",
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.contact,
          service: formData.service,
          amount: parseFloat(formData.amount),
          gst_amount: parseFloat(gstAmount.toFixed(2)),
          total_amount: formattedAmount,
          payment_method: "online",
          payment_status: "successful",
          invoice_number: `INV-${new Date().getTime()}`,
          notes: `Service: ${formData.service}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // First, create the payment record
        const createResponse = await axios.post('/api/payments/', paymentData);
        console.log("Payment saved to database:", createResponse.data);
        
        // Then, verify the payment with Razorpay
        const verifyResponse = await axios.post('/api/payments/verify', {
          payment_id: response.razorpay_payment_id,
          order_id: response.razorpay_order_id || "",
          signature: response.razorpay_signature || ""
        });
        console.log("Payment verification response:", verifyResponse.data);
        
        // Update the booking payment status if booking ID exists
        const bookingUpdated = await updateBookingPaymentStatus(response.razorpay_payment_id);
        
        if (bookingUpdated) {
          console.log("Booking payment status updated successfully");
        }
        
        toast.success("Payment recorded successfully!");
      } catch (error) {
        console.error("Error saving payment to database:", error);
        toast.warning("Payment successful, but couldn't save to database. Please contact support.");
      }
      
      // Send confirmation email
      const emailSent = await sendConfirmationEmail(response.razorpay_payment_id);
      
      if (emailSent) {
        toast.success("Payment confirmation email sent!");
      } else {
        toast.warning("Payment successful, but couldn't send confirmation email.");
      }
      
      // Show confirmation popup - do this last
      console.log("Showing confirmation popup");
      setShowConfirmation(true);
      setLoading(false);

      // Force a re-render to ensure the confirmation popup appears
      setTimeout(() => {
        console.log("Forcing re-render");
        setShowConfirmation(prevState => {
          console.log("Current state:", prevState);
          return prevState;
        });
      }, 100);
    } catch (error) {
      console.error("Error in payment success handling:", error);
      toast.error("Error processing payment completion");
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if all fields are filled
      if (!formData.name || !formData.email || !formData.contact) {
        toast.error("Please fill in all required fields");
        setLoading(false);
      return;
    }
      
      // Calculate GST and total amount
      const gstAmount = formData.amount * 0.18;
      const totalAmount = formData.amount + gstAmount;
      
      // Ensure Razorpay is loaded
      const isScriptLoaded = await loadRazorpayScript();
      
      if (!isScriptLoaded || !window.Razorpay) {
        toast.error("Payment gateway not available. Please try again later.");
        setLoading(false);
        return;
      }

      // Format the amount precisely - Razorpay expects amount in paise (without decimals)
      // First, calculate with precision to 2 decimal places
      const formattedAmount = parseFloat(totalAmount.toFixed(2));
      // Convert to paise (multiply by 100) and ensure it's an integer
      const amountInPaise = Math.round(formattedAmount * 100);

      console.log("Original amount:", totalAmount);
      console.log("Formatted amount:", formattedAmount);
      console.log("Amount in paise:", amountInPaise);

    const options = {
        key: "rzp_test_piQFnjtubjCSKt", // Replace with your Razorpay Key ID
        amount: amountInPaise, // amount in paise (integer required)
      currency: "INR",
        name: "E-Garage Service",
      description: `${formData.service} Booking`,
        handler: handlePaymentSuccess,
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed");
            toast.info("Payment window closed");
            setLoading(false);
          }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
      },
        notes: {
          service: formData.service,
          amount: formData.amount.toFixed(2),
          gst: gstAmount.toFixed(2),
          total: formattedAmount.toFixed(2)
      },
      theme: { color: "#dc3545" },
    };

    const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      
      // Open the payment window
      console.log("Opening Razorpay window with amount:", formattedAmount, "₹");
      paymentObject.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Could not initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
    className="payment-background"
    style={{
      backgroundImage: `url('public/img/money.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      minWidth:'100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'pulseGlow 10s infinite',
    }}
  >
    <div className="payment-overlay">
      {showConfirmation ? (
        <div className="container mt-5" style={{ 
          backgroundColor: 'rgba(255,255,255,0.95)', 
          maxWidth: '500px', 
          borderRadius: '10px', 
          padding: '30px',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)'
        }}>
          <div className="text-center">
            <div className="mb-3">
              <i className="fas fa-check-circle text-success" style={{ fontSize: '64px' }}></i>
              {/* Fallback icon if FontAwesome is not available */}
              <div className="text-success" style={{ fontSize: '64px' }}>✓</div>
            </div>
            <h2 className="mb-4 text-success">Payment Successful!</h2>
            
            <div className="card p-3 mb-3">
              <div className="text-start">
                <p><strong>Payment ID:</strong> {paymentInfo?.id}</p>
                <p><strong>Service:</strong> {paymentInfo?.service}</p>
                <p><strong>Amount:</strong> ₹{paymentInfo?.amount}</p>
                <p><strong>GST (18%):</strong> ₹{paymentInfo?.gst}</p>
                <p><strong>Total:</strong> ₹{paymentInfo?.total}</p>
                <p><strong>Date:</strong> {paymentInfo?.date}</p>
              </div>
            </div>
            
            <p className="mb-4">
              A confirmation email has been sent to <strong>{paymentInfo?.customer?.email}</strong>
            </p>
            
            <button 
              onClick={closeConfirmation} 
              className="btn btn-primary w-100"
            >
              Back to Home
            </button>
          </div>
        </div>
      ) : (
        <div className="container mt-5" style={{ backgroundColor: 'rgba(255,255,255,0.9)', maxWidth: '500px', borderRadius: '10px', height: '530px',width:'500px', contentAlign: 'center', paddingTop: '55px' }}>
      <ToastContainer position="top-center" autoClose={3000} />
      <h2 className="text-center mb-4 text-danger">🔐 Pay for Your Service</h2>
      <form onSubmit={handlePayment} className="d-grid gap-3">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="form-control"
              disabled={loading}
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-control"
              disabled={loading}
        />
        <input
          type="tel"
          name="contact"
          placeholder="Contact Number"
          value={formData.contact}
          onChange={handleChange}
          required
          className="form-control"
              disabled={loading}
        />
        <select
          name="service"
          className="form-select"
          value={formData.service}
          onChange={handleChange}
              disabled={loading}
            >
              <option value="Diagnostic Test">Diagnostic Test</option>
              <option value="Oil Changing">Oil Changing</option>
              <option value="Engine Servicing">Engine Servicing</option>
              <option value="Tires Replacement">Tires Replacement</option>
        </select>

        <div className="fw-bold text-success">
              💰 Subtotal: ₹{formData.amount}
              <br />
              GST (18%): ₹{(formData.amount * 0.18).toFixed(2)}
              <br />
              Total: ₹{(formData.amount + formData.amount * 0.18).toFixed(2)}
        </div>

            <button 
              type="submit" 
              className="btn btn-danger w-100 text-uppercase fw-bold"
              disabled={loading}
            >
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  PROCESSING...
                </span>
              ) : (
                <span>Pay Now</span>
              )}
        </button>
      </form>
        </div>
      )}
    </div>
    </div>
  );
};

export default Payment;
