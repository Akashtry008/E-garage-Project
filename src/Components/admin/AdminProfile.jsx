import React, { useState } from "react";
import AdminSidebar from "../layouts/AdminSidebar";

export const AdminProfile = () => {
  const [profile, setProfile] = useState({
    name: "Admin",
    email: "admin@egarage.com",
    password: "",
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Profile:", profile);
    // 🔐 Save to backend API here
  };

  return (
    <div className="admin-theme sparkle-bg" style={{ minHeight: "100vh", display: "flex" }}>
      <AdminSidebar />
      <main className="dashboard-content" style={{ flex: 1 }}>
        <header>
          <h1>My Profile</h1>
        </header>
        <div className="dashboard-card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" style={{ color: "white" }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={profile.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ color: "white" }}>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={profile.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ color: "white" }}>New Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={profile.password}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn-custom">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProfile;
