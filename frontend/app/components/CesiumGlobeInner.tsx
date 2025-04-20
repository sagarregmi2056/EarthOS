"use client";

import React, { useEffect, useRef, useState } from 'react';
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

// Create a wrapper for safe Cesium loading
let Cesium: any = null;
let Ion: any = null;
let Cartesian3: any = null;
let Color: any = null;
let Viewer: any = null;

const CesiumGlobeInner = ({
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
    const [viewer, setViewer] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Add required Cesium scripts
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Add window global for Cesium assets - use CDN instead
        (window as any).CESIUM_BASE_URL = 'https://cesium.com/downloads/cesiumjs/releases/1.95/Build/Cesium/';

        // Add script tag for Cesium Worker
        const addCesiumScript = () => {
            // Check if script already exists
            if (document.querySelector('script[src="https://cesium.com/downloads/cesiumjs/releases/1.95/Build/Cesium/Cesium.js"]')) {
                setScriptLoaded(true);
                return;
            }

            // Create script tag for main Cesium library
            const script = document.createElement('script');
            script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.95/Build/Cesium/Cesium.js';
            script.async = true;
            script.onload = () => {
                console.log('Cesium script loaded successfully');
                setScriptLoaded(true);
            };
            script.onerror = (err) => {
                console.error('Failed to load Cesium script:', err);
                setError('Failed to load required Cesium resources');
            };
            document.head.appendChild(script);
        };

        // Add CSS for Cesium
        const addCesiumCSS = () => {
            // Check if CSS link already exists
            if (document.querySelector('link[href="https://cesium.com/downloads/cesiumjs/releases/1.95/Build/Cesium/Widgets/widgets.css"]')) {
                return;
            }

            const linkElement = document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.href = 'https://cesium.com/downloads/cesiumjs/releases/1.95/Build/Cesium/Widgets/widgets.css';
            document.head.appendChild(linkElement);
        };

        addCesiumCSS();
        addCesiumScript();
    }, []);

    // Load Cesium module
    useEffect(() => {
        const loadCesium = async () => {
            try {
                // Only execute in browser and after scripts are loaded
                if (typeof window === 'undefined') return;

                // Skip if already initialized or errored
                if (Cesium !== null || error) return;

                setIsInitializing(true);

                // Check if Cesium is available globally from CDN
                if (scriptLoaded && (window as any).Cesium) {
                    console.log('Using global Cesium from CDN');
                    Cesium = (window as any).Cesium;
                    Ion = Cesium.Ion;
                    Cartesian3 = Cesium.Cartesian3;
                    Color = Cesium.Color;
                    Viewer = Cesium.Viewer;

                    // Set token
                    Ion.defaultAccessToken = accessToken ||
                        process.env.NEXT_PUBLIC_CESIUM_TOKEN ||
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyMjY0NjQ5NH0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk';

                    setIsInitializing(false);
                    console.log('Cesium loaded successfully from CDN');
                    return;
                }

                // Dynamically import Cesium as fallback
                try {
                    // Add a small delay to ensure scripts are loaded
                    if (!scriptLoaded) {
                        setTimeout(() => loadCesium(), 500);
                        return;
                    }

                    // Try to use the npm package as fallback
                    const cesiumModule = await import('cesium');
                    Cesium = cesiumModule;
                    Ion = cesiumModule.Ion;
                    Cartesian3 = cesiumModule.Cartesian3;
                    Color = cesiumModule.Color;
                    Viewer = cesiumModule.Viewer;

                    // Set token
                    Ion.defaultAccessToken = accessToken ||
                        process.env.NEXT_PUBLIC_CESIUM_TOKEN ||
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyMjY0NjQ5NH0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk';

                    setIsInitializing(false);
                    console.log('Cesium loaded successfully from npm');
                } catch (err) {
                    console.error("Failed to load Cesium:", err);
                    setError("Failed to load Cesium library");
                    setIsInitializing(false);
                }
            } catch (err) {
                console.error("Error in Cesium initialization:", err);
                setError("Error initializing 3D globe");
                setIsInitializing(false);
            }
        };

        loadCesium();
    }, [accessToken, error, scriptLoaded]);

    // Initialize Cesium viewer after module is loaded
    useEffect(() => {
        if (isInitializing || !cesiumContainer.current || viewer || error || !Cesium) {
            return;
        }

        // Create viewer with basic settings
        try {
            console.log('Initializing Cesium viewer');

            // Create a try-catch wrapped version of the viewer
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
                useBrowserRecommendedResolution: true,
                requestRenderMode: true,
                maximumRenderTimeChange: Infinity,
                scene3DOnly: true, // Force 3D only mode for better performance
                imageryProvider: false as any, // Start with no imagery provider
                mapProjection: new Cesium.WebMercatorProjection() // Ensure proper projection
            });

            // Add Cesium ION imagery after viewer is created
            try {
                const imageryProvider = new Cesium.IonImageryProvider({
                    assetId: 3,  // Cesium World Imagery
                });
                cesiumViewer.imageryLayers.addImageryProvider(imageryProvider);
            } catch (imageryErr) {
                console.error("Error adding imagery:", imageryErr);
                // Continue without imagery if it fails
            }

            // Position camera to view Earth from a distance - wrapped in try-catch
            try {
                cesiumViewer.camera.flyTo({
                    destination: Cartesian3.fromDegrees(0, 0, 20000000),
                    orientation: {
                        heading: 0.0,
                        pitch: -Math.PI / 2,
                        roll: 0.0,
                    },
                });
            } catch (cameraErr) {
                console.error("Error setting camera position:", cameraErr);
                // Continue even if camera positioning fails
            }

            setViewer(cesiumViewer);
            setIsLoaded(true);
            console.log('Cesium viewer created successfully');

            // Cleanup function
            return () => {
                if (cesiumViewer) {
                    try {
                        if (!cesiumViewer.isDestroyed()) {
                            cesiumViewer.destroy();
                        }
                    } catch (err) {
                        console.error("Error destroying Cesium viewer:", err);
                    }
                    setViewer(null);
                }
            };
        } catch (err) {
            console.error("Error initializing Cesium viewer:", err);
            setError("Failed to initialize 3D globe viewer");
        }
    }, [isInitializing, error]);

    // Register custom materials once
    useEffect(() => {
        if (!viewer || !isLoaded || !Cesium) return;

        try {
            // Safely define the pulsing effect material
            const registerMaterials = () => {
                if (!Cesium.Material.PulsingEffectMaterial) {
                    Cesium.Material.PulsingEffectMaterial = 'PulsingEffectMaterial';
                    Cesium.Material.PulsingEffectType = 'PulsingEffect';

                    Cesium.Material.PulsingEffectSource = `
                        uniform vec4 color;
                        uniform float speed;
                        
                        czm_material czm_getMaterial(czm_materialInput materialInput) {
                            czm_material material = czm_getDefaultMaterial(materialInput);
                            
                            float t = fract(czm_frameNumber * speed / 1000.0);
                            float pulse = 1.0 - 0.5 * (1.0 + cos(t * 3.14159 * 2.0));
                            
                            float distance = length(materialInput.st - 0.5);
                            float alpha = color.a * (1.0 - smoothstep(0.0, 0.5, distance)) * pulse;
                            
                            material.diffuse = color.rgb;
                            material.alpha = alpha;
                            
                            return material;
                        }
                    `;

                    // Safely register the material
                    if (Cesium.Material._materialCache &&
                        typeof Cesium.Material._materialCache.addMaterial === 'function') {
                        Cesium.Material._materialCache.addMaterial(Cesium.Material.PulsingEffectType, {
                            fabric: {
                                type: Cesium.Material.PulsingEffectType,
                                uniforms: {
                                    color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
                                    speed: 1.0
                                },
                                source: Cesium.Material.PulsingEffectSource
                            },
                            translucent: function () {
                                return true;
                            }
                        });
                    }
                }
            };

            // Try to register materials
            registerMaterials();
        } catch (err) {
            console.error("Error registering custom Cesium materials:", err);
            // Continue even if material registration fails
        }
    }, [viewer, isLoaded]);

    // Add data points when data or viewer changes
    useEffect(() => {
        if (!viewer || !isLoaded || !Cesium) return;

        try {
            // Safely handle entity additions
            const addEntities = () => {
                // Clear previous entities
                try {
                    viewer.entities.removeAll();
                } catch (clearErr) {
                    console.error("Error clearing entities:", clearErr);
                    return; // Exit if we can't even clear entities
                }

                // Use provided data or fallback to mock data
                const points = dataPoints.length ? dataPoints : [
                    { id: '1', name: 'New York', lat: 40.7128, lng: -74.0060, category: 'pollution' as const, value: 75, timestamp: new Date().toISOString() },
                    { id: '2', name: 'London', lat: 51.5074, lng: -0.1278, category: 'pollution' as const, value: 60, timestamp: new Date().toISOString() },
                    { id: '3', name: 'Delhi', lat: 28.6139, lng: 77.2090, category: 'pollution' as const, value: 90, timestamp: new Date().toISOString() }
                ];

                // Add each data point
                points.forEach((point) => {
                    try {
                        let pointColor = Color.WHITE;

                        switch (point.category) {
                            case 'pollution': pointColor = Color.RED; break;
                            case 'agriculture': pointColor = Color.GREEN; break;
                            case 'climate': pointColor = Color.BLUE; break;
                            case 'wildlife': pointColor = Color.YELLOW; break;
                            case 'citizen': pointColor = Color.MAGENTA; break;
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
                    } catch (pointErr) {
                        console.error(`Error adding data point ${point.id}:`, pointErr);
                        // Continue with next point
                    }
                });

                // Add node connections if enabled
                if (showNodeConnections && nodeConnections.length > 0) {
                    nodeConnections.forEach((connection) => {
                        try {
                            viewer.entities.add({
                                polyline: {
                                    positions: [
                                        Cartesian3.fromDegrees(connection.from.lng, connection.from.lat),
                                        Cartesian3.fromDegrees(connection.to.lng, connection.to.lat),
                                    ],
                                    width: 2 * connection.strength,
                                    material: new Cesium.PolylineGlowMaterialProperty({
                                        glowPower: 0.2,
                                        color: Color.CYAN.withAlpha(0.7 * connection.strength),
                                    }),
                                    arcType: Cesium.ArcType.GEODESIC,
                                }
                            });
                        } catch (connectionErr) {
                            console.error("Error adding connection:", connectionErr);
                            // Continue with next connection
                        }
                    });
                }
            };

            // Execute entity addition
            addEntities();
        } catch (err) {
            console.error("Error in entity management:", err);
            // Continue running even with entity errors
        }
    }, [viewer, isLoaded, dataPoints, nodeConnections, showNodeConnections]);

    return (
        <>
            {/* Error message overlay */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-20">
                    <div className="bg-red-900/80 text-white p-4 rounded-lg max-w-md text-center">
                        <h3 className="text-lg font-bold mb-2">Error Loading 3D Globe</h3>
                        <p>{error}</p>
                        <p className="mt-2 text-sm">Falling back to 2D view</p>
                    </div>
                </div>
            )}

            {/* Loading overlay */}
            {isInitializing && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-20">
                    <div className="flex flex-col items-center">
                        <div className="spinner mb-4"></div>
                        <p className="text-white text-sm">Loading 3D globe...</p>
                    </div>
                </div>
            )}

            {/* Debug info (comment out in production) */}
            {/* 
            <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 z-30 rounded">
                Initializing: {isInitializing ? 'Yes' : 'No'}<br/>
                Scripts Loaded: {scriptLoaded ? 'Yes' : 'No'}<br/>
                Cesium Loaded: {Cesium ? 'Yes' : 'No'}<br/>
                Viewer Created: {viewer ? 'Yes' : 'No'}<br/>
                Error: {error || 'None'}
            </div>
            */}

            {/* Cesium container */}
            <div
                ref={cesiumContainer}
                className="w-full h-full min-h-[500px]"
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
        </>
    );
};

export default CesiumGlobeInner; 