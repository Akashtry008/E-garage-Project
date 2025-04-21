import React from 'react';
import AdminSidebar from '../layouts/AdminSidebar';

export const AdminServices = () => {
  const services = [
    { id: 1, name: 'Oil Change', desc: 'Standard oil change service', price: '$39.99' },
    { id: 2, name: 'Brake Service', desc: 'Brake pad replacement and system check', price: '$129.99' },
    { id: 3, name: 'Tire Rotation', desc: 'Rotate tires for even wear', price: '$25.00' },
    { id: 4, name: 'Engine Tune-up', desc: 'Complete engine diagnostic and tune-up', price: '$89.99' }
  ];

  return (
    <div className="admin-theme sparkle-bg">
      <AdminSidebar/>
      <main className="dashboard-content">
        <header>
          <h1>Services Management</h1>
          <button
            type="button"
            className="add-btn"
            data-bs-toggle="modal"
            data-bs-target="#addServiceModal"
          >
            <i className="fas fa-plus me-2" />
            Add New Service
          </button>
        </header>

        <div className="alert alert-success" role="alert" data-auto-dismiss={5000}>
          Service added successfully
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
          />
        </div>

        <div className="dashboard-card mb-4">
          <div className="card-body">
            <input
              type="text"
              id="searchInput"
              className="form-control mb-3"
              placeholder="Search services."
            />
            <div className="table-responsive">
              <table className="table table-hover align-middle" id="servicesTable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Service Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(service => (
                    <tr key={service.id}>
                      <td>{service.id}</td>
                      <td><strong>{service.name}</strong></td>
                      <td>{service.desc}</td>
                      <td>{service.price}</td>
                      <td><span className="badge badge-completed">Active</span></td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            data-bs-toggle="modal"
                            data-bs-target={`#editServiceModal${service.id}`}
                          >
                            <i className="fas fa-edit" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                          >
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add Service Modal */}
      <div
        className="modal fade"
        id="addServiceModal"
        tabIndex={-1}
        aria-labelledby="addServiceModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addServiceModalLabel" style={{ fontSize: '25px', color: 'blueviolet' }}>
                Add New Service
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <form className="needs-validation" noValidate>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Service Name</label>
                  <input type="text" className="form-control" id="name" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea className="form-control" id="description" rows={3} />
                </div>
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">Price ($)</label>
                  <input type="number" className="form-control" id="price" step="0.01" min={0} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn-custom">Add Service</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Dynamic Edit Modals */}
      {services.map(service => (
        <div
          className="modal fade"
          id={`editServiceModal${service.id}`}
          tabIndex={-1}
          aria-labelledby={`editServiceModalLabel${service.id}`}
          aria-hidden="true"
          key={service.id}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id={`editServiceModalLabel${service.id}`} style={{ fontSize: '25px', color: 'blueviolet' }}>
                  Edit Service
                </h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
              </div>
              <form className="needs-validation" noValidate>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor={`name${service.id}`} className="form-label">Service Name</label>
                    <input type="text" className="form-control" id={`name${service.id}`} defaultValue={service.name} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor={`description${service.id}`} className="form-label">Description</label>
                    <textarea className="form-control" id={`description${service.id}`} rows={3} defaultValue={service.desc} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor={`price${service.id}`} className="form-label">Price ($)</label>
                    <input type="number" className="form-control" id={`price${service.id}`} defaultValue={parseFloat(service.price.replace('$',''))} step="0.01" min={0} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn-custom">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminServices;
