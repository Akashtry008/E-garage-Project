import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaSignOutAlt, FaEdit, FaUserCircle, FaCamera, FaIdBadge, FaUpload, FaImage } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const serviceProviderId = localStorage.getItem('serviceProviderId');
      if (!serviceProviderId) {
        console.warn('No service provider ID found in localStorage');
        return;
      }
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL || ''}/service-provider/${serviceProviderId}`);
      if (response.data && response.data.data) {
        setProfile(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!uploadedImage) return null;
    
    try {
      const formData = new FormData();
      formData.append('avatar', uploadedImage);
      
      const serviceProviderId = localStorage.getItem('serviceProviderId');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || ''}/service-provider/${serviceProviderId}/upload-avatar`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Return the uploaded image URL
      if (response.data && response.data.avatarUrl) {
        return response.data.avatarUrl;
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First upload the avatar if a new one was selected
      let avatarUrl = null;
      if (uploadedImage) {
        avatarUrl = await uploadAvatar();
      }
      
      // Update the profile with the new avatar URL if available
      const updatedProfile = {
        ...profile,
        ...(avatarUrl && { avatar: avatarUrl })
      };
      
      const serviceProviderId = localStorage.getItem('serviceProviderId');
      await axios.put(`${import.meta.env.VITE_API_URL || ''}/service-provider/${serviceProviderId}`, updatedProfile);
      
      // Update the global user data in localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user) {
        user.avatar = avatarUrl || profile.avatar;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      setProfile(updatedProfile);
      setIsEditing(false);
      setImagePreview(null);
      setUploadedImage(null);
      
      // Refresh the page to show updated avatar in header
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('serviceProviderId');
    navigate('/signin');
  };

  if (isLoading) {
    return (
      <div className="sp-loading">
        <div className="sp-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="sp-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="sp-page-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="sp-page-title-container">
          <FaIdBadge className="sp-page-title-icon" />
          <h1 className="sp-page-title">YOUR PROFILE</h1>
        </div>
      </motion.div>

      <div className="sp-profile-layout">
        <motion.div 
          className="sp-profile-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="sp-avatar-container">
            <motion.div
              className="sp-avatar-wrapper"
              whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}
              onClick={handleAvatarClick}
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile Preview" 
                  className="sp-profile-avatar"
                />
              ) : profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt="Profile" 
                  className="sp-profile-avatar"
                />
              ) : (
                <FaUserCircle className="sp-profile-avatar-placeholder" />
              )}
              {isEditing && (
                <div className="sp-avatar-edit">
                  <FaCamera />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </motion.div>
            {isEditing && (
              <div className="sp-avatar-actions">
                <div className="sp-avatar-upload-hint">
                  <FaUpload /> Click profile image to upload new photo
                </div>
                <motion.button
                  type="button"
                  className="sp-btn sp-upload-image-btn"
                  onClick={handleAvatarClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaImage /> Choose Image
                </motion.button>
              </div>
            )}
          </div>
          
          <div className="sp-profile-info">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="sp-profile-name"
            >
              {profile.name || 'Your Name'}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="sp-profile-role"
            >
              Service Provider
            </motion.div>
          </div>

          <motion.div 
            className="sp-profile-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {!isEditing && (
              <motion.button 
                type="button" 
                className="sp-btn sp-btn-primary"
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaEdit /> Edit Profile
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        <motion.form 
          className="sp-form-container sp-profile-form" 
          onSubmit={handleSubmit}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h3 className="sp-form-title">{isEditing ? 'Edit Your Information' : 'Your Information'}</h3>
          
          <div className="sp-form-field">
            <input
              type="text"
              name="name"
              id="name"
              value={profile.name}
              onChange={handleInputChange}
              placeholder="Full Name"
              disabled={!isEditing}
            />
            <label htmlFor="name">
              <FaUser className="sp-form-icon" /> Full Name
            </label>
          </div>

          <div className="sp-form-field">
            <input
              type="email"
              name="email"
              id="email"
              value={profile.email}
              onChange={handleInputChange}
              placeholder="Email"
              disabled={!isEditing}
            />
            <label htmlFor="email">
              <FaEnvelope className="sp-form-icon" /> Email
            </label>
          </div>

          <div className="sp-form-field">
            <input
              type="tel"
              name="phone"
              id="phone"
              value={profile.phone}
              onChange={handleInputChange}
              placeholder="Phone"
              disabled={!isEditing}
            />
            <label htmlFor="phone">
              <FaPhone className="sp-form-icon" /> Phone
            </label>
          </div>

          <div className="sp-form-field">
            <textarea
              name="address"
              id="address"
              value={profile.address}
              onChange={handleInputChange}
              placeholder="Address"
              disabled={!isEditing}
              rows="3"
            />
            <label htmlFor="address">
              <FaMapMarkerAlt className="sp-form-icon" /> Address
            </label>
          </div>

          {isEditing && (
            <div className="sp-form-buttons">
              <motion.button 
                type="submit" 
                className="sp-btn sp-btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSave /> Save Changes
              </motion.button>
              <motion.button 
                type="button" 
                className="sp-btn sp-btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setImagePreview(null);
                  setUploadedImage(null);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          )}
        </motion.form>
      </div>
    </motion.div>
  );
};

export default ProfilePage; 