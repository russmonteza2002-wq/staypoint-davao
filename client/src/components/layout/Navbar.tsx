import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Phone, Menu, X, Search } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC<{ phoneNumber?: string }> = ({ phoneNumber = '+63 917 555 0199' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Available Rooms', path: '/rooms' },
    { name: 'Track Inquiry', path: '/track-inquiry' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-brand-600 text-white rounded-xl shadow-md shadow-brand-600/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-none">
                Staypoint
              </span>
              <span className="text-xs font-semibold text-brand-600 tracking-wider uppercase">
                Davao Apartments
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                  isActive(link.path)
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <a href={`tel:${phoneNumber}`}>
              <Button variant="secondary" size="sm" leftIcon={<Phone className="w-4 h-4 text-emerald-400" />}>
                Call Owner
              </Button>
            </a>
            <Link to="/admin/login">
              <Button variant="ghost" size="sm">
                Admin Portal
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 text-base font-semibold rounded-xl ${
                isActive(link.path) ? 'bg-brand-50 text-brand-600' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <a href={`tel:${phoneNumber}`} className="w-full">
              <Button variant="secondary" className="w-full" leftIcon={<Phone className="w-4 h-4 text-emerald-400" />}>
                Call Owner ({phoneNumber})
              </Button>
            </a>
            <Link to="/admin/login" onClick={() => setIsOpen(false)} className="w-full">
              <Button variant="outline" className="w-full">
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
