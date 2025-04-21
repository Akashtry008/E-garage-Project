// import { useState } from "react";

// export const SPHeader = ({ title, toggleSidebar }) => {
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [provider] = useState({ garageName: "Akash's Garage" });
//   const [unreadMessagesCount] = useState(2);
//   const [newRequestsCount] = useState(1);

//   const toggleNotifications = () => {
//     setShowNotifications(!showNotifications);
//   };

//   const hasNotifications = unreadMessagesCount > 0 || newRequestsCount > 0;

//   return (
//     <header style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb", padding: "1rem" }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <div style={{ display: "flex", alignItems: "center" }}>
//           <button onClick={toggleSidebar} style={{ marginRight: "1rem", background: "none", border: "none", color: "#6b7280" }}>
//             ☰
//           </button>
//           <h1 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1f2937" }}>{title}</h1>
//         </div>

//         <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
//           <div style={{ position: "relative" }}>
//             <button onClick={toggleNotifications} style={{ background: "none", border: "none", position: "relative", padding: "0.5rem", borderRadius: "9999px" }}>
//               🔔
//               {hasNotifications && (
//                 <span style={{ position: "absolute", top: 0, right: 0, height: "0.5rem", width: "0.5rem", borderRadius: "50%", backgroundColor: "red" }}></span>
//               )}
//             </button>
//             {showNotifications && (
//               <div style={{ position: "absolute", right: 0, marginTop: "0.5rem", width: "20rem", backgroundColor: "white", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", borderRadius: "0.5rem", padding: "1rem", zIndex: 10 }}>
//                 <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem" }}>Notifications</h3>
//                 {newRequestsCount > 0 && <p>You have {newRequestsCount} new service requests</p>}
//                 {unreadMessagesCount > 0 && <p>You have {unreadMessagesCount} unread messages</p>}
//                 {!hasNotifications && <p>No new notifications</p>}
//               </div>
//             )}
//           </div>

//           <div style={{ display: "flex", alignItems: "center" }}>
//             <div style={{ height: "2rem", width: "2rem", borderRadius: "50%", backgroundColor: "#3b82f6", color: "white", display: "flex", justifyContent: "center", alignItems: "center" }}>
//               {provider?.garageName.charAt(0) || "G"}
//             </div>
//             <span style={{ marginLeft: "0.5rem", color: "#374151" }}>{provider?.garageName}</span>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default SPHeader;
