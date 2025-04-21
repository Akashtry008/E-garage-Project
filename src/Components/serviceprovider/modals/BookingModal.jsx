import React from 'react';
import '../../../assets/css/ServiceProvider.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';

const BookingModal = ({
  selectedBooking,
  bookingStatus,
  setBookingStatus,
  handleUpdateBookingStatus,
  setShowBookingModal
}) => {
  // Get animation variants from context
  const { formFieldAnimationVariants } = useOutletContext() || {
    formFieldAnimationVariants: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3 }}
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.19, 1.0, 0.22, 1.0],
        staggerChildren: 0.1
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
          <h3 className="sp-modal-title">Booking Details</h3>
          <motion.button 
            className="sp-modal-close"
            onClick={() => setShowBookingModal(false)}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            ×
          </motion.button>
        </motion.div>

        <motion.div className="sp-modal-content">
          <motion.div 
            className="sp-detail-row"
            variants={formFieldAnimationVariants}
          >
            <span className="sp-detail-label">Booking ID:</span>
            <span className="sp-detail-value">#{selectedBooking._id.slice(-6)}</span>
          </motion.div>

          <motion.div 
            className="sp-detail-row"
            variants={formFieldAnimationVariants}
          >
            <span className="sp-detail-label">Customer:</span>
            <span className="sp-detail-value">{selectedBooking.customerName}</span>
          </motion.div>

          <motion.div 
            className="sp-detail-row"
            variants={formFieldAnimationVariants}
          >
            <span className="sp-detail-label">Service:</span>
            <span className="sp-detail-value">{selectedBooking.serviceName}</span>
          </motion.div>

          <motion.div 
            className="sp-detail-row"
            variants={formFieldAnimationVariants}
          >
            <span className="sp-detail-label">Date:</span>
            <span className="sp-detail-value">
              {new Date(selectedBooking.bookingDate).toLocaleDateString()}
            </span>
          </motion.div>

          <motion.div 
            className="sp-detail-row"
            variants={formFieldAnimationVariants}
          >
            <span className="sp-detail-label">Amount:</span>
            <span className="sp-detail-value">${selectedBooking.totalAmount}</span>
          </motion.div>

          <motion.div 
            className="sp-detail-row"
            variants={formFieldAnimationVariants}
          >
            <span className="sp-detail-label">Current Status:</span>
            <motion.span 
              className={`sp-status sp-status-${selectedBooking.status.toLowerCase()}`}
              whileHover={{ scale: 1.05 }}
            >
              {selectedBooking.status}
            </motion.span>
          </motion.div>

          <motion.div 
            className="sp-form-group"
            variants={formFieldAnimationVariants}
          >
            <label className="sp-form-label">Update Status</label>
            <div className="sp-status-options">
              <motion.button
                type="button"
                className={`sp-status-option ${bookingStatus === 'pending' ? 'sp-active' : ''}`}
                onClick={() => setBookingStatus('pending')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Pending
              </motion.button>
              <motion.button
                type="button"
                className={`sp-status-option ${bookingStatus === 'in-progress' ? 'sp-active' : ''}`}
                onClick={() => setBookingStatus('in-progress')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                In Progress
              </motion.button>
              <motion.button
                type="button"
                className={`sp-status-option ${bookingStatus === 'completed' ? 'sp-active' : ''}`}
                onClick={() => setBookingStatus('completed')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Completed
              </motion.button>
              <motion.button
                type="button"
                className={`sp-status-option ${bookingStatus === 'cancelled' ? 'sp-active' : ''}`}
                onClick={() => setBookingStatus('cancelled')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancelled
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            className="sp-modal-footer"
            variants={formFieldAnimationVariants}
          >
            <motion.button 
              type="button"
              className="sp-btn sp-btn-secondary"
              onClick={() => setShowBookingModal(false)}
              whileHover={{ scale: 1.05, backgroundColor: "#2a2a3a" }}
              whileTap={{ scale: 0.95 }}
            >
              Close
            </motion.button>
            <motion.button 
              type="button"
              className="sp-btn sp-btn-primary"
              onClick={handleUpdateBookingStatus}
              whileHover={{ scale: 1.05, backgroundColor: "#3d86ef" }}
              whileTap={{ scale: 0.95 }}
            >
              Update Status
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default BookingModal; 