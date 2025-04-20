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

            // Add stars with varying sizes and brightness
            const starGeometry = new THREE.BufferGeometry();
            const starCount = 8000;
            const starPositions = [];
            const starSizes = [];
            const starColors = [];

            for (let i = 0; i < starCount; i++) {
                const x = (Math.random() - 0.5) * 2000;
                const y = (Math.random() - 0.5) * 2000;
                const z = (Math.random() - 0.5) * 2000;
                starPositions.push(x, y, z);

                // Vary star sizes between 0.5 and 2
                const size = Math.random() * 1.5 + 0.5;
                starSizes.push(size);

                // Vary star colors from blue-white to yellow-white
                const color = new THREE.Color();
                const temperature = Math.random();
                if (temperature > 0.95) {
                    // Blue-white hot stars (rare)
                    color.setRGB(0.8, 0.9, 1);
                } else if (temperature > 0.8) {
                    // White stars
                    color.setRGB(1, 1, 1);
                } else if (temperature > 0.5) {
                    // Yellow-white stars
                    color.setRGB(1, 0.9, 0.7);
                } else {
                    // Reddish stars
                    color.setRGB(1, 0.8, 0.6);
                }
                starColors.push(color.r, color.g, color.b);
            }

            starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
            starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
            starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

            // Custom shader material for stars with varying sizes and colors
            const starMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    pointTexture: { value: new THREE.TextureLoader().load('/images/star.png', () => { }, () => { }) }
                },
                vertexShader: `
                    attribute float size;
                    attribute vec3 color;
                    varying vec3 vColor;
                    void main() {
                        vColor = color;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = size * (300.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform sampler2D pointTexture;
                    varying vec3 vColor;
                    void main() {
                        gl_FragColor = vec4(vColor, 1.0);
                        gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
                    }
                `,
                blending: THREE.AdditiveBlending,
                depthTest: true,
                transparent: true,
                vertexColors: true
            });

            const stars = new THREE.Points(starGeometry, starMaterial);
            scene.add(stars);

            // Add Milky Way galaxy effect
            const galaxyGeometry = new THREE.BufferGeometry();
            const galaxyParticles = 100000;
            const galaxyPositions = [];
            const galaxySizes = [];
            const galaxyColors = [];
            const galaxySpiral = 5; // Number of spiral arms

            for (let i = 0; i < galaxyParticles; i++) {
                // Create spiral galaxy pattern
                const armAngle = (i % galaxySpiral) * Math.PI * 2 / galaxySpiral;
                const randomRadius = Math.pow(Math.random(), 0.5) * 800 + 400; // Between 400 and 1200
                const spinAngle = randomRadius * 0.0005; // Tighter spiral for larger radius
                const finalAngle = armAngle + spinAngle;

                const x = Math.cos(finalAngle) * randomRadius;
                const z = Math.sin(finalAngle) * randomRadius;

                // Add some height variation for the galaxy (thinner at edges)
                const heightVariation = (1 - randomRadius / 1200) * 60; // Thinner at edges
                const y = (Math.random() - 0.5) * heightVariation;

                // Add random scatter around the spiral arms
                const scatter = 40 + (randomRadius * 0.1);
                const scatterX = (Math.random() - 0.5) * scatter;
                const scatterZ = (Math.random() - 0.5) * scatter;

                galaxyPositions.push(x + scatterX, y, z + scatterZ);

                // Center of galaxy has more larger/brighter stars
                const distanceFromCenter = Math.sqrt(x * x + z * z);
                const sizeBasedOnPosition = Math.max(0.1, 1.2 - distanceFromCenter / 1200);
                const size = Math.random() * sizeBasedOnPosition + 0.2;
                galaxySizes.push(size);

                // Color varies by distance from center and which arm
                const color = new THREE.Color();
                const armIndex = i % galaxySpiral;

                // Core is more yellowish-white, edges more blue-purplish
                if (distanceFromCenter < 500) {
                    // Core - whiter/yellowish
                    const mix = distanceFromCenter / 500;
                    color.setRGB(
                        0.9 + mix * 0.1,
                        0.9,
                        0.7 + mix * 0.3
                    );
                } else {
                    // Arms - more blue/purple tints in different arms
                    switch (armIndex) {
                        case 0: color.setRGB(0.8, 0.8, 1.0); break; // Blueish
                        case 1: color.setRGB(1.0, 0.8, 1.0); break; // Purplish
                        case 2: color.setRGB(0.8, 0.9, 1.0); break; // Light blue
                        case 3: color.setRGB(0.9, 0.8, 0.9); break; // Light purple
                        default: color.setRGB(0.9, 0.9, 1.0); break; // Light blue-white
                    }
                }

                galaxyColors.push(color.r, color.g, color.b);
            }

            galaxyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(galaxyPositions, 3));
            galaxyGeometry.setAttribute('size', new THREE.Float32BufferAttribute(galaxySizes, 1));
            galaxyGeometry.setAttribute('color', new THREE.Float32BufferAttribute(galaxyColors, 3));

            // Similar shader material for galaxy with slight modifications
            const galaxyMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    pointTexture: { value: new THREE.TextureLoader().load('/images/star.png', () => { }, () => { }) }
                },
                vertexShader: `
                    attribute float size;
                    attribute vec3 color;
                    varying vec3 vColor;
                    void main() {
                        vColor = color;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = size * (300.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform sampler2D pointTexture;
                    varying vec3 vColor;
                    void main() {
                        gl_FragColor = vec4(vColor, 0.8);
                        gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
                    }
                `,
                blending: THREE.AdditiveBlending,
                depthTest: false, // Allow galaxy to render through other objects
                transparent: true,
                vertexColors: true
            });

            const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
            // Position the galaxy in the background
            galaxy.position.z = -1000;
            galaxy.rotation.x = Math.PI / 6; // Tilt the galaxy to show the spiral pattern
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

                // Animate stars to twinkle slightly
                if (stars && stars.material instanceof THREE.ShaderMaterial) {
                    const time = Date.now() * 0.0005;
                    const sizes = starGeometry.attributes.size.array;

                    for (let i = 0; i < starCount; i++) {
                        // Make each star twinkle at a slightly different rate
                        const twinkle = Math.sin(time + i * 0.1) * 0.2 + 0.8;
                        sizes[i] = (Math.random() * 1.5 + 0.5) * twinkle;
                    }

                    starGeometry.attributes.size.needsUpdate = true;
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
                starGeometry.dispose();
                if (stars.material instanceof THREE.ShaderMaterial) {
                    stars.material.dispose();
                }
                if (galaxy) {
                    galaxyGeometry.dispose();
                    if (galaxy.material instanceof THREE.ShaderMaterial) {
                        galaxy.material.dispose();
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