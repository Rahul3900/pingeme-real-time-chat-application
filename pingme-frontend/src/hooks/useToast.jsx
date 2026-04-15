import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ msg: '', type: '', show: false });
  const timerRef = useRef(null);

  const showToast = useCallback((msg, type = '') => {
    clearTimeout(timerRef.current);
    setToast({ msg, type, show: true });
    timerRef.current = setTimeout(() => {
      setToast(t => ({ ...t, show: false }));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        {toast.msg}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
