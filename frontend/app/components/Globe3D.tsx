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
                1000
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
                const earthTexture = textureLoader.load('/earth-blue-marble.jpg',
                    // On successful load, update the material
                    (texture) => {
                        globeMaterial.map = texture;
                        globeMaterial.needsUpdate = true;
                    },
                    undefined,
                    // On error, fallback silently to blue material
                    (err) => console.log('Using default globe material')
                );
            } catch (error) {
                console.log('Error loading texture, using default globe material');
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

            // Add stars
            const starGeometry = new THREE.BufferGeometry();
            const starMaterial = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 1,
            });

            const starVertices = [];
            for (let i = 0; i < 5000; i++) {
                const x = (Math.random() - 0.5) * 2000;
                const y = (Math.random() - 0.5) * 2000;
                const z = (Math.random() - 0.5) * 2000;
                starVertices.push(x, y, z);
            }

            starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
            const stars = new THREE.Points(starGeometry, starMaterial);
            scene.add(stars);

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
                starMaterial.dispose();
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