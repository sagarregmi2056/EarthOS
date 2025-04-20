"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Define types for module data points
interface DataPoint {
    id: string;
    name: string;
    lat: number;
    lng: number;
    category: 'pollution' | 'agriculture' | 'climate' | 'wildlife' | 'citizen';
    value: number;
    timestamp: string;
}

// Define type for node network connection
interface NodeConnection {
    from: DataPoint;
    to: DataPoint;
    strength: number; // 0-1 value representing connection strength
}

// Load the CesiumGlobeInner component only on client side
const CesiumGlobeInner = dynamic(
    () => import('./CesiumGlobeInner'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full min-h-[500px] bg-slate-900 flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        )
    }
);

export default function CesiumGlobe({
    accessToken,
    dataPoints = [],
    nodeConnections = [],
    showNodeConnections = true
}: {
    accessToken?: string;
    dataPoints?: DataPoint[];
    nodeConnections?: NodeConnection[];
    showNodeConnections?: boolean;
}) {
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Error boundary effect
    useEffect(() => {
        const handleWindowError = (event: ErrorEvent) => {
            if (event.message && event.message.includes('Cesium')) {
                console.error('Cesium error caught by window handler:', event);
                setHasError(true);
                setErrorMessage(event.message);
                event.preventDefault();
            }
        };

        window.addEventListener('error', handleWindowError);
        return () => window.removeEventListener('error', handleWindowError);
    }, []);

    if (hasError) {
        return (
            <div className="w-full h-full min-h-[500px] bg-slate-900 flex items-center justify-center">
                <div className="bg-red-900/80 text-white p-4 rounded-lg max-w-md text-center">
                    <h3 className="text-lg font-bold mb-2">Error Loading 3D Globe</h3>
                    <p>{errorMessage || "An unknown error occurred"}</p>
                    <p className="mt-2 text-sm">Please try refreshing the page</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[500px]">
            {/* Legend Overlay */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs p-2 z-10 rounded">
                <div className="mb-1 font-bold">Data Categories</div>
                <div className="flex items-center mb-1">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block mr-2"></span>
                    <span>Air Pollution</span>
                </div>
                <div className="flex items-center mb-1">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block mr-2"></span>
                    <span>Agriculture</span>
                </div>
                <div className="flex items-center mb-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500 inline-block mr-2"></span>
                    <span>Climate</span>
                </div>
                <div className="flex items-center mb-1">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block mr-2"></span>
                    <span>Wildlife</span>
                </div>
                <div className="flex items-center mb-1">
                    <span className="w-3 h-3 rounded-full bg-pink-500 inline-block mr-2"></span>
                    <span>Citizen Reports</span>
                </div>
                {showNodeConnections && (
                    <div className="flex items-center">
                        <span className="w-6 h-1 bg-cyan-500 inline-block mr-2"></span>
                        <span>Data Network</span>
                    </div>
                )}
            </div>

            <CesiumGlobeInner
                accessToken={accessToken}
                dataPoints={dataPoints}
                nodeConnections={nodeConnections}
                showNodeConnections={showNodeConnections}
            />
        </div>
    );
} 