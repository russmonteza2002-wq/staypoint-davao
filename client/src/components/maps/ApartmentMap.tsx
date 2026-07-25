import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { ApartmentInfo } from '../../types';

export const ApartmentMap: React.FC<{ info?: ApartmentInfo | null }> = ({ info }) => {
  const lat = info?.latitude || 14.599512;
  const lng = info?.longitude || 120.984222;
  const address = info ? `${info.address}, ${info.city}` : '142 Rizal Avenue, Metro Manila';

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-900 aspect-[16/9] md:aspect-[21/9]">
      {/* Interactive Embedded Google Map Iframe */}
      <iframe
        title="Apartment Location Map"
        width="100%"
        height="100%"
        style={{ border: 0, filter: 'contrast(1.05)' }}
        loading="lazy"
        allowFullScreen
        src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
      />

      {/* Floating Property Pin Overlay Card */}
      <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-sm glass-card-dark p-4 rounded-2xl shadow-2xl text-white space-y-3 border border-slate-700/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-brand-600 rounded-xl text-white shrink-0 mt-0.5 shadow-md">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-white leading-tight">
              {info?.name || 'Grand Horizon Apartments'}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{address}</p>
          </div>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <Navigation className="w-4 h-4" /> Get Directions on Google Maps
        </a>
      </div>
    </div>
  );
};
