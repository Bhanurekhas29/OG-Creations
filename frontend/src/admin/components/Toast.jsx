import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext).toast;
export const useConfirm = () => useContext(ToastContext).confirm;

/**
 * Drop-in replacement for `useState('')` message state: `[, setMsg] = useNotice('success')`.
 * Setting a non-empty text shows a popup; the returned value stays empty.
 */
export function useNotice(type) {
  const toast = useToast();
  const setter = useCallback((text) => {
    if (text) toast(type, text);
  }, [toast, type]);
  return ['', setter];
}

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback((type, text) => {
    const id = nextId++;
    setToasts((t) => [...t.slice(-3), { id, type, text }]);
    setTimeout(() => dismiss(id), type === 'error' ? 7000 : 4000);
  }, [dismiss]);

  /** confirm('Message', { title, confirmLabel }) -> Promise<boolean> */
  const confirm = useCallback((message, options = {}) => new Promise((resolve) => {
    setDialog({ message, title: options.title || 'Are you sure?', confirmLabel: options.confirmLabel || 'Confirm', resolve });
  }), []);

  const answer = (value) => {
    dialog?.resolve(value);
    setDialog(null);
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
            {t.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span>{t.text}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss"><X size={16} /></button>
          </div>
        ))}
      </div>

      {dialog && <ConfirmDialog dialog={dialog} onAnswer={answer} />}
    </ToastContext.Provider>
  );
}

function ConfirmDialog({ dialog, onAnswer }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onAnswer(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onAnswer]);

  return (
    <div className="dialog-backdrop" onClick={() => onAnswer(false)}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" onClick={(e) => e.stopPropagation()}>
        <h3 id="dlg-title">{dialog.title}</h3>
        <p>{dialog.message}</p>
        <div className="dialog-actions">
          <button ref={cancelRef} className="btn btn-outline" onClick={() => onAnswer(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onAnswer(true)}>{dialog.confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
