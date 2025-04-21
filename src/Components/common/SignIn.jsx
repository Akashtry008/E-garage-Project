import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AuthForm.module.css';
import AuthService from '../../services/AuthService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const fadeInStyle = {
  animation: 'fadeIn 0.8s ease-in-out'
};

const validateEmail = (email) => email.includes('@');

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');
  const navigate = useNavigate();

  // Check if backend is available and handle new user registration
  useEffect(() => {
    // Check if backend is available
    fetch('http://localhost:8000/api/health')
      .then(response => {
        if (response.ok) {
          console.log('Backend server is available');
          setBackendAvailable(true);
        } else {
          console.error('Backend returned error', response.status);
          setBackendAvailable(false);
        }
      })
      .catch(error => {
        console.error('Backend server not available:', error);
        setBackendAvailable(false);
      });
    
    // Check for new user credentials from registration
    const params = new URLSearchParams(window.location.search);
    const isNewUser = params.get('newUser');
    
    if (isNewUser === 'true') {
      const newUserEmail = localStorage.getItem('newUserEmail');
      const newUserPassword = localStorage.getItem('newUserPassword');
      
      if (newUserEmail && newUserPassword) {
        // Set credentials and select user role
        setEmail(newUserEmail);
        setPassword(newUserPassword);
        setSelectedRole('user');
        
        // Show success message
        toast.info('Please sign in with your new account');
        
        // Clear stored credentials after using them
        localStorage.removeItem('newUserEmail');
        localStorage.removeItem('newUserPassword');
      }
    }
  }, []);

  // Handle role selection and set default credentials
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    
    // Set default credentials based on role
    if (role === 'admin') {
      setEmail('admin@egarage.com');
      setPassword('admin123');
    } else if (role === 'service_provider') {
      setEmail('provider@egarage.com');
      setPassword('provider123');
    } else {
      // Clear credentials for regular user
      setEmail('');
      setPassword('');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!validateEmail(email) || password.length < 6) {
      toast.error('Please enter a valid email and password of at least 6 characters.');
      return;
    }

    if (!backendAvailable) {
      toast.error('Backend server is not available. Please ensure it is running.');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = 'http://localhost:8000/api';
      let endpoint = '';
      let redirectPath = '';
      
      // Determine the endpoint and redirect path based on selected role
      if (selectedRole === 'admin') {
        endpoint = `${apiUrl}/auth/admin/signin`;
        redirectPath = '/AdminDashboard';
      } else if (selectedRole === 'service_provider') {
        endpoint = `${apiUrl}/auth/provider/signin`;
        redirectPath = '/service-provider/dashboard';
      } else {
        endpoint = `${apiUrl}/auth/signin`;
        redirectPath = '/';
      }
      
      console.log(`Attempting to sign in as ${selectedRole} with email: ${email}`);
      console.log('Making fetch request to:', endpoint);
      console.log('Request body:', JSON.stringify({ email, password }));
      
      // Special case handling for first-time login after registration
      const params = new URLSearchParams(window.location.search);
      const isNewUser = params.get('newUser') === 'true';
      
      if (isNewUser) {
        console.log('This is a new user login after registration, adding extra delay for database sync');
        toast.info('Initializing your new account...', { autoClose: 1000 });
        // Add a small delay to give the database time to sync
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const result = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      // Parse the response
      let responseData;
      const responseText = await result.text();
      console.log('Raw response text:', responseText);
      
      try {
        responseData = JSON.parse(responseText);
        console.log('Server response:', responseData);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw { message: 'Received invalid response from server' };
      }
      
      // Check if the request was successful
      if (!result.ok) {
        console.error('Failed sign-in response:', result.status, responseData);
        
        // Special handling for new user registrations that can't sign in
        if (isNewUser && result.status === 404) {
          console.log('New user failed to sign in - likely database sync issue. Trying again...');
          toast.info('Still preparing your account. Please wait...', { autoClose: 2000 });
          
          // Try again with a longer delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const retryResult = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          
          if (retryResult.ok) {
            const retryData = await retryResult.json();
            console.log('Retry successful:', retryData);
            responseData = retryData;
          } else {
            // If retry fails, try to sign up again as a last resort
            console.log('Retry failed, attempting auto-signup');
            
            try {
              // Get the stored data from signup or create basic data
              const firstName = email.split('@')[0];
              const lastName = 'User';
              
              // Create a basic user profile
              const userData = {
                firstName,
                lastName,
                name: `${firstName} ${lastName}`,
                email,
                password,
                role_id: "default_user_role_id"
              };
              
              // Try to sign up silently
              const signupResponse = await fetch(`${apiUrl}/auth/signup`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
              });
              
              if (signupResponse.ok) {
                toast.success('Account created! Logging you in...');
                
                // Try signing in one more time
                const finalRetry = await fetch(endpoint, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email, password }),
                });
                
                if (finalRetry.ok) {
                  responseData = await finalRetry.json();
                } else {
                  throw { message: 'Unable to sign in after account creation. Please try again.' };
                }
              } else {
                throw { message: responseData.message || `Authentication failed: ${result.status}` };
              }
            } catch (error) {
              console.error('Auto-signup failed:', error);
              throw { message: 'Unable to log in. Please try signing up again.' };
            }
          }
        } else {
          throw { message: responseData.message || `Authentication failed: ${result.status}` };
        }
      }
      
      if (responseData && (responseData.token || responseData.access_token)) {
        // Store auth data
        const token = responseData.token || responseData.access_token;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(responseData.user));
        localStorage.setItem('id', responseData.user._id || responseData.user.id);
        
        toast.success('Login successful!');
        setTimeout(() => {
          navigate(redirectPath);
        }, 1000);
      } else {
        throw { message: 'No authentication token received' };
      }
    } catch (error) {
      console.error('Sign In Error:', error);
      
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to sign in. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Style for role selection buttons
  const roleButtonStyle = (role) => ({
    padding: '8px 15px',
    marginRight: '10px',
    marginBottom: '20px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: selectedRole === role ? '#3267e3' : '#e0e0e0',
    color: selectedRole === role ? 'white' : '#333',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  });

  return (
    <div className={styles['auth-wrapper']} style={fadeInStyle}>
      <ToastContainer position="top-center" autoClose={3000} />
      {!backendAvailable && (
        <div style={{ 
          padding: '10px', 
          margin: '10px auto', 
          borderRadius: '5px',
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          Backend server is not available. Please ensure it is running on port 8000.
        </div>
      )}
      <div className={`${styles['auth-box']} ${styles['slide-right']}`}> 
        <div className={styles['auth-form']}>
          <h2>Sign In</h2>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Select your role:</p>
            <button 
              type="button" 
              style={roleButtonStyle('user')}
              onClick={() => handleRoleSelect('user')}
            >
              User
            </button>
            <button 
              type="button" 
              style={roleButtonStyle('service_provider')}
              onClick={() => handleRoleSelect('service_provider')}
            >
              Service Provider
            </button>
            <button 
              type="button" 
              style={roleButtonStyle('admin')}
              onClick={() => handleRoleSelect('admin')}
            >
              Admin
            </button>
          </div>
          
      <form onSubmit={handleSignIn}>
          <input
            type="email"
              placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
              disabled={isLoading}
          />
          <input
            type="password"
              placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
              disabled={isLoading}
            />

            <div style={{ marginBottom: '20px', textAlign: 'right' }}>
              <Link to="/forgot-password" className={styles['auth-footer']}>Forgot Password?</Link>
            </div>

            <button 
              className={styles['auth-btn']} 
              type="submit" 
              disabled={isLoading || !backendAvailable}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className={styles['auth-footer']}>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
        <div className={styles['auth-side']}>
          <h2>Hello!</h2>
          <p>Welcome back to E-Garage</p>
          <p>Not registered yet?</p>
          <Link to="/signup" className={styles['auth-btn-outline']}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
