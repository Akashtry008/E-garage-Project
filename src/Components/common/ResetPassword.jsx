import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import styles from './AuthForm.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthService from '../../services/AuthService';

export const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [searchParams] = useSearchParams();
  const [isValidToken, setIsValidToken] = useState(true);
  const [isValidating, setIsValidating] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(false);
  const navigate = useNavigate();

  // Get token from query string
  const token = searchParams.get('token');

  // Verify token with backend when component mounts
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        console.error('No token found in URL');
        setIsValidToken(false);
        setIsValidating(false);
        setDebugInfo({ error: 'No token provided in URL' });
        return;
      }

      // Save token for debugging
      setDebugInfo(prev => ({ ...prev, token: token, tokenLength: token.length }));

      try {
        console.log(`Verifying token: ${token.substring(0, 10)}...`);
        
        // For fallback, if verify endpoint fails, we'll still allow direct reset attempt
        try {
          // Try calling the verification endpoint
          const response = await AuthService.verifyResetToken(token);
          console.log('Token verification response:', response);
          setDebugInfo(prev => ({ ...prev, verifyResponse: response }));
          
          if (response && response.valid) {
            setIsValidToken(true);
          } else {
            // We'll still try direct reset if validation endpoint returns false
            // This is to handle cases where the verification endpoint might have issues
            console.log("Token validation failed, but will still allow reset attempt");
            setDebugInfo(prev => ({ ...prev, allowResetAttempt: true }));
            setIsValidToken(true);
          }
        } catch (verifyError) {
          console.error('Token verification error:', verifyError);
          setDebugInfo(prev => ({ ...prev, verifyError: verifyError.message || 'Unknown verification error' }));
          
          // We'll still allow form submission as fallback - the actual reset will validate
          console.log("Token verification error, but still allowing reset attempt");
          setIsValidToken(true);
        }
      } catch (error) {
        console.error('Error during token validation:', error);
        setDebugInfo(prev => ({ ...prev, error: error.message || 'Unknown error' }));
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleReset = async (e) => {
    e.preventDefault();
    
    // Validate password length - must match backend requirement (8 chars)
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setDebugInfo(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      console.log("Attempting password reset with token");
      
      // Call the API to reset password
      const response = await AuthService.resetPassword(token, newPassword, confirmPassword);
      
      console.log("Password reset successful:", response);
      setDebugInfo(prev => ({ ...prev, resetResponse: response }));
      
      // Check if we're in testing mode
      const isTestingMode = response.testing_mode === true;
      if (isTestingMode) {
        console.log("Testing mode detected in response");
        setDebugInfo(prev => ({ ...prev, testingMode: true }));
      }
      
      // Mark as complete
      setIsResetComplete(true);
      
      // Show appropriate message
      if (isTestingMode) {
        toast.success('Password reset successful in testing mode!');
      } else {
        toast.success('Password reset successfully! You can now sign in with your new password.');
      }
      
      // Redirect to sign in page after a short delay
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      setDebugInfo(prev => ({ ...prev, resetError: error.message || 'Unknown reset error', errorDetails: error.details || {} }));
      
      // Handle different error messages
      let errorMessage = 'Failed to reset password.';
      
      if (error?.message?.includes('expired')) {
        errorMessage = 'The password reset token has expired. Please request a new one.';
        setIsValidToken(false);
      } else if (error?.message?.includes('Invalid') || error?.message?.includes('invalid')) {
        errorMessage = 'The password reset token is invalid. Please request a new one.';
        setIsValidToken(false);
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setDebugInfo(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  if (isValidating) {
    return (
      <div className={styles['auth-wrapper']}>
        <ToastContainer position="top-center" autoClose={3000} />
        <div className={styles['auth-form']} style={{ width: '100%', maxWidth: '400px' }}>
          <h2>Validating Reset Link</h2>
          <div className="text-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Please wait while we validate your reset link...</p>
            
            <div className="mt-4">
              <button onClick={toggleDebug} className="btn btn-sm btn-outline-secondary">
                {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
              </button>
              
              {showDebug && (
                <div className="mt-3 text-start bg-light p-3 rounded" style={{ fontSize: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isResetComplete) {
    return (
      <div className={styles['auth-wrapper']}>
        <ToastContainer position="top-center" autoClose={3000} />
        <div className={styles['auth-form']} style={{ width: '100%', maxWidth: '400px' }}>
          <h2>Password Reset Complete</h2>
          <div className="alert alert-success">
            <p>Your password has been successfully reset!</p>
            <p>You can now sign in with your new password.</p>
          </div>
          <Link to="/signin" className="btn btn-primary w-100">Go to Sign In</Link>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className={styles['auth-wrapper']}>
        <ToastContainer position="top-center" autoClose={3000} />
        <div className={styles['auth-form']} style={{ width: '100%', maxWidth: '400px' }}>
          <h2>Invalid Token</h2>
          <div className="alert alert-danger">
            <p>The password reset link is invalid or has expired.</p>
            <p>Please request a new password reset link.</p>
          </div>
          <Link to="/forgot-password" className="btn btn-primary w-100">REQUEST NEW RESET LINK</Link>
          
          <div className="mt-4">
            <button onClick={toggleDebug} className="btn btn-sm btn-outline-secondary">
              {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
            </button>
            
            {showDebug && (
              <div className="mt-3 text-start bg-light p-3 rounded" style={{ fontSize: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['auth-wrapper']}>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className={styles['auth-form']} style={{ width: '100%', maxWidth: '400px' }}>
        <h2>Reset Password</h2>
        <form onSubmit={handleReset}>
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">New Password</label>
          <input
            type="password"
              className="form-control"
              id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
              minLength={8}
              placeholder="Enter new password"
          />
            <small className="text-muted">Password must be at least 8 characters long</small>
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input
            type="password"
              className="form-control"
              id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
              minLength={8}
              placeholder="Confirm new password"
          />
          </div>
          
          <div className="d-grid gap-2">
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
            <Link to="/signin" className="btn btn-outline-secondary">Back to Sign In</Link>
          </div>
        </form>
        
        <div className="mt-4">
          <button onClick={toggleDebug} className="btn btn-sm btn-outline-secondary">
            {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
          
          {showDebug && (
            <div className="mt-3 text-start bg-light p-3 rounded" style={{ fontSize: '12px', maxHeight: '200px', overflowY: 'auto' }}>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
