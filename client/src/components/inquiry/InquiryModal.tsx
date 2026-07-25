import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Send,
  CheckCircle,
  Copy,
  Calendar,
  User,
  Mail,
  Phone,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { InquiryService } from '../../services/inquiryService';
import { useToast } from '../../context/ToastContext';

// ---------------------------------------------------------------------------
// Validation constants
// ---------------------------------------------------------------------------

/** Requires a valid TLD domain extension (.com, .ph, .net, .org, etc.) */
const VALID_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** Disposable / temporary email domains that are not allowed */
const DISPOSABLE_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'trashmail.com',
  'dispostable.com',
  'getairmail.com',
  'throwawaymail.com',
  'maildrop.cc',
  'example.com',
  'test.com',
];

/** Obvious keyboard-mash / fake usernames to reject */
const SUSPICIOUS_PATTERNS = [
  /^asdf/i,
  /^qwerty/i,
  /^zxcv/i,
  /^12345/i,
  /^test/i,
  /^fake/i,
  /^none/i,
];

/** Valid Philippine mobile number (+63 9XXXXXXXXX or 09XXXXXXXXX) */
const PH_PHONE_REGEX = /^(?:\+63|0)9\d{9}$/;

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const inquirySchema = z.object({
  userName: z.string().trim().min(2, 'Name is required (at least 2 characters)'),

  userEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address format')
    .refine((email) => VALID_EMAIL_REGEX.test(email), {
      message: 'Please enter a valid email with a domain extension (e.g. name@gmail.com)',
    })
    .refine(
      (email) => {
        const domain = email.split('@')[1];
        return domain ? !DISPOSABLE_DOMAINS.includes(domain) : true;
      },
      { message: 'Disposable or temporary email addresses are not allowed.' }
    )
    .refine(
      (email) => {
        const username = email.split('@')[0] ?? '';
        return !SUSPICIOUS_PATTERNS.some((p) => p.test(username));
      },
      { message: 'Please provide a legitimate personal or work email address.' }
    ),

  userPhone: z
    .string()
    .trim()
    .min(1, 'Phone number is required so the manager can contact you')
    .refine((phone) => PH_PHONE_REGEX.test(phone.replace(/\s+/g, '')), {
      message: 'Please enter a valid PH mobile number (e.g. 09171234567 or +639171234567)',
    }),

  preferredViewingDate: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(val) >= today;
      },
      { message: 'Preferred viewing date cannot be in the past.' }
    ),

  message: z.string().trim().min(10, 'Message must be at least 10 characters long'),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

// ---------------------------------------------------------------------------
// Component types
// ---------------------------------------------------------------------------

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string;
  roomTitle?: string;
}

type PendingData = {
  referenceCode: string;
  userEmail: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RESEND_COOLDOWN_SECONDS = 40;

function startCooldownInterval(
  setter: React.Dispatch<React.SetStateAction<number>>,
  ref: React.MutableRefObject<ReturnType<typeof setInterval> | null>
) {
  if (ref.current) clearInterval(ref.current);
  setter(RESEND_COOLDOWN_SECONDS);
  ref.current = setInterval(() => {
    setter((prev) => {
      if (prev <= 1) {
        clearInterval(ref.current!);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
}

// ---------------------------------------------------------------------------
// InquiryModal
// ---------------------------------------------------------------------------

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  roomId,
  roomTitle,
}) => {
  const { showToast } = useToast();

  // Step state
  const [step, setStep] = useState<'FORM' | 'VERIFY' | 'SUCCESS'>('FORM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pending inquiry data (set after server creates the inquiry)
  const [pendingData, setPendingData] = useState<PendingData | null>(null);

  // OTP input
  const [enteredOtp, setEnteredOtp] = useState('');

  // Resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Minimum allowed date for the viewing date picker
  const todayMinDate = new Date().toISOString().split('T')[0];

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormData>({ resolver: zodResolver(inquirySchema) });

  // Start 40s countdown whenever the VERIFY step becomes active
  useEffect(() => {
    if (step === 'VERIFY') {
      startCooldownInterval(setResendCooldown, cooldownRef);
    }
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [step]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /** Submit the inquiry form — sends OTP email on success */
  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    try {
      const res = await InquiryService.createInquiry({ ...data, roomId });
      setPendingData({
        referenceCode: res.data.referenceCode,
        userEmail: res.data.userEmail,
      });
      setStep('VERIFY');
      showToast(
        'success',
        '📬 Verification Email Sent!',
        `A 6-digit code has been sent to ${res.data.userEmail}. Please check your inbox.`
      );
    } catch (error: any) {
      showToast(
        'error',
        'Submission Failed',
        error.response?.data?.message || 'Please check your email address and input fields.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Verify the OTP code entered by the user */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingData || !enteredOtp.trim()) return;
    setIsSubmitting(true);
    try {
      await InquiryService.verifyInquiryCode(pendingData.referenceCode, enteredOtp.trim());
      setStep('SUCCESS');
      showToast('success', '✅ Email Verified!', 'Your inquiry is active and sent to the property manager.');
      reset();
    } catch (error: any) {
      showToast('error', 'Verification Failed', error.response?.data?.message || 'Invalid 6-digit code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Resend a fresh OTP code (subject to 40s cooldown) */
  const handleResendCode = async () => {
    if (!pendingData || resendCooldown > 0) return;
    setIsResending(true);
    try {
      await InquiryService.resendVerificationCode(pendingData.referenceCode);
      showToast('success', '📬 New Code Sent!', `A fresh 6-digit code was sent to ${pendingData.userEmail}.`);
      startCooldownInterval(setResendCooldown, cooldownRef);
    } catch (error: any) {
      showToast('error', 'Resend Failed', error.response?.data?.message || 'Could not resend code.');
    } finally {
      setIsResending(false);
    }
  };

  /** Reset all state and close the modal */
  const handleClose = () => {
    setStep('FORM');
    setPendingData(null);
    setEnteredOtp('');
    onClose();
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={roomTitle ? `Inquire About ${roomTitle}` : 'Submit Property Inquiry'}
      maxWidth="lg"
    >
      {/* ── SUCCESS ─────────────────────────────────────────────────────── */}
      {step === 'SUCCESS' && pendingData ? (
        <div className="space-y-5 text-center py-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900">Email Verified &amp; Inquiry Sent!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your inquiry has been submitted and is now active. The property manager will reply shortly.
            </p>
          </div>

          {/* Reference code display */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Your Reference Code
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-extrabold tracking-widest text-brand-400">
                {pendingData.referenceCode}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pendingData.referenceCode);
                  showToast('info', 'Copied to Clipboard!');
                }}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
                title="Copy Reference Code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Save reminder notice */}
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-left space-y-2">
            <p className="text-sm font-extrabold text-amber-800">
              📌 Important — Please Save Your Reference Code!
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              You will need this code <strong>to view replies from the manager</strong> and to
              send follow-up messages.
              <br /><br />
              📸 <strong>Take a screenshot</strong> of this screen, or{' '}
              <strong>write it down</strong> somewhere safe.
              <br /><br />
              You can also track your inquiry anytime at:
              <br />
              <strong>staypoint-davao.vercel.app/track-inquiry</strong>
            </p>
          </div>

          <div className="pt-1 flex flex-col gap-2">
            <a href={`/track-inquiry?code=${pendingData.referenceCode}`}>
              <Button variant="primary" className="w-full">
                View My Inquiry Thread
              </Button>
            </a>
            <Button variant="outline" onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        </div>

      /* ── VERIFY ─────────────────────────────────────────────────────── */
      ) : step === 'VERIFY' && pendingData ? (
        <form onSubmit={handleVerifyOtp} className="space-y-6 text-center py-2">
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900">Check Your Email Inbox</h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              We sent a <strong>6-digit verification code</strong> to:
              <br />
              <span className="font-bold text-brand-600">{pendingData.userEmail}</span>
            </p>
          </div>

          {/* Inbox instruction */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-1">
            <p className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">
              📬 Check Your Email Inbox
            </p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Open your Gmail or email app. Look for an email from{' '}
              <strong>Staypoint Davao</strong> with the subject{' '}
              <strong>&quot;Your Inquiry Verification Code&quot;</strong>, then enter the
              6-digit code below.
            </p>
          </div>

          {/* OTP input */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider text-center">
              Enter Your 6-Digit Code
            </label>
            <div className="relative flex items-center justify-center">
              <KeyRound className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="_ _ _ _ _ _"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-2xl border-2 border-brand-300 bg-white py-4 pl-12 pr-4 text-center text-2xl font-extrabold tracking-[0.5em] text-slate-900 placeholder:text-slate-300 shadow-md focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 transition-all"
                autoFocus
                autoComplete="one-time-code"
              />
            </div>
            {enteredOtp.length > 0 && enteredOtp.length < 6 && (
              <p className="text-xs text-center text-amber-600 font-semibold">
                {6 - enteredOtp.length} more digit{6 - enteredOtp.length !== 1 ? 's' : ''} needed
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Verify Code &amp; Activate Inquiry
            </Button>

            {/* Resend button with 40-second cooldown */}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || isResending}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${
                resendCooldown > 0 || isResending
                  ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-100 cursor-pointer'
              }`}
            >
              {isResending
                ? '⏳ Sending new code...'
                : resendCooldown > 0
                ? `🕐 Resend Code in ${resendCooldown}s`
                : '🔁 Resend Verification Code'}
            </button>

            <button
              type="button"
              onClick={() => setStep('FORM')}
              className="w-full text-xs font-bold text-slate-400 hover:text-slate-700 py-1"
            >
              ← Edit Email Address
            </button>
          </div>
        </form>

      /* ── FORM ───────────────────────────────────────────────────────── */
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
              label="Active Mobile Phone Number"
              placeholder="09171234567 or +639171234567"
              leftIcon={<Phone className="w-4 h-4 text-slate-500" />}
              {...register('userPhone')}
              error={errors.userPhone?.message}
            />
          </div>

          <Input
            label="Preferred Viewing Date (Optional)"
            type="date"
            min={todayMinDate}
            leftIcon={<Calendar className="w-4 h-4 text-slate-500" />}
            {...register('preferredViewingDate')}
            error={errors.preferredViewingDate?.message}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Your Message or Specific Questions
            </label>
            <textarea
              rows={4}
              placeholder="I am interested in viewing this room. What are the move-in requirements?"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              {...register('message')}
            />
            {errors.message && (
              <p className="text-xs text-rose-500">{errors.message.message}</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit &amp; Verify Email
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
