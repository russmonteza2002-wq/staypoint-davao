import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { PublicLayout } from '../layouts/PublicLayout';
import { HomePage } from '../pages/public/HomePage';
import { RoomsPage } from '../pages/public/RoomsPage';
import { RoomDetailPage } from '../pages/public/RoomDetailPage';
import { TrackInquiryPage } from '../pages/public/TrackInquiryPage';
import { AboutPage } from '../pages/public/AboutPage';
import { ContactPage } from '../pages/public/ContactPage';

import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminRoomsPage } from '../pages/admin/AdminRoomsPage';
import { AdminAddRoomPage } from '../pages/admin/AdminAddRoomPage';
import { AdminInquiriesPage } from '../pages/admin/AdminInquiriesPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. PUBLIC WEBSITE ROUTES */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/:slug" element={<RoomDetailPage />} />
        <Route path="/track-inquiry" element={<TrackInquiryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* 2. ADMIN AUTH ROUTE */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* 3. PROTECTED ADMIN PORTAL ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/rooms" element={<AdminRoomsPage />} />
          <Route path="/admin/rooms/new" element={<AdminAddRoomPage />} />
          <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
