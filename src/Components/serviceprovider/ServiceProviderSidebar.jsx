// components/Sidebar.js
import React from 'react';
import { 
  FaTachometerAlt, FaUserCircle, FaSignOutAlt 
} from 'react-icons/fa';

export const ServiceProviderSidebar = ({ activeTab, setActiveTab, handleLogout, handleEditProfile }) => {
  return (
    <div className="sp-sidebar">
      <div className="sp-sidebar-header">
        <h3>E-Garage</h3>
      </div>
      <nav className="sp-sidebar-menu">
        <ul>
          <li>
            <button 
              className={`sp-menu-item ${activeTab === 'dashboard' ? 'sp-active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <FaTachometerAlt className="sp-menu-icon" /> 
              Dashboard
            </button>
          </li>
          <li>
            <button 
              className={`sp-menu-item ${activeTab === 'profile' ? 'sp-active' : ''}`}
              onClick={handleEditProfile}
            >
              <FaUserCircle className="sp-menu-icon" /> 
              Profile
            </button>
          </li>
          <li>
            <button 
              className="sp-menu-item"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="sp-menu-icon" /> 
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ServiceProviderSidebar;