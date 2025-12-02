import React, { useState, useCallback, useEffect } from "react";
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
    IonSpinner,
    IonProgressBar,
    IonAlert,
} from "@ionic/react";
import {
    ListingDraft,
    SERVICES,
    createListing,
} from "../components/listing/types";
import "./Tab2.css";
import { storage } from "../service/storage";
import { Geolocation } from "@capacitor/geolocation";
import { useAuth } from "../context/AuthContext";
import { useHistory } from "react-router-dom";

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
    const { isAuthenticated } = useAuth();
    const history = useHistory();
    const [draft, setDraft] = useState<ListingDraft>(empty);
    const [submitting, setSubmitting] = useState(false);
    const [createdId, setCreatedId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string[]>([]); // Nuevo estado para previews

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
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 8) {
                setError("Máximo 8 fotos");
                return;
            }

            // Guardar los archivos en el draft
            update("photos", files);

            // Crear previews para mostrar
            const previews = await Promise.all(
                files.map((file) => {
                    return new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                            resolve(reader.result as string);
                        reader.readAsDataURL(file);
                    });
                })
            );
            setPhotoPreview(previews);
        },
        [update]
    );

    // Cargar draft al montar
    useEffect(() => {
        storage.getListingDraft().then((saved) => {
            if (saved) {
                setDraft(saved);
                // Si el draft tiene fotos guardadas (base64), usarlas como preview
                if (saved.photos && saved.photos.length > 0) {
                    setPhotoPreview(saved.photos);
                }
            }
        });
    }, []);

    // Auto-guardar draft
    useEffect(() => {
        const timer = setInterval(() => {
            if (draft.title.trim()) {
                storage.saveListing(draft, true);
            }
        }, 5000); // Cada 5 segundos en lugar de 3
        return () => clearInterval(timer);
    }, [draft]);

    const getCurrentLocation = async () => {
        setLoadingLocation(true);
        try {
            const position = await Geolocation.getCurrentPosition();
            update("location", {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                address: "Ubicación actual",
            });
        } catch (error) {
            setError("No se pudo obtener la ubicación");
        }
        setLoadingLocation(false);
    };

    const isValid = () =>
        draft.title.trim() &&
        draft.capacity > 0 &&
        draft.basePrice > 0 &&
        draft.photos.length > 0 &&
        draft.availabilityRange?.start &&
        draft.availabilityRange?.end &&
        draft.location; // Agregar validación de ubicación

    const submit = async () => {
        if (!isValid()) {
            setError("Completa los campos obligatorios.");
            return;
        }
        setError(null);
        setSubmitting(true);

        try {
            const id = await storage.saveListing(draft, false);
            await storage.deleteDraft(id);

            const res = await createListing(draft);
            setSubmitting(false);
            setCreatedId(res.id);
            console.log("res", res);
            setDraft(empty);
            setPhotoPreview([]); // Limpiar previews
        } catch (err) {
            setSubmitting(false);
            setError("Error al publicar el alojamiento");
            console.error(err);
        }
    };

    // Redirigir si no está autenticado
    useEffect(() => {
        if (!isAuthenticated) {
            history.push("/login");
        }
    }, [isAuthenticated, history]);

    if (!isAuthenticated) {
        return null;
    }

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
                            presentation="date"
                            multiple={true}
                            value={
                                draft.availabilityRange
                                    ? [
                                          draft.availabilityRange.start,
                                          draft.availabilityRange.end,
                                      ]
                                    : undefined
                            }
                            onIonChange={(e) => {
                                const values = e.detail.value as string[];
                                if (!values || values.length < 2) {
                                    update("availabilityRange", undefined);
                                    return;
                                }
                                const sorted = values.sort();
                                update("availabilityRange", {
                                    start: sorted[0],
                                    end: sorted[sorted.length - 1],
                                });
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
                            {photoPreview.map((preview, i) => (
                                <div className="photo-thumb" key={i}>
                                    <img
                                        src={preview}
                                        alt={`Preview ${i + 1}`}
                                    />
                                    <button
                                        type="button"
                                        className="remove-photo"
                                        onClick={() => {
                                            const newPhotos =
                                                draft.photos.filter(
                                                    (_, idx) => idx !== i
                                                );
                                            const newPreviews =
                                                photoPreview.filter(
                                                    (_, idx) => idx !== i
                                                );
                                            update("photos", newPhotos);
                                            setPhotoPreview(newPreviews);
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                        {photoPreview.length > 0 && (
                            <p className="photo-count-text">
                                {photoPreview.length} de 8 fotos seleccionadas
                            </p>
                        )}
                    </div>

                    <IonItem>
                        <IonLabel position="stacked">Ubicación *</IonLabel>
                        <IonButton
                            expand="block"
                            fill="outline"
                            onClick={getCurrentLocation}
                            disabled={loadingLocation}
                        >
                            {loadingLocation ? (
                                <IonSpinner name="dots" />
                            ) : draft.location ? (
                                `📍 ${draft.location.lat.toFixed(
                                    4
                                )}, ${draft.location.lng.toFixed(4)}`
                            ) : (
                                "Obtener ubicación actual"
                            )}
                        </IonButton>
                    </IonItem>

                    <IonButton
                        expand="block"
                        disabled={submitting}
                        onClick={submit}
                    >
                        {submitting ? <IonSpinner name="dots" /> : "Publicar"}
                    </IonButton>
                </IonList>

                {/* Alert de error */}
                <IonAlert
                    isOpen={!!error}
                    onDidDismiss={() => setError(null)}
                    header="Error"
                    message={error || ""}
                    buttons={["OK"]}
                />

                {/* Alert de éxito */}
                <IonAlert
                    isOpen={!!createdId}
                    onDidDismiss={() => setCreatedId(null)}
                    header="¡Publicación exitosa!"
                    message={`Tu alojamiento ha sido creado con ID: ${createdId}`}
                    buttons={["Aceptar"]}
                />
            </IonContent>
        </IonPage>
    );
};

export default Tab2;
