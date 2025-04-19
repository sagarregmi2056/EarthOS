"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Viewer, Ion, Cartesian3, Color } from 'cesium';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

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

// Extend Cesium Material for our custom types
declare module 'cesium' {
    namespace Material {
        let PulsingEffectMaterial: string;
        let PulsingEffectType: string;
        let PulsingEffectSource: string;
        const _materialCache: {
            addMaterial: (name: string, config: any) => void;
        };
    }
}

const CesiumGlobe = ({
    accessToken,
    dataPoints = [],
    nodeConnections = [],
    showNodeConnections = true
}: {
    accessToken?: string;
    dataPoints?: DataPoint[];
    nodeConnections?: NodeConnection[];
    showNodeConnections?: boolean;
}) => {
    const cesiumContainer = useRef<HTMLDivElement>(null);
    const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load Cesium access token
    useEffect(() => {
        // Use provided token, environment variable, or a default
        Ion.defaultAccessToken = accessToken ||
            process.env.NEXT_PUBLIC_CESIUM_TOKEN ||
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyMjY0NjQ5NH0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk';
    }, [accessToken]);

    // Initialize Cesium viewer
    useEffect(() => {
        if (!cesiumContainer.current || viewer) return;

        // Create viewer with basic settings
        try {
            const cesiumViewer = new Viewer(cesiumContainer.current, {
                shouldAnimate: true,
                baseLayerPicker: false,
                geocoder: false,
                homeButton: false,
                infoBox: false,
                sceneModePicker: false,
                selectionIndicator: false,
                timeline: false,
                animation: false,
                navigationHelpButton: false,
                fullscreenButton: false,
            });

            // Position camera to view Earth from a distance
            cesiumViewer.camera.flyTo({
                destination: Cartesian3.fromDegrees(0, 0, 20000000),
                orientation: {
                    heading: 0.0,
                    pitch: -Math.PI / 2,
                    roll: 0.0,
                },
            });

            setViewer(cesiumViewer);
            setIsLoaded(true);

            // Cleanup
            return () => {
                if (cesiumViewer && !cesiumViewer.isDestroyed()) {
                    cesiumViewer.destroy();
                    setViewer(null);
                }
            };
        } catch (error) {
            console.error("Error initializing Cesium viewer:", error);
        }
    }, []);

    // Register custom materials once
    useEffect(() => {
        if (!viewer) return;

        // Register a custom material for pulsing effect if not already defined
        // @ts-ignore - Cesium types don't include custom material properties
        if (!Cesium.Material.PulsingEffectMaterial) {
            // Define a custom material for pulsing effect
            // @ts-ignore - Cesium types don't include custom material properties
            Cesium.Material.PulsingEffectMaterial = 'PulsingEffectMaterial';
            // @ts-ignore - Cesium types don't include custom material properties
            Cesium.Material.PulsingEffectType = 'PulsingEffect';

            // @ts-ignore - Cesium types don't include custom material properties
            Cesium.Material.PulsingEffectSource = `
                uniform vec4 color;
                uniform float speed;
                
                czm_material czm_getMaterial(czm_materialInput materialInput) {
                    czm_material material = czm_getDefaultMaterial(materialInput);
                    
                    // Calculate pulse based on time
                    float t = fract(czm_frameNumber * speed / 1000.0);
                    float pulse = 1.0 - 0.5 * (1.0 + cos(t * 3.14159 * 2.0));
                    
                    // Adjust alpha based on pulse and distance from center
                    float distance = length(materialInput.st - 0.5);
                    float alpha = color.a * (1.0 - smoothstep(0.0, 0.5, distance)) * pulse;
                    
                    material.diffuse = color.rgb;
                    material.alpha = alpha;
                    
                    return material;
                }
            `;

            // Register the material
            // @ts-ignore - Cesium types don't include _materialCache
            Cesium.Material._materialCache.addMaterial(Cesium.Material.PulsingEffectType, {
                fabric: {
                    // @ts-ignore - Cesium types don't include custom material types
                    type: Cesium.Material.PulsingEffectType,
                    uniforms: {
                        color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
                        speed: 1.0
                    },
                    // @ts-ignore - Cesium types don't include custom material properties
                    source: Cesium.Material.PulsingEffectSource
                },
                // @ts-ignore - Parameter 'material' implicitly has an 'any' type
                translucent: function (material) {
                    return true;
                }
            });
        }
    }, [viewer]);

    // Add data points when data or viewer changes
    useEffect(() => {
        if (!viewer || !isLoaded || dataPoints.length === 0) return;

        // Clear previous entities
        viewer.entities.removeAll();

        // Mock data if none provided
        const mockPoints = dataPoints.length ? dataPoints : [
            { id: '1', name: 'New York', lat: 40.7128, lng: -74.0060, category: 'pollution' as const, value: 75, timestamp: new Date().toISOString() },
            { id: '2', name: 'London', lat: 51.5074, lng: -0.1278, category: 'pollution' as const, value: 60, timestamp: new Date().toISOString() },
            { id: '3', name: 'Delhi', lat: 28.6139, lng: 77.2090, category: 'pollution' as const, value: 90, timestamp: new Date().toISOString() }
        ];

        // Add data point entities
        mockPoints.forEach((point) => {
            // Choose color based on category
            let pointColor = Color.WHITE;

            switch (point.category) {
                case 'pollution':
                    pointColor = Color.RED;
                    break;
                case 'agriculture':
                    pointColor = Color.GREEN;
                    break;
                case 'climate':
                    pointColor = Color.BLUE;
                    break;
                case 'wildlife':
                    pointColor = Color.YELLOW;
                    break;
                case 'citizen':
                    pointColor = Color.MAGENTA;
                    break;
            }

            // Create point entity
            viewer.entities.add({
                id: point.id,
                name: point.name,
                position: Cartesian3.fromDegrees(point.lng, point.lat),
                point: {
                    pixelSize: 10 * (0.5 + (point.value / 100)),
                    color: pointColor,
                    outlineColor: Color.WHITE,
                    outlineWidth: 2,
                }
            });
        });

        // Add node connections if enabled
        if (showNodeConnections && nodeConnections.length > 0) {
            nodeConnections.forEach((connection) => {
                // Create polyline between connected nodes
                viewer.entities.add({
                    polyline: {
                        positions: [
                            Cartesian3.fromDegrees(connection.from.lng, connection.from.lat),
                            Cartesian3.fromDegrees(connection.to.lng, connection.to.lat),
                        ],
                        width: 2 * connection.strength, // Width based on connection strength
                        material: new Cesium.PolylineGlowMaterialProperty({
                            glowPower: 0.2,
                            color: Color.CYAN.withAlpha(0.7 * connection.strength),
                        }),
                        arcType: Cesium.ArcType.GEODESIC,
                    },
                });
            });
        }
    }, [viewer, isLoaded, dataPoints, nodeConnections, showNodeConnections]);

    return (
        <>
            <div
                ref={cesiumContainer}
                className="w-full h-full min-h-[500px]"
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Legend overlay */}
            <div className="absolute bottom-4 left-4 bg-slate-900/70 text-white p-3 rounded-lg backdrop-blur-sm text-sm z-10">
                <h4 className="font-medium">EarthOS Modules Visualization</h4>
                <div className="flex gap-3 mt-2">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>PolluTrack</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>AgriAI</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Climate</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CesiumGlobe; 