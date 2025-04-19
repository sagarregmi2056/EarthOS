"use client";

import { useState, useEffect, useRef } from 'react';
import { Viewer, Entity, EntityDescription, Globe, Scene, Camera } from 'resium';
import {
    Cartesian3,
    Color,
    ScreenSpaceEventHandler,
    ScreenSpaceEventType,
    defined,
    PinBuilder,
    HeightReference,
    Cartographic,
    Math as CesiumMath
} from 'cesium';
import axios from 'axios';
import PollutionLegend from './PollutionLegend';
import TimeSlider from './TimeSlider';

// Add window type extension for Cesium
declare global {
    interface Window {
        CESIUM_BASE_URL: string;
    }
}

// Define the GeoJSON Feature and FeatureCollection interfaces
export interface PollutionProperties {
    pm25: number;
    source: string;
    id: string;
    timestamp?: string;
}

export interface GeoJSONFeature {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    properties: PollutionProperties;
}

export interface GeoJSONFeatureCollection {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
}

const EarthGlobe = () => {
    const [pollutionData, setPollutionData] = useState<GeoJSONFeature[]>([]);
    const [selectedPoint, setSelectedPoint] = useState<GeoJSONFeature | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState(7); // Default: 7 days
    const viewerRef = useRef<any>(null);

    // Function to determine color based on PM2.5 value
    const getPollutionColor = (pm25: number) => {
        if (pm25 > 150) return Color.RED;
        if (pm25 > 50) return Color.YELLOW;
        return Color.GREEN;
    };

    // Initialize Cesium
    useEffect(() => {
        window.CESIUM_BASE_URL = '/cesium/';
    }, []);

    // Fetch pollution data from the API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // For development/MVP, use mock endpoint
                const response = await axios.get<GeoJSONFeatureCollection>('/api/pollution/mock');
                setPollutionData(response.data.features);
            } catch (err) {
                setError('Failed to load pollution data');
                console.error('Error fetching pollution data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    // Use a simpler approach without some of the problematic Cesium components
    return (
        <div className="relative w-full h-screen-90">
            {error && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg z-20">
                    {error}
                </div>
            )}

            <div id="cesiumContainer" className="w-full h-full">
                {/* Temporarily replace the complex Cesium implementation with a placeholder */}
                <div className="flex items-center justify-center h-full bg-slate-800 text-white">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">3D Globe Visualization Temporarily Unavailable</h2>
                        <p className="mb-4">We're experiencing some technical issues with the 3D globe.</p>
                        <p>Please try the 2D view by clicking the toggle button in the top left.</p>
                    </div>
                </div>
            </div>

            {/* Pollution color legend */}
            <PollutionLegend />

            {/* Time range slider */}
            <TimeSlider value={timeRange} onChange={setTimeRange} />
        </div>
    );
};

export default EarthGlobe; 