import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import React from 'react';

import { AddService } from './Components/serviceprovider/AddService';
import { ProductCreate } from './Components/admin/ProductCreate';
import { Home } from './Components/user/Home';
import { About } from './Components/user/About';
import { UserServices } from './Components/user/UserServices';
import { UserServicesGallery } from './Components/user/UserServicesGallery';
import { Booking } from './Components/user/Booking';
import { Contact } from './Components/user/Contact';
import { NotFound } from './Components/user/NotFound';
import { EngineServicing } from './Components/user/EngineServicing';
import { OilChanging } from './Components/user/OilChanging';
import { TiresReplacement } from './Components/user/TiresReplacement';
import { DiagnosticTest } from './Components/user/DiagnosticTest';
import { BookService } from './Components/User/BookService';
import { BookAppointment } from './Components/user/BookAppointment';
import { Help } from './Components/user/Help';
import { FAQs } from './Components/user/FAQs';
// import { AdminSiderbar } from './Components/layouts/AdminSiderbar';
import { Experience } from './Components/user/Experience';
import { Appointments } from './Components/pages/Appointments';
import { Aservices } from './Components/pages/Aservices';
import { Dashboard } from './Components/pages/Dashboard';
import { Customers } from './Components/pages/Customers';
import { Error } from './Components/pages/Error';
import { AdminDashboard } from './Components/admin/AdminDashboard';
import { AdminAppointment } from './Components/admin/AdminAppointment';
// import { AdminLogout } from './Components/admin/AdminLogout';
import { AdminCustomers } from './Components/admin/AdminCustomers';
import AdminServices from './Components/admin/Adminservices';
import AdminProfile from './Components/admin/AdminProfile';
import ScrollToTop from './Components/common/ScrollToTop';
import ScrollTest from './Components/common/ScrollTest';

import './assets/css/style.css';
import './assets/css/bootstrap.min.css';
import './assets/css/custom.css';
import './assets/css/ServiceProvider.css';
import './Components/common/AuthForm.module.css';

// Service Provider Pages
import DashboardPage from './pages/serviceprovider/DashboardPage';
import BookingsPage from './pages/serviceprovider/BookingsPage';
import ServicesPage from './pages/serviceprovider/ServicesPage';
import ReviewsPage from './pages/serviceprovider/ReviewsPage';
import ProfilePage from './pages/serviceprovider/ProfilePage';
import NotificationsPage from './pages/serviceprovider/NotificationsPage';
import ServiceProviderLayout from './layouts/ServiceProviderLayout';
import ServiceDetailPage from './pages/ServiceDetailPage';
import Payment from './Components/user/Payment';
// Component Imports
import SignInPage from './Components/common/SignIn';
import SignUpPage from './Components/common/SignUp';
import PrivateRoute from './Components/common/PrivateRoute';
import ForgetPassword from './Components/common/ForgetPassword';
import ResetPassword from './Components/common/ResetPassword';
import StatCard from './Components/cards/StatCard';
import { ReviewCard } from './Components/cards/ReviewCard';
import { ServiceCard } from './Components/cards/ServiceCard';
// import UserBookings from './Components/user/UserBookings';

// Import the AdminPayments component
import AdminPayments from './Components/admin/AdminPayments';
import AdminMessages from './Components/Admin/AdminMessages';

axios.defaults.baseURL = "http://localhost:8000";

// Add axios interceptor to include auth token in requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function App() {
  return (
    <div className="app-container" style={{ position: 'relative', minHeight: '100vh' }}>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/UserServices" element={<UserServices />} />
        <Route path="/UserServicesGallery" element={<UserServicesGallery />} />
        <Route path="/service/:id" element={<ServiceDetailPage/>} />
        <Route path="/scroll-test" element={<ScrollTest />} />
        <Route path="/payment" element={<Payment />} />
        
        {/* Auth Routes */}
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ForgetPassword/>} />
        <Route path="/reset-password" element={<ResetPassword/>} />

        {/* User Routes */}
        <Route path="/booking" element={<Booking />} />
        <Route path="/DiagnosticTest" element={<DiagnosticTest />} />
        <Route path="/tiresreplacement" element={<TiresReplacement />} />
        <Route path="/oilchanging" element={<OilChanging />} />
        <Route path="/engineservicing" element={<EngineServicing />} />
        <Route path="/BookService" element={<BookService />} />
        <Route path="/BookAppointment" element={<BookAppointment />} />
        {/* <Route path="/user-bookings" element={<UserBookings />} /> */}
        <Route path="/help" element={<Help />} />
        <Route path="/FAQs" element={<FAQs />} />
        <Route path="/Experience" element={<Experience />} />

        {/* Admin Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/AdminServices" element={<AdminServices />} />
          <Route path="/AdminAppointments" element={<AdminAppointment />} />
          <Route path="/AdminCustomers" element={<AdminCustomers />} />
          <Route path="/AdminProfile" element={<AdminProfile />} />
          <Route path="/AdminPayments" element={<AdminPayments />} /> 
          <Route path="/AdminMessages" element={<AdminMessages/>} />
        </Route>

        {/* Service Provider Routes - Protected */}
        <Route element={<PrivateRoute />}>
          <Route path="/service-provider" element={<ServiceProviderLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        {/* Legacy Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/aservices" element={<Aservices />} />
        <Route path="/ProductCreate" element={<ProductCreate />} />
        <Route path="/AddService" element={<AddService />} />

        {/* Error route */}
        <Route path="/Error" element={<Error />} />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />

        {/* Legacy Service Provider Routes */}
        <Route path="/ServiceProviderDashboard" element={<ServiceProviderLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
        
        {/* Component Routes - typically these would not be direct routes */}
        <Route path="/StatCard" element={<StatCard />} />
        <Route path='/ServiceCard' element={<ServiceCard />} />
        <Route path='/ReviewCard' element={<ReviewCard />} />
      </Routes>
    </div>
  );
}

export default App;
