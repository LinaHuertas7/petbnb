import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonChip,
    IonCard,
    IonCardContent,
    IonSpinner,
    IonModal,
    IonGrid,
    IonRow,
    IonCol,
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import {
    locationOutline,
    starOutline,
    pawOutline,
    calendarOutline,
    closeOutline,
    chevronBackOutline,
    chevronForwardOutline,
    shareOutline,
    heartOutline,
} from "ionicons/icons";
import { storage } from "../service/storage";
import "./ListingDetailPage.css";

interface ListingParams {
    id: string;
}

const ListingDetailPage: React.FC = () => {
    const { id } = useParams<ListingParams>();
    const history = useHistory();
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showGallery, setShowGallery] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        loadListing();
    }, [id]);

    const loadListing = async () => {
        setLoading(true);
        try {
            const allListings = await storage.getAllListings();
            const found = allListings.find((l: any) => l.id === id);
            if (found) {
                setListing(found);
            }
        } catch (error) {
            console.error("Error loading listing:", error);
        } finally {
            setLoading(false);
        }
    };

    const nextImage = () => {
        if (listing?.photos) {
            setCurrentImageIndex((prev) =>
                prev === listing.photos.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        if (listing?.photos) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? listing.photos.length - 1 : prev - 1
            );
        }
    };

    if (loading) {
        return (
            <IonPage>
                <IonContent className="ion-padding ion-text-center">
                    <div style={{ marginTop: "50%" }}>
                        <IonSpinner name="dots" />
                        <p>Cargando detalles...</p>
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
                        <IonTitle>Alojamiento no encontrado</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding ion-text-center">
                    <p>No se encontró el alojamiento</p>
                    <IonButton onClick={() => history.push("/tabs/tab1")}>
                        Volver a buscar
                    </IonButton>
                </IonContent>
            </IonPage>
        );
    }

    const hasPhotos = listing.photos && listing.photos.length > 0;

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar className="detail-toolbar">
                    <IonButtons slot="start">
                        <IonButton
                            onClick={() => history.goBack()}
                            className="back-button"
                        >
                            <IonIcon icon={chevronBackOutline} />
                        </IonButton>
                    </IonButtons>
                    <IonButtons slot="end">
                        <IonButton className="icon-button">
                            <IonIcon icon={shareOutline} />
                        </IonButton>
                        <IonButton className="icon-button">
                            <IonIcon icon={heartOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent
                className="detail-content"
                scrollY={true}
                scrollEvents={true}
            >
                {/* Galería de fotos */}
                <div className="photo-gallery">
                    {hasPhotos ? (
                        <>
                            <div
                                className="main-photo"
                                onClick={() => setShowGallery(true)}
                            >
                                <img
                                    src={listing.photos[0]}
                                    alt={listing.title}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "";
                                    }}
                                />
                                {listing.photos.length > 1 && (
                                    <div className="photo-count-badge">
                                        📷 {listing.photos.length} fotos
                                    </div>
                                )}
                            </div>
                            {listing.photos.length > 1 && (
                                <div className="photo-grid">
                                    {listing.photos
                                        .slice(1, 5)
                                        .map((photo: string, idx: number) => (
                                            <div
                                                key={idx}
                                                className="grid-photo"
                                                onClick={() => {
                                                    setCurrentImageIndex(
                                                        idx + 1
                                                    );
                                                    setShowGallery(true);
                                                }}
                                            >
                                                <img
                                                    src={photo}
                                                    alt={`Foto ${idx + 2}`}
                                                />
                                                {idx === 3 &&
                                                    listing.photos.length >
                                                        5 && (
                                                        <div className="more-photos">
                                                            +
                                                            {listing.photos
                                                                .length -
                                                                5}{" "}
                                                            más
                                                        </div>
                                                    )}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-photos">
                            <div className="no-photos-icon">🏡</div>
                            <p>Sin fotos disponibles</p>
                        </div>
                    )}
                </div>

                {/* Información principal */}
                <div className="detail-container">
                    <div className="detail-header">
                        <div>
                            <h1>{listing.title}</h1>
                            <div className="detail-meta">
                                <span className="rating">⭐ 5.0</span>
                                <span className="separator">•</span>
                                <span>
                                    {listing.capacity}{" "}
                                    {listing.capacity === 1
                                        ? "mascota"
                                        : "mascotas"}
                                </span>
                                {listing.location && (
                                    <>
                                        <span className="separator">•</span>
                                        <span className="location">
                                            <IonIcon icon={locationOutline} />
                                            {listing.location.address ||
                                                "Ubicación disponible"}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="price-section">
                            <div className="price">
                                <strong>
                                    {listing.currency || "USD"} $
                                    {listing.basePrice}
                                </strong>
                                <span>/día</span>
                            </div>
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* Descripción */}
                    <div className="section">
                        <h2>Acerca de este alojamiento</h2>
                        <p className="description">
                            {listing.description ||
                                "Sin descripción disponible"}
                        </p>
                    </div>

                    <div className="divider"></div>

                    {/* Servicios */}
                    {listing.services && listing.services.length > 0 && (
                        <>
                            <div className="section">
                                <h2>Lo que ofrece este lugar</h2>
                                <div className="services-grid">
                                    {listing.services.map((service: string) => (
                                        <div
                                            key={service}
                                            className="service-item"
                                        >
                                            <span className="service-icon">
                                                ✓
                                            </span>
                                            <span>{service}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="divider"></div>
                        </>
                    )}

                    {/* Disponibilidad */}
                    {listing.availabilityRange && (
                        <>
                            <div className="section">
                                <h2>Disponibilidad</h2>
                                <IonCard className="availability-card">
                                    <IonCardContent>
                                        <div className="availability-info">
                                            <IonIcon icon={calendarOutline} />
                                            <div>
                                                <p className="availability-label">
                                                    Fechas disponibles
                                                </p>
                                                <p className="availability-dates">
                                                    {
                                                        listing
                                                            .availabilityRange
                                                            .startDate
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        listing
                                                            .availabilityRange
                                                            .endDate
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            </div>
                            <div className="divider"></div>
                        </>
                    )}

                    {/* Ubicación */}
                    {listing.location && (
                        <>
                            <div className="section">
                                <h2>Ubicación</h2>
                                <IonCard className="location-card">
                                    <IonCardContent>
                                        <div className="location-info">
                                            <IonIcon icon={locationOutline} />
                                            <div>
                                                <p>
                                                    {listing.location.address ||
                                                        "Dirección no especificada"}
                                                </p>
                                                <p className="coordinates">
                                                    {listing.location.lat.toFixed(
                                                        4
                                                    )}
                                                    ,{" "}
                                                    {listing.location.lng.toFixed(
                                                        4
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            </div>
                            <div className="divider"></div>
                        </>
                    )}

                    {/* Características adicionales */}
                    <div className="section">
                        <h2>Información importante</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <IonIcon icon={pawOutline} />
                                <div>
                                    <strong>Capacidad</strong>
                                    <p>
                                        Hasta {listing.capacity}{" "}
                                        {listing.capacity === 1
                                            ? "mascota"
                                            : "mascotas"}
                                    </p>
                                </div>
                            </div>
                            <div className="info-item">
                                <IonIcon icon={starOutline} />
                                <div>
                                    <strong>Calificación</strong>
                                    <p>5.0 (Nuevo)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón de reservar fijo */}
                <div className="booking-footer">
                    <div className="footer-price">
                        <strong>
                            {listing.currency || "USD"} ${listing.basePrice}
                        </strong>
                        <span>/día</span>
                    </div>
                    <IonButton
                        expand="block"
                        onClick={() => history.push(`/booking/${listing.id}`)}
                        className="booking-button"
                    >
                        Reservar ahora
                    </IonButton>
                </div>

                {/* Modal de galería */}
                <IonModal
                    isOpen={showGallery}
                    onDidDismiss={() => setShowGallery(false)}
                    className="gallery-modal"
                >
                    <div className="gallery-container">
                        <div className="gallery-header">
                            <IonButton
                                fill="clear"
                                onClick={() => setShowGallery(false)}
                                className="close-gallery"
                            >
                                <IonIcon icon={closeOutline} />
                            </IonButton>
                            <span className="gallery-counter">
                                {currentImageIndex + 1} /{" "}
                                {listing.photos?.length || 0}
                            </span>
                        </div>

                        <div className="gallery-content">
                            {hasPhotos && (
                                <>
                                    <IonButton
                                        fill="clear"
                                        onClick={prevImage}
                                        className="gallery-nav prev"
                                    >
                                        <IonIcon icon={chevronBackOutline} />
                                    </IonButton>

                                    <img
                                        src={listing.photos[currentImageIndex]}
                                        alt={`Foto ${currentImageIndex + 1}`}
                                        className="gallery-image"
                                    />

                                    <IonButton
                                        fill="clear"
                                        onClick={nextImage}
                                        className="gallery-nav next"
                                    >
                                        <IonIcon icon={chevronForwardOutline} />
                                    </IonButton>
                                </>
                            )}
                        </div>

                        <div className="gallery-thumbnails">
                            {listing.photos?.map(
                                (photo: string, idx: number) => (
                                    <div
                                        key={idx}
                                        className={`thumbnail ${
                                            idx === currentImageIndex
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setCurrentImageIndex(idx)
                                        }
                                    >
                                        <img
                                            src={photo}
                                            alt={`Miniatura ${idx + 1}`}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default ListingDetailPage;
