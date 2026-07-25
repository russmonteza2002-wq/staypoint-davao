import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Lock, Mail, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@apartment.com',
      password: 'AdminPass123!',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      showToast('success', 'Welcome Back!', 'Logged into property admin dashboard');
      navigate('/admin/dashboard');
    } catch (error: any) {
      showToast('error', 'Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full glass-card-dark p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Public Website
          </Link>
          <span className="text-[10px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            Admin Only
          </span>
        </div>

        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-brand-600/30">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Property Admin Portal</h2>
          <p className="text-xs text-slate-400">Restricted login for authorized property managers</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
          <Input
            label="Admin Email"
            type="email"
            placeholder="admin@apartment.com"
            leftIcon={<Mail className="w-4 h-4 text-slate-500" />}
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4 text-slate-500" />}
            {...register('password')}
            error={errors.password?.message}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Log In to Dashboard
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-800">
          <p>Protected by JWT authentication and rate limiting.</p>
        </div>
      </div>
    </div>
  );
};
