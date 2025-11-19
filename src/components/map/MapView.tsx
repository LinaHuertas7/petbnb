import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import React, { useEffect } from "react";

export type Caregiver = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    price: number;
    petTypes: string[];
    rating?: number;
    capacity?: number;
    services?: string[];
    photos?: string[];
    description?: string;
};

// Fix iconos en Vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL(
        "leaflet/dist/images/marker-icon-2x.png",
        import.meta.url
    ).toString(),
    iconUrl: new URL(
        "leaflet/dist/images/marker-icon.png",
        import.meta.url
    ).toString(),
    shadowUrl: new URL(
        "leaflet/dist/images/marker-shadow.png",
        import.meta.url
    ).toString(),
});

interface MapViewProps {
    center: [number, number];
    caregivers: Caregiver[];
    zoom?: number;
    onSelect?: (c: Caregiver) => void;
}

const ResizeHelper: React.FC = () => {
    const map = useMap();
    useEffect(() => {
        // Esperar a que el DOM esté listo
        setTimeout(() => {
            map.invalidateSize();
        }, 100);

        // También ante resize de ventana
        const handleResize = () => map.invalidateSize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [map]);

    return null;
};
const MapView: React.FC<MapViewProps> = ({
    center,
    caregivers,
    zoom = 13,
    onSelect,
}) => {
    return (
        <div className="leaflet-wrapper">
            <MapContainer
                center={center}
                zoom={zoom}
                className="leaflet-container-fixed"
            >
                <ResizeHelper />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {caregivers.map((cg) => (
                    <Marker
                        key={cg.id}
                        position={[cg.lat, cg.lng]}
                        /*  eventHandlers={{
                            click: () => onSelect && onSelect(cg),
                        }} */
                    >
                        <Popup>
                            <div style={{ minWidth: 150 }}>
                                <strong>{cg.name}</strong>
                                <div>Desde ${cg.price}</div>
                                {cg.rating != null && (
                                    <div>⭐ {cg.rating.toFixed(1)}</div>
                                )}
                                <button
                                    type="button"
                                    style={{
                                        marginTop: 6,
                                        width: "100%",
                                        background: "#83bd7fff",
                                        color: "#fff",
                                        border: "none",
                                        padding: "4px 6px",
                                        borderRadius: 4,
                                        cursor: "pointer",
                                    }}
                                    onClick={() => onSelect && onSelect(cg)}
                                >
                                    Ver detalle
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;
