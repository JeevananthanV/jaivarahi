import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AdminAuthProvider } from './AdminAuthContext';
import { useAdminAuth } from './AdminAuthContext';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from './AdminLayout';
import { setAdminNavigate } from './adminApi';
import './admin.css';

const AdminRootRedirect = () => {
  const { user } = useAdminAuth();
  return user ? <Navigate to="/admin/dashboard" replace /> : <Login />;
};

// Pages
import Login from './Login';
import Dashboard from './Dashboard';
import DonationManagement from './DonationManagement';
import PackageCategoryManager from './packages/PackageCategoryManager';
import BookingManagement from './BookingManagement';
import TicketManagement from './TicketManagement';
import EventManagement from './EventManagement';
import UserManagement from './UserManagement';
import EntryManagement from './EntryManagement';
import AuditLogManagement from './AuditLogManagement';
import ProfilePage from './ProfilePage';
import JothidamDashboard from './JothidamDashboard';
import JothidamBookingQueue from './JothidamBookingQueue';
import AstrologerManagement from './AstrologerManagement';
import JothidamPricing from './JothidamPricing';
import JothidamReports from './JothidamReports';
import ServiceDashboard from './services/ServiceDashboard';
import ServiceCategoryManager from './services/ServiceCategoryManager';
import ServiceManager from './services/ServiceManager';
import ServiceBookingManager from './services/ServiceBookingManager';
import ServiceReports from './services/ServiceReports';
import AshadaNavarathiriDashboard from './AshadaNavarathiriDashboard';
import AV2EntryDashboard from './AV2EntryDashboard';
import DevoteesManagement from './DevoteesManagement';
import BlogManagement from './BlogManagement';
import MediaLibrary from './MediaLibrary';

const AdminApp = () => {
  const navigate = useNavigate();
  setAdminNavigate(navigate);

  return (
    <AdminAuthProvider>
      <Routes>
        <Route index element={<AdminRootRedirect />} />

        {/* Protected Admin Routes */}
        <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="donations" element={<DonationManagement />} />
          <Route path="devotees" element={<DevoteesManagement />} />
          <Route path="prasadham" element={<BookingManagement type="prasadham" />} />
          <Route path="royal" element={<BookingManagement type="royal" />} />
          <Route path="services" element={<Navigate to="bookings" replace />} />
          <Route path="services/dashboard" element={<ServiceDashboard />} />
          <Route path="services/categories" element={<ServiceCategoryManager />} />
          <Route path="services/list" element={<ServiceManager />} />
          <Route path="services/bookings" element={<ServiceBookingManager />} />
          <Route path="services/reports" element={<ServiceReports />} />
          <Route path="ashada-navarathiri/dashboard" element={<AshadaNavarathiriDashboard />} />
          <Route path="av2-entry/dashboard" element={<AV2EntryDashboard />} />
          <Route path="av2-entry/vip-checkin" element={<TicketManagement type="vip" isCheckInView={true} />} />
          <Route path="av2-entry/free-checkin" element={<TicketManagement type="free" isCheckInView={true} />} />
          <Route path="vip" element={<TicketManagement type="vip" />} />
          <Route path="free" element={<TicketManagement type="free" />} />
          <Route path="stalls" element={<EventManagement type="stalls" />} />
          <Route path="sponsors" element={<EventManagement type="sponsors" />} />
          <Route path="users" element={
            <ProtectedRoute allowedRoles={['Super Admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="audit-logs" element={
            <ProtectedRoute allowedRoles={['Super Admin']}>
              <AuditLogManagement />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="blogs" element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
              <BlogManagement />
            </ProtectedRoute>
          } />
          <Route path="media" element={
            <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
              <MediaLibrary />
            </ProtectedRoute>
          } />
          <Route path="packages" element={<Navigate to="categories" replace />} />
          <Route path="packages/categories" element={<PackageCategoryManager />} />
          <Route path="packages/bookings" element={<BookingManagement type="packages" />} />

          <Route path="jothidam" element={<Navigate to="jothidam-dashboard" replace />} />
          <Route path="jothidam-dashboard" element={<JothidamDashboard />} />
          <Route path="jothidam-bookings" element={<JothidamBookingQueue />} />
          <Route path="jothidam-astrologers" element={<AstrologerManagement />} />
          <Route path="jothidam-pricing" element={<JothidamPricing />} />
          <Route path="jothidam-reports" element={<JothidamReports />} />

        </Route>
      </Routes>
    </AdminAuthProvider>
  );
};

export default AdminApp;
