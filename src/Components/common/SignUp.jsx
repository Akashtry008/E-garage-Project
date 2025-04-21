import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AuthForm.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthService from '../../services/AuthService';

const validateEmail = (email) => email.includes('@');

const SignUpPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole] = useState('user');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (firstName.trim() === '') {
      toast.error('Please enter your first name.');
      return;
    }
    
    if (lastName.trim() === '') {
      toast.error('Please enter your last name.');
      return;
    }
    
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // Match the backend's UserSignUp model with both name (combined) and individual name fields
      const userData = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,  // Add the combined name field
        email,
        password,
        role_id: "default_user_role_id" // Use the default_user_role_id instead of 'user'
      };

      console.log('Sending registration data:', userData);
      const response = await AuthService.signup(userData);
      console.log('Sign Up Successful:', response);
      
      // Store user credentials in localStorage to use on the signin page
      localStorage.setItem('newUserEmail', email);
      localStorage.setItem('newUserPassword', password);
      
      toast.success('Account created successfully! Redirecting to sign in...');

      // Give the toast time to display before redirecting
      setTimeout(() => {
        navigate('/signin?newUser=true');
      }, 2000);
    } catch (error) {
      console.error('Sign Up Error:', error);
      toast.error(error?.message || error?.detail || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['auth-wrapper']}>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className={`${styles['auth-box']} ${styles['slide-left']}`}>
        <div className={styles['auth-side']}>
          <h2>Welcome!</h2>
          <p>If you already have an account</p>
          <Link to="/signin" className={styles['auth-btn-outline']}>SIGN IN</Link>
        </div>
        <div className={`${styles['auth-form']} ${styles['slide-in-left']}`}>
          <h2>Sign Up</h2>

          <form onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={isLoading}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={isLoading}
            />
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
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
            />
            <button
              className={styles['auth-btn']}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
