// components/cards/ServiceCard.js
import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

export const ServiceCard = ({ service, onEdit, onDelete }) => {
  return (
    <div className="sp-service-card">
      <img 
        src={service.image} 
        alt={service.name} 
        className="sp-service-image" 
      />
      <div className="sp-service-details">
        <h3 className="sp-service-title">{service.name}</h3>
        <div className="sp-service-meta">
          <span className="sp-service-price">${service.price.toFixed(2)}</span>
          <span className="sp-service-duration">{service.duration} mins</span>
          <span className={`sp-service-category sp-category-${service.category}`}>
            {service.category}
          </span>
        </div>
        <p className="sp-service-description">{service.description}</p>
      </div>
      <div className="sp-service-actions">
        <button 
          className="sp-btn sp-btn-edit"
          onClick={onEdit}
        >
          <FaEdit /> Edit
        </button>
        <button 
          className="sp-btn sp-btn-delete"
          onClick={onDelete}
        >
          <FaTrash /> Delete
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;