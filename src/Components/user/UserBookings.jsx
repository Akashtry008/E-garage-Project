// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Link } from 'react-router-dom';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// export const UserBookings = () => {
//   const [bookings, setBookings] = useState([]);
//   const [appointmentBookings, setAppointmentBookings] = useState([]);
//   const [serviceBookings, setServiceBookings] = useState([]);
//   const [activeTab, setActiveTab] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchBookings = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const userId = localStorage.getItem('userId');
        
//         if (!token || !userId) {
//           setError('Please sign in to view your bookings');
//           setLoading(false);
//           return;
//         }
        
//         const response = await axios.get(`/api/bookings/user/${userId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });
        
//         if (response.data.status) {
//           setBookings(response.data.bookings);
//           setAppointmentBookings(response.data.appointment_bookings || []);
//           setServiceBookings(response.data.service_bookings || []);
//         } else {
//           setError('Failed to fetch bookings');
//         }
//       } catch (error) {
//         console.error('Error fetching bookings:', error);
//         setError('An error occurred while fetching your bookings');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchBookings();
//   }, []);

//   const getStatusBadgeClass = (status) => {
//     switch (status) {
//       case 'pending':
//         return 'bg-warning';
//       case 'confirmed':
//         return 'bg-primary';
//       case 'completed':
//         return 'bg-success';
//       case 'cancelled':
//         return 'bg-danger';
//       default:
//         return 'bg-secondary';
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const handleCancelBooking = async (bookingId) => {
//     try {
//       const token = localStorage.getItem('token');
      
//       if (!token) {
//         toast.error('Please sign in to cancel a booking');
//         return;
//       }
      
//       const response = await axios.patch(
//         `/api/bookings/${bookingId}/status`,
//         { status: 'cancelled' },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );
      
//       if (response.data.status) {
//         toast.success('Booking cancelled successfully');
//         // Update all relevant state
//         setBookings(bookings.map(booking => 
//           booking._id === bookingId 
//             ? { ...booking, status: 'cancelled' } 
//             : booking
//         ));
//         setAppointmentBookings(appointmentBookings.map(booking => 
//           booking._id === bookingId 
//             ? { ...booking, status: 'cancelled' } 
//             : booking
//         ));
//         setServiceBookings(serviceBookings.map(booking => 
//           booking._id === bookingId 
//             ? { ...booking, status: 'cancelled' } 
//             : booking
//         ));
//       } else {
//         toast.error(response.data.message || 'Failed to cancel booking');
//       }
//     } catch (error) {
//       console.error('Error cancelling booking:', error);
//       toast.error(error.response?.data?.message || 'An error occurred while cancelling your booking');
//     }
//   };

//   // Helper function to render a booking card
//   const renderBookingCard = (booking) => (
//     <div className="col-md-6 col-lg-4 mb-4" key={booking._id}>
//       <div className="card h-100 shadow-sm">
//         <div className="card-header d-flex justify-content-between align-items-center">
//           <h5 className="mb-0">{booking.service?.name || 'Service'}</h5>
//           <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
//             {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
//           </span>
//         </div>
//         <div className="card-body">
//           <p><strong>Type:</strong> {booking.booking_type === 'service' ? 'Service' : 'Appointment'}</p>
//           <p><strong>Date:</strong> {formatDate(booking.booking_date)}</p>
//           <p><strong>Time:</strong> {booking.booking_time}</p>
//           <p><strong>Provider:</strong> {booking.service_provider?.business_name || 'Unknown Provider'}</p>
//           <p><strong>Price:</strong> ${booking.price}</p>
//           <p><strong>Payment Status:</strong> {booking.payment_status}</p>
//           {booking.vehicle_model && (
//             <p><strong>Vehicle Model:</strong> {booking.vehicle_model}</p>
//           )}
//           {booking.payment_method && (
//             <p><strong>Payment Method:</strong> {booking.payment_method}</p>
//           )}
//           {booking.notes && (
//             <p><strong>Notes:</strong> {booking.notes}</p>
//           )}
//         </div>
//         <div className="card-footer bg-white">
//           {booking.status === 'pending' && (
//             <button 
//               className="btn btn-outline-danger w-100" 
//               onClick={() => handleCancelBooking(booking._id)}
//             >
//               Cancel Booking
//             </button>
//           )}
//           {booking.status === 'confirmed' && (
//             <div className="text-center text-success">
//               <i className="bi bi-check-circle me-2"></i>
//               Your booking is confirmed
//             </div>
//           )}
//           {booking.status === 'completed' && (
//             <Link 
//               to={`/review/${booking.service_id}`} 
//               className="btn btn-outline-primary w-100"
//             >
//               Leave a Review
//             </Link>
//           )}
//         </div>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="container mt-5 text-center">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//         <p className="mt-3">Loading your bookings...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mt-5">
//         <div className="alert alert-danger" role="alert">
//           {error}
//         </div>
//         <Link to="/signin" className="btn btn-primary">
//           Sign In
//         </Link>
//       </div>
//     );
//   }

//   const displayedBookings = activeTab === 'all' 
//     ? bookings 
//     : activeTab === 'appointments' 
//       ? appointmentBookings 
//       : serviceBookings;

//   return (
//     <div className="container my-5">
//       <ToastContainer position="top-right" autoClose={3000} />
//       <h1 className="text-center mb-4">My Bookings</h1>
      
//       {bookings.length === 0 ? (
//         <div className="text-center">
//           <p className="lead">You don't have any bookings yet.</p>
//           <div className="row mt-4">
//             <div className="col-md-6 mx-auto">
//               <div className="d-grid gap-2">
//                 <Link to="/BookAppointment" className="btn btn-primary mb-2">
//                   Book an Appointment
//                 </Link>
//                 <Link to="/BookService" className="btn btn-success">
//                   Book a Service
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <>
//           <div className="row mb-4">
//             <div className="col-md-8 mx-auto">
//               <ul className="nav nav-pills nav-fill mb-4">
//                 <li className="nav-item">
//                   <button 
//                     className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
//                     onClick={() => setActiveTab('all')}
//                   >
//                     All Bookings ({bookings.length})
//                   </button>
//                 </li>
//                 <li className="nav-item">
//                   <button 
//                     className={`nav-link ${activeTab === 'appointments' ? 'active' : ''}`}
//                     onClick={() => setActiveTab('appointments')}
//                   >
//                     Appointments ({appointmentBookings.length})
//                   </button>
//                 </li>
//                 <li className="nav-item">
//                   <button 
//                     className={`nav-link ${activeTab === 'services' ? 'active' : ''}`}
//                     onClick={() => setActiveTab('services')}
//                   >
//                     Services ({serviceBookings.length})
//                   </button>
//                 </li>
//               </ul>
//             </div>
//             <div className="col-12 d-flex justify-content-between mb-3">
//               <Link to="/BookAppointment" className="btn btn-primary">
//                 Book Appointment
//               </Link>
//               <Link to="/BookService" className="btn btn-success">
//                 Book Service
//               </Link>
//             </div>
//           </div>
          
//           <div className="row">
//             {displayedBookings.length === 0 ? (
//               <div className="col-12 text-center">
//                 <p className="lead">No bookings in this category.</p>
//               </div>
//             ) : (
//               displayedBookings.map(booking => renderBookingCard(booking))
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default UserBookings; 