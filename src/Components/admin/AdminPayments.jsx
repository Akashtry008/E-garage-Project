import React, { useState, useEffect } from 'react';
import { FaMoneyBill, FaSearch, FaSync, FaFileExport } from 'react-icons/fa';
import AdminSidebar from '../layouts/AdminSidebar';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './adminStyles.css'; // Import CSS if it exists (or we'll create it)

export const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      console.log('Fetching payments from API...');
      const response = await axios.get('http://localhost:8000/api/payments', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        // Process payments to ensure all fields are properly formatted
        const processedPayments = response.data.map(payment => ({
          ...payment,
          // Ensure string values aren't displayed as "string"
          customer_name: typeof payment.customer_name === 'string' ? payment.customer_name : 'N/A',
          customer_email: typeof payment.customer_email === 'string' ? payment.customer_email : 'N/A',
          customer_phone: typeof payment.customer_phone === 'string' ? payment.customer_phone : 'N/A',
          service: typeof payment.service === 'string' ? payment.service : 'N/A',
          payment_method: typeof payment.payment_method === 'string' ? payment.payment_method : 'N/A',
          payment_status: typeof payment.payment_status === 'string' ? payment.payment_status : 'pending',
          // Ensure numeric values
          amount: payment.amount || 0,
          gst_amount: payment.gst_amount || 0,
          total_amount: payment.total_amount || 0,
        }));
        
        setPayments(processedPayments);
        if (processedPayments.length > 0) {
          toast.success(`${processedPayments.length} payments loaded successfully`);
        } else {
          toast.info('No payment records found');
        }
      } else {
        console.error('Invalid data format received:', response.data);
        toast.error('Invalid payment data format received from server');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error(`Failed to load payments: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const sortedPayments = React.useMemo(() => {
    let sortablePayments = [...payments];
    if (sortConfig.key) {
      sortablePayments.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortablePayments;
  }, [payments, sortConfig]);

  const filteredPayments = React.useMemo(() => {
    return sortedPayments.filter(payment => {
      return (
        (payment.customer_name && payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.customer_email && payment.customer_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.payment_id && payment.payment_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.service && payment.service.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.id && payment.id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [sortedPayments, searchTerm]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusClass = (status) => {
    if (!status) return "";
    
    switch (status.toLowerCase()) {
      case "successful":
        return "badge-completed";
      case "pending":
        return "badge-scheduled";
      case "failed":
        return "badge-cancelled";
      case "initiated":
        return "badge-scheduled";
      case "refunded":
        return "badge-refunded";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  // Format currency values
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const exportToCSV = () => {
    // CSV headers including customer_phone
    const headers = [
      'ID', 
      'Customer Name', 
      'Email', 
      'Phone', 
      'Service', 
      'Amount', 
      'GST', 
      'Total', 
      'Method', 
      'Status', 
      'Date', 
      'Invoice #', 
      'Payment ID'
    ];
    
    // Prepare CSV data
    const csvData = filteredPayments.map(payment => [
      payment.id || '',
      payment.customer_name || '',
      payment.customer_email || '',
      payment.customer_phone || '',  // Include phone number in the export
      payment.service || '',
      payment.amount || '0',
      payment.gst_amount || '0',
      payment.total_amount || '0',
      payment.payment_method || '',
      payment.payment_status || '',
      formatDate(payment.created_at),
      payment.invoice_number || '',
      payment.payment_id || ''
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
    link.setAttribute('download', `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Payments exported successfully!');
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content-wrapper">
        <main className="dashboard-content">
          <ToastContainer position="top-right" autoClose={3000} />
          <header>
            <h1><FaMoneyBill className="me-2" /> Payments</h1>
            <div className="action-buttons">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
              </div>
              <button 
                className="btn btn-primary ms-2" 
                onClick={fetchPayments} 
                disabled={loading}
                title="Refresh payments"
              >
                <FaSync className={loading ? "fa-spin" : ""} />
              </button>
              <button
                className="btn btn-success ms-2"
                onClick={exportToCSV}
                disabled={loading || filteredPayments.length === 0}
                title="Export to CSV"
              >
                <FaFileExport /> Export
              </button>
            </div>
          </header>

          <div className="dashboard-card" >
            <div className="card-body" >
              {loading ? (
                <div className="text-center my-5" >
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading payments...</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table table-hover align-middle" >
                    <thead>
                      <tr>
                        <th onClick={() => requestSort('id')} >ID</th>
                        <th onClick={() => requestSort('customer_name')}>Customer</th>
                        <th onClick={() => requestSort('customer_email')}>Email</th>
                        <th onClick={() => requestSort('customer_phone')}>Phone</th>
                        <th onClick={() => requestSort('service')}>Service</th>
                        <th onClick={() => requestSort('amount')}>Amount</th>
                        <th onClick={() => requestSort('gst_amount')}>GST</th>
                        <th onClick={() => requestSort('total_amount')}>Total</th>
                        <th onClick={() => requestSort('payment_method')}>Method</th>
                        <th onClick={() => requestSort('payment_status')}>Status</th>
                        <th onClick={() => requestSort('created_at')}>Date</th>
                        <th onClick={() => requestSort('invoice_number')}>Invoice #</th>
                        <th>Payment ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.length === 0 ? (
                        <tr>
                          <td colSpan="13" className="text-center py-4">
                            No payments found{searchTerm ? ` matching "${searchTerm}"` : ''}.
                            <div className="mt-2">
                              <button className="btn btn-sm btn-outline-primary" onClick={fetchPayments}>
                                Refresh Data
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td>{payment.id || 'N/A'}</td>
                            <td>{payment.customer_name || 'N/A'}</td>
                            <td>{payment.customer_email || 'N/A'}</td>
                            <td>{payment.customer_phone || 'N/A'}</td>
                            <td>{payment.service || 'N/A'}</td>
                            <td>{formatCurrency(payment.amount)}</td>
                            <td>{formatCurrency(payment.gst_amount)}</td>
                            <td>{formatCurrency(payment.total_amount)}</td>
                            <td>{payment.payment_method || 'N/A'}</td>
                            <td>
                              <span className={`badge-status ${getStatusClass(payment.payment_status)}`}>
                                {payment.payment_status 
                                  ? payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)
                                  : 'Pending'}
                              </span>
                            </td>
                            <td>{formatDate(payment.created_at)}</td>
                            <td>{payment.invoice_number || 'N/A'}</td>
                            <td>
                              <span className="payment-id">
                                {payment.payment_id || 'N/A'}
                              </span>
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
    </div>
  );
};

export default AdminPayments; 