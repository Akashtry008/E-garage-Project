import React from 'react';
import '../../../assets/css/ServiceProvider.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';

const PaymentModal = ({
  selectedBooking,
  paymentAmount,
  setPaymentAmount,
  handleProcessPayment,
  setShowPaymentModal
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
          <h3 className="sp-modal-title">Process Payment</h3>
          <motion.button 
            className="sp-modal-close"
            onClick={() => setShowPaymentModal(false)}
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
            <span className="sp-detail-value">{selectedBooking.id}</span>
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
            <span className="sp-detail-label">Original Amount:</span>
            <span className="sp-detail-value">${selectedBooking.amount}</span>
          </motion.div>

          <motion.div 
            className="sp-form-group"
            variants={formFieldAnimationVariants}
          >
            <label className="sp-form-label">Payment Amount</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="sp-form-input"
              placeholder="Enter payment amount"
              min="0"
              step="0.01"
              required
            />
          </motion.div>

          <motion.div 
            className="sp-modal-footer"
            variants={formFieldAnimationVariants}
          >
            <motion.button
              type="button"
              className="sp-btn sp-btn-secondary"
              onClick={() => setShowPaymentModal(false)}
              whileHover={{ scale: 1.05, backgroundColor: "#2a2a3a" }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="button"
              className="sp-btn sp-btn-primary"
              onClick={handleProcessPayment}
              whileHover={{ scale: 1.05, backgroundColor: "#3d86ef" }}
              whileTap={{ scale: 0.95 }}
            >
              Process Payment
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentModal; 