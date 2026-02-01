import { createContext, useContext, useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 min-w-[300px] p-4 rounded-lg shadow-lg border backdrop-blur-md animate-slide-in
                        ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                    toast.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                        'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}
                    >
                        {toast.type === 'success' && <CheckCircle size={20} />}
                        {toast.type === 'error' && <AlertCircle size={20} />}
                        {toast.type === 'warning' && <AlertTriangle size={20} />}
                        {toast.type === 'info' && <Info size={20} />}

                        <p className="text-sm font-medium flex-1">{toast.message}</p>

                        <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100 transition">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
