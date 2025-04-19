"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Import the Globe3D component with no SSR
const Globe3D = dynamic(
    () => import('./Globe3D'),
    { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center"><LoadingSpinner /></div> }
);

interface LandingHeroProps {
    onExploreClick: () => void;
}

const LandingHero: React.FC<LandingHeroProps> = ({ onExploreClick }) => {
    return (
        <section className="relative min-h-[80vh] flex items-center">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 z-0"></div>

            <div className="container mx-auto px-4 z-10">
                <div className="flex flex-col md:flex-row items-center">
                    {/* Text content */}
                    <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                            Monitor Our <span className="text-blue-400">Planet's</span> Air Quality
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 max-w-lg">
                            EarthOS provides real-time air pollution data from around the world, helping you make informed decisions about your health and environment.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                            <button
                                onClick={onExploreClick}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all hover:scale-105"
                            >
                                Explore Interactive Map
                            </button>
                            <button className="bg-transparent border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-slate-900 font-bold py-3 px-8 rounded-full shadow-lg transition-all">
                                Learn More
                            </button>
                        </div>
                    </div>

                    {/* 3D Globe */}
                    <div className="md:w-1/2 h-[400px] md:h-[500px]">
                        <Suspense fallback={<LoadingSpinner />}>
                            <Globe3D />
                        </Suspense>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LandingHero; 