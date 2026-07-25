import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SiteService } from '../services/siteService';
import { ApartmentInfo } from '../types';

export const PublicLayout: React.FC = () => {
  const [siteInfo, setSiteInfo] = useState<ApartmentInfo | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await SiteService.getSiteInfo();
        setSiteInfo(res.data);
      } catch (error) {
        // Fallback default
      }
    };
    fetchInfo();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar phoneNumber={siteInfo?.phoneNumber} />
      <main className="flex-1">
        <Outlet context={{ siteInfo }} />
      </main>
      <Footer info={siteInfo} />
    </div>
  );
};
