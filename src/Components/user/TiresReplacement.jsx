import React from 'react'
import { Link } from 'react-router-dom';
    
    export const TiresReplacement = () => {
      return (
        <div className="position-relative container-fluid bg-light py-5" style={{ overflow: 'hidden' }}>
          {/* Transparent background image */}
          <img
            src="/img/muscular-man-is-fixing-car-s-wheel-with-special-tool-auto-service.jpg" // Make sure this image exists in your public/img folder
            alt="Tire Replacement"
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              objectFit: "cover",
              opacity: 0.28,
              zIndex: 0,
            }}
          />
    
          {/* Foreground content */}
          <div className="container text-center position-relative" style={{ zIndex: 1 }}>
            <h1 className="text-primary fw-bold mb-4">🚗 Tire Replacement</h1>
            <p className="mb-5 mx-auto" style={{ maxWidth: "700px", fontSize: "1.2rem", color: '#1b1b1b' }}>
              Whether it's worn-out treads or seasonal swaps, our tire replacement service ensures optimal road safety and performance. We offer fast, professional tire services using top-quality brands.
            </p>
    
            <div className="bg-white text-dark p-5 rounded shadow mx-auto" style={{ maxWidth: "600px", opacity: 0.90 }}>
              <h2 className="text-secondary fw-semibold mb-3">What We Offer:</h2>
              <ul className="list-unstyled text-start">
                <li className="mb-2"><i className="fa-solid fa-check text-primary me-2"></i>Full tire inspection and diagnostics 🔍</li>
                <li className="mb-2"><i className="fa-solid fa-check text-primary me-2"></i>Mounting and balancing new tires 🛠️</li>
                <li className="mb-2"><i className="fa-solid fa-check text-primary me-2"></i>Tire rotation and alignment check 🔄</li>
                <li className="mb-2"><i className="fa-solid fa-check text-primary me-2"></i>Tire pressure monitoring and safety assurance 🛡️</li>
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
    
    export default TiresReplacement;
  