import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import OtpInput from '../components/OtpInput';
import Alert from '../components/Alert';
import { Mail, Loader2, ArrowRight, RotateCw, Sparkles, Terminal } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(queryEmail);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState(location.state?.devOtp || '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(location.state?.message || '');

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e?.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your email address');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter the full 6-digit verification code');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/verify-email', {
        email: email.trim(),
        otp: otp.trim(),
      });

      if (res.data?.success) {
        navigate('/login', {
          state: {
            message: 'Email verified successfully! You can now log in.',
            email: email.trim(),
          },
        });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Invalid or expired verification code. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError('');
    setInfo('');

    if (!email.trim()) {
      setError('Please provide your email address to resend code');
      return;
    }

    setResending(true);

    try {
      const res = await api.post('/auth/resend-otp', { email: email.trim() });
      if (res.data?.success) {
        setInfo(res.data.message || 'A fresh verification code has been sent to your email.');
        if (res.data?.data?.devOtp) {
          setDevOtp(res.data.data.devOtp);
        }
        setOtp('');
        setCooldown(60); // 60 seconds cooldown
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to resend code. Please try again later.';
      setError(message);
    } finally {
      setResending(false);
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
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
        <Mail className="w-6 h-6" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
        <p className="text-sm text-slate-500 mt-1">
          Enter the 6-digit code sent to{' '}
          <span className="font-semibold text-slate-800">{email || 'your email'}</span>
        </p>
      </div>

      {/* Dev Mode Helper Banner */}
      {/*{devOtp && (
        <div className="mb-5 p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div>
              <span className="font-semibold">Dev OTP:</span>{' '}
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
        </div>)*/
      }

      {info && <Alert type="info" message={info} onClose={() => setInfo('')} className="mb-5" />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />}

      <form onSubmit={handleVerify} className="space-y-5">
        {!queryEmail && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5 text-center">
            Verification Code (6 Digits)
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

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying code...</span>
            </>
          ) : (
            <>
              <span>Verify & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Resend Code Section & Terminal Notice */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-2.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 text-slate-500 text-center">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>OTP is also printed in your server terminal log.</span>
        </div>

        <button
          type="button"
          disabled={cooldown > 0 || resending}
          onClick={handleResend}
          className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-slate-400 transition-colors mt-1"
        >
          <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend verification code'}
        </button>
      </div>

      <div className="mt-4 text-center text-xs text-slate-500">
        <Link to="/login" className="font-semibold text-slate-600 hover:text-slate-800">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
