import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Building2, ShieldCheck, Award, Users, CheckCircle } from 'lucide-react';
import { ApartmentInfo } from '../../types';

export const AboutPage: React.FC = () => {
  const { siteInfo } = useOutletContext<{ siteInfo?: ApartmentInfo | null }>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-10 sm:p-16 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
        <span className="text-xs font-extrabold text-brand-400 uppercase tracking-widest block">
          About Property Management
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Welcome to {siteInfo?.name || 'Grand Horizon Apartments'}
        </h1>
        <p className="text-slate-300 text-lg max-w-3xl leading-relaxed">
          {siteInfo?.description ||
            'Grand Horizon Apartments provides fully-furnished, modern living spaces tailored for working professionals, students, and urban dwellers seeking comfort, high-speed internet, and security.'}
        </p>
      </div>

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-xl text-slate-900">Safety & Security</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            All rooms are protected by 24/7 CCTV surveillance, biometric/card entrance gates, and fire safety equipment.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-xl text-slate-900">Clean & Maintained</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Common hallway cleaning, trash removal, and quick maintenance responses are guaranteed for all tenants.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-xl text-slate-900">Transparent Pricing</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            No hidden utility fees. Clear monthly rental prices and deposit schedules stated upfront in contracts.
          </p>
        </div>
      </div>
    </div>
  );
};
