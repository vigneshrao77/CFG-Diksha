import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

let _idCounter = 1;

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /** Show a toast notification.
   * @param {'success'|'error'|'warning'|'info'} type
   * @param {string} message
   * @param {string} [title]
   * @param {number} [duration=4000]
   */
  const showToast = useCallback((type, message, title, duration = 4000) => {
    const id = _idCounter++;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used inside NotificationProvider');
  return ctx;
}
