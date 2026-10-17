import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Notification({ type = 'info', message, onClose }) {
  if (!message) return null;

  const styleConfig = {
    success: {
      wrapper: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      iconColor: 'text-emerald-600',
      closeBtn: 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100/60',
      Icon: CheckCircle2
    },
    error: {
      wrapper: 'bg-rose-50 border-rose-200 text-rose-800',
      iconColor: 'text-rose-600',
      closeBtn: 'text-rose-600 hover:text-rose-800 hover:bg-rose-100/60',
      Icon: AlertCircle
    },
    info: {
      wrapper: 'bg-blue-50 border-blue-200 text-blue-800',
      iconColor: 'text-blue-600',
      closeBtn: 'text-blue-600 hover:text-blue-800 hover:bg-blue-100/60',
      Icon: Info
    }
  }[type] || {
    wrapper: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-600',
    closeBtn: 'text-blue-600 hover:text-blue-800 hover:bg-blue-100/60',
    Icon: Info
  };

  const { wrapper, iconColor, closeBtn, Icon } = styleConfig;

  return (
    <div
      className={`flex items-center justify-between p-3.5 px-4 border rounded-xl mb-4 text-xs sm:text-sm font-medium shadow-sm transition-all animate-in fade-in slide-in-from-top-1 duration-200 ${wrapper}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon size={18} className={`flex-shrink-0 ${iconColor}`} />
        <span className="truncate">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`p-1 rounded-lg ml-3 transition-colors ${closeBtn}`}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
