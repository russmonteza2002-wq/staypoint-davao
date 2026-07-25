import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, MessageSquare, Clock } from 'lucide-react';
import { ApartmentInfo } from '../../types';
import { ApartmentMap } from '../../components/maps/ApartmentMap';
import { Button } from '../../components/ui/Button';
import { InquiryModal } from '../../components/inquiry/InquiryModal';

export const ContactPage: React.FC = () => {
  const { siteInfo } = useOutletContext<{ siteInfo?: ApartmentInfo | null }>();
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest">
          Get In Touch
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">Contact Property Owner</h1>
        <p className="text-slate-600 text-base max-w-xl mx-auto">
          Inquire online using our website portal, or reach us via phone and Facebook.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900">Phone Contact</h3>
          <p className="text-slate-600 text-sm">{siteInfo?.phoneNumber || '+63 917 555 0199'}</p>
          <a href={`tel:${siteInfo?.phoneNumber}`}>
            <Button variant="outline" size="sm" className="w-full mt-2">
              Call Now
            </Button>
          </a>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center font-bold">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900">Official Email</h3>
          <p className="text-slate-600 text-sm">{siteInfo?.email || 'inquiries@grandhorizon.com'}</p>
          <a href={`mailto:${siteInfo?.email}`}>
            <Button variant="outline" size="sm" className="w-full mt-2">
              Send Email
            </Button>
          </a>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center font-bold">
            <Facebook className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900">Facebook Page</h3>
          <p className="text-slate-600 text-sm">Optional social channel</p>
          {siteInfo?.facebookUrl && (
            <a href={siteInfo.facebookUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="w-full mt-2">
                Visit FB Page
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Online Website Communication Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold">In-App Online Inquiry</h3>
          <p className="text-slate-400 text-sm">
            Submit your viewing request directly into our database to get owner replies inside the website.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setIsInquiryModalOpen(true)}
          leftIcon={<MessageSquare className="w-5 h-5" />}
        >
          Submit Inquiry Form
        </Button>
      </div>

      {/* Map Embed */}
      <div className="space-y-4">
        <h3 className="text-2xl font-extrabold text-slate-900 text-center">Google Maps Location</h3>
        <ApartmentMap info={siteInfo} />
      </div>

      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
      />
    </div>
  );
};
