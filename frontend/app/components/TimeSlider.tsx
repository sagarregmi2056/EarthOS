"use client";

import React, { useState } from 'react';

interface TimeSliderProps {
    value: number;
    onChange: (value: number) => void;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ value, onChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const timeOptions = [
        { value: 1, label: '24 hours' },
        { value: 7, label: '7 days' },
        { value: 30, label: '30 days' },
        { value: 90, label: '90 days' },
        { value: 365, label: '1 year' }
    ];

    return (
        <div className="time-slider">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-gray-300 hover:text-white flex items-center text-sm"
                >
                    <span className="mr-2">Time Range: {timeOptions.find(t => t.value === value)?.label || `${value} days`}</span>
                    <svg
                        className={`w-4 h-4 transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <div className="text-xs text-gray-400">
                    {/* This shows current date as "MOCK" for the MVP */}
                    Current: {new Date().toLocaleDateString()}
                </div>
            </div>

            {isExpanded && (
                <div className="mt-2 grid grid-cols-3 gap-1">
                    {timeOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsExpanded(false);
                            }}
                            className={`text-xs py-1 px-2 rounded ${value === option.value
                                ? 'bg-blue-700 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimeSlider; 