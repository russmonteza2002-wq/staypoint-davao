import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, Facebook, ShieldCheck } from 'lucide-react';
import { ApartmentInfo } from '../../types';

export const Footer: React.FC<{ info?: ApartmentInfo | null }> = ({ info }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-600 text-white rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                {info?.name || 'Staypoint Davao'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              {info?.tagline || 'Modern, Secure & Comfort Urban Living in Davao City'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {info?.facebookUrl && (
                <a
                  href={info.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors"
                >
                  <Facebook className="w-5 h-5 text-sky-400" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wider uppercase text-xs">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-400 transition-colors">
                  Home Page
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-brand-400 transition-colors">
                  Available Rooms Catalog
                </Link>
              </li>
              <li>
                <Link to="/track-inquiry" className="hover:text-brand-400 transition-colors">
                  Track Inquiry Status
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-400 transition-colors">
                  About Our Property
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-400 transition-colors">
                  Contact & Location Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wider uppercase text-xs">
              Contact & Address
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                <span>{info ? `${info.address}, ${info.city}` : 'Rizal Extension, Davao City'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-500 shrink-0" />
                <a href={`tel:${info?.phoneNumber}`} className="hover:text-white transition-colors">
                  {info?.phoneNumber || '+63 917 555 0199'}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-500 shrink-0" />
                <a href={`mailto:${info?.email}`} className="hover:text-white transition-colors">
                  {info?.email || 'inquiries@staypointdavao.com'}
                </a>
              </li>
            </ul>
          </div>

          {/* Security & Admin */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 tracking-wider uppercase text-xs">
              Property Access
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              All communications are securely encrypted and processed directly inside our system database.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Property Admin Login
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {info?.name || 'Staypoint Davao'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
