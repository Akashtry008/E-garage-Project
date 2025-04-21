// components/Header.js
import React from 'react';
import { FaUser, FaEdit } from 'react-icons/fa';
import AuthService from '../../services/AuthService';

export const ServiceProviderHeader = ({ activeTab, handleEditProfile }) => {
  const user = AuthService.getCurrentUser() || {};
  
  const getTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Service Providers Directory';
      case 'profile': return 'My Profile';
      default: return '';
    }
  };

  return (
    <header className="sp-header">
      <div className="sp-header-left">
        <h1 className="sp-header-title">{getTitle()}</h1>
      </div>
      <div className="sp-header-right">
        <button className="sp-edit-profile-btn" onClick={handleEditProfile}>
          <FaEdit /> Edit Profile
        </button>
        <div className="sp-user-profile">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt="User profile" 
              className="sp-user-avatar" 
            />
          ) : (
            <div className="sp-user-avatar sp-default-avatar">
              <FaUser />
            </div>
          )}
          <div className="sp-user-info">
            <h4 className="sp-user-name">{user.name || 'Service Provider'}</h4>
            <p className="sp-user-role">Service Provider</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ServiceProviderHeader;