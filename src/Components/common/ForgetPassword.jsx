import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AuthForm.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthService from '../../services/AuthService';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailInfo, setEmailInfo] = useState(null);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim() || !validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setEmailSending(true);

    try {
      const response = await AuthService.requestPasswordReset(email);
      console.log('Reset response:', response);
      
      // Log detailed info for debugging
      if (response.data) {
        console.log('Response data details:', {
          token: response.data.token ? 'Present' : 'Missing',
          email_filename: response.data.email_filename ? response.data.email_filename : 'Missing',
          status: response.data.status,
          message: response.data.message,
          cwd: response.data.cwd // From debug endpoint
        });
      }
      
      // Check if we received token and email filename directly
      if (response.data.token && response.data.email_filename) {
        // Email functionality is disabled, but token is provided
        setEmailInfo({
          token: response.data.token,
          filename: response.data.email_filename
        });
        
        // Option to redirect immediately to reset page
        setTimeout(() => {
          navigate(`/reset-password?token=${response.data.token}`);
        }, 5000);
      } else if (response.data.token) {
        // We have a token but no filename - still treat as successful
        setEmailInfo({
          token: response.data.token,
          filename: null
        });
        
        toast.success('Password reset token generated successfully. Redirecting...');
        
        // Option to redirect immediately to reset page
        setTimeout(() => {
          navigate(`/reset-password?token=${response.data.token}`);
        }, 5000);
      } else {
        // Standard email flow
        setEmailSent(true);
        toast.success('Password reset link sent to your email!');
      }
    } catch (error) {
      console.error('Error sending reset link:', error);
      toast.error(error.message || 'Failed to send reset link. Please try again.');
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className={styles['auth-wrapper']}>
      <ToastContainer position="top-center" autoClose={5000} />
      <div className={styles['auth-form']} style={{ width: '100%', maxWidth: '400px' }}>
        <h2>Forgot Password</h2>
        
        {emailSent ? (
          <div className="alert alert-success">
            <p>Password reset link has been sent to <strong>{email}</strong></p>
            <p>Please check your email inbox and follow the instructions to reset your password.</p>
            <p className="mt-3">
              <Link to="/signin" className="btn btn-primary">Back to Sign In</Link>
            </p>
          </div>
        ) : emailInfo ? (
          <div className="alert alert-info">
            <p><strong>Email functionality is currently disabled.</strong></p>
            <p>Your password reset token has been generated and you'll be redirected to the reset page automatically.</p>
            
            {emailInfo.filename && (
              <div className="mt-2">
                <p><strong>Your email has been saved as an HTML file:</strong></p>
                <p className="font-monospace bg-light p-2">{emailInfo.filename}</p>
                <p>You can find this file in the <code>emails</code> or <code>backend/emails</code> directory.</p>
              </div>
            )}
            
            <p className="mt-3">
              <button 
                className="btn btn-primary me-2" 
                onClick={() => navigate(`/reset-password?token=${emailInfo.token}`)}
              >
                Go to Reset Page
              </button>
              <Link to="/signin" className="btn btn-outline-secondary">Back to Sign In</Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendResetLink}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={emailSending}
              >
                {emailSending ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link to="/signin" className="btn btn-outline-secondary">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
