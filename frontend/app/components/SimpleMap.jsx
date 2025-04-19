"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue in Next.js
import { Marker } from 'leaflet';
if (typeof window !== 'undefined') {
    delete Marker.prototype._initIcon;
    delete Marker.prototype.update;

    Marker.include({
        _initIcon: function () {
            const options = this.options;
            const classToAdd = 'leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

            const icon = this.options.icon.createIcon(this._icon);
            let addIcon = false;

            if (icon !== this._icon) {
                if (this._icon) {
                    this._removeIcon();
                }
                addIcon = true;
                if (options.title) {
                    icon.title = options.title;
                }
                if (options.alt) {
                    icon.alt = options.alt;
                }
            }

            L.DomUtil.addClass(icon, classToAdd);

            if (options.keyboard) {
                icon.tabIndex = '0';
                icon.setAttribute('role', 'button');
            }

            this._icon = icon;
            if (options.riseOnHover) {
                this.on({
                    mouseover: this._bringToFront,
                    mouseout: this._resetZIndex
                });
            }

            if (addIcon) {
                this.getPane().appendChild(this._icon);
            }
            this._initInteraction();
        },
        update: function () {
            if (!this._icon) return;
            const pos = this._map.latLngToLayerPoint(this._latlng).round();
            this._setPos(pos);
        },
        _setPos: function (pos) {
            L.DomUtil.setPosition(this._icon, pos);
            if (this._shadow) {
                L.DomUtil.setPosition(this._shadow, pos);
            }
            this._zIndex = pos.y + this.options.zIndexOffset;
            this._resetZIndex();
        }
    });
}

// Helper function to get color based on PM2.5 level
const getPollutionColor = (pm25) => {
    if (pm25 <= 12) return '#00e400'; // Good (0-12)
    if (pm25 <= 35.4) return '#ffff00'; // Moderate (12.1-35.4)
    if (pm25 <= 55.4) return '#ff7e00'; // Unhealthy for Sensitive Groups (35.5-55.4)
    if (pm25 <= 150.4) return '#ff0000'; // Unhealthy (55.5-150.4)
    if (pm25 <= 250.4) return '#99004c'; // Very Unhealthy (150.5-250.4)
    return '#7e0023'; // Hazardous (250.5+)
};

const SimpleMap = ({ pollutionData, onPointSelected }) => {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);

    // Fix icon URLs in Leaflet
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Fix Leaflet default icon URLs
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
            });
        }
    }, []);

    useEffect(() => {
        // Safety check for SSR
        if (typeof window === 'undefined') return;

        // Initialize the map if it hasn't been created yet and container exists
        if (!leafletMapRef.current && mapRef.current) {
            try {
                console.log("Initializing map...");
                // Set default view to a global view
                leafletMapRef.current = L.map(mapRef.current, {
                    center: [20, 0],
                    zoom: 2,
                    minZoom: 1,
                    worldCopyJump: true
                });

                // Add OSM tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19
                }).addTo(leafletMapRef.current);

                // Add legend
                const legend = L.control({ position: 'bottomright' });
                legend.onAdd = function () {
                    const div = L.DomUtil.create('div', 'info legend');
                    div.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    div.style.color = 'white';
                    div.style.padding = '10px';
                    div.style.borderRadius = '5px';
                    div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';

                    const grades = [0, 12, 35.4, 55.4, 150.4, 250.4];
                    const labels = ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];

                    div.innerHTML = '<h4 style="margin:0 0 10px 0; text-align:center; font-weight:bold;">PM2.5 Levels</h4>';

                    for (let i = 0; i < grades.length; i++) {
                        const color = getPollutionColor(grades[i] + 0.1);
                        div.innerHTML +=
                            '<div style="display:flex; align-items:center; margin-bottom:5px;">' +
                            '<i style="background:' + color + '; width:18px; height:18px; display:inline-block; margin-right:8px; border-radius:50%;"></i> ' +
                            '<span>' + (grades[i + 1] ? grades[i] + ' - ' + grades[i + 1] : grades[i] + '+') + ' ' +
                            '<span style="margin-left:4px;">' + labels[i] + '</span>' +
                            '</span></div>';
                    }

                    return div;
                };
                legend.addTo(leafletMapRef.current);

                // Create pulsating effect for markers
                const pulseCSS = document.createElement('style');
                pulseCSS.type = 'text/css';
                pulseCSS.innerHTML = `
                    @keyframes pulse {
                        0% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(1.1); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                    .pulse-marker {
                        animation: pulse 1.5s ease-in-out infinite;
                    }
                `;
                document.head.appendChild(pulseCSS);

                console.log("Map initialized successfully!");
            } catch (error) {
                console.error("Error initializing map:", error);
            }
        }

        // Clear existing markers only if the map exists
        if (leafletMapRef.current) {
            leafletMapRef.current.eachLayer((layer) => {
                if (layer instanceof L.CircleMarker) {
                    leafletMapRef.current.removeLayer(layer);
                }
            });

            // Add pollution data points
            if (pollutionData && pollutionData.length > 0) {
                const bounds = [];

                pollutionData.forEach(feature => {
                    if (feature && feature.geometry && feature.geometry.coordinates) {
                        const coords = feature.geometry.coordinates;
                        const pm25 = feature.properties.pm25;
                        const source = feature.properties.source || 'unknown';

                        // Store coordinates for bounding the map
                        bounds.push([coords[1], coords[0]]);

                        // Create marker
                        const marker = L.circleMarker([coords[1], coords[0]], {
                            radius: 8 + (pm25 / 30),
                            fillColor: getPollutionColor(pm25),
                            color: '#fff',
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.8,
                            className: 'pulse-marker'
                        }).addTo(leafletMapRef.current);

                        // Add popup with nice styling
                        marker.bindPopup(`
                            <div style="text-align:center; min-width:200px;">
                                <h3 style="margin:0 0 10px; font-size:16px; font-weight:bold; color:#333; border-bottom:1px solid #ddd; padding-bottom:5px;">
                                    PM2.5: ${pm25} μg/m³
                                </h3>
                                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                    <span style="font-weight:bold;">Source:</span>
                                    <span>${source}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                    <span style="font-weight:bold;">Coordinates:</span>
                                    <span>${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                    <span style="font-weight:bold;">Health Impact:</span>
                                    <span style="color:${getPollutionColor(pm25)}; font-weight:bold;">
                                        ${pm25 > 250.4 ? 'Hazardous' :
                                pm25 > 150.4 ? 'Very Unhealthy' :
                                    pm25 > 55.4 ? 'Unhealthy' :
                                        pm25 > 35.4 ? 'Unhealthy for Sensitive Groups' :
                                            pm25 > 12 ? 'Moderate' : 'Good'}
                                    </span>
                                </div>
                            </div>
                        `, {
                            className: 'custom-popup',
                            closeButton: true,
                            maxWidth: 300
                        });

                        // Add click handler
                        marker.on('click', () => {
                            if (onPointSelected) {
                                onPointSelected(feature);
                            }
                        });
                    }
                });

                // If we have data, fit the map to show all markers
                if (bounds.length > 0) {
                    try {
                        leafletMapRef.current.fitBounds(bounds, {
                            padding: [50, 50],
                            maxZoom: 6
                        });
                    } catch (error) {
                        console.error("Error fitting bounds:", error);
                        // Fallback to center view
                        leafletMapRef.current.setView([20, 0], 2);
                    }
                }
            }
        }

        // Cleanup function
        return () => {
            // We're keeping the map instance for performance
        };
    }, [pollutionData, onPointSelected]);

    // Force map resize when component mounts
    useEffect(() => {
        if (leafletMapRef.current) {
            setTimeout(() => {
                leafletMapRef.current.invalidateSize();
            }, 100);
        }
    }, []);

    return (
        <div ref={mapRef} className="w-full h-full bg-slate-900" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10
        }} />
    );
};

export default SimpleMap; 