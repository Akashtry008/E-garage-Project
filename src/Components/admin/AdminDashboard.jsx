import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/custom.css';
import {
    FaTools,
    FaUsers,
    FaCalendarAlt,
    FaChartBar,
    FaPlus,
    FaClock
} from 'react-icons/fa';
import AdminSidebar from '../layouts/AdminSidebar';

export const AdminDashboard = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formattedTime = time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const formattedDate = time.toLocaleDateString([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="admin-theme sparkle-bg full-height-layout">
            <AdminSidebar />
            <main className="dashboard-content">
                <header>
                    <h1>Dashboard</h1>
                </header>

                <section className="stats">
                    <div className="card">
                        <div className="card-header">
                            <h3>ACTIVE SERVICES</h3>
                            <FaTools className="card-icon text-primary" />
                        </div>
                        <p>4</p>
                        <Link to="/AdminServices"><span>View services →</span></Link>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3>TOTAL CUSTOMERS</h3>
                            <FaUsers className="card-icon text-success" />
                        </div>
                        <p>15</p>
                        <Link to="/AdminCustomers"><span>View customers →</span></Link>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3>ALL APPOINTMENTS</h3>
                            <FaCalendarAlt className="card-icon text-info" />
                        </div>
                        <p>28</p>
                        <Link to="/AdminAppointments"><span>View appointments →</span></Link>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3>CURRENT TIME</h3>
                            <FaClock className="card-icon text-warning" />
                        </div>
                        <p>{formattedTime}</p>
                        <h6 style={{ color: "blueviolet" }}>{formattedDate}</h6>
                    </div>
                </section>




                <section className="appointments">
                    <div className="upcoming">
                        <h2><FaChartBar /> Upcoming Appointments</h2>
                        <div className="chart-placeholder" style={{ alignItems: 'center', padding: '4.5rem' }}>
                            <FaChartBar size={48} />
                            <p>Chart Area</p>
                            <span>Appointment statistics chart would display here</span>
                        </div>
                    </div>
                    <div className="schedule">
                        <h2><FaCalendarAlt /> Today's Schedule</h2>
                        <div className="schedule-card">
                            <strong>09:00 - John Doe</strong>
                            <p>Oil Change</p>
                            <span className="status">Scheduled</span>
                        </div>
                        <div className="schedule-card">
                            <strong>11:30 - Jane Smith</strong>
                            <p>Brake Service</p>
                            <span className="status confirmed">Confirmed</span>
                        </div>
                        <button
                            className="add-btn small"
                            data-bs-toggle="modal"
                            data-bs-target="#addAppointmentModal"
                        >
                            <FaPlus /> Add Appointment
                        </button>
                    </div>
                </section>
            </main>

            {/* Add Appointment Modal */}
            <div
                className="modal fade"
                id="addAppointmentModal"
                tabIndex={-1}
                aria-labelledby="addAppointmentModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5
                                className="modal-title"
                                id="addAppointmentModalLabel"
                                style={{ fontSize: '25px', color: 'blueviolet' }}
                            >
                                Add New Appointment
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            />
                        </div>
                        <form className="needs-validation" noValidate>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="customer" className="form-label" style={{ color: 'black' }}>
                                        Customer Name
                                    </label>
                                    <input type="text" className="form-control" id="customer" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="service" className="form-label" style={{ color: 'black' }}>
                                        Service
                                    </label>
                                    <input type="text" className="form-control" id="service" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="date" className="form-label" style={{ color: 'black' }}>
                                        Date
                                    </label>
                                    <input type="date" className="form-control" id="date" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="time" className="form-label" style={{ color: 'black' }}>
                                        Time
                                    </label>
                                    <input type="time" className="form-control" id="time" required />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-custom">
                                    Add Appointment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
