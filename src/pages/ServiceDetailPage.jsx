import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/services/${id}`);
        setService(response.data.service);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching service details:', error);
        setError('Failed to load service details. Please try again.');
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading service details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link to="/services" className="btn btn-primary">
          Back to Services
        </Link>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">
          Service not found.
        </div>
        <Link to="/services" className="btn btn-primary">
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/services">Services</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{service.name}</li>
        </ol>
      </nav>

      <div className="row mb-5">
        <div className="col-md-6">
          <img 
            src={service.image || 'https://via.placeholder.com/600x400?text=Service+Image'} 
            alt={service.name} 
            className="img-fluid rounded shadow-sm"
          />
        </div>
        <div className="col-md-6">
          <h1 className="mb-3">{service.name}</h1>
          <div className="d-flex align-items-center mb-3">
            <span className="badge bg-primary me-2">₹{service.price}</span>
            <span className="badge bg-secondary">{service.category}</span>
          </div>
          <p className="lead">{service.description}</p>
          <div className="mt-4">
            <Link to={`/BookAppointment?service=${service._id}`} className="btn btn-primary me-2">
              Book Now
            </Link>
            <Link to="/services" className="btn btn-outline-secondary">
              Back to Services
            </Link>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <h3 className="mb-4">Service Details</h3>
          <div className="card mb-4">
            <div className="card-body">
              <p>{service.longDescription || service.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service features */}
      {service.features && service.features.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="mb-3">Features</h3>
            <ul className="list-group">
              {service.features.map((feature, index) => (
                <li key={index} className="list-group-item">
                  <i className="fas fa-check-circle text-success me-2"></i>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Related services placeholder */}
      <div className="row mt-5">
        <div className="col-12">
          <h3 className="mb-4">You May Also Like</h3>
          <div className="row">
            {/* Placeholder for related services */}
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Related Service</h5>
                  <p className="card-text">This is a placeholder for a related service.</p>
                </div>
                <div className="card-footer bg-transparent border-top-0">
                  <Link to="#" className="btn btn-sm btn-outline-primary">View Details</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage; 