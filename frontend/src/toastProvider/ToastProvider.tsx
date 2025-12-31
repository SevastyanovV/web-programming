import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import type { Toast, ToastStatus } from './toast.types';
import styles from './toast.module.scss';

type ShowToastArgs = {
  message: string;
  status: ToastStatus;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (args: ShowToastArgs) => string; // returns id
  removeToast: (id: string) => void;
  clearToasts: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 10000;

function genId() {
  // без внешних библиотек, достаточно для UI
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    // очищаем таймер
    const t = timersRef.current.get(id);
    if (t) {
      window.clearTimeout(t);
      timersRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const showToast = useCallback(
    ({ message, status, durationMs }: ShowToastArgs) => {
      const id = genId();
      const toast: Toast = { id, message, status, createdAt: Date.now() };

      setToasts((prev) => [...prev, toast]);

      const ms = durationMs ?? DEFAULT_DURATION;
      const timer = window.setTimeout(() => removeToast(id), ms);
      timersRef.current.set(id, timer);

      return id;
    },
    [removeToast]
  );

  const value = useMemo<ToastContextValue>(
    () => ({ showToast, removeToast, clearToasts }),
    [showToast, removeToast, clearToasts]
  );

  const portalRoot = typeof document !== 'undefined' ? document.getElementById('root') : null;

  return (
    <ToastContext.Provider value={value}>
      {children}

      {portalRoot
        ? createPortal(
            <div className={styles.stack} aria-live='polite' aria-relevant='additions removals'>
              {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
              ))}
            </div>,
            portalRoot
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const statusClass =
    toast.status === 'success' ? styles.success : styles.failed;

  return (
    <div
      className={`${styles.toast} ${statusClass}`}
      role='status'
      aria-label={toast.status === 'success' ? 'Success message' : 'Error message'}
    >
      <div className={styles.message}>{toast.message}</div>

      <button className={styles.closeBtn} type='button' onClick={onClose} aria-label='Close toast'>
        ✕
      </button>
    </div>
  );
}
