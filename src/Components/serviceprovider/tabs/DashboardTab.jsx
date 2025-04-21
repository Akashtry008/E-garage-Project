import React, { useState, useEffect } from 'react';
import '../../../assets/css/ServiceProvider.css';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaTools, FaStar, FaEdit } from 'react-icons/fa';
import AuthService from '../../../services/AuthService';

const DashboardTab = ({ handleEditProfile }) => {
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setLoading(true);
        
        // Get current user from AuthService
        const user = AuthService.getCurrentUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Use the current user as the provider data
        setProviderData({
          id: user._id || user.id,
          name: user.name || 'Service Provider',
          email: user.email || '',
          phone: user.phone || 'Not provided',
          address: user.address || 'Not provided',
          specialties: user.specialties || [],
          rating: user.rating || 4.5, // Default rating if not available
          avatar: user.avatar || null
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching provider data:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProviderData();
    
    // Listen for storage events to update provider data when it changes
    const handleStorageChange = () => {
      fetchProviderData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="sp-rating">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`sp-star ${i < fullStars ? 'full' : (i === fullStars && hasHalfStar ? 'half' : '')}`}>★</span>
        ))}
        <span className="sp-rating-value">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return <div className="sp-loading">Loading profile data...</div>;
  }

  if (error) {
    return <div className="sp-error">{error}</div>;
  }

  return (
    <div className="dashboard-tab">
      <div className="sp-dashboard-welcome">
        <div className="sp-profile-header">
          <h2>Welcome, {providerData.name}</h2>
          <button 
            className="sp-edit-profile-btn" 
            onClick={handleEditProfile}
          >
            <FaEdit /> Edit Profile
          </button>
        </div>
        <p>Here's your profile information displayed to customers</p>
      </div>

      <div className="sp-profile-card">
        <div className="sp-profile-avatar-section">
          {providerData.avatar ? (
            <img 
              src={providerData.avatar} 
              alt={providerData.name} 
              className="sp-profile-display-avatar" 
            />
          ) : (
            <div className="sp-profile-display-avatar sp-default-avatar">
              <FaUser />
            </div>
          )}
          <div className="sp-profile-rating">
            {renderRatingStars(providerData.rating)}
          </div>
        </div>
        
        <div className="sp-profile-details">
          <div className="sp-profile-item">
            <div className="sp-profile-label">
              <FaUser className="sp-profile-icon" />
              Full Name
            </div>
            <div className="sp-profile-value">{providerData.name}</div>
          </div>
          
          <div className="sp-profile-item">
            <div className="sp-profile-label">
              <FaEnvelope className="sp-profile-icon" />
              Email Address
            </div>
            <div className="sp-profile-value">{providerData.email}</div>
          </div>
          
          <div className="sp-profile-item">
            <div className="sp-profile-label">
              <FaPhone className="sp-profile-icon" />
              Phone Number
            </div>
            <div className="sp-profile-value">{providerData.phone}</div>
          </div>
          
          <div className="sp-profile-item">
            <div className="sp-profile-label">
              <FaMapMarkerAlt className="sp-profile-icon" />
              Address
            </div>
            <div className="sp-profile-value">{providerData.address}</div>
          </div>
          
          <div className="sp-profile-item">
            <div className="sp-profile-label">
              <FaTools className="sp-profile-icon" />
              Specialties
            </div>
            <div className="sp-profile-value">
              <div className="sp-specialties-list">
                {providerData.specialties.length > 0 ? (
                  providerData.specialties.map((specialty, index) => (
                    <span key={index} className="sp-specialty-tag">{specialty}</span>
                  ))
                ) : (
                  <span className="sp-no-specialties">No specialties added yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab; 