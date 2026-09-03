import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="w-full max-w-2xl mx-auto text-center py-6">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6">
        <Shield className="w-3.5 h-3.5" />
        Zero-Trust Email-Based Authentication
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
        Secure, Password-Protected & <span className="text-indigo-600">Email-Verified</span> Auth
      </h1>

      <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
        MailAuth delivers an end-to-end authentication lifecycle featuring 6-digit OTP verification,
        bcrypt password hashing, and JWT sessions secured in HTTP-only cookies.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-200 hover:shadow-lg transition-all"
          >
            Go to Dashboard ({user?.name || 'Account'})
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <>
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-200 hover:shadow-lg transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 shadow-sm transition-all"
            >
              Sign In
            </Link>
          </>
        )}
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Mail className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 mb-1">6-Digit OTP Email Verification</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Time-limited OTP verification codes sent directly to user inboxes for secure account validation.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 mb-1">HTTP-Only Cookie Sessions</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            JWT tokens stored securely in HTTP-only cookies, immune to client-side XSS extraction.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Key className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 mb-1">Password Recovery Flow</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Self-service forgot password mechanism with single-use expiring reset OTP verification.
          </p>
        </div>
      </div>
    </div>
  );
}
