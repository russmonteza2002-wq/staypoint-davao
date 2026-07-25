import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Bed,
  Bath,
  Maximize2,
  Layers,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ArrowLeft,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import { RoomService } from '../../services/roomService';
import { Room } from '../../types';
import { RoomGallery } from '../../components/rooms/RoomGallery';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { InquiryModal } from '../../components/inquiry/InquiryModal';

export const RoomDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const res = await RoomService.getRoomBySlug(slug);
        setRoom(res.data);
      } catch (error) {
        // Error handling
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-extrabold text-slate-900">Room Unit Not Found</h2>
        <p className="text-slate-600">The requested room listing might have been removed or updated.</p>
        <Link to="/rooms">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Available Rooms
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back Link */}
      <div>
        <Link
          to="/rooms"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Rooms Catalog
        </Link>
      </div>

      {/* Header Title & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-extrabold text-brand-600 uppercase tracking-widest">
              Unit #{room.roomNumber} • Floor {room.floor}
            </span>
            <Badge status={room.status} />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900">{room.title}</h1>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Monthly Rental</span>
            <span className="text-3xl font-extrabold text-brand-400">
              ₱{Number(room.pricePerMonth).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400"> / month</span>
          </div>
        </div>
      </div>

      {/* Room Photo Lightbox Gallery */}
      <RoomGallery images={room.images} title={room.title} />

      {/* Content Split: Details Left / Reservation Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column (70%): Specs, Description & Amenities */}
        <div className="lg:col-span-2 space-y-10">
          {/* Quick Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-center">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Size</span>
              <span className="text-lg font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
                <Maximize2 className="w-5 h-5 text-brand-500" /> {room.sizeSqm} m²
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Floor</span>
              <span className="text-lg font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
                <Layers className="w-5 h-5 text-brand-500" /> Level {room.floor}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Bedrooms</span>
              <span className="text-lg font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
                <Bed className="w-5 h-5 text-brand-500" /> {room.bedroomCount} Bed
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Bathrooms</span>
              <span className="text-lg font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
                <Bath className="w-5 h-5 text-brand-500" /> {room.bathroomCount} Bath
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-slate-900">Room Overview</h3>
            <div className="prose text-slate-600 leading-relaxed space-y-4">
              <p className="whitespace-pre-line">{room.description}</p>
            </div>
          </div>

          {/* Amenities Checklist */}
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-slate-900">Included Amenities & Features</h3>
            {room.amenities && room.amenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities.map((item) => (
                  <div
                    key={item.amenityId}
                    className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-sm font-bold text-slate-800"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{item.amenity.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Standard apartment amenities included.</p>
            )}
          </div>
        </div>

        {/* Right Sticky Reservation Card (30%) */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6">
            <div className="border-b border-slate-100 pb-6 space-y-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">
                Rental Summary
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">
                  ₱{Number(room.pricePerMonth).toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-slate-500">per month</span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                Deposit Required: ₱{Number(room.depositAmount).toLocaleString()}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setIsInquiryModalOpen(true)}
                leftIcon={<MessageSquare className="w-5 h-5" />}
              >
                Inquire & Schedule Viewing
              </Button>
              <p className="text-xs text-center text-slate-500 leading-relaxed">
                Submit an online inquiry to check viewing dates and ask questions directly to the property manager.
              </p>
            </div>
          </div>
        </div>
      </div>

      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        roomId={room.id}
        roomTitle={room.title}
      />
    </div>
  );
};
