import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaEye } from 'react-icons/fa';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const serviceProviderId = localStorage.getItem('id');
      const response = await axios.get(`/bookings/service-provider/${serviceProviderId}`);
      setBookings(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      await axios.put(`/bookings/${bookingId}/status`, { status });
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status } 
          : booking
      ));
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'sp-status-pending';
      case 'confirmed': return 'sp-status-confirmed';
      case 'in-progress': case 'in progress': return 'sp-status-in-progress';
      case 'completed': return 'sp-status-completed';
      case 'cancelled': return 'sp-status-cancelled';
      default: return 'sp-status-pending';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    // Filter by status
    if (filter !== 'all' && booking.status.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !booking.service_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="sp-main-content">
        <div className="sp-content-wrapper">
          <div className="sp-loading">
            <div className="sp-spinner"></div>
            <p>Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sp-main-content">
      <div className="sp-content-wrapper">
        <div className="sp-section-header">
          <h2 className="sp-section-title">
            <FaCalendarAlt /> Manage Bookings
          </h2>
          <div className="sp-header-actions">
            <div className="sp-search-box">
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sp-search-input"
              />
              <FaSearch className="sp-search-icon" />
            </div>
          </div>
        </div>

        <div className="sp-filter-controls">
          <div className="sp-filter-group">
            <label htmlFor="status-filter"><FaFilter /> Filter by status:</label>
            <select 
              id="status-filter" 
              className="sp-filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="sp-table-container">
          {filteredBookings.length === 0 ? (
            <div className="sp-empty-state">
              <FaCalendarAlt className="sp-empty-icon" />
              <p>No bookings match your criteria</p>
            </div>
          ) : (
            <table className="sp-table">
              <thead className="sp-table-header">
                <tr>
                  <th className="sp-table-head">Booking ID</th>
                  <th className="sp-table-head">Customer</th>
                  <th className="sp-table-head">Service</th>
                  <th className="sp-table-head">Date & Time</th>
                  <th className="sp-table-head">Status</th>
                  <th className="sp-table-head">Actions</th>
                </tr>
              </thead>
              <tbody className="sp-table-body">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="sp-table-row">
                    <td className="sp-table-cell">{booking.id}</td>
                    <td className="sp-table-cell">{booking.customer_name}</td>
                    <td className="sp-table-cell">{booking.service_name}</td>
                    <td className="sp-table-cell">
                      {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                    </td>
                    <td className="sp-table-cell">
                      <span className={`sp-status ${getStatusClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="sp-table-cell sp-actions-cell">
                      <button 
                        className="sp-action-btn sp-action-btn-view"
                        title="View details"
                      >
                        <FaEye /> View
                      </button>
                      
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            className="sp-action-btn sp-action-btn-confirm"
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            title="Confirm booking"
                          >
                            <FaCheckCircle /> Confirm
                          </button>
                          <button 
                            className="sp-action-btn sp-action-btn-cancel"
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            title="Cancel booking"
                          >
                            <FaTimesCircle /> Cancel
                          </button>
                        </>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <button 
                          className="sp-action-btn sp-action-btn-progress"
                          onClick={() => handleStatusChange(booking.id, 'in-progress')}
                          title="Mark as in progress"
                        >
                          Start
                        </button>
                      )}
                      
                      {booking.status === 'in-progress' && (
                        <button 
                          className="sp-action-btn sp-action-btn-complete"
                          onClick={() => handleStatusChange(booking.id, 'completed')}
                          title="Mark as completed"
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsPage; 