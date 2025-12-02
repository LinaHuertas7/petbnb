import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonAlert,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonDatetime,
    IonTextarea,
    IonIcon,
    IonChip,
    IonSpinner,
    IonBackButton,
    IonButtons,
} from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    calendarOutline,
    pawOutline,
    cashOutline,
    personOutline,
    informationCircleOutline,
    checkmarkCircleOutline,
} from "ionicons/icons";
import { storage } from "../service/storage";
import "./BookingPage.css";

interface BookingParams {
    listingId: string;
}

const BookingPage: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const history = useHistory();
    const { listingId } = useParams<BookingParams>();

    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Datos de la reserva
    const [checkIn, setCheckIn] = useState<string>("");
    const [checkOut, setCheckOut] = useState<string>("");
    const [numberOfPets, setNumberOfPets] = useState<number>(1);
    const [specialRequests, setSpecialRequests] = useState<string>("");

    useEffect(() => {
        loadListing();
    }, [listingId]);

    const loadListing = async () => {
        setLoading(true);
        try {
            const allListings = await storage.getAllListings();
            const found = allListings.find((l) => l.id === listingId);
            if (found) {
                setListing(found);
            }
        } catch (error) {
            console.error("Error loading listing:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateNights = (): number => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const calculateTotal = (): number => {
        if (!listing) return 0;
        const nights = calculateNights();
        return nights * listing.basePrice * numberOfPets;
    };

    const handleBooking = async () => {
        if (!isAuthenticated) {
            setShowLoginAlert(true);
            return;
        }

        if (!checkIn || !checkOut) {
            alert("Por favor selecciona las fechas de entrada y salida");
            return;
        }

        if (numberOfPets < 1 || numberOfPets > (listing?.capacity || 1)) {
            alert(
                `El número de mascotas debe estar entre 1 y ${
                    listing?.capacity || 1
                }`
            );
            return;
        }

        setSubmitting(true);

        // Simular proceso de reserva
        setTimeout(() => {
            setSubmitting(false);
            setShowSuccessAlert(true);
        }, 2000);
    };

    if (loading) {
        return (
            <IonPage>
                <IonContent className="ion-padding ion-text-center">
                    <div style={{ marginTop: "50%" }}>
                        <IonSpinner name="dots" />
                        <p>Cargando información...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (!listing) {
        return (
            <IonPage>
                <IonContent className="ion-padding ion-text-center">
                    <p>Alojamiento no encontrado</p>
                    <IonButton onClick={() => history.goBack()}>
                        Volver
                    </IonButton>
                </IonContent>
            </IonPage>
        );
    }

    const nights = calculateNights();
    const total = calculateTotal();

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/tabs/tab1" />
                    </IonButtons>
                    <IonTitle>Reservar</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="booking-content">
                <div className="booking-container">
                    {/* Header con foto del alojamiento */}
                    <div className="booking-header">
                        {listing.photos && listing.photos.length > 0 ? (
                            <img
                                src={listing.photos[0]}
                                alt={listing.title}
                                className="booking-header-image"
                            />
                        ) : (
                            <div className="booking-header-placeholder">🏠</div>
                        )}
                        <div className="booking-header-overlay">
                            <h1>{listing.title}</h1>
                            <p>{listing.description?.substring(0, 100)}...</p>
                        </div>
                    </div>

                    {/* Formulario de reserva */}
                    <div className="booking-form">
                        <h2>Detalles de tu reserva</h2>

                        {/* Fechas */}
                        <IonCard className="booking-card">
                            <IonCardContent>
                                <div className="section-title">
                                    <IonIcon icon={calendarOutline} />
                                    <span>Fechas</span>
                                </div>

                                <IonItem lines="none">
                                    <IonLabel position="stacked">
                                        Fecha de entrada
                                    </IonLabel>
                                    <IonDatetime
                                        value={checkIn}
                                        onIonChange={(e) =>
                                            setCheckIn(e.detail.value as string)
                                        }
                                        presentation="date"
                                        min={new Date().toISOString()}
                                    />
                                </IonItem>

                                <IonItem lines="none">
                                    <IonLabel position="stacked">
                                        Fecha de salida
                                    </IonLabel>
                                    <IonDatetime
                                        value={checkOut}
                                        onIonChange={(e) =>
                                            setCheckOut(
                                                e.detail.value as string
                                            )
                                        }
                                        presentation="date"
                                        min={
                                            checkIn || new Date().toISOString()
                                        }
                                    />
                                </IonItem>

                                {nights > 0 && (
                                    <div className="nights-info">
                                        {nights}{" "}
                                        {nights === 1 ? "noche" : "noches"}
                                    </div>
                                )}
                            </IonCardContent>
                        </IonCard>

                        {/* Número de mascotas */}
                        <IonCard className="booking-card">
                            <IonCardContent>
                                <div className="section-title">
                                    <IonIcon icon={pawOutline} />
                                    <span>Mascotas</span>
                                </div>

                                <div className="pet-counter">
                                    <IonButton
                                        fill="outline"
                                        onClick={() =>
                                            setNumberOfPets(
                                                Math.max(1, numberOfPets - 1)
                                            )
                                        }
                                        disabled={numberOfPets <= 1}
                                    >
                                        -
                                    </IonButton>
                                    <div className="pet-count">
                                        <strong>{numberOfPets}</strong>
                                        <span>
                                            {numberOfPets === 1
                                                ? "mascota"
                                                : "mascotas"}
                                        </span>
                                    </div>
                                    <IonButton
                                        fill="outline"
                                        onClick={() =>
                                            setNumberOfPets(
                                                Math.min(
                                                    listing.capacity,
                                                    numberOfPets + 1
                                                )
                                            )
                                        }
                                        disabled={
                                            numberOfPets >= listing.capacity
                                        }
                                    >
                                        +
                                    </IonButton>
                                </div>

                                <div className="capacity-info">
                                    <IonIcon icon={informationCircleOutline} />
                                    Capacidad máxima: {listing.capacity}{" "}
                                    {listing.capacity === 1
                                        ? "mascota"
                                        : "mascotas"}
                                </div>
                            </IonCardContent>
                        </IonCard>

                        {/* Solicitudes especiales */}
                        <IonCard className="booking-card">
                            <IonCardContent>
                                <div className="section-title">
                                    <IonIcon icon={personOutline} />
                                    <span>Información adicional</span>
                                </div>

                                <IonTextarea
                                    placeholder="¿Alguna solicitud especial? (opcional)"
                                    value={specialRequests}
                                    onIonInput={(e) =>
                                        setSpecialRequests(e.detail.value || "")
                                    }
                                    rows={4}
                                    className="special-requests"
                                />
                            </IonCardContent>
                        </IonCard>

                        {/* Servicios incluidos */}
                        {listing.services && listing.services.length > 0 && (
                            <IonCard className="booking-card">
                                <IonCardContent>
                                    <div className="section-title">
                                        <IonIcon
                                            icon={checkmarkCircleOutline}
                                        />
                                        <span>Servicios incluidos</span>
                                    </div>
                                    <div className="services-list">
                                        {listing.services.map(
                                            (service: string) => (
                                                <IonChip key={service}>
                                                    <span>✓</span> {service}
                                                </IonChip>
                                            )
                                        )}
                                    </div>
                                </IonCardContent>
                            </IonCard>
                        )}

                        {/* Resumen de precio */}
                        <IonCard className="booking-card price-summary">
                            <IonCardContent>
                                <div className="section-title">
                                    <IonIcon icon={cashOutline} />
                                    <span>Resumen de precios</span>
                                </div>

                                <div className="price-breakdown">
                                    <div className="price-row">
                                        <span>
                                            {listing.currency} $
                                            {listing.basePrice} x {nights}{" "}
                                            {nights === 1 ? "noche" : "noches"}
                                        </span>
                                        <span>
                                            {listing.currency} $
                                            {listing.basePrice * nights}
                                        </span>
                                    </div>
                                    <div className="price-row">
                                        <span>
                                            {numberOfPets}{" "}
                                            {numberOfPets === 1
                                                ? "mascota"
                                                : "mascotas"}
                                        </span>
                                        <span>x {numberOfPets}</span>
                                    </div>
                                    <div className="price-divider" />
                                    <div className="price-row total">
                                        <strong>Total</strong>
                                        <strong>
                                            {listing.currency} ${total}
                                        </strong>
                                    </div>
                                </div>
                            </IonCardContent>
                        </IonCard>

                        {/* Botón de reservar */}
                        <IonButton
                            expand="block"
                            onClick={handleBooking}
                            disabled={submitting || !checkIn || !checkOut}
                            className="booking-button"
                        >
                            {submitting ? (
                                <>
                                    <IonSpinner name="dots" /> Procesando...
                                </>
                            ) : (
                                `Reservar por ${listing.currency} $${total}`
                            )}
                        </IonButton>

                        <p className="booking-disclaimer">
                            No se te cobrará hasta que el anfitrión confirme tu
                            reserva
                        </p>
                    </div>
                </div>

                {/* Alert de login requerido */}
                <IonAlert
                    isOpen={showLoginAlert}
                    onDidDismiss={() => setShowLoginAlert(false)}
                    header="Inicia sesión"
                    message="Debes iniciar sesión para hacer una reserva"
                    buttons={[
                        {
                            text: "Cancelar",
                            role: "cancel",
                        },
                        {
                            text: "Iniciar sesión",
                            handler: () => {
                                history.push("/login");
                            },
                        },
                    ]}
                />

                {/* Alert de éxito */}
                <IonAlert
                    isOpen={showSuccessAlert}
                    onDidDismiss={() => {
                        setShowSuccessAlert(false);
                        history.push("/tabs/tab3");
                    }}
                    header="¡Reserva exitosa!"
                    message="Tu solicitud de reserva ha sido enviada. El anfitrión te contactará pronto."
                    buttons={["OK"]}
                />
            </IonContent>
        </IonPage>
    );
};

export default BookingPage;
