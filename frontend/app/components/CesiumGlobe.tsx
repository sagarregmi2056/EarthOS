"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Ion, Viewer, Entity, Cartesian3, Color } from 'cesium';
import * as Cesium from 'cesium';

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
        // Use provided token or a default (if you have one)
        Ion.defaultAccessToken = accessToken ||
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyMjY0NjQ5NH0.XcKpgANiY19MC4bdFUXMVEBToBmqS8kuYpUlxJHYZxk';
    }, [accessToken]);

    // Initialize Cesium viewer
    useEffect(() => {
        if (!cesiumContainer.current || viewer) return;

        // Initialize terrain asynchronously (to be added after viewer creation)
        const initTerrainPromise = Cesium.createWorldTerrainAsync();

        // Create viewer with minimal configuration to avoid type errors
        // @ts-ignore - We need to use ts-ignore due to type inconsistencies between Cesium and TypeScript
        const cesiumViewer = new Viewer(cesiumContainer.current, {
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

        // Add default imagery layer after initialization to avoid TypeScript errors
        // @ts-ignore - Using ts-ignore for Cesium API compatibility
        cesiumViewer.imageryLayers.addImageryProvider(
            // @ts-ignore - Using ts-ignore for Cesium API compatibility
            new Cesium.TileMapServiceImageryProvider({
                // @ts-ignore - Using ts-ignore for Cesium API compatibility
                url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
            })
        );

        // Add terrain asynchronously after viewer is created
        initTerrainPromise.then(terrainProvider => {
            // @ts-ignore - Using ts-ignore for Cesium API compatibility
            cesiumViewer.terrainProvider = terrainProvider;
        });

        // Try to add ion imagery if needed
        try {
            // Replace default imagery with ion imagery
            // @ts-ignore - Using ts-ignore for Cesium API compatibility
            cesiumViewer.imageryLayers.addImageryProvider(
                // @ts-ignore - Using ts-ignore for Cesium API compatibility
                new Cesium.IonImageryProvider({ assetId: 3 }) // Sentinel-2 imagery
            );
        } catch (error) {
            console.error('Failed to load ion imagery:', error);
        }

        // Configure the scene for better visuals
        // @ts-ignore - Using ts-ignore for Cesium API compatibility
        cesiumViewer.scene.globe.enableLighting = true;
        // @ts-ignore - Using ts-ignore for Cesium API compatibility
        cesiumViewer.scene.globe.showGroundAtmosphere = true;
        // @ts-ignore - Using ts-ignore for Cesium API compatibility
        cesiumViewer.scene.highDynamicRange = true;

        // Add sky atmosphere manually
        // @ts-ignore - Using ts-ignore for Cesium API compatibility
        cesiumViewer.scene.skyAtmosphere = new Cesium.SkyAtmosphere();

        // Configure atmosphere settings if available
        // @ts-ignore - Using ts-ignore for Cesium API compatibility
        if (cesiumViewer.scene.skyAtmosphere) {
            // @ts-ignore - Using ts-ignore for Cesium API compatibility
            cesiumViewer.scene.skyAtmosphere.hueShift = 0.0;
            // @ts-ignore - Using ts-ignore for Cesium API compatibility
            cesiumViewer.scene.skyAtmosphere.saturationShift = 0.1;
            // @ts-ignore - Using ts-ignore for Cesium API compatibility
            cesiumViewer.scene.skyAtmosphere.brightnessShift = 0.1;
        }

        // Position camera to view Earth
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

        // Add data point entities
        dataPoints.forEach((point) => {
            // Choose color based on category
            let pointColor = Color.WHITE;
            let pointScale = 1.0;

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

            // Scale by value (normalize between 0.5 and 2)
            pointScale = 0.5 + (point.value / 100) * 1.5;

            // Create point entity
            viewer.entities.add({
                id: point.id,
                name: point.name,
                position: Cartesian3.fromDegrees(point.lng, point.lat),
                point: {
                    pixelSize: 10 * pointScale,
                    color: pointColor,
                    outlineColor: Color.WHITE,
                    outlineWidth: 2,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY, // Always show on top
                },
                billboard: {
                    image: undefined, // Can add custom icons later
                    scale: 1.0,
                },
            });

            // Add pulsing effect ring using our custom material
            viewer.entities.add({
                position: Cartesian3.fromDegrees(point.lng, point.lat),
                ellipse: {
                    semiMinorAxis: 100000, // 100km
                    semiMajorAxis: 100000,
                    // @ts-ignore - Cesium Material is not assignable to MaterialProperty
                    material: new Cesium.Material({
                        fabric: {
                            // @ts-ignore - Cesium types don't include custom material types
                            type: Cesium.Material.PulsingEffectType,
                            uniforms: {
                                color: pointColor.withAlpha(0.3),
                                speed: 1.0 + Math.random() * 0.5
                            }
                        }
                    })
                },
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

            {/* This component would need Cesium initialized in a global context */}
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