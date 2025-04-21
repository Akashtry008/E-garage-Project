import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const useScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  
  // Check if we're on a user page that already has a scroll to top button
  const isUserPage = 
    location.pathname === '/' || 
    location.pathname === '/about' || 
    location.pathname === '/contact' || 
    location.pathname === '/booking' || 
    location.pathname === '/UserServices' ||
    location.pathname === '/NotFound';

  useEffect(() => {
    // Function to check scroll position
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Set up the event listener
    window.addEventListener('scroll', toggleVisibility);

    // Clear the event listener
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Function to scroll to top
  const scrollToTop = () => {
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } catch (error) {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }
  };

  return { isVisible, scrollToTop, isUserPage };
};

const ScrollToTop = () => {
  const { isVisible, scrollToTop, isUserPage } = useScrollToTop();

  // Don't show on user pages that already have scroll to top buttons
  if (!isVisible || isUserPage) {
    return null;
  }

  const buttonStyle = {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    zIndex: 9999,
    padding: 0
  };

  return (
    <button 
      onClick={scrollToTop} 
      style={buttonStyle}
      aria-label="Scroll to top"
    >
      <FaArrowUp size={20} />
    </button>
  );
};

export default ScrollToTop; 