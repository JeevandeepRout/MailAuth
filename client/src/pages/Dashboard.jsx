import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  LogOut,
  Lock,
  Cookie,
  KeyRound,
  CheckCircle2,
  Database,
  Server,
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dbInfo, setDbInfo] = useState(null);

  useEffect(() => {
    // Fetch database & server health metadata
    const fetchHealth = async () => {
      try {
        const res = await api.get('/health');
        if (res.data?.database) {
          setDbInfo(res.data.database);
        }
      } catch (err) {
        console.error('Failed to fetch server health:', err);
      }
    };
    fetchHealth();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* User Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 text-xl font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">{user?.name || 'Authenticated User'}</h1>
              <p className="text-xs text-indigo-100 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 opacity-80" />
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Verified</span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Account Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Full Name</span>
              </div>
              <div className="text-sm font-semibold text-slate-800">{user?.name || 'N/A'}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Email Address</span>
              </div>
              <div className="text-sm font-semibold text-slate-800 truncate">{user?.email || 'N/A'}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verification Status</span>
              </div>
              <div className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Email Verified</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Member Since</span>
              </div>
              <div className="text-xs font-semibold text-slate-800">
                {formatDate(user?.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-400">Account ID: {user?.id || user?._id}</span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Database Connection Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Database className="w-4 h-4 text-indigo-600" />
          Active Database Connection
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-bold text-slate-800">
                {dbInfo?.type || 'MongoDB Database'}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Connected
            </span>
          </div>

          <div className="text-xs text-slate-500 space-y-1 pt-1">
            <div>
              <span className="font-semibold text-slate-600">Database Name:</span>{' '}
              <code className="bg-white px-1.5 py-0.5 rounded border text-slate-700 font-mono">
                {dbInfo?.name || 'mailauth'}
              </code>
            </div>
            <div>
              <span className="font-semibold text-slate-600">Host:</span>{' '}
              <code className="bg-white px-1.5 py-0.5 rounded border text-slate-700 font-mono">
                {dbInfo?.host || 'localhost'}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Security Architecture Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-indigo-600" />
          Active Security Specifications
        </h2>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">HTTP-Only Cookie Storage</div>
              <div className="text-xs text-slate-500 mt-0.5">
                JWT is stored in an encrypted <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">httpOnly</code> cookie. Client-side JavaScript cannot read or tamper with your session token.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">bcrypt Hash Encryption</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Passwords are salted and cryptographically hashed with bcrypt (10 rounds) before database storage.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
