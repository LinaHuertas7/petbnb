import React, { useState, useCallback } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonCheckbox,
    IonButton,
    IonList,
    IonGrid,
    IonRow,
    IonCol,
    IonDatetime,
    IonSelect,
    IonSelectOption,
    IonNote,
    IonSpinner,
    IonProgressBar,
} from "@ionic/react";
import {
    ListingDraft,
    SERVICES,
    createListing,
} from "../components/listing/types";
import "./Tab2.css";

const empty: ListingDraft = {
    title: "",
    description: "",
    capacity: 1,
    services: [],
    basePrice: 0,
    currency: "USD",
    photos: [],
    availabilityRange: undefined,
};

const Tab2: React.FC = () => {
    const [draft, setDraft] = useState<ListingDraft>(empty);
    const [submitting, setSubmitting] = useState(false);
    const [createdId, setCreatedId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const update = <K extends keyof ListingDraft>(
        key: K,
        value: ListingDraft[K]
    ) => setDraft((d) => ({ ...d, [key]: value }));

    const toggleService = (svc: string) =>
        update(
            "services",
            draft.services.includes(svc)
                ? draft.services.filter((s) => s !== svc)
                : [...draft.services, svc]
        );

    const onPhotosChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files ? Array.from(e.target.files) : [];
            update("photos", files.slice(0, 8)); // máximo 8
        },
        []
    );

    const isValid = () =>
        draft.title.trim() &&
        draft.capacity > 0 &&
        draft.basePrice > 0 &&
        draft.photos.length > 0 &&
        draft.availabilityRange?.start &&
        draft.availabilityRange?.end;

    const submit = async () => {
        if (!isValid()) {
            setError("Completa los campos obligatorios.");
            return;
        }
        setError(null);
        setSubmitting(true);
        const res = await createListing(draft);
        setSubmitting(false);
        setCreatedId(res.id);
        // Reset (mantén fotos opcional)
        setDraft(empty);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Publicar Alojamiento</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="listing-content">
                {submitting && <IonProgressBar type="indeterminate" />}
                <IonList className="listing-form">
                    <IonItem>
                        <IonLabel position="stacked">Título *</IonLabel>
                        <IonInput
                            value={draft.title}
                            placeholder="Ej: Hogar cálido para tu perro"
                            onIonChange={(e) =>
                                update("title", e.detail.value || "")
                            }
                        />
                    </IonItem>

                    <IonItem>
                        <IonLabel position="stacked">Descripción</IonLabel>
                        <IonTextarea
                            autoGrow
                            value={draft.description}
                            placeholder="Describe ambiente, reglas, atención especial..."
                            onIonChange={(e) =>
                                update("description", e.detail.value || "")
                            }
                        />
                    </IonItem>

                    <IonGrid>
                        <IonRow>
                            <IonCol size="6">
                                <IonItem>
                                    <IonLabel position="stacked">
                                        Capacidad *
                                    </IonLabel>
                                    <IonInput
                                        type="number"
                                        value={draft.capacity}
                                        min="1"
                                        onIonChange={(e) =>
                                            update(
                                                "capacity",
                                                Number(e.detail.value)
                                            )
                                        }
                                    />
                                </IonItem>
                            </IonCol>
                            <IonCol size="6">
                                <IonItem>
                                    <IonLabel position="stacked">
                                        Precio base *
                                    </IonLabel>
                                    <IonInput
                                        type="number"
                                        value={draft.basePrice}
                                        min="0"
                                        onIonChange={(e) =>
                                            update(
                                                "basePrice",
                                                Number(e.detail.value)
                                            )
                                        }
                                    />
                                </IonItem>
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    <IonItem>
                        <IonLabel position="stacked">Moneda</IonLabel>
                        <IonSelect
                            value={draft.currency}
                            onIonChange={(e) =>
                                update("currency", e.detail.value)
                            }
                        >
                            <IonSelectOption value="USD">USD</IonSelectOption>
                            <IonSelectOption value="COP">COP</IonSelectOption>
                            <IonSelectOption value="EUR">EUR</IonSelectOption>
                        </IonSelect>
                    </IonItem>

                    <IonItem>
                        <IonLabel position="stacked">
                            Disponibilidad (rango) *
                        </IonLabel>
                        <IonDatetime
                            draggable
                            presentation="date"
                            value={
                                draft.availabilityRange?.start &&
                                draft.availabilityRange?.end
                                    ? `${draft.availabilityRange.start}/${draft.availabilityRange.end}`
                                    : undefined
                            }
                            onIonChange={(e) => {
                                const v = e.detail.value as string | undefined;
                                if (!v)
                                    return update(
                                        "availabilityRange",
                                        undefined
                                    );
                                const [start, end] = v.split("/");
                                update("availabilityRange", { start, end });
                            }}
                        />
                    </IonItem>

                    <div className="services-group">
                        <div className="services-title">
                            Servicios ofrecidos
                        </div>
                        {SERVICES.map((svc) => (
                            <IonItem
                                key={svc}
                                lines="none"
                                className="svc-item"
                            >
                                <IonCheckbox
                                    checked={draft.services.includes(svc)}
                                    onIonChange={() => toggleService(svc)}
                                    justify="start"
                                >
                                    {svc}
                                </IonCheckbox>
                            </IonItem>
                        ))}
                    </div>

                    <div className="photos-block">
                        <label className="photos-label">
                            Fotos (mínimo 1, máximo 8) *
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={onPhotosChange}
                            className="photos-input"
                        />
                        <div className="photos-preview">
                            {draft.photos.map((f, i) => (
                                <div className="photo-thumb" key={i}>
                                    <img
                                        src={URL.createObjectURL(f)}
                                        alt={f.name}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && <IonNote color="danger">{error}</IonNote>}
                    {createdId && (
                        <IonNote color="success">
                            Creado ID: {createdId}
                        </IonNote>
                    )}

                    <IonButton
                        expand="block"
                        disabled={submitting}
                        onClick={submit}
                    >
                        {submitting ? <IonSpinner name="dots" /> : "Publicar"}
                    </IonButton>
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default Tab2;
