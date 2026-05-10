'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'MEMBER']),
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'MEMBER' },
  });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      const res = await api.signup(data);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Signup failed. Please try again.';
      setApiError(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="w-full max-w-md relative"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4f7bef] to-[#a855f7] items-center justify-center text-white font-bold text-xl mb-4">
            N
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Create your account</h1>
          <p className="text-sm text-[#8892a4] mt-1">Join your team on NexusHQ</p>
        </div>

        <div className="bg-[#161b27] border border-[#2a3350] rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {apiError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {apiError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#8892a4] mb-1.5">Full name</label>
              <input
                {...register('name')}
                placeholder="Alex Liu"
                className="w-full bg-[#1e2435] border border-[#2a3350] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-[#5a6480] outline-none focus:border-[#4f7bef] focus:ring-2 focus:ring-[#4f7bef]/10 transition-all"
              />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8892a4] mb-1.5">Email address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@company.com"
                className="w-full bg-[#1e2435] border border-[#2a3350] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-[#5a6480] outline-none focus:border-[#4f7bef] focus:ring-2 focus:ring-[#4f7bef]/10 transition-all"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8892a4] mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className="w-full bg-[#1e2435] border border-[#2a3350] rounded-lg px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-[#5a6480] outline-none focus:border-[#4f7bef] focus:ring-2 focus:ring-[#4f7bef]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a6480] hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8892a4] mb-1.5">Role</label>
              <select
                {...register('role')}
                className="w-full bg-[#1e2435] border border-[#2a3350] rounded-lg px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#4f7bef] focus:ring-2 focus:ring-[#4f7bef]/10 transition-all appearance-none cursor-pointer"
              >
                <option value="MEMBER">Member — View & update assigned tasks</option>
                <option value="PROJECT_MANAGER">Project Manager — Create & assign tasks</option>
                <option value="ADMIN">Admin — Full access</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#4f7bef] hover:bg-[#3d6be0] text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#5a6480] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4f7bef] hover:text-[#6b9bff] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
