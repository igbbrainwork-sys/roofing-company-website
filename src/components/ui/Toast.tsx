import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  onDismiss: (id: string) => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  onDismiss,
  durationMs = 5000,
}) => {
  useEffect(() => {
    if (durationMs > 0) {
      const timer = setTimeout(() => onDismiss(id), durationMs);
      return () => clearTimeout(timer);
    }
  }, [id, durationMs, onDismiss]);

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      border: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      border: 'border-rose-200 bg-rose-50 text-rose-900',
    },
    info: {
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
      border: 'border-sky-200 bg-sky-50 text-sky-900',
    },
  }[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 max-w-md animate-in fade-in slide-in-from-top-2 duration-200 ${typeConfig.border}`}
    >
      {typeConfig.icon}
      <div className="flex-1 text-xs">
        {title && <p className="font-bold text-slate-900 mb-0.5">{title}</p>}
        <p className="text-slate-700 leading-relaxed">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
