import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({ defaultValues: { remember: true } });
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function onSubmit(values: LoginForm) {
    try {
      await login(values.email, values.password, values.remember);
      navigate(from, { replace: true });
    } catch {
      // The auth context displays the toast. Keep the form on screen for correction.
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.22),transparent_28%),linear-gradient(135deg,#f8fafc,#dbeafe)] p-4 dark:bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.22),transparent_28%),linear-gradient(135deg,#020617,#172554)]">
      <motion.form initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(onSubmit)} className="glass-panel w-full max-w-md rounded-2xl p-8">
        <div className="mb-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Lock />
          </div>
          <h1 className="text-3xl font-extrabold">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Secure access for asset exit management.</p>
        </div>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Email</span>
            <span className="relative block">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input className="control w-full pl-10" {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' } })} />
            </span>
            {errors.email && <span className="mt-1 block text-xs text-rose-500">{errors.email.message}</span>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Password</span>
            <span className="relative block">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type={showPassword ? 'text' : 'password'} className="control w-full pl-10 pr-12" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Use at least 6 characters' } })} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            {errors.password && <span className="mt-1 block text-xs text-rose-500">{errors.password.message}</span>}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" {...register('remember')} />
            Remember me
          </label>
          <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign in'}</button>
        </div>
      </motion.form>
    </main>
  );
}
