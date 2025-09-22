import React, { useEffect, useRef } from 'react';

declare var L: any;

try {
    const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
} catch (e) {
    console.warn("Leaflet not loaded yet, cannot set default icon.", e);
}


interface MapInputProps {
    onShapeChange: (shapeGeoJSON: string, areaHectares: number) => void;
    initialShape?: string; // GeoJSON string
    readOnly?: boolean;
}

const MapInput: React.FC<MapInputProps> = ({ onShapeChange, initialShape, readOnly = false }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any | null>(null);
    const drawnItemsRef = useRef<any | null>(null);
    const initialShapeRef = useRef(initialShape); // Use ref to prevent re-renders from affecting this

    useEffect(() => {
        let isMounted = true;
        if (mapContainerRef.current && !mapRef.current && typeof L !== 'undefined') {
            const map = L.map(mapContainerRef.current, { attributionControl: false });
            mapRef.current = map;

            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            }).addTo(map);

            const drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);
            drawnItemsRef.current = drawnItems;

            if (initialShapeRef.current) {
                try {
                    const geoJsonLayer = L.geoJSON(JSON.parse(initialShapeRef.current));
                    geoJsonLayer.eachLayer((layer: any) => {
                         if (isMounted) {
                            drawnItems.addLayer(layer);
                            map.fitBounds(layer.getBounds(), { padding: [50, 50] });
                         }
                    });
                } catch(e) {
                    console.error("Could not parse initial shape GeoJSON", e);
                     if (isMounted) map.setView([28.61, 77.20], 5);
                }
            } else {
                 map.on('locationfound', (e: any) => {
                    if (isMounted) map.setView(e.latlng, 13);
                });
                map.on('locationerror', () => {
                   if (isMounted) map.setView([28.61, 77.20], 5);
                });
                map.locate();
            }

            if (!readOnly) {
                const drawControl = new L.Control.Draw({
                    edit: { featureGroup: drawnItems, remove: true },
                    draw: {
                        polygon: { allowIntersection: false, showArea: true },
                        rectangle: { showArea: true },
                        polyline: false, circle: false, marker: false, circlemarker: false
                    }
                });
                map.addControl(drawControl);
                
                const getAreaAndNotify = (layer: any) => {
                    const areaMeters = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
                    const areaHectares = areaMeters / 10000;
                    const geoJSON = JSON.stringify(layer.toGeoJSON());
                    onShapeChange(geoJSON, areaHectares);
                }
    
                map.on(L.Draw.Event.CREATED, (event: any) => {
                    const layer = event.layer;
                    drawnItems.clearLayers();
                    drawnItems.addLayer(layer);
                    map.fitBounds(layer.getBounds(), { padding: [50, 50] });
                    getAreaAndNotify(layer);
                });
                
                map.on(L.Draw.Event.EDITED, (event: any) => {
                    event.layers.eachLayer((layer: any) => getAreaAndNotify(layer));
                });
    
                map.on(L.Draw.Event.DELETED, () => {
                    onShapeChange('', 0);
                });
            }
        }

        return () => {
            isMounted = false;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [onShapeChange, readOnly]);

    return <div ref={mapContainerRef} className="w-full h-80 rounded-lg border-2 border-gray-300" />;
};

export default MapInput;