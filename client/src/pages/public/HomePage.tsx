import React, { useEffect, useState, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Wifi,
  Sparkles,
  ArrowRight,
  MessageSquare,
  MapPin,
  ChevronLeft,
  ChevronRight,
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
  const sliderRef = useRef<HTMLDivElement>(null);

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

  const handleScrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-10 sm:space-y-24 pb-10 sm:pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[55vh] sm:min-h-[85vh] flex items-center justify-center pt-6 pb-12 sm:pt-12 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950 text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center filter brightness-75 scale-105 animate-pulse duration-[10000ms]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-0" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-4 sm:space-y-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass-card-dark text-brand-300 text-[11px] sm:text-xs font-bold uppercase tracking-widest border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-400" /> Premium Room Rental & Apartment Living
          </div>

          <h1 className="text-3xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-white drop-shadow-md">
            Find Your Ideal Space at <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-400">
              {siteInfo?.name || 'Staypoint Davao'}
            </span>
          </h1>

          <p className="text-sm sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {siteInfo?.tagline ||
              'Fully-furnished apartment rooms in Davao City featuring free water supply, individual electric sub-meters, high-speed WiFi, and 24/7 CCTV security.'}
          </p>

          {/* Quick Search Glass Box */}
          <div className="max-w-4xl mx-auto glass-card-dark p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-700/60 shadow-2xl flex flex-col md:flex-row gap-2.5 sm:gap-3 items-center">
            <div className="flex-1 w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <Building2 className="w-4 h-4 text-brand-400 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-slate-200">Browsing Available Room Units</span>
            </div>
            <Link to="/rooms" className="w-full md:w-auto">
              <Button size="lg" className="w-full md:w-auto py-2.5 text-sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Available Rooms
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* 2. WHY CHOOSE US / FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-6 sm:mb-12">
          <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest">
            Property Highlights
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            Why Tenants Choose Staypoint Davao
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2 text-center sm:text-left">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center font-bold mx-auto sm:mx-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-lg text-slate-900">24/7 Security &amp; CCTV</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed hidden sm:block">
              Round-the-clock monitoring and secure entry.
            </p>
          </div>

          <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2 text-center sm:text-left">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center font-bold mx-auto sm:mx-0">
              <Wifi className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-lg text-slate-900">High-Speed WiFi</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed hidden sm:block">
              Fiber internet connection ready in every room.
            </p>
          </div>

          <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2 text-center sm:text-left">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold mx-auto sm:mx-0">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-lg text-slate-900">Direct Inquiries</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed hidden sm:block">
              Direct tracking and message thread with owner.
            </p>
          </div>

          <div className="p-4 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2 text-center sm:text-left">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold mx-auto sm:mx-0">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="font-extrabold text-sm sm:text-lg text-slate-900">Prime Location</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed hidden sm:block">
              Poblacion District, Davao near transit &amp; malls.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED ROOMS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between gap-3 mb-2 sm:mb-6">
          <div>
            <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest">
              Available Units
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-0.5">
              Featured Room Listings
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Slider Navigation Arrows */}
            <div className="flex items-center gap-1.5 mr-2">
              <button
                onClick={handleScrollLeft}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-sm active:scale-95 transition-all"
                title="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleScrollRight}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-sm active:scale-95 transition-all"
                title="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <Link to="/rooms" className="hidden sm:inline-block">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Catalog
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-hidden py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shrink-0 w-[82vw] sm:w-[350px] h-64 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div
            ref={sliderRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 sm:gap-6 py-2 px-1 scroll-smooth"
          >
            {featuredRooms.map((room) => (
              <div key={room.id} className="snap-start shrink-0 w-[82vw] sm:w-[350px] lg:w-[380px] flex flex-col">
                <RoomCard room={room} />
              </div>
            ))}
          </div>
        )}

        <div className="text-center sm:hidden pt-2">
          <Link to="/rooms">
            <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Rooms Catalog
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. MAP & LOCATION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="text-center space-y-1 sm:space-y-2">
          <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest">
            Map &amp; Directions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Apartment Location</h2>
        </div>
        <ApartmentMap info={siteInfo} />
      </section>

      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
      />
    </div>
  );
};
