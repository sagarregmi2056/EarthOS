"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Define the type for OrbitControls
type OrbitControlsType = {
    new(camera: THREE.Camera, domElement: HTMLElement): {
        enableDamping: boolean;
        dampingFactor: number;
        rotateSpeed: number;
        enableZoom: boolean;
        autoRotate: boolean;
        autoRotateSpeed: number;
        update: () => void;
    }
};

// Define the type for child objects with userData
interface PulseObject extends THREE.Object3D {
    userData: {
        initialScale?: THREE.Vector3;
        [key: string]: any;
    };
}

const Globe3D = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current || typeof window === 'undefined') return;

        // Get DOM element dimensions
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        // Dynamically import OrbitControls
        let OrbitControls: OrbitControlsType | null = null;

        // Function to initialize the scene after OrbitControls is loaded
        const initScene = async () => {
            try {
                // Dynamically import OrbitControls at runtime
                const orbitControlsModule = await import('three/examples/jsm/controls/OrbitControls.js');
                OrbitControls = orbitControlsModule.OrbitControls as unknown as OrbitControlsType;
            } catch (error) {
                console.error("Failed to load OrbitControls:", error);
                // Fallback to a basic rotation without controls if import fails
                OrbitControls = null;
            }

            // Scene setup
            const scene = new THREE.Scene();
            scene.background = new THREE.Color('#0f172a'); // slate-900 in tailwind

            // Camera setup
            const camera = new THREE.PerspectiveCamera(
                75,
                width / height,
                0.1,
                2000
            );
            camera.position.z = 200;

            // Renderer setup
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(width, height);

            // Check again before appendChild (to satisfy TypeScript)
            if (!mountRef.current) return;
            mountRef.current.appendChild(renderer.domElement);

            // Create a simple spherical globe since we may not have texture images
            const globeGeometry = new THREE.SphereGeometry(100, 64, 64);

            // Use a basic material with a blue color if images aren't available
            const globeMaterial = new THREE.MeshPhongMaterial({
                color: 0x0077be, // Ocean blue
                shininess: 25,
                emissive: 0x000000,
                flatShading: false,
            });

            // Try to load textures if available
            const textureLoader = new THREE.TextureLoader();
            try {
                textureLoader.load(
                    '/earth-blue-marble.jpg',
                    // On successful load, update the material
                    (texture) => {
                        console.log('Earth texture loaded successfully');
                        globeMaterial.map = texture;
                        globeMaterial.needsUpdate = true;
                    },
                    // On progress
                    (xhr) => {
                        console.log(`Earth texture ${Math.floor(xhr.loaded / xhr.total * 100)}% loaded`);
                    },
                    // On error, fallback silently to blue material
                    (err) => {
                        console.error('Error loading Earth texture:', err);
                        // Try alternative URL if first one fails
                        textureLoader.load(
                            '/images/earth-blue-marble.jpg',
                            (texture) => {
                                globeMaterial.map = texture;
                                globeMaterial.needsUpdate = true;
                            },
                            undefined,
                            (err2) => console.error('Failed to load backup texture as well:', err2)
                        );
                    }
                );
            } catch (error) {
                console.error('Error in texture loading process:', error);
            }

            // Create globe mesh
            const globe = new THREE.Mesh(globeGeometry, globeMaterial);
            scene.add(globe);

            // Add ambient light
            const ambientLight = new THREE.AmbientLight(0x404040, 1);
            scene.add(ambientLight);

            // Add directional light (sun)
            const sunLight = new THREE.DirectionalLight(0xffffff, 1);
            sunLight.position.set(300, 100, 200);
            scene.add(sunLight);

            // Add atmosphere glow
            const atmosphereGeometry = new THREE.SphereGeometry(102, 64, 64);
            const atmosphereMaterial = new THREE.MeshBasicMaterial({
                color: 0x3498db,
                transparent: true,
                opacity: 0.1,
            });
            const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            scene.add(atmosphere);

            // Create a basic star point sprite
            const createStarSprite = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;

                const ctx = canvas.getContext('2d');
                if (!ctx) return null;

                // Draw a radial gradient for the star
                const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
                gradient.addColorStop(0.5, 'rgba(128, 128, 255, 0.4)');
                gradient.addColorStop(1, 'rgba(128, 128, 255, 0)');

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 32, 32);

                const texture = new THREE.CanvasTexture(canvas);
                return texture;
            };

            // Create star texture
            const starTexture = createStarSprite();

            // Background stars (distant tiny stars)
            const backgroundStarCount = 20000;
            const backgroundStarGeometry = new THREE.BufferGeometry();
            const backgroundStarPositions = new Float32Array(backgroundStarCount * 3);
            const backgroundStarSizes = new Float32Array(backgroundStarCount);
            const backgroundStarColors = new Float32Array(backgroundStarCount * 3);

            for (let i = 0; i < backgroundStarCount; i++) {
                const i3 = i * 3;
                // Place stars in a large sphere around the scene
                const radius = 1500;
                const phi = Math.acos(-1 + (2 * Math.random()));
                const theta = 2 * Math.PI * Math.random();

                backgroundStarPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
                backgroundStarPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                backgroundStarPositions[i3 + 2] = radius * Math.cos(phi);

                // Vary star sizes (smaller for background stars)
                backgroundStarSizes[i] = Math.random() * 0.8 + 0.2;

                // Vary star colors
                const colorChoice = Math.random();
                if (colorChoice > 0.95) {
                    // Blue-white hot stars (rare)
                    backgroundStarColors[i3] = 0.8;
                    backgroundStarColors[i3 + 1] = 0.9;
                    backgroundStarColors[i3 + 2] = 1.0;
                } else if (colorChoice > 0.8) {
                    // White stars
                    backgroundStarColors[i3] = 1.0;
                    backgroundStarColors[i3 + 1] = 1.0;
                    backgroundStarColors[i3 + 2] = 1.0;
                } else if (colorChoice > 0.5) {
                    // Yellow-white stars
                    backgroundStarColors[i3] = 1.0;
                    backgroundStarColors[i3 + 1] = 0.9;
                    backgroundStarColors[i3 + 2] = 0.7;
                } else {
                    // Reddish stars
                    backgroundStarColors[i3] = 1.0;
                    backgroundStarColors[i3 + 1] = 0.8;
                    backgroundStarColors[i3 + 2] = 0.6;
                }
            }

            backgroundStarGeometry.setAttribute('position', new THREE.BufferAttribute(backgroundStarPositions, 3));
            backgroundStarGeometry.setAttribute('size', new THREE.BufferAttribute(backgroundStarSizes, 1));
            backgroundStarGeometry.setAttribute('color', new THREE.BufferAttribute(backgroundStarColors, 3));

            const backgroundStarMaterial = new THREE.PointsMaterial({
                size: 1.5,
                sizeAttenuation: true,
                transparent: true,
                opacity: 0.8,
                vertexColors: true,
                blending: THREE.AdditiveBlending,
            });

            if (starTexture) {
                backgroundStarMaterial.map = starTexture;
            }

            const backgroundStars = new THREE.Points(backgroundStarGeometry, backgroundStarMaterial);
            scene.add(backgroundStars);

            // Create Milky Way galaxy
            const createMilkyWay = () => {
                // Create a spiral galaxy pattern
                const galaxyParticles = 150000;
                const galaxyGeometry = new THREE.BufferGeometry();
                const galaxyPositions = new Float32Array(galaxyParticles * 3);
                const galaxySizes = new Float32Array(galaxyParticles);
                const galaxyColors = new Float32Array(galaxyParticles * 3);

                // Galaxy parameters
                const arms = 5;
                const armWidth = 0.15;
                const revolutions = 2.2;
                const randomness = 0.18;
                const randomnessRadius = 0.8;
                const centerSize = 200;
                const galaxyRadius = 1200;
                const coreConcentration = 50000;

                // Core and arm colors
                const coreColor = new THREE.Color(0xffdb8c); // Golden yellow
                const armColors = [
                    new THREE.Color(0xc8e3ff), // Blue-white
                    new THREE.Color(0xffddc8), // Orange-white
                    new THREE.Color(0xe5c8ff), // Purple-white
                    new THREE.Color(0xc8ffdb), // Green-white
                    new THREE.Color(0xf2f2f2)  // Pure white
                ];

                let vertexIdx = 0;

                // Create dense galactic core
                for (let i = 0; i < coreConcentration; i++) {
                    const i3 = vertexIdx * 3;
                    const distance = Math.random() * centerSize;
                    const angle = Math.random() * Math.PI * 2;

                    // Create disk-like distribution
                    const x = Math.cos(angle) * distance;
                    const z = Math.sin(angle) * distance;
                    const y = (Math.random() - 0.5) * centerSize * 0.1; // Flatter in the center

                    galaxyPositions[i3] = x;
                    galaxyPositions[i3 + 1] = y;
                    galaxyPositions[i3 + 2] = z;

                    // Size based on distance from center
                    galaxySizes[vertexIdx] = Math.max(0.8, 2.5 * (1 - distance / centerSize) + Math.random() * 0.5);

                    // Core has yellow-white color
                    const colorFactor = Math.random() * 0.3 + 0.7; // 0.7-1.0 brightness variation
                    galaxyColors[i3] = coreColor.r * colorFactor;
                    galaxyColors[i3 + 1] = coreColor.g * colorFactor;
                    galaxyColors[i3 + 2] = coreColor.b * colorFactor;

                    vertexIdx++;
                }

                // Create spiral arms
                for (let i = vertexIdx; i < galaxyParticles; i++) {
                    const i3 = i * 3;
                    const armIndex = Math.floor(Math.random() * arms);
                    const arm = armIndex / arms;

                    // Randomized distance from center
                    const distanceFromCenter = centerSize + Math.random() * (galaxyRadius - centerSize);
                    const distanceFactor = (distanceFromCenter - centerSize) / (galaxyRadius - centerSize);

                    // Spiral equation: r = a*e^(b*theta)
                    // Start with arm's base angle, then add spiral rotation based on distance
                    const rotation = distanceFactor * revolutions * Math.PI * 2;
                    const angle = arm * Math.PI * 2 + rotation;

                    // Add some randomness to angle based on distance
                    const randomAngle = (Math.random() - 0.5) * armWidth * (1 + distanceFactor);
                    const finalAngle = angle + randomAngle;

                    // Calculate position
                    const x = Math.cos(finalAngle) * distanceFromCenter;
                    const z = Math.sin(finalAngle) * distanceFromCenter;

                    // Add vertical scatter (thinner at edges)
                    const yScatter = (1 - distanceFactor * 0.9) * centerSize * 0.1;
                    const y = (Math.random() - 0.5) * yScatter;

                    // Add radial scatter
                    const radialScatter = distanceFromCenter * randomnessRadius * randomness;
                    const scatterX = (Math.random() - 0.5) * radialScatter;
                    const scatterZ = (Math.random() - 0.5) * radialScatter;

                    galaxyPositions[i3] = x + scatterX;
                    galaxyPositions[i3 + 1] = y;
                    galaxyPositions[i3 + 2] = z + scatterZ;

                    // Star size decreases with distance from center
                    const sizeFactor = Math.max(0.1, 1 - distanceFactor * 0.8);
                    galaxySizes[i] = (Math.random() * 0.5 + 0.5) * sizeFactor;

                    // Get arm color
                    const color = armColors[armIndex];

                    // Add slight color variation
                    const colorVariation = Math.random() * 0.2 + 0.8; // 0.8-1.0 brightness
                    galaxyColors[i3] = color.r * colorVariation;
                    galaxyColors[i3 + 1] = color.g * colorVariation;
                    galaxyColors[i3 + 2] = color.b * colorVariation;
                }

                galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
                galaxyGeometry.setAttribute('size', new THREE.BufferAttribute(galaxySizes, 1));
                galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));

                const galaxyMaterial = new THREE.PointsMaterial({
                    size: 2.5,
                    sizeAttenuation: true,
                    transparent: true,
                    depthWrite: false,
                    opacity: 0.9,
                    vertexColors: true,
                    blending: THREE.AdditiveBlending
                });

                if (starTexture) {
                    galaxyMaterial.map = starTexture;
                }

                const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);

                // Position and rotate the galaxy
                galaxy.position.z = -700;  // Push it behind the Earth
                galaxy.position.x = 300;   // Offset to the side
                galaxy.position.y = -200;  // Offset down a bit
                galaxy.rotation.x = Math.PI / 5; // Tilt to show the spiral
                galaxy.rotation.y = Math.PI / 4; // Rotate to view from an angle

                return { galaxy, geometry: galaxyGeometry, material: galaxyMaterial };
            };

            const { galaxy, geometry: galaxyGeometry, material: galaxyMaterial } = createMilkyWay();
            scene.add(galaxy);

            // Add OrbitControls if available
            let controls = null;
            if (OrbitControls) {
                controls = new OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;
                controls.dampingFactor = 0.05;
                controls.rotateSpeed = 0.5;
                controls.enableZoom = false;
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.5;
            }

            // Add data points (mock pollution centers)
            const pollutionData = [
                { lat: 40.7128, lng: -74.0060, size: 5, color: 0xff0000 }, // New York
                { lat: 51.5074, lng: -0.1278, size: 3, color: 0xff7700 },  // London
                { lat: 39.9042, lng: 116.4074, size: 8, color: 0xff0000 }, // Beijing
                { lat: 28.6139, lng: 77.2090, size: 7, color: 0xff0000 },  // Delhi
                { lat: 35.6762, lng: 139.6503, size: 4, color: 0xff7700 }, // Tokyo
                { lat: -23.5505, lng: -46.6333, size: 5, color: 0xff7700 }, // São Paulo
                { lat: 19.4326, lng: -99.1332, size: 6, color: 0xff0000 }, // Mexico City
                { lat: 37.7749, lng: -122.4194, size: 2, color: 0x00ff00 }, // San Francisco
                { lat: -33.8688, lng: 151.2093, size: 2, color: 0x00ff00 }, // Sydney
                { lat: 55.7558, lng: 37.6173, size: 4, color: 0xff7700 }   // Moscow
            ];

            // Convert lat/lng to 3D position
            pollutionData.forEach(point => {
                const lat = point.lat * Math.PI / 180;
                const lng = -point.lng * Math.PI / 180;
                const radius = 102;

                const x = radius * Math.cos(lat) * Math.cos(lng);
                const y = radius * Math.sin(lat);
                const z = radius * Math.cos(lat) * Math.sin(lng);

                // Create point
                const pointGeometry = new THREE.SphereGeometry(point.size / 10, 16, 16);
                const pointMaterial = new THREE.MeshBasicMaterial({ color: point.color });
                const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);

                pointMesh.position.set(x, y, z);
                scene.add(pointMesh);

                // Add pulsating effect
                const pulse = new THREE.Mesh(
                    new THREE.SphereGeometry(point.size / 5, 16, 16),
                    new THREE.MeshBasicMaterial({
                        color: point.color,
                        transparent: true,
                        opacity: 0.3
                    })
                ) as PulseObject;

                pulse.position.set(x, y, z);
                scene.add(pulse);

                // Store initial scale for animation
                pulse.userData = { initialScale: pulse.scale.clone() };
            });

            // Handle window resize
            const handleResize = () => {
                if (!mountRef.current) return;

                const newWidth = mountRef.current.clientWidth;
                const newHeight = mountRef.current.clientHeight;

                camera.aspect = newWidth / newHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(newWidth, newHeight);
            };

            window.addEventListener('resize', handleResize);

            // Animation function
            let frameId: number;
            const animate = () => {
                frameId = requestAnimationFrame(animate);

                // Slowly rotate the globe
                globe.rotation.y += 0.001;
                atmosphere.rotation.y += 0.001;

                // Very slowly rotate the galaxy
                if (galaxy) {
                    galaxy.rotation.z += 0.0001;
                }

                // Very slowly rotate the background stars in different direction
                if (backgroundStars) {
                    backgroundStars.rotation.y += 0.00005;
                    backgroundStars.rotation.x += 0.00002;
                }

                // Animate pulse
                scene.children.forEach((child: THREE.Object3D) => {
                    const typedChild = child as PulseObject;
                    if (typedChild.userData && typedChild.userData.initialScale) {
                        const scale = 1 + 0.2 * Math.sin(Date.now() * 0.003);
                        typedChild.scale.set(scale, scale, scale);
                    }
                });

                // Update controls if available
                if (controls) {
                    controls.update();
                }

                renderer.render(scene, camera);
            };

            animate();

            // Cleanup function
            return () => {
                window.removeEventListener('resize', handleResize);
                cancelAnimationFrame(frameId);
                if (mountRef.current) {
                    mountRef.current.removeChild(renderer.domElement);
                }

                // Dispose resources
                globeGeometry.dispose();
                globeMaterial.dispose();
                atmosphereGeometry.dispose();
                atmosphereMaterial.dispose();

                if (starTexture) {
                    starTexture.dispose();
                }

                if (backgroundStars) {
                    backgroundStarGeometry.dispose();
                    if (backgroundStars.material instanceof THREE.Material) {
                        backgroundStars.material.dispose();
                    }
                }

                if (galaxy) {
                    galaxyGeometry.dispose();
                    if (galaxyMaterial) {
                        galaxyMaterial.dispose();
                    }
                }

                renderer.dispose();
            };
        };

        // Initialize the scene
        let cleanup: (() => void) | undefined;
        initScene().then(cleanupFn => {
            if (cleanupFn) cleanup = cleanupFn;
        });

        // Return cleanup function
        return () => {
            if (cleanup) cleanup();
        };
    }, []);

    return <div ref={mountRef} className="w-full h-full min-h-[500px]" />;
};

export default Globe3D; 