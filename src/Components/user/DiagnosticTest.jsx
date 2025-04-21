import React from "react";
import { Link } from "react-router-dom";

export const DiagnosticTest = () => {
  return (
    
    <div className="position-relative container-fluid bg-light py-5" style={{ overflow: 'hidden' }}>
      {/* Transparent background image */}
      <img
        src="/img/male-female-mechanics-working-shop-car.jpg"
        alt="Diagnostics"
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          objectFit: "cover",
          opacity: 0.29,
          zIndex: 0,
        }}
      />

      {/* Foreground content */}
      <div className="container text-center position-relative" style={{ zIndex: 1 }}>
        <h1 className="text-primary fw-bold mb-4">🔍 Diagnostic Test</h1>
        <p className="mb-5 mx-auto" style={{ maxWidth: "700px" , fontSize: "1.2rem",color: '#1b1b1b ' }}>
          Our advanced diagnostic test helps identify any issues with your vehicle before they become major problems.
          We use state-of-the-art equipment to ensure accurate results and optimal vehicle performance.
        </p>
        <div className="bg-white text-dark p-5 rounded shadow mx-auto" style={{ maxWidth: "600px" , opacity: 0.90 }}>
          <h2 className="text-secondary fw-semibold mb-3">What We Offer:</h2>
          <ul className="list-unstyled text-start">
            <li className="mb-2"><i className="fa fa-check text-primary me-2"></i>Comprehensive vehicle health check  🚘</li>
            <li className="mb-2"><i className="fa fa-check text-primary me-2"></i>Engine and transmission diagnostics ⚙️</li>
            <li className="mb-2"><i className="fa fa-check text-primary me-2"></i>Battery and alternator testing  🔋</li>
            <li className="mb-2"><i className="fa fa-check text-primary me-2"></i>Brake system analysis  🛑 </li>
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

export default DiagnosticTest;
