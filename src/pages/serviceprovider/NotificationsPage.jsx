import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBell, FaCheck, FaTimes, FaClock, FaTrash, FaFilter, FaCheckDouble, FaCog, FaTrashAlt, FaEnvelope, FaMobile, FaRegCalendarAlt, FaStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../../assets/css/ServiceProvider.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    notifyOnBooking: true,
    notifyOnReview: true,
    notifyOnPayment: true
  });

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, []);

  const fetchNotifications = async () => {
    try {
      const serviceProviderId = localStorage.getItem('serviceProviderId');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/notifications/serviceprovider/${serviceProviderId}`);
      setNotifications(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const serviceProviderId = localStorage.getItem('serviceProviderId');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/notifications/serviceprovider/${serviceProviderId}/preferences`);
      if (response.data.data) {
        setPreferences(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      const serviceProviderId = localStorage.getItem('serviceProviderId');
      await axios.put(`${import.meta.env.VITE_API_URL}/notifications/serviceprovider/${serviceProviderId}/preferences`, preferences);
      setShowPreferences(false);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/notifications/${notificationId}/read`);
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const serviceProviderId = localStorage.getItem('serviceProviderId');
      await axios.put(`${import.meta.env.VITE_API_URL}/notifications/serviceprovider/${serviceProviderId}/read-all`);
      setNotifications(notifications.map(notification => ({
        ...notification, 
        read: true
      })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/notifications/${notificationId}`);
      setNotifications(notifications.filter(notification => 
        notification.id !== notificationId
      ));
      setSelectedNotifications(selectedNotifications.filter(id => id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/notifications/batch-delete`, { ids: selectedNotifications });
      setNotifications(notifications.filter(notification => 
        !selectedNotifications.includes(notification.id)
      ));
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
    }
  };

  const toggleSelectNotification = (notificationId) => {
    if (selectedNotifications.includes(notificationId)) {
      setSelectedNotifications(selectedNotifications.filter(id => id !== notificationId));
    } else {
      setSelectedNotifications([...selectedNotifications, notificationId]);
    }
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setPreferences({
      ...preferences,
      [name]: checked
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <FaRegCalendarAlt className="notification-icon booking" />;
      case 'review':
        return <FaStar className="notification-icon review" />;
      case 'payment':
        return <FaEnvelope className="notification-icon payment" />;
      default:
        return <FaBell className="notification-icon" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    // Filter by type
    if (filter !== 'all' && notification.type !== filter) {
      return false;
    }
    
    // Filter by read status
    if (readFilter === 'read' && !notification.read) {
      return false;
    }
    if (readFilter === 'unread' && notification.read) {
      return false;
    }
    
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="sp-main-content">
        <div className="sp-content-wrapper">
          <div className="sp-notifications-loading">
            <motion.div 
              className="sp-spinner"
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Loading notifications...
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sp-main-content">
      <div className="sp-content-wrapper">
        <motion.div 
          className="sp-page-title-container"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaBell className="sp-page-title-icon" />
          </motion.div>
          <h1 className="sp-page-title">NOTIFICATIONS</h1>
        </motion.div>

        <motion.div 
          className="notification-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="notification-header">
            <div className="notification-stats">
              <motion.span 
                className="notification-count"
                animate={{ 
                  boxShadow: ['0 0 0px rgba(0, 150, 255, 0)', '0 0 15px rgba(0, 150, 255, 0.5)', '0 0 0px rgba(0, 150, 255, 0)']
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {unreadCount} unread notifications
              </motion.span>
              <div className="header-actions">
                <motion.button 
                  className="btn btn-secondary"
                  onClick={handleMarkAllAsRead}
                  disabled={!notifications.some(n => !n.read)}
                  title="Mark all as read"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(120, 130, 160, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCheckDouble /> Mark all read
                </motion.button>
                <motion.button 
                  className="btn btn-primary"
                  onClick={() => setShowPreferences(!showPreferences)}
                  title="Notification Preferences"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(30, 140, 240, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCog /> Preferences
                </motion.button>
              </div>
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <label>
                  <FaFilter /> Filter by type:
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="select-control"
                >
                  <option value="all">All</option>
                  <option value="booking">Bookings</option>
                  <option value="review">Reviews</option>
                  <option value="payment">Payments</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={readFilter}
                  onChange={(e) => setReadFilter(e.target.value)}
                  className="select-control"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
            </div>
          </div>

          {showPreferences ? (
            <motion.div 
              className="preference-panel"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Notification Preferences
              </motion.h3>
              <div className="preference-form">
                <motion.div 
                  className="preference-group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4><FaEnvelope /> Delivery Methods</h4>
                  <div className="preference-option">
                    <input 
                      type="checkbox" 
                      id="emailNotifications" 
                      name="emailNotifications" 
                      checked={preferences.emailNotifications} 
                      onChange={handlePreferenceChange} 
                    />
                    <label htmlFor="emailNotifications">Email Notifications</label>
                  </div>
                  <div className="preference-option">
                    <input 
                      type="checkbox" 
                      id="pushNotifications" 
                      name="pushNotifications" 
                      checked={preferences.pushNotifications} 
                      onChange={handlePreferenceChange} 
                    />
                    <label htmlFor="pushNotifications">Push Notifications</label>
                  </div>
                </motion.div>

                <motion.div 
                  className="preference-group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h4><FaBell /> Notification Types</h4>
                  <div className="preference-option">
                    <input 
                      type="checkbox" 
                      id="notifyOnBooking" 
                      name="notifyOnBooking" 
                      checked={preferences.notifyOnBooking} 
                      onChange={handlePreferenceChange} 
                    />
                    <label htmlFor="notifyOnBooking">New Bookings</label>
                  </div>
                  <div className="preference-option">
                    <input 
                      type="checkbox" 
                      id="notifyOnReview" 
                      name="notifyOnReview" 
                      checked={preferences.notifyOnReview} 
                      onChange={handlePreferenceChange} 
                    />
                    <label htmlFor="notifyOnReview">New Reviews</label>
                  </div>
                  <div className="preference-option">
                    <input 
                      type="checkbox" 
                      id="notifyOnPayment" 
                      name="notifyOnPayment" 
                      checked={preferences.notifyOnPayment} 
                      onChange={handlePreferenceChange} 
                    />
                    <label htmlFor="notifyOnPayment">Payments</label>
                  </div>
                </motion.div>

                <motion.div 
                  className="preference-actions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button 
                    className="btn btn-secondary"
                    onClick={() => setShowPreferences(false)}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(120, 130, 160, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    className="btn btn-primary"
                    onClick={savePreferences}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(30, 140, 240, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Save Preferences
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {selectedNotifications.length > 0 && (
                <motion.div 
                  className="batch-actions"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>{selectedNotifications.length} selected</span>
                  <motion.button 
                    className="btn btn-danger"
                    onClick={handleDeleteSelected}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(240, 70, 70, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTrashAlt /> Delete Selected
                  </motion.button>
                </motion.div>
              )}

              {filteredNotifications.length === 0 ? (
                <motion.div 
                  className="empty-notifications"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <FaBell size={50} className="empty-icon" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    No notifications
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    You don't have any {filter !== 'all' ? filter : ''} notifications {readFilter !== 'all' ? `that are ${readFilter}` : ''}.
                  </motion.p>
                </motion.div>
              ) : (
                <div className="notification-list">
                  <div className="notification-list-header">
                    <div className="notification-checkbox">
                      <input 
                        type="checkbox" 
                        id="selectAll" 
                        checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                        onChange={selectAllNotifications}
                      />
                      <label htmlFor="selectAll"></label>
                    </div>
                    <div className="notification-sort">
                      <span>Sorted by newest first</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {filteredNotifications.map((notification, index) => (
                      <motion.div 
                        key={notification.id}
                        className={`notification-item ${notification.read ? 'read' : 'unread'} ${selectedNotifications.includes(notification.id) ? 'selected' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        transition={{ 
                          duration: 0.3,
                          delay: index * 0.05
                        }}
                        layout
                      >
                        <div className="notification-checkbox">
                          <input 
                            type="checkbox" 
                            id={`notification-${notification.id}`}
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => toggleSelectNotification(notification.id)}
                          />
                          <label htmlFor={`notification-${notification.id}`}></label>
                        </div>
                        
                        <div className="notification-content">
                          <motion.div 
                            className="notification-icon-wrapper"
                            whileHover={{ 
                              scale: 1.1,
                              boxShadow: '0 0 15px rgba(101, 224, 255, 0.5)'
                            }}
                          >
                            {getNotificationIcon(notification.type)}
                          </motion.div>
                          <div className="notification-text">
                            <h3 className="notification-title">{notification.title}</h3>
                            <p className="notification-message">{notification.message}</p>
                            <div className="notification-meta">
                              <span className="notification-time">
                                {new Date(notification.createdAt).toLocaleString()}
                              </span>
                              <span className="notification-type">
                                {notification.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="notification-actions">
                          {!notification.read && (
                            <motion.button 
                              className="btn btn-icon btn-read"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="Mark as read"
                              whileHover={{ scale: 1.1, boxShadow: '0 0 10px rgba(30, 140, 240, 0.5)' }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FaCheck />
                            </motion.button>
                          )}
                          <motion.button 
                            className="btn btn-icon btn-delete"
                            onClick={() => handleDelete(notification.id)}
                            title="Delete"
                            whileHover={{ scale: 1.1, boxShadow: '0 0 10px rgba(240, 70, 70, 0.5)' }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaTrash />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationsPage; 