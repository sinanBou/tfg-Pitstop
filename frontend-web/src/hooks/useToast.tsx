import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Check, X, AlertTriangle, Info } from '@/assets/icons';

/* ─────────────────────────────────────────────
 *  TOAST NOTIFICATION SYSTEM
 *  Context + Provider + Hook para notificaciones globales.
 *  Renderiza un stack de toasts en la esquina superior derecha.
 * ───────────────────────────────────────────── */

// ── Types ──
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  /** Timestamp de creación para la barra de progreso */
  createdAt: number;
}

interface ToastAPI {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

interface ToastContextValue {
  toast: ToastAPI;
}

const MAX_VISIBLE = 5;
const DEFAULT_DURATION = 4000;

// ── Variant Styles ──
const VARIANT_CONFIG: Record<ToastVariant, {
  borderColor: string;
  iconColor: string;
  bgAccent: string;
  progressColor: string;
  icon: React.ReactNode;
}> = {
  success: {
    borderColor: 'border-green-500/30',
    iconColor: 'text-green-400',
    bgAccent: 'bg-green-500/5',
    progressColor: 'bg-green-500',
    icon: (
      <Check className="w-4 h-4" strokeWidth={2.5} />
    ),
  },
  error: {
    borderColor: 'border-red-500/30',
    iconColor: 'text-red-400',
    bgAccent: 'bg-red-500/5',
    progressColor: 'bg-red-500',
    icon: (
      <X className="w-4 h-4" strokeWidth={2.5} />
    ),
  },
  warning: {
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    bgAccent: 'bg-amber-500/5',
    progressColor: 'bg-amber-500',
    icon: (
      <AlertTriangle className="w-4 h-4" strokeWidth={2.5} />
    ),
  },
  info: {
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    bgAccent: 'bg-blue-500/5',
    progressColor: 'bg-blue-500',
    icon: (
      <Info className="w-4 h-4" strokeWidth={2.5} />
    ),
  },
};

// ── Variant Labels ──
const VARIANT_LABELS: Record<ToastVariant, string> = {
  success: 'Éxito',
  error: 'Error',
  warning: 'Aviso',
  info: 'Info',
};

// ── Single Toast Component ──
const ToastCard: React.FC<{
  item: ToastItem;
  onDismiss: (id: string) => void;
}> = ({ item, onDismiss }) => {
  const config = VARIANT_CONFIG[item.variant];
  const [isExiting, setIsExiting] = React.useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(item.id), 280);
  }, [item.id, onDismiss]);

  // Auto-dismiss timer
  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, item.duration);
    return () => clearTimeout(timer);
  }, [item.duration, handleDismiss]);

  return (
    <div
      className={`
        relative overflow-hidden
        w-[360px] max-w-[calc(100vw-2rem)]
        bg-neutral-950/95 backdrop-blur-xl
        border ${config.borderColor}
        rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]
        cursor-pointer select-none
        transition-all duration-300 ease-out
        ${isExiting
          ? 'opacity-0 translate-x-[120%] scale-95'
          : 'opacity-100 translate-x-0 scale-100 animate-[toastSlideIn_0.35s_cubic-bezier(0.16,1,0.3,1)]'
        }
      `}
      onClick={handleDismiss}
      role="alert"
    >
      {/* Contenido */}
      <div className={`flex items-start gap-3 px-4 py-3.5 ${config.bgAccent}`}>
        {/* Icono */}
        <div className={`shrink-0 mt-0.5 ${config.iconColor}`}>
          {config.icon}
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <span className={`text-[9px] font-black uppercase tracking-widest ${config.iconColor} block mb-0.5`}>
            {VARIANT_LABELS[item.variant]}
          </span>
          <p className="text-xs font-semibold text-white leading-relaxed break-words">
            {item.message}
          </p>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
          className="shrink-0 w-5 h-5 flex items-center justify-center text-neutral-500 hover:text-white transition-colors rounded-md hover:bg-white/10"
        >
          <X className="w-3 h-3" strokeWidth={2} />
        </button>
      </div>

      {/* Barra de progreso animada */}
      <div className="h-[2px] bg-neutral-900 w-full">
        <div
          className={`h-full ${config.progressColor} opacity-60`}
          style={{
            animation: `toastCountdown ${item.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

// ── Context ──
const ToastContext = createContext<ToastContextValue | null>(null);

// ── Provider ──
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idCounter = useRef(0);

  const addToast = useCallback((message: string, variant: ToastVariant, duration = DEFAULT_DURATION) => {
    const id = `toast-${Date.now()}-${idCounter.current++}`;
    const newToast: ToastItem = { id, message, variant, duration, createdAt: Date.now() };
    setToasts(prev => [...prev.slice(-(MAX_VISIBLE - 1)), newToast]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast: ToastAPI = React.useMemo(() => ({
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    dismiss,
  }), [addToast, dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* ── Toast Container (Top-Right) ── */}
      {toasts.length > 0 && (
        <div
          className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-auto"
          aria-live="polite"
          aria-atomic="false"
        >
          {toasts.map(t => (
            <ToastCard key={t.id} item={t} onDismiss={dismiss} />
          ))}
        </div>
      )}

      {/* Keyframes CSS (inyección inline única) */}
      <style>{`
        @keyframes toastSlideIn {
          0% { opacity: 0; transform: translateX(100%) scale(0.92); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastCountdown {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

// ── Hook ──
export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return ctx.toast;
}
