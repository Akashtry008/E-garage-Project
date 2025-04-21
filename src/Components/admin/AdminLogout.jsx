// import React, { useState } from "react";
// import AdminDashboard from "./AdminDashboard";
// import { FaSignOutAlt } from "react-icons/fa";
// import sadFace from "../../assets/cat.gif"; // ← make sure this cartoon sad GIF exists

// export const AdminLogout = () => {
//   const [showModal, setShowModal] = useState(false);

//   const handleLogoutClick = () => {
//     setShowModal(true);
//   };

//   const confirmLogout = () => {
//     setShowModal(false);
//     // 🔐 Implement actual logout logic here (e.g., redirect to login, clear auth tokens)
//     console.log("Logged out");
//   };

//   const cancelLogout = () => {
//     setShowModal(false);
//   };

//   return (
//     <div className="admin-logout-wrapper">
//       <div className={`dashboard-overlay ${showModal ? "blurred" : ""}`}>
//         <AdminDashboard />
//         <button className="add-btn logout-btn" onClick={handleLogoutClick}>
//           <FaSignOutAlt /> Logout
//         </button>
//       </div>

//       {showModal && (
//         <div className="logout-modal-overlay">
//           <div className="logout-modal-content">
//             <img src={sadFace} alt="Sad cartoon" className="logout-gif" />
//             <h2>Are you sure you want to log out?</h2>
//             <div className="modal-actions">
//               <button className="btn-custom" onClick={confirmLogout}>
//                 Yes, Logout
//               </button>
//               <button className="btn btn-secondary" onClick={cancelLogout}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminLogout;
