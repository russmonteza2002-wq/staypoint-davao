import React from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { Camera, Maximize } from 'lucide-react';
import { RoomImage } from '../../types';

export const RoomGallery: React.FC<{ images: RoomImage[]; title: string }> = ({
  images,
  title,
}) => {
  const fallbackImage =
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';

  const galleryList =
    images && images.length > 0
      ? images
      : [
          {
            id: 'fallback',
            roomId: '',
            imageUrl: fallbackImage,
            thumbnailUrl: fallbackImage,
            isPrimary: true,
            sortOrder: 0,
          },
        ];

  const primaryPhoto = galleryList[0];
  const secondaryPhotos = galleryList.slice(1, 5);

  return (
    <PhotoProvider>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-900 p-2">
        {/* Main Hero Photo */}
        <div className="md:col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto overflow-hidden rounded-2xl group cursor-pointer">
          <PhotoView src={primaryPhoto.imageUrl}>
            <img
              src={primaryPhoto.imageUrl}
              alt={primaryPhoto.caption || title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </PhotoView>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 pointer-events-none">
            <span className="text-white text-xs font-semibold flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg">
              <Maximize className="w-4 h-4 text-brand-400" /> Click to enlarge full gallery
            </span>
          </div>
        </div>

        {/* Grid Photos */}
        {secondaryPhotos.map((photo, idx) => (
          <div
            key={photo.id || idx}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl group cursor-pointer"
          >
            <PhotoView src={photo.imageUrl}>
              <img
                src={photo.imageUrl}
                alt={photo.caption || `${title} photo ${idx + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </PhotoView>
          </div>
        ))}

        {/* If fewer secondary photos, pad remaining gallery slots */}
        {galleryList.length < 5 &&
          Array.from({ length: 5 - galleryList.length }).map((_, i) => (
            <div
              key={`pad-${i}`}
              className="hidden md:flex items-center justify-center bg-slate-800 rounded-2xl text-slate-500 text-xs font-medium border border-slate-700/50"
            >
              <Camera className="w-5 h-5 opacity-40" />
            </div>
          ))}
      </div>
    </PhotoProvider>
  );
};
