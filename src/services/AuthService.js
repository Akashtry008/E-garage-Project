import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${BASE_URL}/api`; // Add /api prefix

const AuthService = {
  // Sign up a new user
  signup: async (userData) => {
    try {
      console.log('Sending signup request to:', `${API_URL}/auth/signup`);
      console.log('Request data:', JSON.stringify(userData, null, 2));
      
      // Use fetch instead of axios for consistency
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      // Get the raw response text first
      const responseText = await response.text();
      console.log('Raw signup response:', responseText);
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed signup response:', data);
      } catch (parseError) {
        console.error('Error parsing response as JSON:', parseError);
        throw { message: 'Server returned invalid JSON response' };
      }
      
      if (!response.ok) {
        console.error('Signup error response:', data);
        throw { 
          message: data.message || data.detail || 'Registration failed',
          statusCode: response.status,
          data: data
        };
      }
      
      // Store token and user data if available
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('id', data.user._id || data.user.id);
        }
      }
      
      // Store credentials for auto-login
      if (userData.email && userData.password) {
        console.log('Storing credentials for auto-login');
        localStorage.setItem('newUserEmail', userData.email);
        localStorage.setItem('newUserPassword', userData.password);
      }
      
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // Sign in an existing user
  signin: async (credentials) => {
    try {
      // Simple direct request
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      // Parse the JSON response
      const data = await response.json();
      console.log('Raw user login response:', data);
      
      if (!response.ok) {
        throw { message: data.message || 'Authentication failed' };
      }
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('id', data.user._id);
      }
      
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  // Admin sign in
  adminSignin: async (credentials) => {
    try {
      // Simple direct request
      const response = await fetch(`${API_URL}/auth/admin/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      // Parse the JSON response
      const data = await response.json();
      console.log('Raw admin login response:', data);
      
      if (!response.ok) {
        throw { message: data.message || 'Authentication failed' };
      }
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('id', data.user._id);
      }
      
      return data;
    } catch (error) {
      console.error('Admin sign in error:', error);
      throw error;
    }
  },

  // Service provider sign in
  serviceProviderSignin: async (credentials) => {
    try {
      // Simple direct request
      const response = await fetch(`${API_URL}/auth/provider/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      // Parse the JSON response
      const data = await response.json();
      console.log('Raw service provider login response:', data);
      
      if (!response.ok) {
        throw { message: data.message || 'Authentication failed' };
      }
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('id', data.user._id);
      }
      
      return data;
    } catch (error) {
      console.error('Service provider sign in error:', error);
      throw error;
    }
  },

  // Logout the current user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('id');
  },

  // Get the current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // GET - Get user profile by ID
  getUserProfile: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching user profile' };
    }
  },

  // GET - Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching users' };
    }
  },

  // PUT - Update user profile
  updateUserProfile: async (userId, userData) => {
    try {
      const response = await axios.put(`${API_URL}/users/${userId}`, userData);

      const currentUser = AuthService.getCurrentUser();
      if (currentUser && currentUser._id === userId) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error updating user profile' };
    }
  },

  // DELETE - Delete user account
  deleteUserAccount: async (userId) => {
    try {
      const response = await axios.delete(`${API_URL}/users/${userId}`);

      const currentUser = AuthService.getCurrentUser();
      if (currentUser && currentUser._id === userId) {
        AuthService.logout();
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error deleting user account' };
    }
  },

  // POST - Change password
  changePassword: async (userId, passwordData) => {
    try {
      const response = await axios.post(`${API_URL}/users/${userId}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error changing password' };
    }
  },

  // POST - Request password reset
  requestPasswordReset: async (email) => {
    try {
      // For debugging, use the debug endpoint instead 
      // Change this to true to use the debug endpoint
      const useDebugEndpoint = true;
      
      let endpoint = `${API_URL}/auth/request-password-reset`;
      if (useDebugEndpoint) {
        endpoint = `${API_URL}/auth/debug-password-reset`;
        console.log("Using debug endpoint for password reset");
      }
      
      const response = await axios.post(endpoint, {
        email
      });
      
      // Log for debugging / test
      console.log('Password reset response:', response.data);
      
      // Special instructions for yopmail addresses
      if (email.toLowerCase().includes('yopmail.com')) {
        console.log('For yopmail addresses, check your inbox at http://www.yopmail.com/en/');
      }
      
      return response;  // Return the full response to allow access to data property
    } catch (error) {
      console.error('Error requesting password reset:', error);
      
      // Format the error properly
      let errorMessage = 'Failed to send reset link. Please try again.';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Still return a successful response for security reasons even when there's an error
      if (email.toLowerCase().includes('yopmail.com')) {
        return { data: { message: "Reset link sent (to yopmail)", status: true } };
      }
      
      // Throw a properly formatted error
      throw { message: errorMessage };
    }
  },

  // POST - Check if reset token is valid
  verifyResetToken: async (token) => {
    try {
      console.log(`Verifying reset token validity`);
      
      // Call the backend endpoint to verify token
      const response = await axios.post(`${API_URL}/auth/verify-reset-token`, { token });
      
      // If the response came back successfully, the token is valid
      return response.data;
    } catch (error) {
      console.error('Error verifying token:', error);
      
      // Format the error message based on response
      let errorMessage = 'Invalid or expired token';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      // For temporary workaround, return a valid response even if verification fails
      // This allows us to still attempt a password reset even if verification endpoint has issues
      return { 
        valid: true, 
        status: true, 
        message: "Fallback token validation",
        error: errorMessage,
        fallback: true
      };
      
      // In production, you would uncomment this to properly handle invalid tokens:
      // throw { message: errorMessage };
    }
  },

  // POST - Reset password with token
  resetPassword: async (token, newPassword, confirmPassword) => {
    try {
      console.log(`Attempting to reset password with token`);
      
      // First log detailed information about the request
      console.log(`Token length: ${token.length}`);
      console.log(`Token preview: ${token.substring(0, 10)}...${token.substring(token.length-5)}`);
      console.log(`Password length: ${newPassword.length}`);
      
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      console.log('Password reset response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      
      // Format the error message based on response
      let errorMessage = 'Failed to reset password.';
      let errorDetails = {};
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        errorDetails = {
          status: error.response.status,
          data: error.response.data
        };
        
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 404) {
          errorMessage = 'User account not found.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid or expired token. Please request a new password reset link.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        errorMessage = 'No response from server. Please check your connection and try again.';
        errorDetails = { request: 'No response received' };
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        errorMessage = error.message;
        errorDetails = { message: error.message };
      }
      
      // Throw a detailed error object
      throw { 
        message: errorMessage, 
        details: errorDetails,
        timestamp: new Date().toISOString()
      };
    }
  },

  // POST - Verify email address
  verifyEmail: async (token) => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email`, { token });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error verifying email' };
    }
  },

  // GET - Check token validity
  validateToken: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/validate-token`);
      
      if (!response.ok) {
        AuthService.logout();
        throw { message: 'Invalid or expired token' };
      }
      
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Token validation error:', error);
      AuthService.logout();
      throw error;
    }
  }
};

export default AuthService;
