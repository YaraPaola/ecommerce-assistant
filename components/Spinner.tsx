import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'accent';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'primary' }) => {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-10 w-10',
        lg: 'h-16 w-16',
    };

    const colorClasses = {
        primary: 'text-primary-accent',
        secondary: 'text-secondary',
        accent: 'text-accent',
    };

    return (
        <div className="relative">
            <svg 
                className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
            >
                <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                ></circle>
                <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            {/* Glow effect */}
            <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-r from-primary-accent/20 to-secondary/20 blur-sm animate-pulse-slow`}></div>
        </div>
    );
};
