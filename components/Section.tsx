
import React from 'react';

interface SectionProps {
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    gradient?: boolean;
}

export const Section: React.FC<SectionProps> = ({ title, children, icon, gradient = false }) => {
    return (
        <div className={`${gradient ? 'bg-gradient-to-br from-white to-surface-elevated' : 'bg-white/90'} backdrop-blur-sm p-8 rounded-2xl shadow-soft border border-white/30 hover-lift transition-all duration-300`}>
            <div className="flex items-center space-x-3 mb-8">
                {icon && (
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-accent to-secondary rounded-lg flex items-center justify-center text-white shadow-glow">
                        {icon}
                    </div>
                )}
                <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
            </div>
            <div className="space-y-6 animate-fade-in">
                {children}
            </div>
        </div>
    );
};