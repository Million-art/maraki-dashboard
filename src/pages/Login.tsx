import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import { useAppDispatch } from '../store';
import { login } from '../store/slices/authSlice';
import { passwordSchema } from '../lib/validations';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      // Clear any previous errors
      clearErrors('root');
      
      await dispatch(login(data)).unwrap();
      
      // Navigate to dashboard
      navigate('/');
    } catch (error: any) {
      
      // Handle different types of errors
      let errorMessage = 'Login failed. Please try again.';
      
      if (error?.response?.data) {
        // Backend error response
        const backendError = error.response.data;
        
        // Handle specific error cases
        if (backendError.statusCode === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (backendError.statusCode === 400) {
          // Handle validation errors
          if (backendError.details && Array.isArray(backendError.details)) {
            // Show first validation error
            errorMessage = backendError.details[0] || backendError.message;
          } else {
            errorMessage = backendError.message || 'Please check your input and try again.';
          }
        } else if (backendError.statusCode === 429) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (backendError.statusCode >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = backendError.message || errorMessage;
        }
      } else if (error?.message) {
        // Network or other errors
        if (error.message.includes('Network Error') || error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  {...register('email', {
                    onChange: () => clearErrors('root')
                  })}
                  error={errors.email?.message}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  {...register('password', {
                    onChange: () => clearErrors('root')
                  })}
                  error={errors.password?.message}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  {...register('rememberMe')}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.root && errors.root.message && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {errors.root.message}
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {errors.root.message.includes('Invalid email or password') ? (
                      <p>Double-check your email and password, then try again.</p>
                    ) : errors.root.message.includes('validation') || errors.root.message.includes('required') ? (
                      <p>Please fill in all required fields correctly.</p>
                    ) : errors.root.message.includes('Server error') ? (
                      <p>We're experiencing technical difficulties. Please try again later.</p>
                    ) : (
                      <p>Please check your input and try again.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default Login;
