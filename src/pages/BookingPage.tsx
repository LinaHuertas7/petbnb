import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonTextarea,
    IonCard,
    IonCardContent,
    IonIcon,
    IonSpinner,
    IonAlert,
    IonModal,
    IonCheckbox,
} from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import {
    calendarOutline,
    pawOutline,
    locationOutline,
    cardOutline,
    informationCircleOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import { storage } from "../service/storage";
import "./BookingPage.css";

interface BookingParams {
    id: string;
}

const BookingPage: React.FC = () => {
    const { id } = useParams<BookingParams>();
    const { user } = useAuth();
    const history = useHistory();

    const [listing, setListing] = useState<any>(null);
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        selectedPets: [] as string[],
        specialRequests: "",
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        if (!user) {
            history.push("/login");
            return;
        }

        setLoading(true);
        try {
            const allListings = await storage.getAllListings();
            const foundListing = allListings.find((l: any) => l.id === id);

            if (!foundListing) {
                setAlertMessage("Alojamiento no encontrado");
                setShowAlert(true);
                return;
            }

            const userPets = await storage.getUserPets(user.id);

            setListing(foundListing);
            setPets(userPets);

            // Pre-seleccionar fechas si hay disponibilidad
            if (foundListing.availabilityRange?.from) {
                setFormData((prev) => ({
                    ...prev,
                    startDate: foundListing.availabilityRange.from,
                }));
            }
        } catch (error) {
            console.error("Error loading data:", error);
            setAlertMessage("Error al cargar los datos");
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const calculateTotal = () => {
        const days = calculateDays();
        const petsCount = formData.selectedPets.length;
        if (days === 0 || petsCount === 0) return 0;
        return days * listing.basePrice * petsCount;
    };

    const handleSubmit = async () => {
        // Validaciones
        if (!formData.startDate || !formData.endDate) {
            setAlertMessage("Por favor selecciona las fechas de la reserva");
            setShowAlert(true);
            return;
        }

        if (formData.selectedPets.length === 0) {
            setAlertMessage("Debes seleccionar al menos una mascota");
            setShowAlert(true);
            return;
        }

        if (formData.selectedPets.length > listing.capacity) {
            setAlertMessage(
                `Este alojamiento solo acepta hasta ${listing.capacity} mascota(s)`
            );
            setShowAlert(true);
            return;
        }

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (start >= end) {
            setAlertMessage(
                "La fecha de fin debe ser posterior a la fecha de inicio"
            );
            setShowAlert(true);
            return;
        }

        setSubmitting(true);
        try {
            const booking = {
                id: `booking_${Date.now()}`,
                userId: user!.id,
                listingId: listing.id,
                listingTitle: listing.title,
                startDate: formData.startDate,
                endDate: formData.endDate,
                pets: formData.selectedPets.map((petId) => {
                    const pet = pets.find((p) => p.id === petId);
                    return {
                        id: pet.id,
                        name: pet.name,
                        species: pet.species,
                    };
                }),
                specialRequests: formData.specialRequests,
                totalAmount: calculateTotal(),
                currency: listing.currency || "USD",
                status: "pending",
                createdAt: new Date().toISOString(),
            };

            await storage.saveBooking(booking as any);
            setShowSuccess(true);
        } catch (error) {
            console.error("Error creating booking:", error);
            setAlertMessage("Error al crear la reserva");
            setShowAlert(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePetToggle = (petId: string) => {
        setFormData((prev) => ({
            ...prev,
            selectedPets: prev.selectedPets.includes(petId)
                ? prev.selectedPets.filter((id) => id !== petId)
                : [...prev.selectedPets, petId],
        }));
    };

    if (loading) {
        return (
            <IonPage>
                <IonContent className="ion-padding ion-text-center">
                    <div style={{ marginTop: "50%" }}>
                        <IonSpinner name="dots" color="primary" />
                        <p>Cargando...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (!listing) {
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
                <IonContent className="ion-padding ion-text-center">
                    <div className="error-state">
                        <h2>Alojamiento no encontrado</h2>
                        <IonButton onClick={() => history.push("/tabs/tab1")}>
                            Volver a buscar
                        </IonButton>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/listing/${id}`} />
                    </IonButtons>
                    <IonTitle>Reservar</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="booking-content" scrollY={true}>
                <div className="booking-container">
                    {/* Resumen del alojamiento */}
                    <IonCard className="listing-summary">
                        <IonCardContent>
                            <div className="summary-header">
                                {listing.photos && listing.photos.length > 0 ? (
                                    <img
                                        src={listing.photos[0]}
                                        alt={listing.title}
                                        className="summary-image"
                                    />
                                ) : (
                                    <div className="summary-placeholder">
                                        🏡
                                    </div>
                                )}
                                <div className="summary-info">
                                    <h3>{listing.title}</h3>
                                    <p>
                                        <IonIcon icon={locationOutline} />
                                        {listing.location?.address ||
                                            "Ubicación disponible"}
                                    </p>
                                    <p className="summary-price">
                                        <strong>
                                            {listing.currency || "USD"} $
                                            {listing.basePrice}
                                        </strong>
                                        <span>/día por mascota</span>
                                    </p>
                                </div>
                            </div>
                        </IonCardContent>
                    </IonCard>

                    {/* Selección de fechas */}
                    <IonCard className="section-card">
                        <IonCardContent>
                            <div className="section-title">
                                <IonIcon icon={calendarOutline} />
                                <h2>Fechas de tu estadía</h2>
                            </div>

                            <IonList className="date-list">
                                <IonItem>
                                    <IonLabel position="stacked">
                                        Fecha de inicio
                                    </IonLabel>
                                    <IonDatetime
                                        value={formData.startDate}
                                        onIonChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                startDate: e.detail
                                                    .value as string,
                                            })
                                        }
                                        presentation="date"
                                        min={new Date().toISOString()}
                                        max={listing.availabilityRange?.to}
                                    />
                                </IonItem>

                                <IonItem>
                                    <IonLabel position="stacked">
                                        Fecha de fin
                                    </IonLabel>
                                    <IonDatetime
                                        value={formData.endDate}
                                        onIonChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                endDate: e.detail
                                                    .value as string,
                                            })
                                        }
                                        presentation="date"
                                        min={
                                            formData.startDate ||
                                            new Date().toISOString()
                                        }
                                        max={listing.availabilityRange?.to}
                                    />
                                </IonItem>
                            </IonList>

                            {calculateDays() > 0 && (
                                <div className="days-badge">
                                    📅 {calculateDays()}{" "}
                                    {calculateDays() === 1 ? "día" : "días"}
                                </div>
                            )}
                        </IonCardContent>
                    </IonCard>

                    {/* Selección de mascotas */}
                    <IonCard className="section-card">
                        <IonCardContent>
                            <div className="section-title">
                                <IonIcon icon={pawOutline} />
                                <h2>Selecciona tus mascotas</h2>
                            </div>

                            {pets.length === 0 ? (
                                <div className="no-pets-message">
                                    <p>No tienes mascotas registradas</p>
                                    <IonButton
                                        size="small"
                                        fill="outline"
                                        onClick={() =>
                                            history.push("/pets/new")
                                        }
                                    >
                                        Agregar mascota
                                    </IonButton>
                                </div>
                            ) : (
                                <div className="pets-selection">
                                    {pets.map((pet) => (
                                        <div
                                            key={pet.id}
                                            className={`pet-select-item ${
                                                formData.selectedPets.includes(
                                                    pet.id
                                                )
                                                    ? "selected"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handlePetToggle(pet.id)
                                            }
                                        >
                                            <IonCheckbox
                                                checked={formData.selectedPets.includes(
                                                    pet.id
                                                )}
                                                onIonChange={() =>
                                                    handlePetToggle(pet.id)
                                                }
                                            />
                                            {pet.photo ? (
                                                <img
                                                    src={pet.photo}
                                                    alt={pet.name}
                                                    className="pet-select-photo"
                                                />
                                            ) : (
                                                <div className="pet-select-placeholder">
                                                    {pet.species === "dog"
                                                        ? "🐕"
                                                        : pet.species === "cat"
                                                        ? "🐈"
                                                        : "🐾"}
                                                </div>
                                            )}
                                            <div className="pet-select-info">
                                                <strong>{pet.name}</strong>
                                                <span>{pet.breed}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="capacity-info">
                                <IonIcon icon={informationCircleOutline} />
                                Capacidad máxima: {listing.capacity} mascota(s)
                            </p>
                        </IonCardContent>
                    </IonCard>

                    {/* Solicitudes especiales */}
                    <IonCard className="section-card">
                        <IonCardContent>
                            <div className="section-title">
                                <IonIcon icon={informationCircleOutline} />
                                <h2>Solicitudes especiales</h2>
                            </div>

                            <IonTextarea
                                value={formData.specialRequests}
                                onIonChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        specialRequests: e.detail.value || "",
                                    })
                                }
                                placeholder="Horarios preferidos, necesidades especiales, instrucciones adicionales..."
                                rows={4}
                                className="requests-textarea"
                            />
                        </IonCardContent>
                    </IonCard>

                    {/* Resumen de precio */}
                    {calculateTotal() > 0 && (
                        <IonCard className="price-summary">
                            <IonCardContent>
                                <div className="price-row">
                                    <span>
                                        {listing.currency || "USD"} $
                                        {listing.basePrice} x {calculateDays()}{" "}
                                        {calculateDays() === 1 ? "día" : "días"}{" "}
                                        x {formData.selectedPets.length}{" "}
                                        {formData.selectedPets.length === 1
                                            ? "mascota"
                                            : "mascotas"}
                                    </span>
                                    <strong>
                                        {listing.currency || "USD"} $
                                        {calculateTotal()}
                                    </strong>
                                </div>
                                <div className="price-row total">
                                    <span>Total</span>
                                    <strong className="total-amount">
                                        {listing.currency || "USD"} $
                                        {calculateTotal()}
                                    </strong>
                                </div>
                            </IonCardContent>
                        </IonCard>
                    )}

                    {/* Botón de reservar */}
                    <div className="booking-actions">
                        <IonButton
                            expand="block"
                            onClick={handleSubmit}
                            disabled={submitting || calculateTotal() === 0}
                            className="reserve-button"
                        >
                            {submitting ? (
                                <IonSpinner name="dots" />
                            ) : (
                                <>
                                    <IonIcon icon={cardOutline} slot="start" />
                                    Reservar ahora
                                </>
                            )}
                        </IonButton>
                    </div>
                </div>

                {/* Alert de error */}
                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header="Atención"
                    message={alertMessage}
                    buttons={["OK"]}
                />

                {/* Modal de éxito */}
                <IonModal
                    isOpen={showSuccess}
                    onDidDismiss={() => setShowSuccess(false)}
                >
                    <div className="success-modal">
                        <div className="success-icon">✓</div>
                        <h2>¡Reserva realizada!</h2>
                        <p>Tu reserva ha sido creada exitosamente</p>
                        <p className="booking-id">
                            ID: {`booking_${Date.now()}`.slice(0, 20)}...
                        </p>
                        <IonButton
                            expand="block"
                            onClick={() => {
                                setShowSuccess(false);
                                history.push("/tabs/tab3");
                            }}
                        >
                            Ver mis reservas
                        </IonButton>
                        <IonButton
                            expand="block"
                            fill="outline"
                            onClick={() => {
                                setShowSuccess(false);
                                history.push("/tabs/tab1");
                            }}
                        >
                            Seguir buscando
                        </IonButton>
                    </div>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default BookingPage;
