import React, { useEffect } from 'react';
import '../../../assets/css/ServiceProvider.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';

export const ServiceModal = ({
  selectedService,
  serviceForm,
  setServiceForm,
  handleAddService,
  handleServiceFormChange,
  setShowServiceModal,
  setSelectedService
}) => {
  // Get animation variants from context
  const { formFieldAnimationVariants } = useOutletContext() || {
    formFieldAnimationVariants: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3 }}
    }
  };

  const handleClose = () => {
    setShowServiceModal(false);
    setSelectedService(null);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddService(e);
  };

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

  // Use createPortal to render outside the main container
  return (
    <motion.div 
      className="sp-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="sp-modal-container"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div 
          className="sp-modal-header"
          variants={formFieldAnimationVariants}
        >
          <h3>{selectedService ? 'Edit Service' : 'Add New Service'}</h3>
          <motion.button 
            className="sp-modal-close"
            onClick={handleClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            ×
          </motion.button>
        </motion.div>

        <motion.div className="sp-modal-content">
          <motion.form 
            onSubmit={handleSubmit} 
            className="sp-form-container"
          >
            <motion.div 
              className="sp-form-field"
              variants={formFieldAnimationVariants}
            >
              <label htmlFor="serviceName">Service Name</label>
              <input
                type="text"
                name="name"
                id="serviceName"
                value={serviceForm.name || ''}
                onChange={handleServiceFormChange}
                placeholder="Enter service name"
                required
              />
            </motion.div>

            <motion.div 
              className="sp-form-field"
              variants={formFieldAnimationVariants}
            >
              <label htmlFor="serviceDescription">Description</label>
              <textarea
                name="description"
                id="serviceDescription"
                value={serviceForm.description || ''}
                onChange={handleServiceFormChange}
                placeholder="Enter service description"
                rows="4"
                required
              />
            </motion.div>

            <motion.div 
              className="sp-form-row"
              variants={formFieldAnimationVariants}
            >
              <div className="sp-form-field">
                <label htmlFor="servicePrice">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  id="servicePrice"
                  value={serviceForm.price || ''}
                  onChange={handleServiceFormChange}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="sp-form-field">
                <label htmlFor="serviceDuration">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  id="serviceDuration"
                  value={serviceForm.duration || ''}
                  onChange={handleServiceFormChange}
                  placeholder="Enter duration"
                  min="15"
                  step="15"
                  required
                />
              </div>
            </motion.div>

            <motion.div 
              className="sp-form-field"
              variants={formFieldAnimationVariants}
            >
              <label htmlFor="serviceCategory">Category</label>
              <select
                name="category"
                id="serviceCategory"
                value={serviceForm.category || ''}
                onChange={handleServiceFormChange}
                required
              >
                <option value="" disabled>Select a category</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Repair">Repair</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Inspection">Inspection</option>
                <option value="Other">Other</option>
              </select>
            </motion.div>

            <motion.div 
              className="sp-modal-footer"
              variants={formFieldAnimationVariants}
            >
              <motion.button 
                type="button"
                className="sp-btn sp-btn-secondary"
                onClick={handleClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button 
                type="submit"
                className="sp-btn sp-btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {selectedService ? 'Update Service' : 'Add Service'}
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ServiceModal; 