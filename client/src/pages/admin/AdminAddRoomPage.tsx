import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Upload, Check, Trash2, ArrowLeft } from 'lucide-react';
import { RoomService } from '../../services/roomService';
import { Amenity } from '../../types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

const roomFormSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  pricePerMonth: z.coerce.number().positive('Price must be greater than 0'),
  depositAmount: z.coerce.number().min(0, 'Deposit cannot be negative'),
  sizeSqm: z.coerce.number().positive('Size must be greater than 0'),
  floor: z.coerce.number().int('Floor must be integer'),
  bedroomCount: z.coerce.number().int().min(1).default(1),
  bathroomCount: z.coerce.number().int().min(1).default(1),
  status: z.enum(['AVAILABLE', 'RESERVED', 'OCCUPIED']).default('AVAILABLE'),
  isFeatured: z.boolean().default(false),
});

type RoomFormData = z.infer<typeof roomFormSchema>;

export const AdminAddRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      bedroomCount: 1,
      bathroomCount: 1,
      floor: 1,
      status: 'AVAILABLE',
      isFeatured: false,
    },
  });

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const res = await RoomService.getAmenities();
        setAmenities(res.data);
      } catch (error) {}
    };
    fetchAmenities();
  }, []);

  const toggleAmenity = (id: string) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const onSubmit = async (data: RoomFormData) => {
    setIsSubmitting(true);
    try {
      const roomRes = await RoomService.createRoom({
        ...data,
        amenityIds: selectedAmenityIds,
      });

      const newRoomId = roomRes.data.id;

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append('images', file);
        });
        await RoomService.uploadImages(newRoomId, formData);
      }

      showToast('success', 'Room Created!', 'New room unit listing and photos added successfully');
      navigate('/admin/rooms');
    } catch (error: any) {
      showToast('error', 'Creation Failed', error.response?.data?.message || 'Check input fields');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Add New Room Unit</h1>
          <p className="text-sm text-slate-400">Fill in room specs, select amenities, and upload WebP photo gallery</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Metadata */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-xl font-bold text-white">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Room Number"
              placeholder="e.g. 101"
              {...register('roomNumber')}
              error={errors.roomNumber?.message}
            />
            <Input
              label="Listing Title"
              placeholder="Deluxe Studio Unit 101"
              {...register('title')}
              error={errors.title?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Monthly Rent (₱)"
              type="number"
              placeholder="12500"
              {...register('pricePerMonth')}
              error={errors.pricePerMonth?.message}
            />
            <Input
              label="Deposit Required (₱)"
              type="number"
              placeholder="12500"
              {...register('depositAmount')}
              error={errors.depositAmount?.message}
            />
            <Input
              label="Size (Sqm)"
              type="number"
              placeholder="28"
              {...register('sizeSqm')}
              error={errors.sizeSqm?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Floor Level"
              type="number"
              {...register('floor')}
              error={errors.floor?.message}
            />
            <Input
              label="Bedroom Count"
              type="number"
              {...register('bedroomCount')}
              error={errors.bedroomCount?.message}
            />
            <Input
              label="Bathroom Count"
              type="number"
              {...register('bathroomCount')}
              error={errors.bathroomCount?.message}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Detailed Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe room layout, lighting, kitchen counter, balcony..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
              {...register('description')}
            />
            {errors.description && <p className="text-xs text-rose-400">{errors.description.message}</p>}
          </div>
        </div>

        {/* Amenities Checklist */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-xl font-bold text-white">Select Included Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {amenities.map((a) => {
              const isChecked = selectedAmenityIds.includes(a.id);
              return (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => toggleAmenity(a.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm font-semibold transition-all ${
                    isChecked
                      ? 'bg-brand-600/20 border-brand-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{a.name}</span>
                  {isChecked && <Check className="w-4 h-4 text-brand-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* File Photo Upload Box */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-xl font-bold text-white">Upload Room Photos</h3>
          <div className="border-2 border-dashed border-slate-800 hover:border-brand-500/50 rounded-2xl p-8 text-center bg-slate-950 transition-colors cursor-pointer relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-10 h-10 text-brand-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">Click or drag & drop room photos here</p>
            <p className="text-xs text-slate-500 mt-1">Files automatically converted to Sharp WebP format</p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Selected Photos ({selectedFiles.length})</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 truncate">
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          Create Room Listing & Upload Photos
        </Button>
      </form>
    </div>
  );
};
