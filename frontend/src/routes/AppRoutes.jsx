import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import HomePage from '../pages/public/HomePage';
import VillasPage from '../pages/public/VillasPage';
import VillaDetailPage from '../pages/public/VillaDetailPage';
import BookingPage from '../pages/public/BookingPage';
import BookingConfirmationPage from '../pages/public/BookingConfirmationPage';
import AboutPage from '../pages/public/AboutPage';
import GalleryPage from '../pages/public/GalleryPage';
import ContactPage from '../pages/public/ContactPage';
import TermsPrivacyPage from '../pages/public/TermsPrivacyPage';

// Admin ERP Pages & Modules
import LoginPage from '../pages/admin/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import WebsiteManagement from '../modules/WebsiteManagement';
import ReservationManagement from '../modules/ReservationManagement';
import VillaRoomManagement from '../modules/VillaRoomManagement';
import CRMManagement from '../modules/CRMManagement';
import CustomerManagement from '../modules/CustomerManagement';
import BillingManagement from '../modules/BillingManagement';
import VendorManagement from '../modules/VendorManagement';
import PayoutManagement from '../modules/PayoutManagement';
import ExpenseManagement from '../modules/ExpenseManagement';
import StaffManagement from '../modules/StaffManagement';
import ReportsManagement from '../modules/ReportsManagement';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Reservation Website */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="villas" element={<VillasPage />} />
        <Route path="villas/:slug" element={<VillaDetailPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="booking-confirmation/:reference" element={<BookingConfirmationPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="terms" element={<TermsPrivacyPage />} />
        <Route path="privacy" element={<TermsPrivacyPage />} />
      </Route>

      {/* Admin ERP Login */}
      <Route path="/erp/login" element={<LoginPage />} />

      {/* Private Admin ERP Platform */}
      <Route path="/erp" element={<AdminLayout />}>
        <Route index element={<Navigate to="/erp/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="website" element={<WebsiteManagement />} />
        <Route path="reservations" element={<ReservationManagement />} />
        <Route path="villas" element={<VillaRoomManagement />} />
        <Route path="crm" element={<CRMManagement />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="billing" element={<BillingManagement />} />
        <Route path="vendors" element={<VendorManagement />} />
        <Route path="payouts" element={<PayoutManagement />} />
        <Route path="expenses" element={<ExpenseManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="reports" element={<ReportsManagement />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
