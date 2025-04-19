"use client";

import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    return (
        <header className="bg-slate-800 shadow-md z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center">
                    <span className="text-2xl font-bold text-white mr-2">🌍</span>
                    <h1 className="text-2xl font-bold text-white">
                        <Link href="/" className="hover:text-blue-300 transition-colors">
                            EarthOS
                        </Link>
                    </h1>
                    <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">BETA</span>
                </div>

                <div className="flex items-center">
                    <nav className="hidden md:flex space-x-6">
                        <Link href="/" className="text-white hover:text-blue-300 transition-colors">
                            Home
                        </Link>
                        <Link href="/about" className="text-white hover:text-blue-300 transition-colors">
                            About
                        </Link>
                        <Link href="/data" className="text-white hover:text-blue-300 transition-colors">
                            Data Sources
                        </Link>
                    </nav>

                    <div className="flex ml-6">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                            Sign In
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-blue-600 py-1 px-4 text-center text-white text-sm">
                <p>EarthOS Planetary Monitoring System - Visualizing Earth's Vital Systems</p>
            </div>
        </header>
    );
};

export default Header; 