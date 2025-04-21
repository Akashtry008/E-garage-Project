import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaChartBar,
  FaTools,
  FaCalendarAlt,
  FaUsers,
  FaSignOutAlt,
  FaMoneyBill,
  FaEnvelope,
} from "react-icons/fa";
import sadCat from "../../assets/cat.gif";

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  const items = [
    { icon: <FaChartBar />, label: "Dashboard", path: "/AdminDashboard" },
    { icon: <FaTools />, label: "Services", path: "/AdminServices" },
    { icon: <FaCalendarAlt />, label: "Appointments", path: "/AdminAppointments" },
    { icon: <FaUsers />, label: "Customers", path: "/AdminCustomers" },
    { icon: <FaMoneyBill />, label: "Payments", path: "/AdminPayments" },
    { icon: <FaEnvelope />, label: "Messages", path: "/AdminMessages" },

    { label: "Administration", isTitle: true },
    { icon: <FaSignOutAlt />, label: "Logout", action: "logout" },
    { icon: <FaUsers />, label: "Profile", path: "/AdminProfile" },
  ];

  const handleItemClick = (item) => {
    if (item.action === "logout") {
      setShowModal(true);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    setShowModal(false);
    localStorage.clear();
    navigate("/signin");
  };

  return (
    <>
      <div className="admin-theme sparkle-bg full-height-layout">

        <div className={`sidebar-wrapper ${showModal ? "blur-background" : ""}`}>
          <aside className="sidebar">
            <h2>
              <FaTools className="icon" /> E-Garage Admin
            </h2>
            <nav>
              <ul>
                {items.map((item, index) =>
                  item.isTitle ? (
                    <li key={index} className="section-title">
                      {item.label}
                    </li>
                  ) : (
                    <li
                      key={index}
                      className={location.pathname === item.path ? "active" : ""}
                      onClick={() => handleItemClick(item)}
                    >
                      {item.icon} {item.label}
                    </li>
                  )
                )}
              </ul>
            </nav>
          </aside>
        </div>

        {showModal && (
          <div className="logout-modal-overlay">
            <div className="logout-modal-content animate-slide">
              <img src={sadCat} alt="Sad cat" className="logout-gif" />
              <h2 style={{ fontFamily: "'Poppins', 'sans-serif', 'bold', '20px' font-size: '20px'" }}>Are you sure you want to log out?</h2>
              <div className="modal-actions">
                <button className="btn-custom" onClick={handleLogout}>
                  Yes, Logout
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminSidebar;
