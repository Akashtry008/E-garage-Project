import React, { useState, useEffect } from 'react';
import '../../assets/css/ServiceProvider.css';
import ServiceProviderSidebar from './ServiceProviderSidebar';
import ServiceProviderHeader from './ServiceProviderHeader';
import DashboardTab from './tabs/DashboardTab';
import ProfileModal from './modals/ProfileModal';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import { AnimatePresence } from 'framer-motion';

const ServiceProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data on component mount
    const user = AuthService.getCurrentUser();
    if (user) {
      setUserData(user);
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/signin');
  };

  const handleEditProfile = () => {
    setShowProfileModal(true);
  };

  const handleProfileUpdate = (updatedUser) => {
    // Update the user data in state
    setUserData(updatedUser);
    
    // Trigger storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="sp-container">
      <ServiceProviderSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout}
        handleEditProfile={handleEditProfile}
      />
      
      <main className="sp-main-content">
        <ServiceProviderHeader 
          activeTab={activeTab}
          handleEditProfile={handleEditProfile}
        />
        
        <div className="sp-content-wrapper">
          <DashboardTab handleEditProfile={handleEditProfile} />
        </div>
      </main>

      <AnimatePresence>
        {showProfileModal && (
          <ProfileModal 
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            onProfileUpdate={handleProfileUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceProviderDashboard;