import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setServerError(null);
      const response = await api.post('/auth/login', data);
      
      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);
      
      navigate(from, { replace: true });
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-neutral-100">
        <h2 className="text-2xl font-serif font-bold text-center mb-6">Welcome Back</h2>
        
        {serverError && (
          <div className="mb-4 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl font-semibold border border-red-200 shadow-xs">
            <p className="font-bold">⚠️ Login Failed</p>
            <p className="mt-0.5">
              {serverError === 'Invalid credentials' || serverError === 'Failed to login'
                ? 'Incorrect email or password. Please use password: 123456 or click Sign Up below to create a new account.'
                : serverError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};
