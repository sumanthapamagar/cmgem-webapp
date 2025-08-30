import { useEffect } from 'react';

const variants = {
    success: {
        icon: 'fas fa-check-circle',
        className: 'bg-green-50 border-green-200 text-green-800',
        iconClassName: 'text-green-400'
    },
    error: {
        icon: 'fas fa-exclamation-circle',
        className: 'bg-red-50 border-red-200 text-red-800',
        iconClassName: 'text-red-400'
    },
    warning: {
        icon: 'fas fa-exclamation-triangle',
        className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        iconClassName: 'text-yellow-400'
    },
    info: {
        icon: 'fas fa-info-circle',
        className: 'bg-blue-50 border-blue-200 text-blue-800',
        iconClassName: 'text-blue-400'
    }
};

export function NotificationBanner({ 
    type = 'info', 
    message, 
    onClose, 
    autoClose = false, 
    autoCloseDelay = 5000,
    className = ''
}) {
    const variant = variants[type];

    useEffect(() => {
        if (autoClose && message) {
            const timer = setTimeout(() => {
                onClose?.();
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [autoClose, message, autoCloseDelay, onClose]);

    if (!message) return null;

    return (
        <div className={`border rounded-lg px-4 py-2 m-2 ${variant.className} ${className}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <i className={`${variant.icon} h-5 w-5 ${variant.iconClassName}`} aria-hidden="true"></i>
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{message}</p>
                </div>
            </div>
        </div>
    );
}
