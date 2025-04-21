import React, { useEffect, useState } from "react";

export const Aservices = () => {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setServices([
        {
          id: 1,
          name: "Oil Change",
          description: "Replace engine oil and filter",
          price: 50,
          durationMinutes: 30,
        },
        {
          id: 2,
          name: "Brake Service",
          description: "Inspect and replace brake pads",
          price: 90,
          durationMinutes: 45,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDeleteService = (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const filteredServices = searchQuery.trim() === ""
    ? services
    : services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const formatCurrency = (value) => `$${value.toFixed(2)}`;

  return (
    <div className="services">
      <div className="header">
        <h2>Services</h2>
        <button>Add Service</button>
      </div>

      <input
        type="search"
        placeholder="Search services..."
        className="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="grid">
        {loading ? (
          <p>Loading...</p>
        ) : filteredServices.length > 0 ? (
          filteredServices.map(service => (
            <div className="card" key={service.id}>
              <div className="card-header">
                <h3>{service.name}</h3>
                <div>
                  <button>Edit</button>
                  <button onClick={() => handleDeleteService(service.id)}>Delete</button>
                </div>
              </div>
              <div className="card-content">
                <p><strong>{formatCurrency(service.price)}</strong> ({service.durationMinutes} mins)</p>
                <p>{service.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No services found.</p>
        )}
      </div>

      <style>{`
        .services {
          padding: 20px;
          font-family: sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .search {
          width: 100%;
          max-width: 400px;
          padding: 8px;
          margin-bottom: 1rem;
        }

        .grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }

        .card {
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 16px;
          background: white;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-content {
          margin-top: 8px;
        }

        button {
          margin-left: 8px;
        }
      `}</style>
    </div>
  );
};

export default Aservices;
