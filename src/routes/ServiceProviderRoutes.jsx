import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ServiceProviderDashboard from '../Components/serviceprovider/ServiceProviderDashboard';

const ServiceProviderRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/service-provider/dashboard" />} />
      <Route path="/dashboard" element={<ServiceProviderDashboard />} />
    </Routes>
  );
};

export default ServiceProviderRoutes; 