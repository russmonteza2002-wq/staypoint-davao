import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle, Copy, Calendar, User, Mail, Phone } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { InquiryService } from '../../services/inquiryService';
import { useToast } from '../../context/ToastContext';

// Strict regex requiring valid TLD domain extension (.com, .ph, .net, .org, etc.)
const VALID_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const inquirySchema = z.object({
  userName: z.string().trim().min(2, 'Name is required (at least 2 characters)'),
  userEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address format')
    .refine((email: string) => VALID_EMAIL_REGEX.test(email), {
      message: 'Please enter a valid email address (e.g. name@gmail.com)',
    })
    .refine(
      (email: string) =>
        !['test@test.com', 'admin@admin.com', 'abc@abc.com', 'user@example.com'].includes(email),
      {
        message: 'Please enter a real, active personal or work email address',
      }
    ),
  userPhone: z.string().optional(),
  preferredViewingDate: z.string().optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters long'),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string;
  roomTitle?: string;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  roomId,
  roomTitle,
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    referenceCode: string;
    accessToken: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
  });

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    try {
      const res = await InquiryService.createInquiry({
        ...data,
        roomId,
      });

      setSubmittedData({
        referenceCode: res.data.inquiry.referenceCode,
        accessToken: res.data.accessToken,
      });

      showToast('success', 'Inquiry Submitted!', 'Save your reference code to track manager replies.');
      reset();
    } catch (error: any) {
      showToast('error', 'Submission Failed', error.response?.data?.message || 'Please check email address and input fields');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedData(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={roomTitle ? `Inquire About ${roomTitle}` : 'Submit Property Inquiry'} maxWidth="lg">
      {submittedData ? (
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900">Inquiry Sent Successfully!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your inquiry has been stored directly in our property portal database. Save your reference code below to track direct replies from the owner.
            </p>
          </div>

          {/* Reference Code Box */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Your Unique Reference Code</span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-extrabold tracking-widest text-brand-400">
                {submittedData.referenceCode}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(submittedData.referenceCode);
                  showToast('info', 'Copied to Clipboard!');
                }}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
                title="Copy Reference Code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <a href={`/track-inquiry?code=${submittedData.referenceCode}&token=${submittedData.accessToken}`}>
              <Button variant="primary" className="w-full">
                View Inquiry Thread & Status
              </Button>
            </a>
            <Button variant="outline" onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            leftIcon={<User className="w-4 h-4 text-slate-500" />}
            {...register('userName')}
            error={errors.userName?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. name@gmail.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-500" />}
              {...register('userEmail')}
              error={errors.userEmail?.message}
            />

            <Input
              label="Phone Number (Optional)"
              placeholder="+63 917 000 0000"
              leftIcon={<Phone className="w-4 h-4 text-slate-500" />}
              {...register('userPhone')}
              error={errors.userPhone?.message}
            />
          </div>

          <Input
            label="Preferred Viewing Date (Optional)"
            type="date"
            leftIcon={<Calendar className="w-4 h-4 text-slate-500" />}
            {...register('preferredViewingDate')}
            error={errors.preferredViewingDate?.message}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Your Message or Specific Questions
            </label>
            <div className="relative">
              <textarea
                rows={4}
                placeholder="I am interested in viewing this room. What are the move-in requirements?"
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                {...register('message')}
              />
            </div>
            {errors.message && <p className="text-xs text-rose-500">{errors.message.message}</p>}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit Inquiry
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
