import React from "react";
import { Link } from "react-router-dom";
import '../../assets/css/custom.css';

export const Error = () => {
  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div>
        <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>404 - Page Not Found</h1>
        <p style={{ maxWidth: 600, margin: "1rem auto", color: "#666" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ marginTop: 24 }}>
          <Link to="/AdminDashboard" style={{ marginRight: 16, padding: "10px 20px", backgroundColor: "#007bff", color: "white", borderRadius: 4, textDecoration: "none" }}>Back to Home</Link>
          <Link to="#" onClick={() => window.history.back()} style={{ padding: "10px 20px", border: "1px solid #ccc", borderRadius: 4, textDecoration: "none" }}>Go Back</Link>
        </div>
      </div>
    </div>
  );
};

export default Error;