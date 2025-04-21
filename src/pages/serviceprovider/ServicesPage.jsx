import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServiceModal from '../../Components/serviceprovider/modals/ServiceModal';
import { FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceForm, setServiceForm] = useState({});
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const serviceProviderId = localStorage.getItem('serviceProviderId');
      if (!serviceProviderId) {
        console.warn('No service provider ID found in localStorage');
        return;
      }
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL || ''}/service/provider/${serviceProviderId}`);
      if (response.data && response.data.data) {
        setServices(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const serviceProviderId = localStorage.getItem('serviceProviderId');
      if (!serviceProviderId) {
        console.warn('No service provider ID found in localStorage');
        return;
      }
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL || ''}/service`, {
        ...serviceForm,
        serviceProviderId
      });
      
      if (res.data && res.data.data) {
        if (selectedService) {
          // If editing, replace the existing service
          setServices(services.map(service => 
            service._id === selectedService._id ? res.data.data : service
          ));
        } else {
          // If adding, append to the list
          setServices([...services, res.data.data]);
        }
        setShowServiceModal(false);
        setSelectedService(null);
        setServiceForm({});
      }
    } catch (error) {
      console.error('Error adding/updating service:', error);
      alert('Failed to save service. Please try again.');
    }
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category
    });
    setShowServiceModal(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL || ''}/service/${serviceId}`);
        setServices(services.filter(service => service._id !== serviceId));
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  const handleServiceFormChange = (e) => {
    setServiceForm({
      ...serviceForm,
      [e.target.name]: e.target.value
    });
  };

  const filteredServices = filterCategory === 'all'
    ? services
    : services.filter(service => service.category && service.category.toLowerCase() === filterCategory);

  if (isLoading) {
    return (
      <div className="sp-loading">
        <div className="sp-spinner"></div>
        <p>Loading services...</p>
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
      <div className="sp-page-header">
        <motion.h1 
          className="sp-page-title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Manage Services
        </motion.h1>
        <motion.div 
          className="sp-header-actions"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="sp-filter-container">
            <FaFilter className="sp-filter-icon" />
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="sp-filter-select"
            >
              <option value="all">All Categories</option>
              <option value="maintenance">Maintenance</option>
              <option value="repair">Repair</option>
              <option value="cleaning">Cleaning</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>
          <motion.button 
            className="sp-btn sp-btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedService(null);
              setServiceForm({});
              setShowServiceModal(true);
            }}
          >
            <FaPlus className="sp-btn-icon" /> Add New Service
          </motion.button>
        </motion.div>
      </div>

      {services.length === 0 ? (
        <motion.div 
          className="sp-empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p>You haven't added any services yet.</p>
          <motion.button 
            className="sp-btn sp-btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedService(null);
              setServiceForm({});
              setShowServiceModal(true);
            }}
          >
            <FaPlus className="sp-btn-icon" /> Add Your First Service
          </motion.button>
        </motion.div>
      ) : (
        <motion.div className="sp-service-grid">
          <AnimatePresence>
            {filteredServices.map((service, index) => (
              <motion.div 
                key={service._id} 
                className="sp-service-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
              >
                <div className="sp-service-details">
                  <h3 className="sp-service-title">{service.name}</h3>
                  <div className="sp-service-meta">
                    <span className="sp-service-price">${service.price}</span>
                    <span className="sp-service-duration">{service.duration} mins</span>
                    <span className={`sp-service-category sp-category-${service.category ? service.category.toLowerCase() : 'other'}`}>
                      {service.category || 'Other'}
                    </span>
                  </div>
                  <p className="sp-service-description">{service.description}</p>
                  <div className="sp-service-actions">
                    <motion.button 
                      className="sp-btn sp-btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditService(service)}
                    >
                      <FaEdit className="sp-btn-icon" /> Edit
                    </motion.button>
                    <motion.button 
                      className="sp-btn sp-btn-danger"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteService(service._id)}
                    >
                      <FaTrash className="sp-btn-icon" /> Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {showServiceModal && (
          <ServiceModal
            selectedService={selectedService}
            serviceForm={serviceForm}
            setServiceForm={setServiceForm}
            handleAddService={handleAddService}
            handleServiceFormChange={handleServiceFormChange}
            setShowServiceModal={setShowServiceModal}
            setSelectedService={setSelectedService}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ServicesPage; 