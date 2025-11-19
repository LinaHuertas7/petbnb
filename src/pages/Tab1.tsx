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
} from "@ionic/react";
import React, { useEffect, useMemo, useState } from "react";
import MapView, { Caregiver } from "../components/map/MapView";
import "./Tab1.css";
import { useHistory } from "react-router-dom";
import { mockCaregivers } from "../data/caregivers";

// Haversine (km)
function distanceKm(a: [number, number], b: [number, number]) {
    const R = 6371;
    const dLat = ((b[0] - a[0]) * Math.PI) / 180;
    const dLon = ((b[1] - a[1]) * Math.PI) / 180;
    const lat1 = (a[0] * Math.PI) / 180;
    const lat2 = (b[0] * Math.PI) / 180;
    const x =
        Math.sin(dLat / 2) ** 2 +
        Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return 2 * R * Math.asin(Math.sqrt(x));
}

// Cuidadores de prueba EN BOGOTÁ

const Tab1: React.FC = () => {
    const [query, setQuery] = useState("");
    const [petType, setPetType] = useState<string>("all");
    const [maxDistance, setMaxDistance] = useState<number>(50);
    const [center] = useState<[number, number]>([4.711, -74.0059]);
    const [caregivers] = useState<Caregiver[]>(mockCaregivers);

    const history = useHistory();

    const filtered = useMemo(() => {
        return caregivers.filter((cg) => {
            const matchesQuery = cg.name
                .toLowerCase()
                .includes(query.toLowerCase().trim());
            const matchesType =
                petType === "all" ? true : cg.petTypes.includes(petType);
            const withinDistance =
                distanceKm(center, [cg.lat, cg.lng]) <= maxDistance;
            return matchesQuery && matchesType && withinDistance;
        });
    }, [caregivers, center, query, petType, maxDistance]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Buscar Cuidadores</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="map-content">
                <div className="filters">
                    <IonSearchbar
                        placeholder="Buscar por nombre"
                        value={query}
                        onIonInput={(e) => setQuery(e.detail.value ?? "")}
                    />
                    <IonList>
                        <IonItem>
                            <IonLabel>Tipo de mascota</IonLabel>
                            <IonSelect
                                interface="popover"
                                value={petType}
                                onIonChange={(e) => setPetType(e.detail.value)}
                            >
                                <IonSelectOption value="all">
                                    Todas
                                </IonSelectOption>
                                <IonSelectOption value="perro">
                                    Perros
                                </IonSelectOption>
                                <IonSelectOption value="gato">
                                    Gatos
                                </IonSelectOption>
                            </IonSelect>
                        </IonItem>
                        <IonItem>
                            <IonLabel>Radio (km): {maxDistance}</IonLabel>
                            <IonRange
                                min={1}
                                max={50}
                                value={maxDistance}
                                pin={true}
                                onIonChange={(e) =>
                                    setMaxDistance(e.detail.value as number)
                                }
                            />
                        </IonItem>
                    </IonList>
                </div>

                <div className="map-wrapper">
                    <MapView
                        center={center}
                        caregivers={filtered}
                        zoom={13}
                        onSelect={(c) => history.push(`/listing/${c.id}`)}
                    />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Tab1;
