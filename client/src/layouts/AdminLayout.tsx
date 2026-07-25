import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, Building2, LogOut } from 'lucide-react';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800/80 border border-slate-700"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-600 text-white rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-sm">Staypoint Admin</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
          title="Log Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <AdminSidebar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
