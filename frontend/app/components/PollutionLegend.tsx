"use client";

import React from 'react';

const PollutionLegend = () => {
    return (
        <div className="pollution-legend">
            <h3 className="text-lg font-semibold mb-2">PM2.5 Levels</h3>
            <div className="flex items-center space-x-4">
                <div>
                    <div className="legend-gradient rounded-sm"></div>
                </div>
                <div className="flex flex-col justify-between h-full text-sm space-y-6">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-earth-red rounded-full mr-2"></div>
                        <span>{'> 150: Hazardous'}</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-earth-yellow rounded-full mr-2"></div>
                        <span>50-150: Moderate</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-earth-green rounded-full mr-2"></div>
                        <span>{'< 50: Good'}</span>
                    </div>
                </div>
            </div>
            <div className="text-xs mt-3 text-gray-300">
                Values in µg/m³ (micrograms per cubic meter)
            </div>
        </div>
    );
};

export default PollutionLegend; 