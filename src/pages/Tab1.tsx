import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonRange,
    IonList,
    IonButton,
    IonIcon,
    IonBadge,
    IonChip,
    IonFab,
    IonFabButton,
    IonAlert,
} from "@ionic/react";
import React, { useEffect, useMemo, useState } from "react";
import MapView from "../components/map/MapView";
import "./Tab1.css";
import { useHistory } from "react-router-dom";
import { storage } from "../service/storage";
import {
    closeOutline,
    filterOutline,
    locateOutline,
    refreshOutline,
    trashOutline,
    mapOutline,
    listOutline,
} from "ionicons/icons";

// Función para calcular distancia entre dos coordenadas (fórmula de Haversine)
function distanceKm(
    coord1: [number, number],
    coord2: [number, number]
): number {
    const [lat1, lng1] = coord1;
    const [lat2, lng2] = coord2;
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const Tab1: React.FC = () => {
    const [query, setQuery] = useState("");
    const [petType, setPetType] = useState<string>("all");
    const [maxDistance, setMaxDistance] = useState<number>(50);
    const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
    const [caregivers, setCaregivers] = useState<any[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<"map" | "list">("map");
    const [loading, setLoading] = useState(false);
    const [locationError, setLocationError] = useState<string>("");
    const [showLocationAlert, setShowLocationAlert] = useState(false);

    // Centro del mapa - solo cambia cuando se obtiene nueva ubicación
    const [mapCenter, setMapCenter] = useState<[number, number]>([
        4.6097, -74.0817,
    ]);

    const history = useHistory();

    // Cargar alojamientos publicados
    const loadListings = async () => {
        setLoading(true);
        const published = await storage.getAllListings();
        const mapped = published.map((listing: any) => ({
            id: listing.id,
            name: listing.title,
            description: listing.description,
            location: listing.location
                ? ([listing.location.lat, listing.location.lng] as [
                      number,
                      number
                  ])
                : ([4.6097, -74.0817] as [number, number]),
            rating: 5.0,
            price: listing.basePrice,
            currency: listing.currency,
            services: listing.services,
            capacity: listing.capacity,
            photos: listing.photos,
            photoCount: listing.photoCount || 0,
            petTypes: ["perro", "gato"],
        }));
        setCaregivers(mapped);
        setLoading(false);
    };

    useEffect(() => {
        loadListings();
    }, []);

    const filtered = useMemo(() => {
        return caregivers.filter((cg) => {
            const matchesQuery =
                query.trim() === "" ||
                cg.name.toLowerCase().includes(query.toLowerCase().trim());
            const matchesType =
                petType === "all" || cg.petTypes?.includes(petType);
            const withinDistance =
                !userLoc || distanceKm(userLoc, cg.location) <= maxDistance;
            return matchesQuery && matchesType && withinDistance;
        });
    }, [caregivers, query, petType, maxDistance, userLoc]);

    useEffect(() => {
        storage.getFilters().then((saved) => {
            if (saved) {
                setQuery(saved.query || "");
                setPetType(saved.petType || "all");
                setMaxDistance(saved.maxDistance || 50);
            }
        });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            storage.saveFilters({ query, petType, maxDistance });
        }, 500);
        return () => clearTimeout(timer);
    }, [query, petType, maxDistance]);

    const clearFilters = () => {
        setQuery("");
        setPetType("all");
        setMaxDistance(50);
        setUserLoc(null);
    };

    const getCurrentLocation = async () => {
        setLocationError("");
        setLoading(true);

        try {
            if (!navigator.geolocation) {
                throw new Error(
                    "Geolocalización no disponible en este navegador"
                );
            }

            try {
                const { Geolocation } = await import("@capacitor/geolocation");

                const permission = await Geolocation.checkPermissions();

                if (permission.location === "denied") {
                    const requestResult =
                        await Geolocation.requestPermissions();
                    if (requestResult.location === "denied") {
                        throw new Error("Permisos de ubicación denegados");
                    }
                }

                const position = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                });

                const newLoc: [number, number] = [
                    position.coords.latitude,
                    position.coords.longitude,
                ];

                setUserLoc(newLoc);
                setMapCenter(newLoc); // Actualizar el centro del mapa
                console.log("Ubicación obtenida (Capacitor):", newLoc);
            } catch (capacitorError) {
                console.log(
                    "Intentando con API del navegador...",
                    capacitorError
                );

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const newLoc: [number, number] = [
                            position.coords.latitude,
                            position.coords.longitude,
                        ];
                        setUserLoc(newLoc);
                        setMapCenter(newLoc); // Actualizar el centro del mapa
                        console.log("Ubicación obtenida (Navigator):", newLoc);
                    },
                    (error) => {
                        let errorMessage = "No se pudo obtener la ubicación";
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage =
                                    "Permisos de ubicación denegados";
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = "Ubicación no disponible";
                                break;
                            case error.TIMEOUT:
                                errorMessage = "Tiempo de espera agotado";
                                break;
                        }
                        setLocationError(errorMessage);
                        setShowLocationAlert(true);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    }
                );
            }
        } catch (error: any) {
            console.error("Error obteniendo ubicación:", error);
            setLocationError(error.message || "Error desconocido");
            setShowLocationAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const hasActiveFilters =
        query.trim() !== "" || petType !== "all" || userLoc !== null;

    return (
        <IonPage>
            <IonContent fullscreen className="ion-no-padding">
                {/* Mapa o Lista */}
                {viewMode === "map" ? (
                    <div className="leaflet-wrapper">
                        <MapView
                            center={mapCenter}
                            caregivers={filtered}
                            userLocation={userLoc}
                            onMarkerClick={(id) =>
                                history.push(`/listing/${id}`)
                            }
                        />
                    </div>
                ) : (
                    <div className="list-view">
                        {filtered.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🏠</div>
                                <div className="empty-state-title">
                                    No hay alojamientos disponibles
                                </div>
                                <div className="empty-state-message">
                                    Intenta ajustar tus filtros o publicar tu
                                    propio alojamiento
                                </div>
                            </div>
                        ) : (
                            filtered.map((cg) => {
                                const imageUrl =
                                    cg.photos && cg.photos.length > 0
                                        ? cg.photos[0]
                                        : null;

                                return (
                                    <div
                                        key={cg.id}
                                        className="caregiver-card"
                                        onClick={() =>
                                            history.push(`/listing/${cg.id}`)
                                        }
                                    >
                                        <div className="card-image-container">
                                            {imageUrl ? (
                                                <>
                                                    <img
                                                        className="card-image"
                                                        src={imageUrl}
                                                        alt={cg.name}
                                                        onError={(e) => {
                                                            const img =
                                                                e.target as HTMLImageElement;
                                                            img.style.display =
                                                                "none";
                                                            const container =
                                                                img.parentElement!;
                                                            container.innerHTML = `
                                                                <div class="card-image" style="
                                                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                                                    display: flex;
                                                                    align-items: center;
                                                                    justify-content: center;
                                                                    font-size: 48px;
                                                                    width: 100%;
                                                                    height: 100%;
                                                                ">🏡</div>
                                                                <div class="card-badge">⭐ ${cg.rating.toFixed(
                                                                    1
                                                                )}</div>
                                                            `;
                                                        }}
                                                    />
                                                    {cg.photoCount > 1 && (
                                                        <div className="photo-count">
                                                            📷 {cg.photoCount}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div
                                                    className="card-image"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: "48px",
                                                    }}
                                                >
                                                    🏡
                                                </div>
                                            )}
                                            <div className="card-badge">
                                                ⭐ {cg.rating.toFixed(1)}
                                            </div>
                                        </div>
                                        <div className="card-content">
                                            <div className="card-header">
                                                <h3>{cg.name}</h3>
                                                <div className="price-badge">
                                                    {cg.currency || "USD"} $
                                                    {cg.price}/día
                                                </div>
                                            </div>
                                            <p
                                                className="description"
                                                style={{
                                                    //limitar la descripcion
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                    WebkitLineClamp: 3,
                                                }}
                                            >
                                                {cg.description ||
                                                    "Sin descripción disponible"}
                                            </p>
                                            <div className="card-footer">
                                                <span>
                                                    🐾 Hasta {cg.capacity}{" "}
                                                    mascotas
                                                </span>
                                                {userLoc && (
                                                    <span>
                                                        📍{" "}
                                                        {distanceKm(
                                                            userLoc,
                                                            cg.location
                                                        ).toFixed(1)}{" "}
                                                        km
                                                    </span>
                                                )}
                                            </div>
                                            {cg.services?.length > 0 && (
                                                <div className="services-chips">
                                                    {cg.services
                                                        .slice(0, 3)
                                                        .map((s: string) => (
                                                            <IonChip key={s}>
                                                                {s}
                                                            </IonChip>
                                                        ))}
                                                    {cg.services.length > 3 && (
                                                        <IonChip>
                                                            +
                                                            {cg.services
                                                                .length - 3}
                                                        </IonChip>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Filtros flotantes */}
                <IonFab vertical="top" horizontal="end" slot="fixed">
                    <IonFabButton
                        onClick={() => setShowFilters(!showFilters)}
                        color={hasActiveFilters ? "warning" : "primary"}
                    >
                        <IonIcon
                            icon={showFilters ? closeOutline : filterOutline}
                        />
                    </IonFabButton>
                </IonFab>

                {/* Botón cambiar vista */}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton
                        onClick={() =>
                            setViewMode(viewMode === "map" ? "list" : "map")
                        }
                        color="secondary"
                    >
                        <IonIcon
                            icon={viewMode === "map" ? listOutline : mapOutline}
                        />
                    </IonFabButton>
                </IonFab>

                {showFilters && (
                    <div className="filters">
                        <div className="filter-header">
                            <h3>Filtros</h3>
                            {hasActiveFilters && (
                                <IonButton
                                    fill="clear"
                                    size="small"
                                    onClick={clearFilters}
                                >
                                    <IonIcon icon={trashOutline} slot="start" />
                                    Limpiar
                                </IonButton>
                            )}
                        </div>

                        <IonSearchbar
                            placeholder="Buscar por nombre"
                            value={query}
                            onIonInput={(e) => setQuery(e.detail.value ?? "")}
                            showClearButton="focus"
                        />

                        <IonList>
                            <IonItem>
                                <IonLabel>Tipo de mascota</IonLabel>
                                <IonSelect
                                    interface="popover"
                                    value={petType}
                                    onIonChange={(e) =>
                                        setPetType(e.detail.value)
                                    }
                                >
                                    <IonSelectOption value="all">
                                        Todas
                                    </IonSelectOption>
                                    <IonSelectOption value="perro">
                                        🐕 Perros
                                    </IonSelectOption>
                                    <IonSelectOption value="gato">
                                        🐈 Gatos
                                    </IonSelectOption>
                                </IonSelect>
                            </IonItem>

                            <IonItem>
                                <div style={{ width: "100%" }}>
                                    <IonLabel>
                                        Radio:{" "}
                                        {userLoc ? `${maxDistance} km` : "∞"}
                                    </IonLabel>
                                    <IonRange
                                        min={1}
                                        max={100}
                                        step={5}
                                        value={maxDistance}
                                        pin={true}
                                        disabled={!userLoc}
                                        onIonChange={(e) =>
                                            setMaxDistance(
                                                e.detail.value as number
                                            )
                                        }
                                    />
                                    {!userLoc && (
                                        <p className="hint">
                                            Activa ubicación para filtrar por
                                            distancia
                                        </p>
                                    )}
                                </div>
                            </IonItem>

                            <IonItem lines="none">
                                <IonButton
                                    expand="block"
                                    fill={userLoc ? "solid" : "outline"}
                                    color={userLoc ? "success" : "primary"}
                                    onClick={getCurrentLocation}
                                    disabled={loading}
                                    style={{ width: "100%" }}
                                >
                                    <IonIcon
                                        icon={locateOutline}
                                        slot="start"
                                    />
                                    {userLoc
                                        ? "📍 Ubicación activada"
                                        : "Obtener mi ubicación"}
                                </IonButton>
                            </IonItem>

                            <IonItem lines="none">
                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    onClick={loadListings}
                                    disabled={loading}
                                    style={{ width: "100%" }}
                                >
                                    <IonIcon
                                        icon={refreshOutline}
                                        slot="start"
                                    />
                                    Recargar alojamientos
                                </IonButton>
                            </IonItem>
                        </IonList>

                        <div className="filter-summary">
                            <p>
                                Mostrando <strong>{filtered.length}</strong> de{" "}
                                <strong>{caregivers.length}</strong>{" "}
                                alojamientos
                            </p>
                        </div>
                    </div>
                )}

                {/* Alert de error de ubicación */}
                <IonAlert
                    isOpen={showLocationAlert}
                    onDidDismiss={() => setShowLocationAlert(false)}
                    header="Error de ubicación"
                    message={locationError}
                    buttons={[
                        {
                            text: "OK",
                            role: "cancel",
                        },
                        {
                            text: "Configuración",
                            handler: () => {
                                console.log("Abrir configuración de permisos");
                            },
                        },
                    ]}
                />
            </IonContent>
        </IonPage>
    );
};

export default Tab1;
