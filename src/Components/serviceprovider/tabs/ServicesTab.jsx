import React from 'react';
import '../../../assets/css/ServiceProvider.css';

const ServicesTab = ({ 
  services, 
  setShowServiceModal,
  setSelectedService,
  setServiceForm,
  handleDeleteService
}) => {
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

  return (
    <div className="services-tab">
      <div className="sp-section-header">
        <h2 className="sp-section-title">My Services</h2>
        <button 
          className="sp-btn sp-btn-primary"
          onClick={() => {
            setSelectedService(null);
            setServiceForm({});
            setShowServiceModal(true);
          }}
        >
          Add New Service
        </button>
      </div>

      <div className="sp-service-grid">
        {services.map(service => (
          <div key={service._id} className="sp-service-card">
            <div className="sp-service-details">
              <h3 className="sp-service-title">{service.name}</h3>
              <div className="sp-service-meta">
                <span className="sp-service-price">${service.price}</span>
                <span className="sp-service-duration">{service.duration} mins</span>
                <span className={`sp-service-category sp-category-${service.category.toLowerCase()}`}>
                  {service.category}
                </span>
              </div>
              <p className="sp-service-description">{service.description}</p>
              <div className="sp-service-actions">
                <button 
                  className="sp-btn sp-btn-edit"
                  onClick={() => handleEditService(service)}
                >
                  Edit
                </button>
                <button 
                  className="sp-btn sp-btn-delete"
                  onClick={() => handleDeleteService(service._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesTab; 