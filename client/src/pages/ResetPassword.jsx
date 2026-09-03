import React, { useState } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import OtpInput from '../components/OtpInput';
import Alert from '../components/Alert';
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, Check, Sparkles, Terminal } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(queryEmail);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState(location.state?.devOtp || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter the full 6-digit reset code.');
      return;
    }

    if (!isPasswordValid) {
      setError('New password does not meet the security requirements below.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

      if (res.data?.success) {
        navigate('/login', {
          state: {
            message: 'Password reset successfully! You can now log in with your new password.',
            email: email.trim(),
          },
        });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Invalid or expired reset code. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillDevOtp = () => {
    if (devOtp) {
      setOtp(devOtp);
      setError('');
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
        <p className="text-sm text-slate-500 mt-1">
          Enter the 6-digit recovery code and choose a new password
        </p>
      </div>

      {/* Dev Mode Helper Banner */}
      {devOtp && (
        <div className="mb-5 p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div>
              <span className="font-semibold">Dev Reset Code:</span>{' '}
              <code className="font-mono text-sm font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-700">
                {devOtp}
              </code>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutofillDevOtp}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors text-xs"
          >
            Auto-fill
          </button>
        </div>
      )}

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />}

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
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all disabled:opacity-60"
            />
          </div>
        </div>

        {/* 6-digit OTP */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 text-center">
            Reset Code (6 Digits)
          </label>
          <OtpInput
            length={6}
            value={otp}
            disabled={loading}
            onChange={(val) => {
              setOtp(val);
              if (error) setError('');
            }}
          />
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              disabled={loading}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              disabled={loading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all disabled:opacity-60"
            />
          </div>
        </div>

        {/* Password Requirements Checklist */}
        {newPassword && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
            <div className="font-medium text-slate-600 mb-1">Password requirements:</div>
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
            {confirmPassword && (
              <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 font-medium' : 'text-rose-500'}`}>
                <Check className={`w-3.5 h-3.5 ${passwordsMatch ? 'opacity-100' : 'opacity-30'}`} />
                <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating password...</span>
            </>
          ) : (
            <>
              <span>Reset Password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Terminal Notice */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <Terminal className="w-3.5 h-3.5 text-slate-400" />
        <span>Reset code is also logged to your server terminal.</span>
      </div>

      <div className="mt-3 text-center text-xs text-slate-500">
        <Link to="/login" className="font-semibold text-slate-600 hover:text-slate-800">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
