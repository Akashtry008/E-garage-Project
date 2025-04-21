import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaTools, FaStar, FaUser, FaBell, FaSignOutAlt, FaBars, 
         FaWrench, FaCar, FaOilCan, FaGasPump, FaTachometerAlt, FaExclamationTriangle,
         FaCogs, FaUserCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import '../assets/css/ServiceProvider.css';
import AuthService from '../services/AuthService';

const ServiceProviderLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [serviceProviderName, setServiceProviderName] = useState('Service Provider');
  const [avatar, setAvatar] = useState('/default-avatar.png');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const logoutDialogRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchNotificationsCount();
    
    // Apply dark mode for futuristic theme
    document.body.classList.add('dark-mode');
  }, []);

  const fetchProfile = async () => {
    try {
      // Get user from AuthService instead of localStorage
      const user = AuthService.getCurrentUser();
      if (user) {
        setServiceProviderName(user.name || 'Service Provider');
        setAvatar(user.avatar || '/default-avatar.png');
      } else {
        // If no user is found, redirect to login
        navigate('/signin');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      navigate('/signin');
    }
  };

  const fetchNotificationsCount = async () => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return;
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL || ''}/notifications/${user.id}/unread-count`);
      if (response.data) {
        setUnreadNotifications(response.data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications count:', error);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const closeLogoutDialog = () => {
    if (logoutDialogRef.current) {
      logoutDialogRef.current.classList.remove('active');
      setTimeout(() => {
        setShowLogoutDialog(false);
      }, 300);
    } else {
      setShowLogoutDialog(false);
    }
  };

  const confirmLogout = () => {
    // Use AuthService for logout
    AuthService.logout();
    navigate('/signin');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };
  
  const getPageTitle = () => {
    if (location.pathname === '/service-provider/dashboard' || location.pathname === '/service-provider') return 'Dashboard';
    
    // Legacy paths
    if (location.pathname === '/ServiceProviderDashboard') return 'Dashboard';
    
    return '';
  };

  // Animation variants
  const formAnimationVariants = {
    hidden: { 
      opacity: 0, 
      y: 20
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const formFieldAnimationVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const dialogAnimationVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.19, 1.0, 0.22, 1.0]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="sp-container">
      <button className="sp-sidebar-toggle" onClick={toggleMobileMenu}>
        <FaBars />
      </button>
      
      <AnimatePresence>
        <motion.div 
          className={`sp-sidebar ${mobileMenuOpen ? 'show' : ''}`}
          initial={{ x: '-100%' }}
          animate={{ x: mobileMenuOpen ? 0 : (window.innerWidth <= 768 ? '-100%' : 0) }}
          transition={{ duration: 0.3 }}
        >
          <div className="sp-sidebar-header">
            <div className="sp-logo">
              <motion.div
                animate={{ 
                  rotate: [0, 15, -15, 15, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <FaCogs className="sp-logo-icon" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="sp-logo-text"
              >
                E-GARAGE
              </motion.h3>
            </div>
          </div>
          <div className="sp-sidebar-menu">
            <ul>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <Link 
                  to="/service-provider/dashboard" 
                  className={`sp-menu-item ${isActive('/service-provider/dashboard') ? 'sp-active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaTachometerAlt className="sp-menu-icon" /> Dashboard
                </Link>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <button 
                  className="sp-menu-item"
                  onClick={handleLogoutClick}
                >
                  <FaSignOutAlt className="sp-menu-icon" /> Logout
                </button>
              </motion.li>
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <main className="sp-main-content">
        <div className="sp-header">
          <div className="sp-page-title-container">
            <div className="sp-page-title-icon">
              {getPageTitle() === 'Dashboard' && <FaTachometerAlt />}
            </div>
            <h1 className="sp-page-title">{getPageTitle()}</h1>
          </div>
          
          <div className="sp-header-right">
            <div className="sp-notification-icon">
              <div className="sp-notification-bell" onClick={() => navigate('/service-provider/notifications')}>
                <FaBell />
              {unreadNotifications > 0 && (
                  <span className="sp-notification-count">{unreadNotifications}</span>
                )}
              </div>
            </div>
            
            <motion.div 
              className="sp-user-profile"
              onClick={() => navigate('/service-provider/profile')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="sp-user-avatar">
                {avatar && avatar !== '/default-avatar.png' ? (
                  <img src={avatar} alt="Profile" />
                ) : (
                  <div className="sp-default-avatar">
                    <FaUserCircle size={24} />
                  </div>
                )}
              </div>
              <div className="sp-user-info">
                <span className="sp-user-name">{serviceProviderName}</span>
                <span className="sp-user-role">Service Provider</span>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="sp-content-wrapper">
          <Outlet />
        </div>
      </main>
      
      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {showLogoutDialog && (
          <motion.div
            className="sp-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLogoutDialog}
          >
            <motion.div 
              className="sp-modal-container"
              ref={logoutDialogRef}
              variants={dialogAnimationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <div className="sp-modal-header">
                <h3>Confirm Logout</h3>
                <button className="sp-modal-close" onClick={closeLogoutDialog}>×</button>
              </div>
              <div className="sp-modal-content">
                <p>Are you sure you want to log out of your account?</p>
              </div>
              <div className="sp-modal-footer">
                <button className="sp-btn sp-btn-secondary" onClick={closeLogoutDialog}>Cancel</button>
                <button className="sp-btn sp-btn-primary" onClick={confirmLogout}>Logout</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
    </div>
  );
};

export default ServiceProviderLayout; 