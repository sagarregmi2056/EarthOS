"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from './LoadingSpinner';

// Import CesiumGlobe with dynamic import to avoid SSR issues
const CesiumGlobe = dynamic(
    () => import('./CesiumGlobe'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                <LoadingSpinner size="lg" message="Initializing 3D Globe..." />
            </div>
        )
    }
);

// Define GeoJSON interfaces
export interface GeoJSONGeometry {
    type: string;
    coordinates: number[];
}

export interface PollutionProperties {
    pm25: number;
    source: string;
    id: string;
    timestamp?: string;
}

export interface GeoJSONFeature {
    type: string;
    geometry: GeoJSONGeometry;
    properties: PollutionProperties;
}

export interface GeoJSONFeatureCollection {
    type: string;
    features: GeoJSONFeature[];
}

// Define the DataPoint interface for Cesium
export interface DataPoint {
    id: string;
    name: string;
    lat: number;
    lng: number;
    category: 'pollution' | 'agriculture' | 'climate' | 'wildlife' | 'citizen';
    value: number;
    timestamp: string;
}

// Convert GeoJSON features to data points for Cesium
const convertToDataPoints = (features: GeoJSONFeature[]): DataPoint[] => {
    return features.map(feature => {
        const coords = feature.geometry.coordinates;
        const pm25 = feature.properties.pm25;

        // Map PM2.5 values to categories and intensity
        let category: 'pollution' | 'agriculture' | 'climate' = 'pollution';

        // Determine color based on PM2.5 levels
        if (pm25 <= 12) {
            category = 'agriculture'; // Use green
        } else if (pm25 <= 35.4) {
            category = 'climate'; // Use blue
        } else {
            category = 'pollution'; // Use red
        }

        return {
            id: feature.properties.id,
            name: `PM2.5: ${pm25}`,
            lat: coords[1],
            lng: coords[0],
            category,
            value: pm25,
            timestamp: feature.properties.timestamp || new Date().toISOString()
        };
    });
};

const EarthGlobe = ({
    pollutionData = [],
    onPointSelected = () => { }
}: {
    pollutionData?: GeoJSONFeature[],
    onPointSelected?: (feature: GeoJSONFeature) => void
}) => {
    const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);

    // Convert GeoJSON to Cesium data points
    useEffect(() => {
        if (pollutionData && pollutionData.length > 0) {
            setDataPoints(convertToDataPoints(pollutionData));
        }
    }, [pollutionData]);

    return (
        <div className="w-full h-full relative">
            <CesiumGlobe
                dataPoints={dataPoints}
                showNodeConnections={false}
            />
        </div>
    );
};

export default EarthGlobe; 