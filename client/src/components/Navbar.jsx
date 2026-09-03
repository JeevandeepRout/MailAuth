import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ShieldCheck, LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-indigo-600 hover:text-indigo-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            MailAuth
            <ShieldCheck className="w-4 h-4 text-indigo-600 inline" />
          </span>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-3 sm:gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="truncate max-w-[120px]">{user?.name || user?.email}</span>
              </div>

              <button
                onClick={handleLogout}
                type="button"
                className="flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                  isActive('/login')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
              >
                Create Account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
