import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'gradient' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
    children, 
    className, 
    variant = 'primary', 
    size = 'md',
    glow = false,
    ...props 
}) => {
    const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover-lift";
    
    const sizeClasses = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
    };

    const variantClasses = {
        primary: "text-white bg-gradient-to-r from-primary-accent to-primary-accent-hover hover:from-primary-accent-hover hover:to-primary-accent focus:ring-primary-accent border-0 shadow-medium",
        secondary: "text-primary-accent bg-primary-accent/10 border border-primary-accent/20 hover:bg-primary-accent/20 focus:ring-primary-accent",
        outline: "text-text-primary bg-white/80 border border-border hover:bg-white focus:ring-primary-accent backdrop-blur-sm",
        gradient: "text-white bg-gradient-to-r from-primary-accent via-secondary to-accent hover:from-secondary hover:via-accent hover:to-primary-accent focus:ring-primary-accent border-0 shadow-large",
        ghost: "text-text-secondary bg-transparent hover:bg-white/50 focus:ring-primary-accent border-0",
    };

    const glowClasses = glow ? "shadow-glow" : "";

    return (
        <button
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${glowClasses} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};