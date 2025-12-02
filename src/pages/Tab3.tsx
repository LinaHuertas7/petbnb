import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonRefresher,
    IonRefresherContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { storage } from "../service/storage";
import { useAuth } from "../context/AuthContext";
import { useHistory, useLocation } from "react-router-dom";
import {
    logOutOutline,
    pawOutline,
    addOutline,
    homeOutline,
    calendarOutline,
    personOutline,
} from "ionicons/icons";
import "./Tab3.css";

const Tab3: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [pets, setPets] = useState<any[]>([]);
    const { user, isAuthenticated, logout } = useAuth();
    const history = useHistory();
    const location = useLocation();

    const loadData = async () => {
        if (!user) return;
        console.log("Cargando datos del perfil...");
        const bookingsData = await storage.getUserBookings(user.id);
        const petsData = await storage.getUserPets(user.id);
        console.log("Mascotas cargadas:", petsData.length);
        console.log("Reservas cargadas:", bookingsData.length);
        setBookings(bookingsData);
        setPets(petsData);
    };

    // Cargar cuando el usuario cambia
    useEffect(() => {
        loadData();
    }, [user]);

    // Recargar cuando la ubicación cambia (cuando vuelves a esta página)
    useEffect(() => {
        if (location.pathname === "/tabs/tab3") {
            console.log("Tab3 visible, recargando datos...");
            loadData();
        }
    }, [location.pathname]);

    // También recargar cada vez que el componente se vuelve visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && location.pathname === "/tabs/tab3") {
                console.log("Página visible, recargando datos...");
                loadData();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        history.push("/login");
    };

    const getSpeciesEmoji = (species: string) => {
        switch (species) {
            case "dog":
                return "🐕";
            case "cat":
                return "🐈";
            default:
                return "🐾";
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Perfil</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="profile-content" scrollY={true}>
                {isAuthenticated ? (
                    <>
                        <IonRefresher
                            slot="fixed"
                            onIonRefresh={async (e) => {
                                await loadData();
                                e.detail.complete();
                            }}
                        >
                            <IonRefresherContent></IonRefresherContent>
                        </IonRefresher>

                        {/* Header del perfil */}
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <IonIcon icon={personOutline} />
                            </div>
                            <h2>{user?.name}</h2>
                            <p>{user?.email}</p>
                        </div>

                        {/* Stats Cards */}
                        <IonGrid className="stats-grid">
                            <IonRow>
                                <IonCol size="4">
                                    <div className="stat-card">
                                        <IonIcon icon={pawOutline} />
                                        <strong>{pets.length}</strong>
                                        <span>Mascotas</span>
                                    </div>
                                </IonCol>
                                <IonCol size="4">
                                    <div className="stat-card">
                                        <IonIcon icon={calendarOutline} />
                                        <strong>{bookings.length}</strong>
                                        <span>Reservas</span>
                                    </div>
                                </IonCol>
                                <IonCol size="4">
                                    <div className="stat-card">
                                        <IonIcon icon={homeOutline} />
                                        <strong>0</strong>
                                        <span>Alojamientos</span>
                                    </div>
                                </IonCol>
                            </IonRow>
                        </IonGrid>

                        {/* Sección de Mascotas */}
                        <div className="section">
                            <div className="section-title">
                                <h3>
                                    <IonIcon icon={pawOutline} />
                                    Mis Mascotas
                                </h3>
                                <IonButton
                                    fill="clear"
                                    size="small"
                                    onClick={() => history.push("/pets/new")}
                                >
                                    <IonIcon
                                        icon={addOutline}
                                        slot="icon-only"
                                    />
                                </IonButton>
                            </div>

                            {pets.length === 0 ? (
                                <IonCard className="empty-card">
                                    <IonCardContent>
                                        <div className="empty-content">
                                            <IonIcon icon={pawOutline} />
                                            <p>
                                                No tienes mascotas registradas
                                            </p>
                                            <IonButton
                                                size="small"
                                                onClick={() =>
                                                    history.push("/pets/new")
                                                }
                                            >
                                                Agregar mascota
                                            </IonButton>
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            ) : (
                                <div className="pets-list">
                                    {pets.slice(0, 3).map((pet) => (
                                        <IonCard
                                            key={pet.id}
                                            className="pet-mini-card"
                                            onClick={() =>
                                                history.push(
                                                    `/pets/edit/${pet.id}`
                                                )
                                            }
                                        >
                                            <IonCardContent>
                                                <div className="pet-mini-content">
                                                    {pet.photo ? (
                                                        <img
                                                            src={pet.photo}
                                                            alt={pet.name}
                                                            className="pet-mini-photo"
                                                        />
                                                    ) : (
                                                        <div className="pet-mini-placeholder">
                                                            {getSpeciesEmoji(
                                                                pet.species
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="pet-mini-info">
                                                        <strong>
                                                            {pet.name}
                                                        </strong>
                                                        <span>
                                                            {pet.breed} •{" "}
                                                            {pet.age}{" "}
                                                            {pet.age === 1
                                                                ? "año"
                                                                : "años"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </IonCardContent>
                                        </IonCard>
                                    ))}
                                </div>
                            )}

                            {pets.length > 3 && (
                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    onClick={() => history.push("/pets")}
                                >
                                    Ver todas mis mascotas ({pets.length})
                                </IonButton>
                            )}
                        </div>

                        {/* Sección de Reservas */}
                        <div className="section">
                            <div className="section-title">
                                <h3>
                                    <IonIcon icon={calendarOutline} />
                                    Mis Reservas
                                </h3>
                            </div>

                            {bookings.length === 0 ? (
                                <IonCard className="empty-card">
                                    <IonCardContent>
                                        <div className="empty-content">
                                            <IonIcon icon={calendarOutline} />
                                            <p>No tienes reservas activas</p>
                                            <IonButton
                                                size="small"
                                                onClick={() =>
                                                    history.push("/tabs/tab1")
                                                }
                                            >
                                                Buscar alojamientos
                                            </IonButton>
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            ) : (
                                <IonList className="bookings-list">
                                    {bookings.map((b) => (
                                        <IonItem key={b.id}>
                                            <IonLabel>
                                                <h2>
                                                    Reserva {b.id.slice(0, 8)}
                                                </h2>
                                                <p>
                                                    {b.startDate} → {b.endDate}
                                                </p>
                                                <p>
                                                    {b.pets.length} mascota(s)
                                                </p>
                                            </IonLabel>
                                            <IonBadge
                                                slot="end"
                                                color={
                                                    b.status === "confirmed"
                                                        ? "success"
                                                        : "warning"
                                                }
                                            >
                                                {b.status}
                                            </IonBadge>
                                        </IonItem>
                                    ))}
                                </IonList>
                            )}
                        </div>

                        {/* Botón de cerrar sesión */}
                        <div className="section">
                            <IonButton
                                expand="block"
                                color="danger"
                                fill="outline"
                                onClick={handleLogout}
                            >
                                <IonIcon icon={logOutOutline} slot="start" />
                                Cerrar sesión
                            </IonButton>
                        </div>
                    </>
                ) : (
                    <div className="not-authenticated">
                        <div className="not-auth-icon">👤</div>
                        <h2>No has iniciado sesión</h2>
                        <p>
                            Inicia sesión para ver tu perfil y gestionar tus
                            mascotas
                        </p>
                        <IonButton onClick={() => history.push("/login")}>
                            Iniciar sesión
                        </IonButton>
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default Tab3;
