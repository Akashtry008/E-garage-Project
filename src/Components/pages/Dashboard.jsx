import React, { useEffect, useState } from "react";

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appointments");

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setStats({
        todayAppointments: 5,
        appointmentsTrend: 10,
        revenueToday: 1200,
        revenueTrend: 15,
        totalServices: 12,
        serviceTrend: 5,
        completedServices: 8,
        completedTrend: 20,
      });

      setTodayAppointments([
        {
          id: 1,
          customer: { name: "John Doe" },
          service: { name: "Oil Change", price: 50 },
          appointmentTime: "10:30",
        },
        {
          id: 2,
          customer: { name: "Jane Smith" },
          service: { name: "Brake Check", price: 75 },
          appointmentTime: "14:00",
        },
      ]);

      setRecentCustomers([
        {
          id: 1,
          name: "John Doe",
          phone: "555-1234",
          lastAppointment: { appointmentDate: "2024-04-08" },
        },
        {
          id: 2,
          name: "Jane Smith",
          phone: "555-5678",
          lastAppointment: { appointmentDate: "2024-04-05" },
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (value) => `$${value.toFixed(2)}`;
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();
  const formatTime = (timeStr) => timeStr;

  const StatCard = ({ title, value, trendLabel }) => (
    <div className="card">
      <h4>{title}</h4>
      <p className="value">{value}</p>
      <small>{trendLabel}</small>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="header">
        <h2>Dashboard</h2>
        <div>
          <button>View Calendar</button>
          <button onClick={() => alert("Download initiated")}>Download Project</button>
        </div>
      </div>

      <div className="stats">
        {loading ? (
          <p>Loading stats...</p>
        ) : (
          <>
            <StatCard
              title="Today's Appointments"
              value={stats.todayAppointments}
              trendLabel={`${stats.appointmentsTrend}% from last week`}
            />
            <StatCard
              title="Revenue Today"
              value={formatCurrency(stats.revenueToday)}
              trendLabel={`${stats.revenueTrend}% from last week`}
            />
            <StatCard
              title="Active Services"
              value={stats.totalServices}
              trendLabel={`${stats.serviceTrend}% from last month`}
            />
            <StatCard
              title="Completed Services"
              value={stats.completedServices}
              trendLabel={`${stats.completedTrend}% from last month`}
            />
          </>
        )}
      </div>

      <div className="tabs">
        <button onClick={() => setActiveTab("appointments")}>Today's Appointments</button>
        <button onClick={() => setActiveTab("customers")}>Recent Customers</button>
      </div>

      <div className="tab-content">
        {activeTab === "appointments" && (
          <div>
            <h3>Today's Appointments</h3>
            {loading ? (
              <p>Loading appointments...</p>
            ) : todayAppointments.length > 0 ? (
              todayAppointments.map((appt) => (
                <div key={appt.id} className="item">
                  <p>
                    <strong>{appt.customer.name}</strong> - {appt.service.name}
                  </p>
                  <p>
                    Time: {formatTime(appt.appointmentTime)} | Price: {formatCurrency(appt.service.price)}
                  </p>
                </div>
              ))
            ) : (
              <p>No appointments today.</p>
            )}
            <a href="/appointments">View all appointments →</a>
          </div>
        )}

        {activeTab === "customers" && (
          <div>
            <h3>Recent Customers</h3>
            {loading ? (
              <p>Loading customers...</p>
            ) : recentCustomers.length > 0 ? (
              recentCustomers.map((cust) => (
                <div key={cust.id} className="item">
                  <p>
                    <strong>{cust.name}</strong> - {cust.phone}
                  </p>
                  <p>Last Visit: {formatDate(cust.lastAppointment.appointmentDate)}</p>
                </div>
              ))
            ) : (
              <p>No recent customers.</p>
            )}
            <a href="/customers">View all customers →</a>
          </div>
        )}
      </div>

      <style>{`
        .dashboard {
          padding: 20px;
          font-family: sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .header button {
          margin-left: 10px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .card {
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .value {
          font-size: 20px;
          font-weight: bold;
        }

        .tabs button {
          margin-right: 10px;
        }

        .tab-content {
          margin-top: 20px;
        }

        .item {
          border-bottom: 1px solid #ddd;
          padding: 10px 0;
        }

        a {
          display: inline-block;
          margin-top: 10px;
          color: #0070f3;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
