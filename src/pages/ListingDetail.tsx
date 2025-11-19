import React, { useState } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonChip,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonTextarea,
    IonInput,
    IonDatetime,
    IonList,
    IonItem,
    IonBackButton,
} from "@ionic/react";
import { useParams } from "react-router-dom";
import { getCaregiver } from "../data/caregivers";
import "./ListingDetail.css";

interface RouteParams {
    id: string;
}

const ListingDetail: React.FC = () => {
    const { id } = useParams<RouteParams>();
    const caregiver = getCaregiver(id);
    const [pets, setPets] = useState([{ name: "", species: "perro" }]);
    const [range, setRange] = useState<{ start?: string; end?: string }>({});
    const [notes, setNotes] = useState("");
    const [sending, setSending] = useState(false);
    const [ok, setOk] = useState<string | null>(null);

    if (!caregiver) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>No encontrado</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="detail-content">
                    <p>Alojamiento no existe.</p>
                    <IonButton routerLink="/tab1">Volver</IonButton>
                </IonContent>
            </IonPage>
        );
    }

    const updatePet = (i: number, key: "name" | "species", v: string) => {
        setPets((ps) => {
            const copy = [...ps];
            copy[i] = { ...copy[i], [key]: v };
            return copy;
        });
    };
    const addPet = () => setPets((p) => [...p, { name: "", species: "perro" }]);

    //const canSubmit =
    range.start && range.end && pets.every((p) => p.name.trim());

    const submit = async () => {
        if (!canSubmit) return;
        setSending(true);
        await new Promise((r) => setTimeout(r, 500));
        setSending(false);
        setOk("Reserva creada");
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{caregiver.name}</IonTitle>
                    <IonBackButton defaultHref="/tab1" slot="start" />
                </IonToolbar>
            </IonHeader>
            <IonContent className="detail-content listing" fullscreen>
                <div className="header-section">
                    <h2>{caregiver.name}</h2>
                    <p className="desc">{caregiver.description}</p>
                </div>
                <div className="photos-grid">
                    {(caregiver.photos || []).map((p, i) => (
                        <div className="photo" key={i}>
                            <img src={p} alt={caregiver.name + i} />
                        </div>
                    ))}
                </div>
                <IonGrid className="stats-grid">
                    <IonRow>
                        <IonCol size="6">
                            <div className="stat">
                                <span>Precio</span>
                                <strong>${caregiver.price}/día</strong>
                            </div>
                        </IonCol>
                        <IonCol size="6">
                            <div className="stat">
                                <span>Capacidad</span>
                                <strong>{caregiver.capacity ?? "—"}</strong>
                            </div>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <h3 className="stats-grid">Servicios</h3>
                <div className="chips">
                    {(caregiver.services || []).map((s) => (
                        <IonChip key={s}>
                            <IonLabel>{s}</IonLabel>
                        </IonChip>
                    ))}
                </div>

                <h3 className="stats-grid">Reservar</h3>
                <IonItem>
                    <IonLabel position="stacked">Rango fechas *</IonLabel>
                    <IonDatetime
                        presentation="date-range"
                        value={
                            range.start && range.end
                                ? `${range.start}/${range.end}`
                                : undefined
                        }
                        onIonChange={(e) => {
                            const v = e.detail.value as string | undefined;
                            if (!v) return setRange({});
                            const [start, end] = v.split("/");
                            setRange({ start, end });
                        }}
                    />
                </IonItem>

                <h4 className="stats-grid">Mascotas *</h4>
                <IonList>
                    {pets.map((p, i) => (
                        <IonItem key={i}>
                            <IonInput
                                label="Nombre"
                                labelPlacement="stacked"
                                value={p.name}
                                onIonChange={(e) =>
                                    updatePet(i, "name", e.detail.value || "")
                                }
                            />
                            <IonInput
                                label="Especie"
                                labelPlacement="stacked"
                                value={p.species}
                                onIonChange={(e) =>
                                    updatePet(
                                        i,
                                        "species",
                                        e.detail.value || ""
                                    )
                                }
                            />
                        </IonItem>
                    ))}
                </IonList>
                <IonButton
                    className="stats-grid"
                    size="small"
                    fill="outline"
                    onClick={addPet}
                >
                    Añadir mascota
                </IonButton>

                <h4 className="stats-grid">Cuidados específicos</h4>
                <IonTextarea
                    autoGrow
                    value={notes}
                    className="stats-grid"
                    placeholder="Medicamentos, horarios, comportamiento..."
                    onIonChange={(e) => setNotes(e.detail.value || "")}
                />

                {ok && <p className="ok">{ok}</p>}
                <IonButton expand="block" disabled={sending} onClick={submit}>
                    {sending ? "Enviando..." : "Confirmar reserva"}
                </IonButton>
            </IonContent>
        </IonPage>
    );
};

export default ListingDetail;
