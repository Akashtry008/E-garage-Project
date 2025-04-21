import React, { useState, useEffect } from 'react';
import { FaUsers, FaSearch, FaSync } from 'react-icons/fa';
import AdminSidebar from '../layouts/AdminSidebar';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './adminStyles.css';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      console.log('Fetching customers from API...');
      // Try different API endpoints
      const apiEndpoints = [
        'http://localhost:8000/api/users',
        'http://127.0.0.1:8000/api/users'
      ];
      
      let response = null;
      
      for (const endpoint of apiEndpoints) {
        try {
          console.log(`Trying API endpoint: ${endpoint}`);
          response = await axios.get(endpoint, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            timeout: 5000 // 5 second timeout
          });
          
          console.log(`Successfully connected to: ${endpoint}`);
          break; // Stop trying if successful
        } catch (err) {
          console.log(`Failed to connect to ${endpoint}:`, err.message);
        }
      }
      
      if (!response) {
        throw new Error('Could not connect to any API endpoint');
      }
      
      // Handle multiple possible response formats
      let usersData = [];
      
      if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else if (response.data && response.data.status === true && response.data.users) {
        usersData = response.data.users;
      } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
        // Try to find any array property that might contain users
        const possibleArrays = Object.entries(response.data)
          .filter(([key, value]) => Array.isArray(value) && value.length > 0)
          .map(([key, value]) => value);
          
        if (possibleArrays.length > 0) {
          usersData = possibleArrays[0];
        }
      }
      
      if (usersData && usersData.length > 0) {
        // Process customers to ensure all fields are properly formatted
        const processedCustomers = usersData.map(customer => ({
          id: customer.id || customer._id || 'N/A',
          name: typeof customer.name === 'string' ? customer.name : 'N/A',
          email: typeof customer.email === 'string' ? customer.email : 'N/A',
          phone: typeof customer.phone === 'string' ? customer.phone : 'N/A',
          address: typeof customer.address === 'string' ? customer.address : 'N/A',
          status: customer.is_active ? 'active' : 'inactive',
          joined: customer.created_at || new Date().toISOString()
        }));
        
        setCustomers(processedCustomers);
        toast.success(`${processedCustomers.length} customers loaded successfully`);
      } else {
        console.log('No user data found in the response');
        setCustomers([]);
        toast.info('No customer records found in the database');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customer data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const sortedCustomers = React.useMemo(() => {
    let sortableCustomers = [...customers];
    if (sortConfig.key) {
      sortableCustomers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableCustomers;
  }, [customers, sortConfig]);

  const filteredCustomers = React.useMemo(() => {
    return sortedCustomers.filter(customer => {
      return (
        (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.id && customer.id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [sortedCustomers, searchTerm]);

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
      case "active":
        return "badge-completed";
      case "inactive":
        return "badge-cancelled";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  // Add mock data for testing when no real data is available
  const generateMockData = () => {
    const mockCustomers = [
      {
        id: 'mock-001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        address: '123 Main St',
        status: 'active',
        joined: new Date().toISOString()
      },
      {
        id: 'mock-002',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '987-654-3210',
        address: '456 Elm St',
        status: 'active',
        joined: new Date().toISOString()
      },
      {
        id: 'mock-003',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '555-123-4567',
        address: '789 Oak St',
        status: 'inactive',
        joined: new Date().toISOString()
      }
    ];
    
    setCustomers(mockCustomers);
    toast.info('Showing sample data (no connection to database)');
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content-wrapper">
        <main className="dashboard-content">
          <ToastContainer 
            position="top-right" 
            autoClose={3000}
            limit={1}
            newestOnTop={true}
          />
          <header>
            <h1><FaUsers className="me-2" /> Customers</h1>
            <div className="action-buttons">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
              </div>
              <button 
                className="btn btn-primary ms-2" 
                onClick={fetchCustomers} 
                disabled={loading}
                title="Refresh customers"
              >
                <FaSync className={loading ? "fa-spin" : ""} />
              </button>
              <button
                className="btn btn-secondary ms-2"
                onClick={generateMockData}
                title="Show sample data"
              >
                Sample Data
              </button>
            </div>
          </header>

          <div className="dashboard-card">
            <div className="card-body">
              {loading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading customers...</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr className="table-header">
                        <th onClick={() => requestSort('id')}>ID</th>
                        <th onClick={() => requestSort('name')}>Name</th>
                        <th onClick={() => requestSort('email')}>Email</th>
                        <th onClick={() => requestSort('phone')}>Phone</th>
                        <th onClick={() => requestSort('address')}>Address</th>
                        <th onClick={() => requestSort('joined')}>Joined</th>
                        <th onClick={() => requestSort('status')}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            No customers found{searchTerm ? ` matching "${searchTerm}"` : ''}.
                            <div className="mt-2">
                              <button className="btn btn-sm btn-outline-primary" onClick={fetchCustomers}>
                                Refresh Data
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <tr key={customer.id}>
                            <td>{customer.id || 'N/A'}</td>
                            <td>{customer.name || 'N/A'}</td>
                            <td>{customer.email || 'N/A'}</td>
                            <td>{customer.phone || 'N/A'}</td>
                            <td>{customer.address || 'N/A'}</td>
                            <td>{formatDate(customer.joined)}</td>
                            <td>
                              <span className={`badge-status ${getStatusClass(customer.status)}`}>
                                {customer.status 
                                  ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1)
                                  : 'Unknown'}
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

// Add this at the end of the file, just before the final export default line
// Add custom styles just before the export
const styles = document.createElement('style');
styles.innerHTML = `
  .table-header th {
    background-color: #6c5ce7;
    color: white;
    padding: 12px 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .table-header th:hover {
    background-color: #5541d7;
  }
`;
document.head.appendChild(styles);

export default AdminCustomers;
