"use client";

import React, { useState } from 'react';
import Link from 'next/link';

// Define the module type
interface Module {
    id: string;
    name: string;
    year: string;
    color: string;
    description: string;
    isActive?: boolean;
}

const ModuleRoadmap: React.FC = () => {
    const [activeModule, setActiveModule] = useState<string | null>(null);

    // Define the modules
    const modules: Module[] = [
        {
            id: 'pollutrack',
            name: 'PolluTrack',
            year: '2025',
            color: 'bg-red-500',
            description: 'Real-time air/water pollution tracking using IoT sensors and satellite data.'
        },
        {
            id: 'agriai',
            name: 'AgriAI',
            year: '2026',
            color: 'bg-green-500',
            description: 'Crop health monitoring, rainfall prediction, and pest warnings for farmers.'
        },
        {
            id: 'ecowatch',
            name: 'EcoWatch',
            year: '2026',
            color: 'bg-yellow-500',
            description: 'Wildlife tracking via satellites, drones, and ground sensors.'
        },
        {
            id: 'energygrid',
            name: 'EnergyGrid',
            year: '2026',
            color: 'bg-blue-500',
            description: 'Visualizes global/regional energy consumption and production.'
        },
        {
            id: 'climatelens',
            name: 'ClimateLens',
            year: '2027',
            color: 'bg-purple-500',
            description: 'Tracks climate change impacts and regional carbon footprints.'
        }
    ];

    const handleModuleClick = (moduleId: string) => {
        setActiveModule(moduleId === activeModule ? null : moduleId);
    };

    return (
        <div className="relative w-full max-w-lg mx-auto py-10">
            {/* No need for standalone title as it's in the parent section now */}

            {/* Vertical line - brighter to stand out better */}
            <div className="absolute left-8 top-10 bottom-10 w-1 bg-blue-400 bg-opacity-30 rounded"></div>

            {/* Modules timeline */}
            <div className="relative">
                {modules.map((module, index) => (
                    <div key={module.id} className="mb-16 relative">
                        <div className="flex items-start">
                            {/* Timeline circle - enhanced glow effect */}
                            <div
                                className={`w-6 h-6 rounded-full border-4 border-white z-10 mr-4 ${module.id === activeModule ? module.color : 'bg-slate-600'
                                    }`}
                                style={{
                                    boxShadow: module.id === activeModule
                                        ? `0 0 15px 3px ${getColorHex(module.color)}`
                                        : '0 0 5px rgba(255, 255, 255, 0.3)'
                                }}
                            ></div>

                            {/* Year and module content */}
                            <div className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} w-full`}>
                                <div className={`font-bold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-blue-200 mr-6 ${index % 2 === 0 ? 'text-right w-24' : 'text-left w-24 ml-6'
                                    }`}>
                                    {module.year}
                                </div>

                                <div className="flex-1">
                                    <button
                                        onClick={() => handleModuleClick(module.id)}
                                        className={`text-left w-full p-4 rounded-lg transition-all ${module.id === activeModule
                                            ? 'bg-slate-800 border border-slate-700 shadow-lg shadow-blue-900/30'
                                            : 'bg-slate-900/70 border border-slate-800 hover:bg-slate-800/90 hover:border-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center mb-2">
                                            <span className={`w-3 h-3 rounded-full ${module.color} mr-2`}></span>
                                            <h3 className="text-xl font-bold text-white">{module.name}</h3>
                                        </div>

                                        {module.id === activeModule && (
                                            <p className="text-slate-300 mt-2">{module.description}</p>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Arrow to next module - brighter */}
                        {index < modules.length - 1 && (
                            <div className="absolute left-[7px] top-6 h-16 flex items-center justify-center">
                                <svg width="12" height="50" viewBox="0 0 12 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 0V45M6 45L1 40M6 45L11 40" stroke="rgba(147, 197, 253, 0.6)" strokeWidth="2" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper function to get color hex for shadow effect
function getColorHex(tailwindClass: string): string {
    const colorMap: { [key: string]: string } = {
        'bg-red-500': 'rgba(239, 68, 68, 0.7)',
        'bg-green-500': 'rgba(34, 197, 94, 0.7)',
        'bg-yellow-500': 'rgba(234, 179, 8, 0.7)',
        'bg-blue-500': 'rgba(59, 130, 246, 0.7)',
        'bg-purple-500': 'rgba(168, 85, 247, 0.7)',
        'bg-teal-500': 'rgba(20, 184, 166, 0.7)',
        'bg-pink-500': 'rgba(236, 72, 153, 0.7)'
    };

    return colorMap[tailwindClass] || 'rgba(255, 255, 255, 0.7)';
}

export default ModuleRoadmap; 