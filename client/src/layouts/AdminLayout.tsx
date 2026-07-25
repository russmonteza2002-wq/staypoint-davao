import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
