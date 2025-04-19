"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJSONFeature } from './EarthGlobe';

interface LeafletMapProps {
    pollutionData: GeoJSONFeature[];
    onPointSelected: (feature: GeoJSONFeature) => void;
}

// Create a simple map component that doesn't use hooks
const LeafletMap: React.FC<LeafletMapProps> = ({ pollutionData, onPointSelected }) => {
    // Add inline styles to ensure map container is visible
    const mapContainerStyle = {
        height: '100%',
        width: '100%',
        zIndex: 1
    };

    // Wrap the map in a div for positioning
    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            {/* Use a simple MapContainer without Leaflet specific configuration */}
            <div className="h-full w-full">
                {typeof window !== 'undefined' && (
                    <MapContainer
                        center={[20, 0]}
                        zoom={2}
                        style={mapContainerStyle}
                        attributionControl={true}
                        zoomControl={true}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {pollutionData && pollutionData.length > 0 && pollutionData.map((feature: GeoJSONFeature) => {
                            if (!feature || !feature.geometry || !feature.geometry.coordinates) {
                                return null;
                            }

                            const [longitude, latitude] = feature.geometry.coordinates;
                            const pm25 = feature.properties.pm25;

                            // Determine color based on PM2.5 value
                            let color = '#16a34a'; // green for good
                            if (pm25 > 150) color = '#dc2626'; // red for hazardous
                            else if (pm25 > 50) color = '#ca8a04'; // yellow for moderate

                            return (
                                <CircleMarker
                                    key={feature.properties.id}
                                    center={[latitude, longitude]}
                                    radius={5 + (pm25 / 30)} // Size based on pollution level
                                    pathOptions={{
                                        color,
                                        fillColor: color,
                                        fillOpacity: 0.7,
                                        weight: 2
                                    }}
                                    eventHandlers={{
                                        click: () => onPointSelected(feature)
                                    }}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h3 className="font-bold text-lg">Pollution Reading</h3>
                                            <p><strong>PM2.5:</strong> {pm25} µg/m³</p>
                                            <p><strong>Location:</strong> {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
                                            <p><strong>Source:</strong> {feature.properties.source}</p>
                                            <p><strong>Health Impact:</strong> {
                                                pm25 > 150 ? 'Hazardous' :
                                                    pm25 > 100 ? 'Unhealthy' :
                                                        pm25 > 50 ? 'Moderate' :
                                                            'Good'
                                            }</p>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>
                )}
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-5 left-5 bg-black bg-opacity-70 text-white p-3 rounded-lg z-10">
                <h3 className="font-bold mb-2">PM2.5 Levels</h3>
                <div className="flex items-center mb-1">
                    <div className="w-4 h-4 bg-red-600 rounded-full mr-2"></div>
                    <span>Hazardous (&gt;150)</span>
                </div>
                <div className="flex items-center mb-1">
                    <div className="w-4 h-4 bg-yellow-600 rounded-full mr-2"></div>
                    <span>Moderate (50-150)</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full mr-2"></div>
                    <span>Good (&lt;50)</span>
                </div>
            </div>
        </div>
    );
};

export default LeafletMap;
