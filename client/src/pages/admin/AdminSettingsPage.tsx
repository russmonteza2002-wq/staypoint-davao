import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Phone, Mail, Facebook } from 'lucide-react';
import { SiteService } from '../../services/siteService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

const siteSettingsSchema = z.object({
  name: z.string().min(2, 'Apartment name is required'),
  tagline: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  phoneNumber: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  facebookUrl: z.string().optional(),
});

type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
  });

  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const res = await SiteService.getSiteInfo();
        const info = res.data;
        if (info) {
          setValue('name', info.name);
          setValue('tagline', info.tagline || '');
          setValue('description', info.description);
          setValue('address', info.address);
          setValue('city', info.city);
          setValue('latitude', info.latitude);
          setValue('longitude', info.longitude);
          setValue('phoneNumber', info.phoneNumber);
          setValue('email', info.email);
          setValue('facebookUrl', info.facebookUrl || '');
        }
      } catch (error) {}
    };
    fetchSiteInfo();
  }, [setValue]);

  const onSubmit = async (data: SiteSettingsFormData) => {
    setIsSubmitting(true);
    try {
      await SiteService.updateSiteInfo(data);
      showToast('success', 'Settings Saved', 'Apartment profile and Google Map details updated');
    } catch (error: any) {
      showToast('error', 'Update Failed', error.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white">Apartment Site Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage brand profile, Google Maps coordinates, phone & Facebook links</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Brand & Address Profile */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-xl font-bold text-white">Property Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Apartment Brand Name"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Tagline / Motto"
              {...register('tagline')}
              error={errors.tagline?.message}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              About Description
            </label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 font-semibold placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
              {...register('description')}
            />
            {errors.description && <p className="text-xs text-rose-400">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Street Address"
              {...register('address')}
              error={errors.address?.message}
            />
            <Input
              label="City / Region"
              {...register('city')}
              error={errors.city?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Google Maps Latitude"
              type="number"
              step="any"
              {...register('latitude')}
              error={errors.latitude?.message}
            />
            <Input
              label="Google Maps Longitude"
              type="number"
              step="any"
              {...register('longitude')}
              error={errors.longitude?.message}
            />
          </div>
        </div>

        {/* Contact Channels */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-xl font-bold text-white">Contact & Social Channels</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Contact Phone Number"
              leftIcon={<Phone className="w-4 h-4 text-slate-500" />}
              {...register('phoneNumber')}
              error={errors.phoneNumber?.message}
            />
            <Input
              label="Official Email"
              leftIcon={<Mail className="w-4 h-4 text-slate-500" />}
              {...register('email')}
              error={errors.email?.message}
            />
          </div>

          <Input
            label="Facebook Page URL (Optional)"
            leftIcon={<Facebook className="w-4 h-4 text-slate-500" />}
            {...register('facebookUrl')}
            error={errors.facebookUrl?.message}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting} leftIcon={<Save className="w-5 h-5" />}>
          Save Property Settings
        </Button>
      </form>
    </div>
  );
};
