
import React from 'react';
import { SEOContent } from '../types';
import { Spinner } from './Spinner';

interface RightPanelProps {
    content: SEOContent | null;
    isLoading: boolean;
}

export const RightPanel: React.FC<RightPanelProps> = ({ content, isLoading }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary-accent rounded-lg flex items-center justify-center text-white shadow-glow">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-text-primary">Generated Content</h2>
            </div>
            
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-primary-accent/5 to-secondary/5 rounded-2xl border border-primary-accent/20">
                    <div className="relative">
                        <Spinner />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary-accent to-secondary rounded-full animate-pulse-slow"></div>
                        </div>
                    </div>
                    <p className="text-text-secondary mt-6 text-center font-medium">Generating amazing content for you...</p>
                    <div className="flex space-x-1 mt-4">
                        <div className="w-2 h-2 bg-primary-accent rounded-full animate-bounce-subtle"></div>
                        <div className="w-2 h-2 bg-secondary rounded-full animate-bounce-subtle" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce-subtle" style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
            )}
            
            {!isLoading && !content && (
                <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-surface-elevated to-white rounded-2xl border border-border-light">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-accent/10 to-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-primary-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-text-muted text-center font-medium">Your generated title, description, and tags will appear here.</p>
                    <p className="text-text-muted text-sm text-center mt-2">Start by configuring your AI settings and providing product details.</p>
                </div>
            )}
            
            {!isLoading && content && (
                <div className="space-y-6 animate-fade-in">
                    <div className="p-6 bg-gradient-to-br from-white to-surface-elevated rounded-2xl border border-border-light shadow-soft">
                        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center">
                            <div className="w-2 h-2 bg-primary-accent rounded-full mr-2"></div>
                            Title
                        </h3>
                        <p className="text-lg font-bold text-text-primary leading-relaxed">{content.title}</p>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-br from-white to-surface-elevated rounded-2xl border border-border-light shadow-soft">
                        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center">
                            <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                            Description
                        </h3>
                        <div
                            className="prose prose-sm max-w-none text-text-primary leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: content.description }}
                        />
                    </div>
                    
                    <div className="p-6 bg-gradient-to-br from-white to-surface-elevated rounded-2xl border border-border-light shadow-soft">
                        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center">
                            <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                            Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {content.tags.map((tag, index) => (
                                <span key={index} className="bg-gradient-to-r from-primary-accent/10 to-secondary/10 text-primary-accent text-xs font-semibold px-3 py-1.5 rounded-full border border-primary-accent/20 hover:shadow-soft transition-all duration-200">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};