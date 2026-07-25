import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize2, Layers } from 'lucide-react';
import { Room } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export const RoomCard: React.FC<{ room: Room }> = ({ room }) => {
  const primaryImage =
    room.images?.find((img) => img.isPrimary)?.imageUrl ||
    room.images?.[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

  return (
    <Card className="group flex flex-col h-full hover:-translate-y-1">
      {/* Thumbnail Header */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={room.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <Badge status={room.status} />
        </div>
        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white font-extrabold text-lg px-3 py-1.5 rounded-xl shadow-lg">
          ₱{Number(room.pricePerMonth).toLocaleString()}{' '}
          <span className="text-xs font-normal text-slate-300">/ mo</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <span>Unit #{room.roomNumber}</span>
            <span>•</span>
            <span>Floor {room.floor}</span>
          </div>
          <h3 className="font-extrabold text-lg text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {room.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            {room.description}
          </p>
        </div>

        {/* Feature Specs */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-slate-600 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-brand-500 shrink-0" />
            <span>{room.sizeSqm} m²</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-brand-500 shrink-0" />
            <span>{room.bedroomCount} Bed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-brand-500 shrink-0" />
            <span>{room.bathroomCount} Bath</span>
          </div>
        </div>

        {/* Action */}
        <Link to={`/rooms/${room.slug}`} className="w-full">
          <button className="w-full py-2.5 px-4 bg-slate-100 hover:bg-brand-600 hover:text-white text-slate-700 font-bold text-sm rounded-xl transition-all duration-200">
            View Details & Reserve
          </button>
        </Link>
      </div>
    </Card>
  );
};
