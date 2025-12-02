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
} from "@ionic/react";
import { useEffect, useState } from "react";
import { storage } from "../service/storage";
import { useAuth } from "../context/AuthContext";
import { useHistory } from "react-router-dom";
import { logOutOutline } from "ionicons/icons";
import "./Tab3.css";

const Tab3: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const { user, isAuthenticated, logout } = useAuth();
    const history = useHistory();

    const loadBookings = async () => {
        const data = await storage.getBookings();
        setBookings(data);
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const handleLogout = () => {
        logout();
        history.push("/login");
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Perfil</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                {isAuthenticated ? (
                    <>
                        <div style={{ padding: "20px" }}>
                            <h2>Hola, {user?.name}!</h2>
                            <p>{user?.email}</p>
                            <IonButton
                                expand="block"
                                color="danger"
                                onClick={handleLogout}
                            >
                                <IonIcon icon={logOutOutline} slot="start" />
                                Cerrar sesión
                            </IonButton>
                        </div>
                        <IonRefresher
                            slot="fixed"
                            onIonRefresh={async (e) => {
                                await loadBookings();
                                e.detail.complete();
                            }}
                        >
                            <IonRefresherContent></IonRefresherContent>
                        </IonRefresher>

                        <IonList>
                            {bookings.map((b) => (
                                <IonItem key={b.id}>
                                    <IonLabel>
                                        <h2>Reserva {b.id.slice(0, 8)}</h2>
                                        <p>
                                            {b.startDate} → {b.endDate}
                                        </p>
                                        <p>{b.pets.length} mascota(s)</p>
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
                    </>
                ) : (
                    <div
                        style={{
                            padding: "20px",
                            textAlign: "center",
                        }}
                    >
                        <p>No has iniciado sesión</p>
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
