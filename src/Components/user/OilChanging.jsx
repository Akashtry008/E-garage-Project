import React from 'react';
import { Link } from 'react-router-dom';

export const OilChanging = () => {
  return (
    <div className="position-relative container-fluid bg-light py-5" style={{ overflow: 'hidden' }}>
      {/* Transparent background image */}
      <img
        src="/img/modern-automobile-mechanic-composition.jpg"
        alt="Oil Changing"
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          objectFit: "cover",
          opacity: 0.29,
          zIndex: 0,
        }}
      />

      {/* Foreground content */}
      <div className="container text-center position-relative" style={{ zIndex: 1 }}>
        <h1 className="text-primary fw-bold mb-4">🛢️ Oil Changing</h1>
        <p className="mb-5 mx-auto" style={{ maxWidth: "700px", fontSize: "1.2rem", color: '#1b1b1b' }}>
          Regular oil changes are essential to keeping your engine running smoothly and extending the life of your vehicle.
          Our expert technicians use high-quality oils and filters to maintain top performance.
        </p>
        <div className="bg-white text-dark p-5 rounded shadow mx-auto" style={{ maxWidth: "600px", opacity: 0.90 }}>
          <h2 className="text-secondary fw-semibold mb-3">What We Offer:</h2>
          <ul className="list-unstyled text-start">
            <li className="mb-2"><i className="fa-solid fa-check text-primary me-2"></i>High-quality oil and filter replacement  🛢</li>
            <li className="mb-2"><i className="fa-solid fa-check text-primary me-2"></i>Oil level and pressure inspection ⛽</li>
            <li className="mb-2"><i className="fa-solid fa-check text-primary me-2"></i>Service reminder reset ⏰</li>
            <li className="mb-2"><i className="fa-solid fa-check text-primary me-2"></i>Fluid top-up and engine cooling check  🌡️</li>
          </ul>
        </div>
        <div className="mt-4 d-flex justify-content-center gap-3">
          <Link to="/BookService" className="btn btn-primary">Book A Service</Link>
          <Link to="/" className="btn btn-outline-secondary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default OilChanging;
