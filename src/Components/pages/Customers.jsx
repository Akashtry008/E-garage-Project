import React, { useEffect, useState } from "react";

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCustomers([
        {
          id: 1,
          name: "John Doe",
          phone: "123-456-7890",
          email: "john@example.com",
          lastAppointment: { appointmentDate: "2024-04-05" },
          vehicleDetails: "Honda Civic"
        },
        {
          id: 2,
          name: "Jane Smith",
          phone: "987-654-3210",
          email: "jane@example.com",
          lastAppointment: { appointmentDate: "2024-04-02" },
          vehicleDetails: "Toyota Corolla"
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();
  const formatRelativeDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    return `${diff} day(s) ago`;
  };

  const handleDeleteCustomer = (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSorted = () => {
    let filtered = customers.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let valA = sortField === "lastVisit" ? a.lastAppointment?.appointmentDate || "" : a[sortField];
      let valB = sortField === "lastVisit" ? b.lastAppointment?.appointmentDate || "" : b[sortField];
      return (valA < valB ? -1 : 1) * (sortDirection === "asc" ? 1 : -1);
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Customers</h2>
      <input
        type="search"
        placeholder="Search customers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ padding: 8, width: "100%", maxWidth: 400, marginBottom: 20 }}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>Name</th>
              <th>Contact</th>
              <th onClick={() => handleSort("lastVisit")} style={{ cursor: "pointer" }}>Last Visit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted().length > 0 ? (
              filteredAndSorted().map(c => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong><br />
                    <small>{c.vehicleDetails}</small>
                  </td>
                  <td>
                    {c.phone}<br />
                    {c.email}
                  </td>
                  <td>
                    {c.lastAppointment ? (
                      <>
                        {formatRelativeDate(c.lastAppointment.appointmentDate)}<br />
                        <small>{formatDate(c.lastAppointment.appointmentDate)}</small>
                      </>
                    ) : (
                      <em>No visits yet</em>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleDeleteCustomer(c.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Customers;
