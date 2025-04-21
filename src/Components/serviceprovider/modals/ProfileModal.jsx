import React, { useState, useRef, useEffect } from 'react';
import '../../../assets/css/ServiceProvider.css';
import { motion } from 'framer-motion';
import { FaCamera, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTools } from 'react-icons/fa';
import AuthService from '../../../services/AuthService';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${BASE_URL}/api`; 

const ProfileModal = ({ isOpen, onClose, onProfileUpdate }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialties: [],
    avatar: null
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [specialtyInput, setSpecialtyInput] = useState('');
  
  const fileInputRef = useRef(null);
  
  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.19, 1.0, 0.22, 1.0],
        staggerChildren: 0.08
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: {
        duration: 0.15
      }
    }
  };
  
  const formFieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 }}
  };

  // Load user profile data
  useEffect(() => {
    if (isOpen) {
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        setProfileData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          address: currentUser.address || '',
          specialties: currentUser.specialties || [],
          avatar: null
        });
        
        // Set preview image if user has an avatar
        if (currentUser.avatar) {
          setPreviewImage(currentUser.avatar);
        }
      }
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({
        ...profileData,
        avatar: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAddSpecialty = () => {
    if (specialtyInput.trim() && !profileData.specialties.includes(specialtyInput.trim())) {
      setProfileData({
        ...profileData,
        specialties: [...profileData.specialties, specialtyInput.trim()]
      });
      setSpecialtyInput('');
    }
  };

  const handleRemoveSpecialty = (specialty) => {
    setProfileData({
      ...profileData,
      specialties: profileData.specialties.filter(s => s !== specialty)
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSpecialty();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const userId = currentUser._id || currentUser.id;
      
      // Create form data to handle file upload
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      formData.append('phone', profileData.phone);
      formData.append('address', profileData.address);
      profileData.specialties.forEach((specialty, index) => {
        formData.append(`specialties[${index}]`, specialty);
      });
      
      if (profileData.avatar) {
        formData.append('avatar', profileData.avatar);
      }
      
      // Get the auth token
      const token = AuthService.getToken();
      
      // Make the API request with proper headers for file upload
      const response = await axios.put(
        `${API_URL}/service-providers/${userId}`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update the user in local storage
      if (response.data && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      setIsLoading(false);
      
      // Call the callback to update the UI
      if (onProfileUpdate) {
        onProfileUpdate(response.data.user);
      }
      
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      className="sp-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="sp-modal-container"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div 
          className="sp-modal-header"
          variants={formFieldVariants}
        >
          <h3>Edit Profile</h3>
          <motion.button 
            className="sp-modal-close"
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            ×
          </motion.button>
        </motion.div>

        <motion.div className="sp-modal-content">
          {error && (
            <motion.div 
              className="sp-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
          
          <motion.form 
            onSubmit={handleSubmit} 
            className="sp-form-container"
          >
            {/* Avatar Upload Section */}
            <motion.div 
              className="sp-avatar-container"
              variants={formFieldVariants}
            >
              <div className="sp-avatar-wrapper" onClick={triggerFileInput}>
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="sp-profile-avatar" />
                ) : (
                  <div className="sp-profile-avatar-placeholder">
                    <FaUser />
                  </div>
                )}
                <div className="sp-avatar-edit">
                  <FaCamera />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*"
              />
              <div className="sp-avatar-upload-hint">
                Click to upload profile photo
              </div>
            </motion.div>

            {/* Basic Information */}
            <motion.div 
              className="sp-form-field"
              variants={formFieldVariants}
            >
              <label htmlFor="name">
                <FaUser className="sp-form-icon" /> Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </motion.div>

            <motion.div 
              className="sp-form-field"
              variants={formFieldVariants}
            >
              <label htmlFor="email">
                <FaEnvelope className="sp-form-icon" /> Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
              />
            </motion.div>

            <motion.div 
              className="sp-form-field"
              variants={formFieldVariants}
            >
              <label htmlFor="phone">
                <FaPhone className="sp-form-icon" /> Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </motion.div>

            <motion.div 
              className="sp-form-field"
              variants={formFieldVariants}
            >
              <label htmlFor="address">
                <FaMapMarkerAlt className="sp-form-icon" /> Address
              </label>
              <textarea
                id="address"
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
                placeholder="Enter your business address"
                rows="3"
              />
            </motion.div>

            {/* Specialties Section */}
            <motion.div 
              className="sp-form-field"
              variants={formFieldVariants}
            >
              <label>
                <FaTools className="sp-form-icon" /> Specialties
              </label>
              <div className="sp-specialty-input-container">
                <input
                  type="text"
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add your specialties (e.g., Oil Change, Brake Repair)"
                />
                <button 
                  type="button" 
                  className="sp-btn sp-btn-secondary sp-specialty-add-btn"
                  onClick={handleAddSpecialty}
                >
                  Add
                </button>
              </div>
              <div className="sp-specialties-display">
                {profileData.specialties.map((specialty, index) => (
                  <div key={index} className="sp-specialty-tag">
                    {specialty}
                    <button 
                      type="button" 
                      className="sp-specialty-remove-btn"
                      onClick={() => handleRemoveSpecialty(specialty)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="sp-modal-footer"
              variants={formFieldVariants}
            >
              <button 
                type="button" 
                className="sp-btn sp-btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="sp-btn sp-btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileModal; 