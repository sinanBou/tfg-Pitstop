import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container — Posicionado en la parte superior derecha */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-sm w-full p-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div
                onClick={() => removeToast(toast.id)}
                className={`p-4 rounded-2xl border backdrop-blur-2xl flex items-start gap-3.5 cursor-pointer transition-all duration-300 active:scale-[0.98] bg-neutral-950/95 text-white ${
                  toast.type === 'success'
                    ? 'border-emerald-500/20 shadow-[0_15px_40px_-5px_rgba(16,185,129,0.15)]'
                    : toast.type === 'error'
                    ? 'border-red-500/20 shadow-[0_15px_40px_-5px_rgba(239,68,68,0.15)]'
                    : toast.type === 'warning'
                    ? 'border-amber-500/20 shadow-[0_15px_40px_-5px_rgba(245,158,11,0.15)]'
                    : 'border-blue-500/20 shadow-[0_15px_40px_-5px_rgba(59,130,246,0.15)]'
                }`}
              >
                {/* Iconos vectoriales premium con colores temáticos */}
                {toast.type === 'success' && (
                  <svg className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {toast.type === 'error' && (
                  <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {toast.type === 'warning' && (
                  <svg className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {toast.type === 'info' && (
                  <svg className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                
                <div className="flex-1 flex flex-col gap-0.5">
                  <p className={`text-[10px] uppercase font-black tracking-widest ${
                    toast.type === 'success' ? 'text-emerald-400' : toast.type === 'error' ? 'text-red-400' : toast.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    {toast.type === 'success' ? 'Éxito' : toast.type === 'error' ? 'Error' : toast.type === 'warning' ? 'Advertencia' : 'Información'}
                  </p>
                  <p className="text-xs font-bold leading-relaxed text-neutral-200">{toast.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
};
