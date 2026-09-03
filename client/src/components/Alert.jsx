import React from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export default function Alert({ type = 'info', message, onClose, className = '' }) {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    },
    info: {
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      icon: <Info className="w-5 h-5 text-indigo-600 flex-shrink-0" />,
    },
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium animate-fadeIn ${currentStyle.bg} ${className}`}
      role="alert"
    >
      {currentStyle.icon}
      <div className="flex-1 pt-0.5">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Close alert"
          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
