import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

// Icono de ubicación del usuario mejorado
const createUserLocationIcon = () => {
    const html = `
        <div class="user-location-marker">
            📍
        </div>
    `;

    return L.divIcon({
        html,
        className: "custom-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });
};

// Icono de alojamiento mejorado
const createListingIcon = () => {
    const html = `
        <div class="listing-marker">
            🏠
        </div>
    `;

    return L.divIcon({
        html,
        className: "custom-marker",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
    });
};

interface Caregiver {
    id: string;
    name: string;
    description?: string;
    location: [number, number];
    rating: number;
    price: number;
    currency?: string;
    photos?: string[];
    services?: string[];
    capacity?: number;
}

interface MapViewProps {
    center: [number, number];
    caregivers: Caregiver[];
    userLocation?: [number, number] | null;
    onMarkerClick?: (id: string) => void;
}

// Componente mejorado que solo centra cuando la ubicación cambia significativamente
const MapCenterController: React.FC<{
    center: [number, number];
    userLocation?: [number, number] | null;
}> = ({ center, userLocation }) => {
    const map = useMap();
    const prevUserLocationRef = useRef<[number, number] | null>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Solo centrar en el primer render
        if (isFirstRender.current) {
            map.setView(center, 13);
            isFirstRender.current = false;
            return;
        }

        // Solo centrar si la ubicación del usuario cambió
        if (userLocation) {
            const prevLocation = prevUserLocationRef.current;

            // Si es la primera vez que se obtiene ubicación o cambió significativamente
            if (
                !prevLocation ||
                Math.abs(prevLocation[0] - userLocation[0]) > 0.001 ||
                Math.abs(prevLocation[1] - userLocation[1]) > 0.001
            ) {
                map.flyTo(userLocation, 14, {
                    duration: 1.5,
                    easeLinearity: 0.5,
                });

                prevUserLocationRef.current = userLocation;
            }
        }
    }, [userLocation, map]);

    return null;
};

const MapView: React.FC<MapViewProps> = ({
    center,
    caregivers,
    userLocation,
    onMarkerClick,
}) => {
    // Handler para el click del botón
    const handleDetailsClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Click en Ver detalles:', id);
        onMarkerClick?.(id);
    };

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <MapContainer
                center={center}
                zoom={13}
                style={{ width: "100%", height: "100%" }}
                zoomControl={true}
                scrollWheelZoom={true}
                dragging={true}
                touchZoom={true}
                doubleClickZoom={true}
            >
                <MapCenterController
                    center={center}
                    userLocation={userLocation}
                />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Marcador del usuario */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={createUserLocationIcon()}
                    >
                        <Popup
                            className="custom-popup"
                            closeButton={false}
                            autoClose={false}
                            closeOnClick={false}
                        >
                            <div
                                style={{
                                    padding: "8px",
                                    textAlign: "center",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "24px",
                                        marginBottom: "4px",
                                    }}
                                >
                                    📍
                                </div>
                                <strong
                                    style={{
                                        fontSize: "13px",
                                        color: "#222",
                                    }}
                                >
                                    Tu ubicación
                                </strong>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Marcadores de alojamientos */}
                {caregivers.map((cg) => (
                    <Marker
                        key={cg.id}
                        position={cg.location}
                        icon={createListingIcon()}
                        eventHandlers={{
                            click: (e) => {
                                // Abrir el popup al hacer click en el marcador
                                console.log('Click en marcador:', cg.id);
                            },
                        }}
                    >
                        <Popup
                            className="custom-popup"
                            maxWidth={260}
                            closeButton={true}
                            autoClose={false}
                            closeOnClick={false}
                            offset={[0, -10]}
                        >
                            <div className="popup-card">
                                {cg.photos && cg.photos.length > 0 ? (
                                    <img
                                        src={cg.photos[0]}
                                        alt={cg.name}
                                        className="popup-image"
                                        onError={(e) => {
                                            (
                                                e.target as HTMLImageElement
                                            ).style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <div className="popup-image-placeholder">
                                        🏡
                                    </div>
                                )}

                                <div className="popup-content">
                                    <div className="popup-header">
                                        <h3>{cg.name}</h3>
                                        <div className="popup-rating">
                                            ⭐ {cg.rating.toFixed(1)}
                                        </div>
                                    </div>

                                    {cg.description && (
                                        <p className="popup-description">
                                            {cg.description.length > 60
                                                ? cg.description.substring(
                                                      0,
                                                      60
                                                  ) + "..."
                                                : cg.description}
                                        </p>
                                    )}

                                    <div className="popup-details">
                                        <span>🐾 {cg.capacity || 1}</span>
                                        {cg.services &&
                                            cg.services.length > 0 && (
                                                <span>
                                                    ✨ {cg.services.length}
                                                </span>
                                            )}
                                    </div>

                                    <div className="popup-price">
                                        <strong>
                                            {cg.currency || "USD"} ${cg.price}
                                        </strong>
                                        <span>/día</span>
                                    </div>

                                    <button
                                        className="popup-button"
                                        onClick={(e) => handleDetailsClick(e, cg.id)}
                                        type="button"
                                    >
                                        Ver detalles →
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;
