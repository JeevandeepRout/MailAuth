import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import { KeyRound, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your email address');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data?.success) {
        setSent(true);
        if (res.data?.data?.devOtp) {
          setDevOtp(res.data.data.devOtp);
        }
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'An error occurred while requesting password reset.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm w-full">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
        <KeyRound className="w-6 h-6" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
        <p className="text-sm text-slate-500 mt-1">
          No worries, we'll send a 6-digit recovery code to your email.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />}

      {sent ? (
        <div className="space-y-5 animate-fadeIn">
          <Alert
            type="success"
            message="If an account exists with that email, a 6-digit password reset code has been sent (or logged to server terminal)."
          />
          <button
            type="button"
            onClick={() =>
              navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`, {
                state: { devOtp },
              })
            }
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 hover:shadow transition-all flex items-center justify-center gap-2"
          >
            <span>Enter Reset Code & Set Password</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending reset code...</span>
              </>
            ) : (
              <>
                <span>Send Reset Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
        Remember your password?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
