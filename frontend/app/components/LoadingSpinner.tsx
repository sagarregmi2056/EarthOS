import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-full w-full bg-slate-900 bg-opacity-80">
            <div className="flex flex-col items-center">
                <div className="spinner"></div>
                <p className="mt-4 text-white font-semibold text-lg">Loading Earth Data...</p>
                <p className="text-gray-400 text-sm mt-2">Please wait while we gather pollution information</p>
            </div>
        </div>
    );
};

export default LoadingSpinner; 