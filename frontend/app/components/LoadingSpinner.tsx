"use client";

import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message = 'Loading...'
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4'
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div
                className={`${sizeClasses[size]} border-t-blue-500 border-r-blue-300 border-b-blue-200 border-l-blue-400 rounded-full animate-spin`}
            ></div>
            {message && (
                <p className="mt-4 text-slate-300 text-sm md:text-base font-medium">{message}</p>
            )}
        </div>
    );
};

export default LoadingSpinner; 