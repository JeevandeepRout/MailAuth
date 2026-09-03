import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Check } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  // Password validation rules
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet the security requirements below.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (res.data?.success) {
        // Redirect to email verification page with prefilled email
        navigate(`/verify-email?email=${encodeURIComponent(formData.email.trim())}`, {
          state: {
            message: res.data.message || 'Account created! Please check your email for the verification code.',
            devOtp: res.data?.data?.devOtp,
          },
        });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'An error occurred during registration. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1">Get started with a free MailAuth account</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="name"
              required
              disabled={loading}
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all disabled:opacity-60"
            />
          </div>
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              name="email"
              required
              disabled={loading}
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all disabled:opacity-60"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              disabled={loading}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all disabled:opacity-60"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Password Requirements Checklist */}
        {formData.password && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
            <div className="font-medium text-slate-600 mb-1">Password must include:</div>
            <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
              <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'opacity-100' : 'opacity-30'}`} />
              <span>At least 8 characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
              <Check className={`w-3.5 h-3.5 ${hasUppercase ? 'opacity-100' : 'opacity-30'}`} />
              <span>At least one uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
              <Check className={`w-3.5 h-3.5 ${hasLowercase ? 'opacity-100' : 'opacity-30'}`} />
              <span>At least one lowercase letter (a-z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
              <Check className={`w-3.5 h-3.5 ${hasNumber ? 'opacity-100' : 'opacity-30'}`} />
              <span>At least one number (0-9)</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Sign Up</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Sign In
        </Link>
      </div>
    </div>
  );
}
