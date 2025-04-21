import React from "react";
import { Link } from "react-router-dom";

export const EngineServicing = () => {
  return (
    <div className="position-relative container-fluid bg-light py-5" style={{ overflow: 'hidden' }}>
      {/* Transparent background image */}
      <img
        src="/img/muscular-car-service-worker-repairing-vehicle.jpg"
        alt="Engine Servicing"
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          objectFit: "cover",
          opacity: 0.3,
          zIndex: 0,
        }}
      />

      {/* Foreground content */}
      <div className="container text-center position-relative" style={{ zIndex: 1 }}>
        <h1 className="text-primary fw-bold mb-4"><span style={{color:"grey" , }}>🛠</span> Engine Servicing</h1>
        <p className="mb-5 mx-auto" style={{ maxWidth: "700px", fontSize: "1.2rem", color: "#1b1b1b" }}>
          Regular engine servicing ensures peak performance, fuel efficiency, and longevity of your vehicle.
          Our expert mechanics use cutting-edge tools for precise diagnostics and maintenance.
        </p>
        <div className="bg-white text-dark p-5 rounded shadow mx-auto" style={{ maxWidth: "600px", opacity: 0.90 }}>
          <h2 className="text-secondary fw-semibold mb-3">What We Offer:</h2>
          <ul className="list-unstyled text-start">
            <li className="mb-2"><i className="fa fa-check text-primary me-2"></i >Oil and filter change 🛢️</li>
            <li className="mb-2"><i className="fa fa-check text-primary me-2"></i>Engine tune-up and diagnostics⚙️  </li>
            <li className="mb-2"><i className="fa fa-check text-primary me-2"></i>Timing belt and spark plug inspection 🔌</li>
            <li className="mb-2"><i className="fa fa-check text-primary me-2"></i>Cooling system and radiator service  🌊</li>
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

export default EngineServicing;
