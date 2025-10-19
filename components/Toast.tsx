import React, { useEffect } from 'react';
import { ToastInfo } from '../types';
import { Icon } from './Icon';

interface ToastProps {
    info: ToastInfo;
    onClose: () => void;
}

const toastConfig = {
    success: {
        bg: 'bg-gradient-to-r from-success/10 to-success/5',
        text: 'text-success',
        icon: 'check-circle',
        iconColor: 'text-success',
        link: 'text-success font-bold hover:text-success/80',
        ring: 'focus:ring-success focus:ring-offset-success/10',
        border: 'border-success/20',
        shadow: 'shadow-glow',
    },
    error: {
        bg: 'bg-gradient-to-r from-error/10 to-error/5',
        text: 'text-error',
        icon: 'x-circle',
        iconColor: 'text-error',
        link: 'text-error font-bold hover:text-error/80',
        ring: 'focus:ring-error focus:ring-offset-error/10',
        border: 'border-error/20',
        shadow: 'shadow-soft',
    },
    info: {
        bg: 'bg-gradient-to-r from-primary-accent/10 to-secondary/5',
        text: 'text-primary-accent',
        icon: 'info-circle',
        iconColor: 'text-primary-accent',
        link: 'text-primary-accent font-bold hover:text-primary-accent/80',
        ring: 'focus:ring-primary-accent focus:ring-offset-primary-accent/10',
        border: 'border-primary-accent/20',
        shadow: 'shadow-glow',
    }
};


export const Toast: React.FC<ToastProps> = ({ info, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 8000);

        return () => {
            clearTimeout(timer);
        };
    }, [onClose]);

    const config = toastConfig[info.type];

    return (
        <div className="fixed top-6 right-6 z-50 w-full max-w-sm animate-slide-up">
            <div className={`rounded-2xl ${config.bg} p-5 ${config.shadow} border ${config.border} backdrop-blur-sm`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
                            <Icon name={config.icon} className={`h-5 w-5 ${config.iconColor}`} />
                        </div>
                    </div>
                    <div className="ml-4 flex-1">
                        <p className={`text-sm font-semibold ${config.text}`}>{info.message}</p>
                        {info.link && (
                            <p className="mt-2 text-sm">
                                <a href={info.link} target="_blank" rel="noopener noreferrer" className={`${config.link} hover:underline transition-colors duration-200`}>
                                    Click here to view →
                                </a>
                            </p>
                        )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`inline-flex rounded-lg p-1.5 ${config.text} hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.ring} transition-all duration-200`}
                        >
                            <span className="sr-only">Dismiss</span>
                            <Icon name="x" className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
