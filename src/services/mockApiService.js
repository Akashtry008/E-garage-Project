/**
 * Mock API Service
 * This file provides mock responses for API endpoints when the backend server is not available
 */

import axios from 'axios';

// Intercept axios requests to provide mock responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Case 1: Network error (server not available)
    if (!error.response && error.message === 'Network Error') {
      console.warn('Backend server not available, using mock response');
      return handleMockResponse(error.config);
    }

    // Case 2: 404 Not Found errors for specific endpoints
    if (error.response && error.response.status === 404) {
      const url = error.config.url || '';
      
      // Check if it's a booking or payment endpoint
      if (url.includes('/api/bookings/') || url.includes('/api/payments/')) {
        console.warn('API endpoint not found, using mock response:', url);
        return handleMockResponse(error.config);
      }
    }
    
    // Allow other errors to propagate
    return Promise.reject(error);
  }
);

// Handle mock responses based on the request URL and method
const handleMockResponse = (config) => {
  const { url, method, data } = config;
  
  console.log('Handling mock response for:', url, method);
  
  // Extract endpoint from URL
  let endpoint = '';
  
  try {
    // Handle both relative and absolute URLs
    if (url.startsWith('http')) {
      const urlObj = new URL(url);
      endpoint = urlObj.pathname.split('/').slice(1).join('/');
    } else {
      endpoint = url.split('/').slice(1).join('/');
    }
  } catch (e) {
    console.error('Error parsing URL:', e);
    endpoint = url.split('/').slice(1).join('/');
  }
  
  console.log('Extracted endpoint:', endpoint);
  
  // Process different endpoints
  if (endpoint.endsWith('bookings/service') && method.toLowerCase() === 'post') {
    return mockServiceBooking(data ? (typeof data === 'string' ? JSON.parse(data) : data) : {});
  }
  
  if (endpoint.endsWith('payments') && method.toLowerCase() === 'post') {
    return mockCreatePayment(data ? (typeof data === 'string' ? JSON.parse(data) : data) : {});
  }
  
  if (endpoint.endsWith('payments/verify') && method.toLowerCase() === 'post') {
    return mockVerifyPayment(data ? (typeof data === 'string' ? JSON.parse(data) : data) : {});
  }
  
  if (endpoint.match(/bookings\/.*\/payment/) && method.toLowerCase() === 'patch') {
    return mockUpdateBookingPayment(endpoint, data ? (typeof data === 'string' ? JSON.parse(data) : data) : {});
  }
  
  // Default mock response
  return Promise.resolve({
    status: 200,
    data: {
      message: 'Mock response - Backend endpoint not available',
      status: true
    }
  });
};

// Mock service booking
const mockServiceBooking = (payload) => {
  console.log('Creating mock service booking with payload:', payload);
  
  // Generate a mock booking ID
  const bookingId = 'mock-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  
  // Store booking in localStorage for persistence
  const bookings = JSON.parse(localStorage.getItem('mockBookings') || '[]');
  const newBooking = {
    _id: bookingId,
    ...payload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  bookings.push(newBooking);
  localStorage.setItem('mockBookings', JSON.stringify(bookings));
  
  return Promise.resolve({
    status: 201,
    statusText: 'Created',
    data: {
      message: 'Booking created successfully',
      booking: newBooking,
      status: true
    }
  });
};

// Mock create payment
const mockCreatePayment = (payload) => {
  console.log('Creating mock payment with payload:', payload);
  
  // Generate a mock payment ID if not provided
  const paymentId = payload.payment_id || 'pay_mock_' + Date.now().toString(36);
  
  // Store payment in localStorage for persistence
  const payments = JSON.parse(localStorage.getItem('mockPayments') || '[]');
  const newPayment = {
    id: paymentId,
    ...payload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  payments.push(newPayment);
  localStorage.setItem('mockPayments', JSON.stringify(payments));
  
  return Promise.resolve({
    status: 201,
    statusText: 'Created',
    data: {
      message: 'Payment created successfully',
      payment: newPayment,
      status: true
    }
  });
};

// Mock verify payment
const mockVerifyPayment = (payload) => {
  console.log('Verifying mock payment with payload:', payload);
  
  return Promise.resolve({
    status: 200,
    statusText: 'OK',
    data: {
      status: 'success',
      message: 'Payment verified successfully'
    }
  });
};

// Mock update booking payment
const mockUpdateBookingPayment = (endpoint, payload) => {
  console.log('Updating mock booking payment status with payload:', payload);
  
  // Extract booking ID from endpoint
  const bookingId = endpoint.split('/')[2];
  
  // Update booking in localStorage
  const bookings = JSON.parse(localStorage.getItem('mockBookings') || '[]');
  const bookingIndex = bookings.findIndex(booking => booking._id === bookingId);
  
  if (bookingIndex >= 0) {
    bookings[bookingIndex].payment_status = payload.payment_status;
    bookings[bookingIndex].updated_at = new Date().toISOString();
    localStorage.setItem('mockBookings', JSON.stringify(bookings));
    
    return Promise.resolve({
      status: 200,
      statusText: 'OK',
      data: {
        message: 'Booking payment status updated successfully',
        booking: bookings[bookingIndex],
        status: true
      }
    });
  }
  
  // If booking not found
  return Promise.resolve({
    status: 404,
    statusText: 'Not Found',
    data: {
      message: 'Booking not found',
      status: false
    }
  });
};

export default {
  // Empty export - functionality is provided through the axios interceptor
}; 