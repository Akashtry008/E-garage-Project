import React, { useEffect, useState } from "react";
import AdminSidebar from "../layouts/AdminSidebar";
import { FaEnvelope, FaSearch, FaSync } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './adminStyles.css';
import { fetchMessages, formatDate, MOCK_MESSAGES } from './messageUtils';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Add debug script to page
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/debug.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  // Load messages on component mount
  useEffect(() => {
    loadMessages();
  }, []);
  
  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the utility function to fetch messages
      const result = await fetchMessages();
      setMessages(result.messages);
      toast.success(`Loaded ${result.messages.length} messages`);
    } catch (err) {
      console.error("Error loading messages:", err);
      setError(err.message);
      toast.error(`Error: ${err.message}`);
      
      // Use mock data as fallback
      setMessages(MOCK_MESSAGES);
      toast.info("Showing mock data due to API error");
    } finally {
      setLoading(false);
    }
  };
  
  // Filter messages based on search term
  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content-wrapper">
        <main className="dashboard-content">
          <ToastContainer position="top-right" autoClose={3000} />
          
          <header>
            <h1><FaEnvelope className="me-2" />Contact Messages</h1>
            <div className="action-buttons">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <button
                className="btn btn-primary ms-2"
                onClick={loadMessages}
                disabled={loading}
                title="Refresh messages"
              >
                <FaSync className={loading ? "fa-spin" : ""} />
              </button>
            </div>
          </header>
          
          <div className="dashboard-card">
            <div className="card-body">
              {loading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="mt-3">Loading messages...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <h5>Error loading messages</h5>
                  <p>{error}</p>
                  <button className="btn btn-sm btn-outline-primary mt-2" onClick={loadMessages}>
                    Try Again
                  </button>
                  <div className="mt-3">
                    <a href="/test.html" target="_blank" className="btn btn-sm btn-secondary">
                      Open Test Page
                    </a>
                  </div>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMessages.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            No messages found{searchTerm && ` matching "${searchTerm}"`}.
                            <div className="mt-2">
                              <button className="btn btn-sm btn-outline-primary" onClick={loadMessages}>
                                Reload
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredMessages.map((msg) => (
                          <tr key={msg.id}>
                            <td>{msg.id}</td>
                            <td>{msg.name}</td>
                            <td>{msg.email}</td>
                            <td>{msg.phone}</td>
                            <td>{msg.subject}</td>
                            <td>{msg.message}</td>
                            <td>{formatDate(msg.created_at)}</td>
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

export default AdminMessages;
