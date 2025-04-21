import React from 'react';
import '../../../assets/css/ServiceProvider.css';

const BookingsTab = ({ 
  bookings, 
  services,
  setSelectedBooking,
  setShowBookingModal,
  setPaymentDetails,
  setShowPaymentModal
}) => {
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleProcessPayment = (booking) => {
    setSelectedBooking(booking);
    setPaymentDetails({
      amount: booking.totalAmount,
      bookingId: booking._id
    });
    setShowPaymentModal(true);
  };

  return (
    <div className="bookings-tab">
      <div className="sp-table-container">
        <table className="sp-table">
          <thead className="sp-table-header">
            <tr>
              <th className="sp-table-head">Booking ID</th>
              <th className="sp-table-head">Customer</th>
              <th className="sp-table-head">Service</th>
              <th className="sp-table-head">Date</th>
              <th className="sp-table-head">Status</th>
              <th className="sp-table-head">Amount</th>
              <th className="sp-table-head">Actions</th>
            </tr>
          </thead>
          <tbody className="sp-table-body">
            {bookings.map(booking => {
              const service = services.find(s => s._id === booking.serviceId);
              return (
                <tr key={booking._id} className="sp-table-row">
                  <td className="sp-table-cell">#{booking._id.slice(-6)}</td>
                  <td className="sp-table-cell">{booking.customerName}</td>
                  <td className="sp-table-cell">{service?.name || 'N/A'}</td>
                  <td className="sp-table-cell">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </td>
                  <td className="sp-table-cell">
                    <span className={`sp-status sp-status-${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="sp-table-cell">${booking.totalAmount}</td>
                  <td className="sp-table-cell">
                    <div className="sp-actions-cell">
                      <button 
                        className="sp-btn sp-btn-primary"
                        onClick={() => handleViewBooking(booking)}
                      >
                        View
                      </button>
                      {booking.status === 'pending' && (
                        <button 
                          className="sp-btn sp-btn-payment"
                          onClick={() => handleProcessPayment(booking)}
                        >
                          Process Payment
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsTab; 