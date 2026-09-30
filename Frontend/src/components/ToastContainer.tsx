import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-none shadow-xl border flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-[#2B2B2B] text-white border-emerald-500'
                : isError
                ? 'bg-[#2B2B2B] text-white border-[#E11D48]'
                : 'bg-[#2B2B2B] text-white border-[#D4D4D4]'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isError && <AlertCircle className="w-4 h-4 text-[#E11D48]" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-[#E11D48]" />}
            </div>

            <div className="flex-1 min-w-0">
              {toast.title && <div className="text-xs font-bold leading-tight uppercase tracking-wider">{toast.title}</div>}
              <div className="text-xs text-[#D4D4D4] leading-snug">{toast.message}</div>
            </div>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded-none text-stone-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
