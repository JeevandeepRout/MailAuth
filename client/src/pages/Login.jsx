import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
    if (unverifiedEmail) setUnverifiedEmail('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail('');
    setSuccessMessage('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);

    try {
      await login(formData.email.trim(), formData.password);
      // Navigate to destination or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.isVerified === false) {
        setUnverifiedEmail(err.response.data.email || formData.email.trim());
      } else {
        const message =
          err.response?.data?.message || 'Invalid email or password. Please try again.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to your MailAuth account</p>
      </div>

      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage('')}
          className="mb-5"
        />
      )}

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />}

      {/* Unverified Account Warning with Direct Action */}
      {unverifiedEmail && (
        <div className="mb-5 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm">
          <div className="flex items-start gap-2.5 font-semibold mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>Email Not Verified</span>
          </div>
          <p className="text-xs text-amber-800 mb-3">
            Your email is registered but has not been verified yet. Please enter your verification code to continue.
          </p>
          <Link
            to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <span>Verify Email Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
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

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Create account
        </Link>
      </div>
    </div>
  );
}
