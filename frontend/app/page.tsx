"use client";

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import PollutionForm from './components/PollutionForm';
import ErrorBoundary from './components/ErrorBoundary';
import LandingHero from './components/LandingHero';
import { GeoJSONFeature, GeoJSONFeatureCollection } from './components/EarthGlobe';
import HeroSection from './components/HeroSection';
import ModuleRoadmap from './components/ModuleRoadmap';

// Dynamically import the map components with no SSR to avoid window issues
const EarthGlobe = dynamic(
    () => import('./components/EarthGlobe'),
    { ssr: false, loading: () => <LoadingSpinner /> }
);

// Import the SimpleMap component with no SSR
const SimpleMap = dynamic(
    () => import('./components/SimpleMap'),
    { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-900"><LoadingSpinner /></div> }
);

// Mock data for initial rendering and fallback
const mockData: GeoJSONFeature[] = [
    {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [85.3240, 27.7172] },
        properties: { pm25: 178, source: 'user', id: '1' }
    },
    {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [77.2090, 28.6139] },
        properties: { pm25: 210, source: 'satellite', id: '2' }
    },
    {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [121.4737, 31.2304] },
        properties: { pm25: 156, source: 'sensor', id: '3' }
    },
    {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-74.0060, 40.7128] },
        properties: { pm25: 35, source: 'sensor', id: '4' }
    },
    {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [139.6917, 35.6895] },
        properties: { pm25: 42, source: 'sensor', id: '5' }
    }
];

// Statistics for the landing page
const statistics = [
    { label: 'Global Stations', value: '10,000+' },
    { label: 'Countries', value: '150+' },
    { label: 'Data Points', value: '1.2M+' },
    { label: 'Daily Users', value: '50,000+' }
];

// Core modules data
const coreModules = [
    {
        title: 'PolluTrack',
        description: 'Real-time air/water pollution tracking using IoT sensors and satellite data.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5"></path>
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
                <path d="M20 20a8 8 0 1 0-16 0"></path>
            </svg>
        ),
        color: 'from-red-500 to-orange-500'
    },
    {
        title: 'AgriAI',
        description: 'Crop health monitoring, rainfall prediction, and pest warnings for farmers.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v2"></path>
                <path d="M12 15v3"></path>
                <path d="M9.17 6.17a6 6 0 1 0 5.66 9.83"></path>
                <path d="M4 13H2"></path>
                <path d="M12 22v-2"></path>
                <path d="M20 13h2"></path>
                <path d="m14.83 14.83 1.42 1.42"></path>
            </svg>
        ),
        color: 'from-green-500 to-emerald-500'
    },
    {
        title: 'EcoWatch',
        description: 'Wildlife tracking via satellites, drones, and ground sensors.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        ),
        color: 'from-amber-500 to-yellow-500'
    },
    {
        title: 'EnergyGrid',
        description: 'Visualizes global/regional energy consumption and production.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10"></path>
                <path d="M12 20V4"></path>
                <path d="M6 20v-6"></path>
            </svg>
        ),
        color: 'from-blue-500 to-indigo-500'
    },
    {
        title: 'ClimateLens',
        description: 'Tracks climate change impacts and regional carbon footprints.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
        ),
        color: 'from-purple-500 to-violet-500'
    },
    {
        title: 'CitizenNode',
        description: 'Crowdsourced data from smartphones and IoT sensors (like Waze for Earth).',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
        ),
        color: 'from-teal-500 to-cyan-500'
    },
    {
        title: 'AI Advisor',
        description: 'Recommends actions for emissions reduction, urban planning, and resource conservation.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2-2 3-3 3 3 2 2 3 3V10a8 8 0 0 0-8-8z"></path>
            </svg>
        ),
        color: 'from-pink-500 to-rose-500'
    }
];

// Target audience data
const targetAudience = [
    {
        title: 'NGOs/Governments',
        description: 'Policy insights and data-driven decision making for environmental management and regulation.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 20h20"></path>
                <path d="M5 20V9l7-4 7 4v11"></path>
                <path d="M12 17v-6"></path>
                <path d="M9 14h6"></path>
            </svg>
        )
    },
    {
        title: 'Scientists',
        description: 'Open datasets and analytics tools for advanced research and environmental modeling.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3h6m-3-3v3"></path>
                <path d="M7 7c0 3-1 5-3 7 2 2 3 4 3 7h10c0-3 1-5 3-7-2-2-3-4-3-7z"></path>
                <path d="M8 16h8"></path>
                <path d="M9 13h6"></path>
                <path d="M11 10h2"></path>
            </svg>
        )
    },
    {
        title: 'Startups',
        description: 'Platform for eco-solutions development and integration with new green technologies.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <path d="M22 4 12 14.01l-3-3"></path>
            </svg>
        )
    },
    {
        title: 'Citizens',
        description: 'Climate awareness and actionable micro-tips for everyday environmental responsibility.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 11v12h10v-3h-4v-1h4v-4h-4v-1h4v-3z"></path>
                <path d="M14.058 3c-3.862 0-7 3.138-7 7h14c0-3.862-3.138-7-7-7z"></path>
                <path d="M7 17h10"></path>
            </svg>
        )
    }
];

export default function Home() {
    const [showForm, setShowForm] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [viewMode, setViewMode] = useState('2d'); // Start with 2D view as default
    const [pollutionData, setPollutionData] = useState<GeoJSONFeature[]>(mockData);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data for both views
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Use a try-catch to handle potential API issues
                try {
                    const response = await axios.get('/api/pollution/mock');
                    if (response.data && response.data.features) {
                        setPollutionData(response.data.features);
                    }
                } catch (apiError) {
                    console.error('API error:', apiError);
                    // Keep using mock data if API fails
                }
            } catch (err) {
                console.error('Error fetching pollution data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle point selection
    const handlePointSelected = (point: GeoJSONFeature) => {
        console.log('Selected point:', point);
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-900">
            {/* Header */}
            <Header />

            {!showMap ? (
                // Landing page content with padding to account for fixed header
                <main className="flex-grow pt-[105px]">
                    <HeroSection />

                    {/* Statistics Section */}
                    <section className="py-16 bg-slate-800">
                        <div className="container mx-auto px-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {statistics.map((stat, index) => (
                                    <div key={index} className="bg-slate-700/50 backdrop-blur-sm border border-slate-600 p-6 rounded-lg shadow-xl transform hover:scale-105 transition-all">
                                        <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 text-center mb-2">{stat.value}</p>
                                        <p className="text-gray-300 text-lg text-center">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Target Audience Section */}
                    <section className="py-20 px-4 relative overflow-hidden bg-slate-900">
                        <div className="container mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Who Uses <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">EarthOS</span></h2>
                                <p className="text-slate-400 max-w-3xl mx-auto text-lg">
                                    Our platform serves diverse stakeholders working toward a sustainable future.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {targetAudience.map((audience, index) => (
                                    <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg transform hover:translate-y-[-5px] transition-transform duration-300">
                                        <div className="flex items-center mb-4">
                                            <div className="p-3 rounded-lg bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-blue-400">
                                                {audience.icon}
                                            </div>
                                            <h3 className="text-xl font-bold text-white ml-4">{audience.title}</h3>
                                        </div>
                                        <p className="text-slate-400">{audience.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Core Modules Section */}
                    <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900">
                        {/* Decorative background elements */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute w-96 h-96 rounded-full bg-blue-500/20 blur-3xl top-10 -left-48"></div>
                            <div className="absolute w-96 h-96 rounded-full bg-teal-500/20 blur-3xl bottom-10 -right-48"></div>
                        </div>

                        <div className="container mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Modules</span></h2>
                                <p className="text-slate-400 max-w-3xl mx-auto text-lg">
                                    EarthOS is built around seven interconnected modules that monitor and manage our planet's vital systems.
                                </p>
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {coreModules.map((module, index) => (
                                    <div key={index} className="group bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5">
                                        <div className={`h-2 w-full bg-gradient-to-r ${module.color}`}></div>
                                        <div className="p-6">
                                            <div className="flex items-center mb-4">
                                                <div className={`p-3 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 text-gradient bg-clip-text from-teal-400 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity`}>
                                                    {module.icon}
                                                </div>
                                                <h3 className="text-xl font-bold text-white ml-4 group-hover:text-blue-400 transition-colors">{module.title}</h3>
                                            </div>
                                            <p className="text-slate-400">{module.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Module Roadmap Section */}
                    <section className="py-20 px-4 bg-slate-950 bg-gradient-to-b from-slate-900 to-black">
                        <div className="container mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Development <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Roadmap</span></h2>
                                <p className="text-slate-400 max-w-3xl mx-auto text-lg">
                                    Our decentralized DAO governance model prioritizes transparency and community-driven development of EarthOS modules over time.
                                </p>
                            </div>
                            <div className="w-full max-w-4xl mx-auto">
                                <ModuleRoadmap />
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="py-20 px-4 bg-gradient-to-r from-slate-900 to-slate-950 relative overflow-hidden border-t border-slate-800">
                        {/* Background decoration */}
                        <div className="absolute inset-0 overflow-hidden opacity-20">
                            <svg className="absolute -bottom-1/4 -right-1/4 w-2/3 h-2/3 text-blue-500/10" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M42.8,-64.2C54.9,-56.3,63.5,-42.8,69.4,-28.5C75.3,-14.1,78.4,1.2,75.6,15.2C72.8,29.2,64.1,41.9,52.4,50.1C40.7,58.3,26,62.1,11.7,65.7C-2.7,69.3,-16.7,72.7,-29.2,69.2C-41.7,65.7,-52.6,55.2,-59.4,42.6C-66.2,30,-68.8,15,-68.9,-0.1C-69,-15.1,-66.6,-30.2,-59.2,-41.6C-51.8,-53,-39.3,-60.7,-26.5,-67.9C-13.8,-75,-6.9,-81.6,3.9,-87.9C14.6,-94.2,29.2,-100.1,42.8,-96.8C56.4,-93.5,68.9,-81,73,-67.4C77.1,-53.9,72.9,-39.3,65.5,-27.9C58.1,-16.5,47.4,-8.2,42.8,1.4C38.1,11.1,39.4,22.2,36.4,32.5C33.3,42.8,26,52.4,16.3,53.8C6.5,55.3,-5.6,48.7,-18.7,46.3C-31.8,43.9,-45.8,45.9,-55.1,40.6C-64.3,35.3,-68.8,22.9,-70.4,10.3C-72.1,-2.3,-70.9,-15,-66.4,-27.2C-61.9,-39.5,-54.1,-51.3,-43.3,-59.4C-32.5,-67.5,-18.7,-71.9,-3.6,-76.5C11.4,-81.1,22.8,-85.9,31.9,-82.6C41,-79.3,47.8,-68,54.1,-56.9Z" transform="translate(100 100)" />
                            </svg>
                        </div>

                        <div className="container mx-auto text-center relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Ready to explore global environmental data?</h2>
                            <p className="text-xl mb-10 text-slate-300 max-w-2xl mx-auto leading-relaxed">
                                Join thousands of researchers, policymakers, and citizens who use EarthOS to make informed decisions about our planet's future.
                            </p>
                            <button
                                onClick={() => setShowMap(true)}
                                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:from-teal-600 hover:to-blue-700 font-bold rounded-full shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                            >
                                Open Interactive Map
                            </button>
                        </div>
                    </section>
                </main>
            ) : (
                // Map view
                <main className="flex-grow relative">
                    {/* Back to Home Button */}
                    <div className="absolute top-5 left-5 z-40">
                        <button
                            onClick={() => setShowMap(false)}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all mr-3"
                        >
                            ← Back to Home
                        </button>
                        <button
                            onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all"
                        >
                            {viewMode === '3d' ? 'Switch to 2D Map' : 'Try 3D Globe (Beta)'}
                        </button>
                    </div>

                    {/* Map Container */}
                    <div className="absolute inset-0">
                        <ErrorBoundary fallback={<div className="p-4 bg-red-800 text-white">Error loading the map. Please try again later.</div>}>
                            <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><LoadingSpinner /></div>}>
                                {viewMode === '3d' ? (
                                    <EarthGlobe />
                                ) : (
                                    <SimpleMap
                                        pollutionData={pollutionData}
                                        onPointSelected={handlePointSelected}
                                    />
                                )}
                            </Suspense>
                        </ErrorBoundary>
                    </div>

                    {/* Report Pollution Button */}
                    <div className="absolute bottom-5 right-5 z-20">
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all"
                        >
                            {showForm ? 'Close Form' : 'Report Pollution'}
                        </button>
                    </div>

                    {/* Pollution Reporting Form */}
                    {showForm && (
                        <div className="absolute bottom-20 right-5 w-80 z-20">
                            <PollutionForm onClose={() => setShowForm(false)} />
                        </div>
                    )}
                </main>
            )}

            {/* Footer */}
            <footer className="bg-slate-900 text-gray-300 py-8 border-t border-slate-800">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-center md:text-left mb-6 md:mb-0">
                            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-2">EarthOS</h3>
                            <p className="text-sm text-gray-400">© {new Date().getFullYear()} | Developed by Sagar Regmi</p>
                            <p className="text-xs text-gray-500 mt-1">Monitoring Our Planet's Health</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Terms of Service</a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Contact</a>
                            <a href="https://github.com/yourusername/earthos" className="text-gray-400 hover:text-blue-400 transition-colors">GitHub</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
} 