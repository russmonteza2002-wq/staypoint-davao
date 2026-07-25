import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Wifi,
  Sparkles,
  ArrowRight,
  MessageSquare,
  MapPin,
  Droplet,
  Zap,
  FileText,
  Bike,
  Slash,
} from 'lucide-react';
import { RoomService } from '../../services/roomService';
import { Room, ApartmentInfo } from '../../types';
import { RoomCard } from '../../components/rooms/RoomCard';
import { Button } from '../../components/ui/Button';
import { ApartmentMap } from '../../components/maps/ApartmentMap';
import { InquiryModal } from '../../components/inquiry/InquiryModal';

export const HomePage: React.FC = () => {
  const { siteInfo } = useOutletContext<{ siteInfo?: ApartmentInfo | null }>();
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await RoomService.getFeaturedRooms();
        setFeaturedRooms(res.data);
      } catch (error) {
        // Handle error silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-20 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950 text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center filter brightness-75 scale-105 animate-pulse duration-[10000ms]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-0" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-dark text-brand-300 text-xs font-bold uppercase tracking-widest border border-brand-500/30">
            <Sparkles className="w-4 h-4 text-brand-400" /> Premium Room Rental & Apartment Living
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-white drop-shadow-md">
            Find Your Ideal Space at <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-400">
              {siteInfo?.name || 'Staypoint Davao'}
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {siteInfo?.tagline ||
              'Fully-furnished apartment rooms in Davao City featuring free water supply, individual electric sub-meters, high-speed WiFi, and 24/7 CCTV security.'}
          </p>

          {/* Quick Search Glass Box */}
          <div className="max-w-4xl mx-auto glass-card-dark p-4 rounded-3xl border border-slate-700/60 shadow-2xl flex flex-col md:flex-row gap-3 items-center">
            <div className="flex-1 w-full flex items-center gap-3 px-4 py-3 bg-slate-900/80 rounded-2xl border border-slate-800">
              <Building2 className="w-5 h-5 text-brand-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-200">Browsing Available Room Units</span>
            </div>
            <Link to="/rooms" className="w-full md:w-auto">
              <Button size="lg" className="w-full md:w-auto" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Explore Available Rooms
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. RENTAL POLICIES & INCLUDED UTILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl text-white space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold text-brand-400 uppercase tracking-widest">
              Rental Policies & Utilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Transparent Lease Terms</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Everything you need to know before moving into Staypoint Davao.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-center">
              <Droplet className="w-7 h-7 text-sky-400 mx-auto" />
              <h4 className="font-extrabold text-sm text-white">Free Water Supply</h4>
              <p className="text-xs text-slate-400">Water utility is included in monthly rent.</p>
            </div>

            <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-center">
              <Zap className="w-7 h-7 text-amber-400 mx-auto" />
              <h4 className="font-extrabold text-sm text-white">Own Electric Meter</h4>
              <p className="text-xs text-slate-400">Individual sub-meter for actual usage.</p>
            </div>

            <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-center">
              <FileText className="w-7 h-7 text-indigo-400 mx-auto" />
              <h4 className="font-extrabold text-sm text-white">1-Year Minimum Term</h4>
              <p className="text-xs text-slate-400">Minimum 1-year contract agreement.</p>
            </div>

            <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-center">
              <Bike className="w-7 h-7 text-emerald-400 mx-auto" />
              <h4 className="font-extrabold text-sm text-white">Motorcycle Parking</h4>
              <p className="text-xs text-slate-400">Motorbike parking space inside premises.</p>
            </div>

            <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-center">
              <Slash className="w-7 h-7 text-rose-400 mx-auto" />
              <h4 className="font-extrabold text-sm text-white">No Pets Allowed</h4>
              <p className="text-xs text-slate-400">Strict no-pets policy inside building.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE US / FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest">
            Property Highlights
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Why Tenants Choose Staypoint Davao
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Designed for convenience, safety, and modern urban comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center font-bold">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">24/7 Security & CCTV</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Complete peace of mind with round-the-clock security monitoring and secure access gates.
            </p>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center font-bold">
              <Wifi className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">High-Speed WiFi</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Fiber optic internet connection ready in every room, perfect for remote working and streaming.
            </p>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">Direct Inquiry Messaging</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Submit questions and receive manager responses directly on the website using tracking codes.
            </p>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">Prime Location</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Situated in Poblacion District, Davao City within walking distance of transit, markets, and malls.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FEATURED ROOMS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest">
              Available Units
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              Featured Room Listings
            </h2>
          </div>
          <Link to="/rooms">
            <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Rooms Catalog
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>

      {/* 5. MAP & LOCATION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest">
            Map & Directions
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">Apartment Location</h2>
        </div>
        <ApartmentMap info={siteInfo} />
      </section>

      {/* 6. CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-10 sm:p-16 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Schedule a Viewing?
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Submit your inquiry online now. Our property manager will review your preferred date and reply back directly on the portal.
            </p>
          </div>
          <div className="z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Button
              size="lg"
              onClick={() => setIsInquiryModalOpen(true)}
              leftIcon={<MessageSquare className="w-5 h-5" />}
            >
              Submit General Inquiry
            </Button>
          </div>
        </div>
      </section>

      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
      />
    </div>
  );
};
