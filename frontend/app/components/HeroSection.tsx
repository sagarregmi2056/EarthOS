"use client";

import React, { useState, useEffect } from 'react';
import Globe3D from './Globe3D';
import Link from 'next/link';

// Animation for the data flow lines between nodes
const DataFlowLines = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden opacity-40">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-gradient-to-r from-teal-400 to-blue-500"
                    style={{
                        width: `${Math.random() * 40 + 10}px`,
                        height: `${Math.random() * 1 + 0.5}px`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.5 + 0.3,
                        transform: `rotate(${Math.random() * 360}deg)`,
                        animation: `flow${i % 4} ${Math.random() * 10 + 10}s infinite linear`,
                    }}
                />
            ))}
        </div>
    );
};

// Module navigation component - simpler vertical menu matching the screenshot
const ModuleNavigation = () => {
    const [activeModule, setActiveModule] = useState<string | null>(null);

    const modules = [
        { id: 'pollutrack', name: 'PolluTrack', color: 'bg-red-500', icon: 'waves' },
        { id: 'agriai', name: 'AgriAI', color: 'bg-green-500', icon: 'seed' },
        { id: 'ecowatch', name: 'EcoWatch', color: 'bg-yellow-500', icon: 'visibility' },
        { id: 'energygrid', name: 'EnergyGrid', color: 'bg-blue-500', icon: 'bolt' },
        { id: 'climatelens', name: 'ClimateLens', color: 'bg-purple-500', icon: 'thermostat' },
        { id: 'citizennode', name: 'CitizenNode', color: 'bg-teal-500', icon: 'smartphone' },
        { id: 'aiadvisor', name: 'AI Advisor', color: 'bg-pink-500', icon: 'psychology' }
    ];

    return (
        <div className="absolute top-24 left-4 z-30 sm:left-6 lg:left-8">
            <div className="flex flex-col gap-2 sm:gap-4">
                {modules.map((module) => (
                    <button
                        key={module.id}
                        className="flex items-center gap-2 sm:gap-3 hover:bg-slate-800/50 rounded-lg transition-all px-2 sm:px-3 py-1 sm:py-2"
                        onClick={() => setActiveModule(module.id === activeModule ? null : module.id)}
                    >
                        <span className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full ${module.color}`}></span>
                        <span className="text-white text-sm sm:text-base font-medium">{module.name}</span>
                    </button>
                ))}
            </div>

            {activeModule && (
                <div className="mt-3 bg-slate-800/90 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-lg max-w-[180px] sm:max-w-xs ml-4 sm:ml-6">
                    <h3 className="text-white text-sm sm:text-base font-bold mb-1 sm:mb-2">
                        {modules.find(m => m.id === activeModule)?.name}
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm">
                        {activeModule === 'pollutrack' && 'Real-time air/water pollution tracking using IoT sensors and satellite data.'}
                        {activeModule === 'agriai' && 'Crop health monitoring, rainfall prediction, and pest warnings for farmers.'}
                        {activeModule === 'ecowatch' && 'Wildlife tracking via satellites, drones, and ground sensors.'}
                        {activeModule === 'energygrid' && 'Visualizes global/regional energy consumption and production.'}
                        {activeModule === 'climatelens' && 'Tracks climate change impacts and regional carbon footprints.'}
                        {activeModule === 'citizennode' && 'Crowdsourced data from smartphones and IoT sensors (like Waze for Earth).'}
                        {activeModule === 'aiadvisor' && 'Recommends actions for emissions reduction, urban planning, and resource conservation.'}
                    </p>
                </div>
            )}
        </div>
    );
};

const HeroSection = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Add a small delay for initial animation
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 200);

        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="relative w-full h-screen bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
            {/* Background data flow animation */}
            <DataFlowLines />

            {/* Blue border at the top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 z-20"></div>

            {/* Globe visualization - Improved positioning */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="w-full h-full max-w-screen-lg mx-auto">
                    <Globe3D />
                </div>
            </div>

            {/* Module Navigation System */}
            <ModuleNavigation />

            {/* Content overlay */}
            <div className="relative z-20 container mx-auto h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
                <div className={`max-w-xl sm:max-w-2xl lg:max-w-3xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Headline */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600">
                            EarthOS:
                        </span> <br />
                        <span className="leading-tight">A Decentralized Operating System for Our Planet</span>
                    </h1>

                    {/* Subheadline */}
                    <h2 className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-4 sm:mb-6">
                        Monitor, optimize, and collaborate globally with real-time, decentralized data and AI-driven insights.
                    </h2>

                    {/* Description */}
                    <p className="text-slate-400 mb-6 sm:mb-8 max-w-full text-sm sm:text-base">
                        EarthOS is an open-source, decentralized platform empowering humanity with a real-time "HUD" to track pollution, climate, wildlife, and more. Built on IPFS and governed by a DAO, it unites citizens, scientists, and governments in a transparent, community-driven mission for a sustainable future.
                    </p>

                    {/* Call to action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Link
                            href="/explore"
                            className="px-6 sm:px-8 py-2 sm:py-3 text-white text-sm sm:text-base bg-gradient-to-r from-teal-500 to-blue-600 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                        >
                            Explore EarthOS Now
                        </Link>
                        <Link
                            href="/community"
                            className="px-6 sm:px-8 py-2 sm:py-3 text-white text-sm sm:text-base bg-slate-800 border border-slate-700 rounded-full font-medium hover:bg-slate-700 transition-all duration-300"
                        >
                            Join the Decentralized Community
                        </Link>
                    </div>
                </div>
            </div>

            {/* Decentralized nodes visualization overlay */}
            <div className="absolute inset-0 z-15 pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 sm:w-2 sm:h-2 rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            backgroundColor: i % 3 === 0 ? '#ef4444' : (i % 3 === 1 ? '#3b82f6' : '#f97316'),
                            boxShadow: i % 3 === 0 ? '0 0 10px 2px rgba(239, 68, 68, 0.5)' : (i % 3 === 1 ? '0 0 10px 2px rgba(59, 130, 246, 0.5)' : '0 0 10px 2px rgba(249, 115, 22, 0.5)'),
                            animation: `pulse ${Math.random() * 4 + 4}s infinite ease-in-out ${Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>

            {/* CSS animations */}
            <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.5); opacity: 1; }
        }
        
        @keyframes flow0 {
          0% { transform: translateX(-100%) translateY(0) rotate(0deg); }
          100% { transform: translateX(1000%) translateY(100px) rotate(20deg); }
        }
        
        @keyframes flow1 {
          0% { transform: translateX(0) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100px) translateY(1000%) rotate(60deg); }
        }
        
        @keyframes flow2 {
          0% { transform: translateX(1000%) translateY(0) rotate(90deg); }
          100% { transform: translateX(-100%) translateY(200px) rotate(110deg); }
        }
        
        @keyframes flow3 {
          0% { transform: translateX(0) translateY(1000%) rotate(135deg); }
          100% { transform: translateX(200px) translateY(-100%) rotate(160deg); }
        }
      `}</style>
        </section>
    );
};

export default HeroSection; 