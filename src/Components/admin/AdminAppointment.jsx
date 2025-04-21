import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaSearch, FaSync, FaFileExport, FaInfoCircle } from 'react-icons/fa';
import AdminSidebar from '../layouts/AdminSidebar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './adminStyles.css';
import { fetchAppointments, formatDate } from './appointmentUtils';

export const AdminAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isMockData, setIsMockData] = useState(false);
  const [showAllOriginalData, setShowAllOriginalData] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the utility function to fetch appointments
      const result = await fetchAppointments();
      setAppointments(result.appointments);
      
      // Check if this is mock data
      setIsMockData(result.source === 'mock');
      
      if (result.source === 'mock') {
        toast.info("Showing sample appointment data for demonstration");
      } else {
        toast.success(`Loaded ${result.appointments.length} appointments`);
      }
    } catch (err) {
      console.error("Error loading appointments:", err);
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const viewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeAppointmentDetails = () => {
    setSelectedAppointment(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const sortedAppointments = React.useMemo(() => {
    let sortableAppointments = [...appointments];
    if (sortConfig.key) {
      sortableAppointments.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableAppointments;
  }, [appointments, sortConfig]);

  const filteredAppointments = React.useMemo(() => {
    return sortedAppointments.filter(appointment => {
      return (
        (appointment.customer && appointment.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (appointment.service && appointment.service.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (appointment.status && appointment.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (appointment.email && appointment.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (appointment.phone && appointment.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (appointment.id && appointment.id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [sortedAppointments, searchTerm]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

const getStatusClass = (status) => {
    if (!status) return "badge-scheduled";
    
    switch (status.toLowerCase()) {
      case "confirmed":
        return "badge-completed";
      case "scheduled":
      case "pending":
        return "badge-scheduled";
      case "completed":
        return "badge-success";
      case "cancelled":
        return "badge-cancelled";
      default:
        return "badge-scheduled";
    }
  };

  const getPaymentStatusClass = (status) => {
    if (!status) return "badge-scheduled";
    
    switch (status.toLowerCase()) {
      case "paid":
        return "badge-completed";
      case "unpaid":
        return "badge-scheduled";
      case "refunded":
        return "badge-cancelled";
      default:
        return "badge-scheduled";
    }
  };

  const exportToCSV = () => {
    // CSV headers
    const headers = [
      'ID', 
      'Customer', 
      'Email',
      'Phone',
      'Service', 
      'Date', 
      'Time', 
      'Status', 
      'Payment',
      'Notes'
    ];
    
    // Prepare CSV data
    const csvData = filteredAppointments.map(appointment => [
      appointment.id || '',
      appointment.customer || '',
      appointment.email || '',
      appointment.phone || '',
      appointment.service || '',
      appointment.date || '',
      appointment.time || '',
      appointment.status || '',
      appointment.payment || '',
      appointment.notes || ''
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => 
        // Handle cells that contain commas by wrapping them in double quotes
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell.replace(/"/g, '""')}"` 
          : cell
      ).join(','))
    ].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `appointments_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Appointments exported successfully!');
  };

  // Function to download all original data as JSON
  const exportAllOriginalData = () => {
    const originalData = appointments.map(appt => appt.raw || appt);
    const dataStr = JSON.stringify(originalData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `all_appointments_original_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('All original appointment data exported successfully!');
  };

  // Appointment Detail Modal
  const AppointmentDetailModal = () => {
    if (!selectedAppointment) return null;
    
    // Add state to toggle original data
    // Initialize to true if the appointment was opened with the "Original Data" button
    const [showOriginalData, setShowOriginalData] = useState(selectedAppointment.showOriginalDataDirectly || false);
    
    return (
      <div className="modal-overlay" onClick={closeAppointmentDetails}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Appointment Details</h3>
            <button className="close-btn" onClick={closeAppointmentDetails}>&times;</button>
          </div>
          <div className="modal-body">
            {/* Toggle button for original data */}
            <div className="mb-3">
              <button 
                className={`btn btn-sm ${showOriginalData ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setShowOriginalData(!showOriginalData)}
              >
                {showOriginalData ? 'Show Formatted Data' : 'Show Original API Data'}
              </button>
            </div>
            
            {showOriginalData ? (
              // Original data view
              <div className="raw-data">
                <h4>Original Booking Data</h4>
                <div className="mb-2">
                  <button 
                    className="btn btn-sm btn-outline-success"
                    onClick={() => {
                      // Create and download JSON file
                      const dataStr = JSON.stringify(selectedAppointment.raw || selectedAppointment, null, 2);
                      const blob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.setAttribute('href', url);
                      link.setAttribute('download', `appointment_${selectedAppointment.id}_original.json`);
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      toast.success('Original appointment data exported successfully!');
                    }}
                  >
                    Export JSON
                  </button>
                </div>
                <pre className="json-display">
                  {JSON.stringify(selectedAppointment.raw || selectedAppointment, null, 2)}
                </pre>
              </div>
            ) : (
              // Formatted data view
              <>
                <div className="detail-row">
                  <span className="detail-label">ID:</span>
                  <span>{selectedAppointment.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Customer:</span>
                  <span>{selectedAppointment.customer}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span>{selectedAppointment.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span>{selectedAppointment.phone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Service:</span>
                  <span>{selectedAppointment.service}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span>{selectedAppointment.date}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time:</span>
                  <span>{selectedAppointment.time}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`badge-status ${getStatusClass(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment:</span>
                  <span className={`badge-status ${getPaymentStatusClass(selectedAppointment.payment)}`}>
                    {selectedAppointment.payment}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Notes:</span>
                  <span>{selectedAppointment.notes || 'No additional notes'}</span>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={closeAppointmentDetails}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  // Modal for showing all raw data
  const AllOriginalDataModal = () => {
    return (
      <div className="modal-overlay" onClick={() => setShowAllOriginalData(false)}>
        <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>All Original Appointment Data</h3>
            <button className="close-btn" onClick={() => setShowAllOriginalData(false)}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <button 
                className="btn btn-sm btn-outline-success me-2"
                onClick={exportAllOriginalData}
              >
                Export All as JSON
              </button>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowAllOriginalData(false)}
              >
                Close
              </button>
            </div>
            <pre className="json-display">
              {JSON.stringify(appointments.map(appt => appt.raw || appt), null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content-wrapper">
      <main className="dashboard-content">
          <ToastContainer position="top-right" autoClose={3000} />
        <header>
            <h1><FaCalendarAlt className="me-2" /> Appointments</h1>
            {isMockData && (
              <div className="mock-data-banner">
                <FaInfoCircle /> Sample Data (API Unavailable)
              </div>
            )}
            <div className="action-buttons">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
              </div>
              <div className="d-flex gap-2 mb-3">
                <button className="btn btn-outline-primary" onClick={loadAppointments}>
                  <FaSync className="me-1" /> Refresh
                </button>
                <button className="btn btn-outline-success" onClick={exportToCSV}>
                  <FaFileExport className="me-1" /> Export to CSV
                </button>
                <button className="btn btn-outline-secondary" onClick={() => setShowAllOriginalData(true)}>
                  <i className="fas fa-code me-1"></i> View Original Data
                </button>
              </div>
            </div>
        </header>

        <div className="dashboard-card">
          <div className="card-body">
              {loading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading appointments...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <h5>Error loading appointments</h5>
                  <p>{error}</p>
                  <button className="btn btn-sm btn-outline-primary mt-2" onClick={loadAppointments}>
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="table-container">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                        <th onClick={() => requestSort('id')}>ID</th>
                        <th onClick={() => requestSort('customer')}>Customer</th>
                        <th onClick={() => requestSort('email')}>Email</th>
                        <th onClick={() => requestSort('phone')}>Phone</th>
                        <th onClick={() => requestSort('service')}>Service</th>
                        <th onClick={() => requestSort('date')}>Date</th>
                        <th onClick={() => requestSort('time')}>Time</th>
                        <th onClick={() => requestSort('status')}>Status</th>
                        <th onClick={() => requestSort('payment')}>Payment</th>
                        <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="text-center py-4">
                            No appointments found{searchTerm ? ` matching "${searchTerm}"` : ''}.
                            <div className="mt-2">
                              <button className="btn btn-sm btn-outline-primary" onClick={loadAppointments}>
                                  Refresh Data
                                </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments.map((appointment) => (
                          <tr key={appointment.id}>
                            <td>{appointment.id && appointment.id.length > 8 ? `${appointment.id.substring(0, 8)}...` : appointment.id || 'N/A'}</td>
                            <td>{appointment.customer || 'N/A'}</td>
                            <td>{appointment.email || 'N/A'}</td>
                            <td>{appointment.phone || 'N/A'}</td>
                            <td>{appointment.service || 'N/A'}</td>
                            <td>{appointment.date || 'N/A'}</td>
                            <td>{appointment.time || 'N/A'}</td>
                            <td>
                              <span className={`badge-status ${getStatusClass(appointment.status)}`}>
                                {appointment.status 
                                  ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
                                  : 'Pending'}
                        </span>
                      </td>
                      <td>
                              <span className={`badge-status ${getPaymentStatusClass(appointment.payment)}`}>
                                {appointment.payment 
                                  ? appointment.payment.charAt(0).toUpperCase() + appointment.payment.slice(1)
                                  : 'Unpaid'}
                              </span>
                      </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button 
                                  className="btn btn-sm btn-info" 
                                  onClick={() => viewAppointmentDetails(appointment)}
                                >
                                  <FaInfoCircle /> View
                                </button>
                                <button 
                                  className="btn btn-sm btn-secondary" 
                                  onClick={() => {
                                    // Create a temporary appointment object with raw data visible
                                    const rawDataAppointment = {...appointment, showOriginalDataDirectly: true};
                                    viewAppointmentDetails(rawDataAppointment);
                                  }}
                                >
                                  Original Data
                                </button>
                              </div>
                            </td>
                    </tr>
                        ))
                      )}
                </tbody>
              </table>
            </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Modal for appointment details */}
      {selectedAppointment && <AppointmentDetailModal />}
      
      {/* Modal for all raw data */}
      {showAllOriginalData && <AllOriginalDataModal />}
      
      {/* Add CSS for modal */}
      <style jsx="true">{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 8px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .modal-lg {
          max-width: 80%;
        }
        
        .modal-header {
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-body {
          padding: 20px;
          max-height: 70vh;
          overflow-y: auto;
        }
        
        .modal-footer {
          padding: 15px 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
        
        .detail-row {
          margin-bottom: 10px;
          display: flex;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 8px;
        }
        
        .detail-label {
          font-weight: bold;
          min-width: 100px;
          margin-right: 10px;
        }
        
        .mock-data-banner {
          background-color: #fff3cd;
          color: #856404;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .json-display {
          background-color: #f8f9fa;
          color: #212529;
          padding: 15px;
          border-radius: 4px;
          max-height: 400px;
          overflow-y: auto;
          font-family: monospace;
          font-size: 13px;
          white-space: pre-wrap;
          word-break: break-word;
          border: 1px solid #dee2e6;
        }
        
        .raw-data h4 {
          margin-bottom: 10px;
          font-size: 16px;
          color: #495057;
        }
      `}</style>
    </div>
  );
};

export default AdminAppointment;
