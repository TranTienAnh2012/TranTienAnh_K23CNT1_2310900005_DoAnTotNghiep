import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-xl' }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl w-full ${maxWidth} shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
