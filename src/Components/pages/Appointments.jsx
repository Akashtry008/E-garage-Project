import React, { useState, useEffect } from 'react';

export const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data from an API
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/appointments'); // Replace with your API endpoint
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  return (
    <div>
      <h1>Appointments</h1>
      {appointments.length === 0 ? (
        <p>No appointments available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Vehicle</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.customerName}</td>
                <td>{appointment.vehicle}</td>
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td>{appointment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Appointments;