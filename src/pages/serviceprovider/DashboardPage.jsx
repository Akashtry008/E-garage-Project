import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaTools, FaStar, FaUser, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import { motion } from 'framer-motion';

function DashboardPage() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalServices: 0,
    totalReviews: 0,
    totalEarnings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentServices, setRecentServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const serviceProviderId = localStorage.getItem('serviceProviderId');
      
      // Fetch dashboard statistics
      const statsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/stats/${serviceProviderId}`);
      
      // Fetch recent bookings
      const bookingsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/bookings/service-provider/${serviceProviderId}?limit=5`);
      
      // Fetch recent services
      const servicesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/services/service-provider/${serviceProviderId}?limit=5`);
      
      setStats(statsResponse.data.data || {
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        totalServices: 0,
        totalReviews: 0,
        totalEarnings: 0
      });
      
      setRecentBookings(bookingsResponse.data.data || []);
      setRecentServices(servicesResponse.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'sp-status-pending';
      case 'confirmed': return 'sp-status-confirmed';
      case 'in-progress': case 'in progress': return 'sp-status-in-progress';
      case 'completed': return 'sp-status-completed';
      case 'cancelled': return 'sp-status-cancelled';
      default: return 'sp-status-pending';
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  if (loading) {
    return (
      <div className="sp-content-wrapper">
        <div className="sp-loading">
          <div className="sp-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sp-content-wrapper">
      <motion.div 
        className="sp-dashboard-cards"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="sp-card sp-card-blue" variants={cardVariants}>
          <div className="sp-card-header">
            <div className="sp-card-info">
              <h3 className="sp-card-title">Total Bookings</h3>
              <p className="sp-card-value">{stats.totalBookings}</p>
            </div>
            <div className="sp-card-icon">
              <FaCalendarAlt className="sp-card-icon-element" />
            </div>
          </div>
        </motion.div>

        <motion.div className="sp-card sp-card-orange" variants={cardVariants}>
          <div className="sp-card-header">
            <div className="sp-card-info">
              <h3 className="sp-card-title">Pending Bookings</h3>
              <p className="sp-card-value">{stats.pendingBookings}</p>
            </div>
            <div className="sp-card-icon">
              <FaCalendarAlt className="sp-card-icon-element" />
            </div>
          </div>
        </motion.div>

        <motion.div className="sp-card sp-card-green" variants={cardVariants}>
          <div className="sp-card-header">
            <div className="sp-card-info">
              <h3 className="sp-card-title">Completed Bookings</h3>
              <p className="sp-card-value">{stats.completedBookings}</p>
            </div>
            <div className="sp-card-icon">
              <FaCalendarAlt className="sp-card-icon-element" />
            </div>
          </div>
        </motion.div>

        <motion.div className="sp-card sp-card-yellow" variants={cardVariants}>
          <div className="sp-card-header">
            <div className="sp-card-info">
              <h3 className="sp-card-title">Total Services</h3>
              <p className="sp-card-value">{stats.totalServices}</p>
            </div>
            <div className="sp-card-icon">
              <FaTools className="sp-card-icon-element" />
            </div>
          </div>
        </motion.div>

        <motion.div className="sp-card sp-card-purple" variants={cardVariants}>
          <div className="sp-card-header">
            <div className="sp-card-info">
              <h3 className="sp-card-title">Total Reviews</h3>
              <p className="sp-card-value">{stats.totalReviews}</p>
            </div>
            <div className="sp-card-icon">
              <FaStar className="sp-card-icon-element" />
            </div>
          </div>
        </motion.div>

        <motion.div className="sp-card sp-card-blue" variants={cardVariants}>
          <div className="sp-card-header">
            <div className="sp-card-info">
              <h3 className="sp-card-title">Total Earnings</h3>
              <p className="sp-card-value">${stats.totalEarnings}</p>
            </div>
            <div className="sp-card-icon">
              <FaMoneyBillWave className="sp-card-icon-element" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="sp-dashboard-sections"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="sp-dashboard-section">
          <div className="sp-section-header">
            <h3 className="sp-section-title">Recent Bookings</h3>
            <motion.a 
              href="/ServiceProviderDashboard/bookings" 
              className="sp-btn sp-btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All
            </motion.a>
          </div>
          
          {recentBookings.length === 0 ? (
            <div className="sp-empty-state">
              <FaCalendarAlt className="sp-empty-icon" />
              <p>No recent bookings</p>
            </div>
          ) : (
            <div className="sp-table-container">
              <table className="sp-table">
                <thead className="sp-table-header">
                  <tr>
                    <th className="sp-table-head">Customer</th>
                    <th className="sp-table-head">Service</th>
                    <th className="sp-table-head">Date</th>
                    <th className="sp-table-head">Status</th>
                  </tr>
                </thead>
                <tbody className="sp-table-body">
                  {recentBookings.map((booking, index) => (
                    <motion.tr 
                      key={booking.id || index} 
                      className="sp-table-row"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <td className="sp-table-cell">{booking.customer_name}</td>
                      <td className="sp-table-cell">{booking.service_name}</td>
                      <td className="sp-table-cell">
                        {booking.booking_date && new Date(booking.booking_date).toLocaleDateString()}
                      </td>
                      <td className="sp-table-cell">
                        <span className={`sp-status ${getStatusClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="sp-dashboard-section">
          <div className="sp-section-header">
            <h3 className="sp-section-title">Recent Services</h3>
            <motion.a 
              href="/ServiceProviderDashboard/services" 
              className="sp-btn sp-btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All
            </motion.a>
          </div>
          
          {recentServices.length === 0 ? (
            <div className="sp-empty-state">
              <FaTools className="sp-empty-icon" />
              <p>No services added yet</p>
            </div>
          ) : (
            <div className="sp-recent-list">
              {recentServices.map((service, index) => (
                <motion.div 
                  key={service.id || index} 
                  className="sp-recent-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ 
                    y: -10, 
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="sp-recent-item-info">
                    <h4>{service.name}</h4>
                    <p className="sp-recent-item-price">${service.price}</p>
                    <div className="sp-recent-item-details">
                      <span className="sp-recent-item-duration">{service.duration}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default DashboardPage; 