'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            pointerEvents: 'none',
          }}
        >
          {toasts.map(toast => (
            <div
              key={toast.id}
              onClick={() => dismiss(toast.id)}
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                background:
                  toast.type === 'error'
                    ? 'rgba(239, 68, 68, 0.95)'
                    : toast.type === 'info'
                      ? 'rgba(59, 130, 246, 0.95)'
                      : 'rgba(246, 237, 221, 0.95)',
                color:
                  toast.type === 'error' || toast.type === 'info'
                    ? '#fff'
                    : '#1a1c16',
                fontSize: '0.875rem',
                fontWeight: 500,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)',
                animation: 'toast-in 0.25s ease-out',
                maxWidth: '20rem',
              }}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translateY(0.5rem) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/** Safe version that returns a no-op if used outside ToastProvider */
export function useToastSafe() {
  const context = useContext(ToastContext);
  if (!context) {
    return { showToast: () => {} };
  }
  return context;
}
