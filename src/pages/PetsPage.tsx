import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonFab,
    IonFabButton,
    IonAlert,
    IonActionSheet,
    IonSpinner,
    IonChip,
} from "@ionic/react";
import {
    addOutline,
    pawOutline,
    createOutline,
    trashOutline,
    informationCircleOutline,
} from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { storage } from "../service/storage";
import "./PetsPage.css";

const PetsPage: React.FC = () => {
    const { user } = useAuth();
    const history = useHistory();
    const location = useLocation();
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPet, setSelectedPet] = useState<any>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showActionSheet, setShowActionSheet] = useState(false);

    const loadPets = async () => {
        if (!user) return;
        setLoading(true);
        try {
            console.log("Cargando mascotas...");
            const userPets = await storage.getUserPets(user.id);
            console.log("Mascotas cargadas:", userPets.length);
            setPets(userPets);
        } catch (error) {
            console.error("Error loading pets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPets();
    }, [user]);

    // Recargar cuando vuelves a esta página
    useEffect(() => {
        if (location.pathname === "/pets") {
            console.log("PetsPage visible, recargando...");
            loadPets();
        }
    }, [location.pathname]);

    const handleDeletePet = async () => {
        if (!selectedPet) return;
        try {
            await storage.deletePet(selectedPet.id);
            await loadPets();
            setShowDeleteAlert(false);
            setSelectedPet(null);
        } catch (error) {
            console.error("Error deleting pet:", error);
        }
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

    const getSizeLabel = (size: string) => {
        switch (size) {
            case "small":
                return "Pequeño";
            case "medium":
                return "Mediano";
            case "large":
                return "Grande";
            default:
                return size;
        }
    };

    if (loading) {
        return (
            <IonPage>
                <IonContent className="ion-padding ion-text-center">
                    <div style={{ marginTop: "50%" }}>
                        <IonSpinner name="dots" color="primary" />
                        <p>Cargando mascotas...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Mis Mascotas</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="pets-content">
                {pets.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🐾</div>
                        <h2>No tienes mascotas registradas</h2>
                        <p>
                            Agrega información de tus mascotas para facilitar
                            las reservas
                        </p>
                        <IonButton
                            onClick={() => history.push("/pets/new")}
                            className="add-first-pet"
                        >
                            <IonIcon icon={addOutline} slot="start" />
                            Agregar mi primera mascota
                        </IonButton>
                    </div>
                ) : (
                    <div className="pets-container">
                        <div className="pets-header">
                            <h2>Tus Mascotas ({pets.length})</h2>
                            <p>
                                Gestiona la información de tus compañeros
                                peludos
                            </p>
                        </div>

                        <div className="pets-grid">
                            {pets.map((pet) => (
                                <IonCard
                                    key={pet.id}
                                    className="pet-card"
                                    onClick={() =>
                                        history.push(`/pets/edit/${pet.id}`)
                                    }
                                >
                                    <div className="pet-card-header">
                                        {pet.photo ? (
                                            <img
                                                src={pet.photo}
                                                alt={pet.name}
                                                className="pet-photo"
                                            />
                                        ) : (
                                            <div className="pet-photo-placeholder">
                                                {getSpeciesEmoji(pet.species)}
                                            </div>
                                        )}
                                        <div className="pet-actions">
                                            <IonButton
                                                fill="clear"
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedPet(pet);
                                                    setShowActionSheet(true);
                                                }}
                                            >
                                                ⋮
                                            </IonButton>
                                        </div>
                                    </div>

                                    <IonCardContent className="pet-card-content">
                                        <div className="pet-name-section">
                                            <h3>{pet.name}</h3>
                                            <span className="pet-species">
                                                {getSpeciesEmoji(pet.species)}{" "}
                                                {pet.breed}
                                            </span>
                                        </div>

                                        <div className="pet-info-row">
                                            <div className="pet-info-item">
                                                <span className="label">
                                                    Edad
                                                </span>
                                                <span className="value">
                                                    {pet.age}{" "}
                                                    {pet.age === 1
                                                        ? "año"
                                                        : "años"}
                                                </span>
                                            </div>
                                            <div className="pet-info-item">
                                                <span className="label">
                                                    Tamaño
                                                </span>
                                                <span className="value">
                                                    {getSizeLabel(pet.size)}
                                                </span>
                                            </div>
                                            {pet.weight > 0 && (
                                                <div className="pet-info-item">
                                                    <span className="label">
                                                        Peso
                                                    </span>
                                                    <span className="value">
                                                        {pet.weight} kg
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pet-chips">
                                            {pet.vaccinated && (
                                                <IonChip color="success">
                                                    <span>✓ Vacunado</span>
                                                </IonChip>
                                            )}
                                            {pet.neutered && (
                                                <IonChip color="primary">
                                                    <span>✓ Esterilizado</span>
                                                </IonChip>
                                            )}
                                            {pet.specialInstructions && (
                                                <IonChip color="warning">
                                                    <IonIcon
                                                        icon={
                                                            informationCircleOutline
                                                        }
                                                    />
                                                    <span>Indicaciones</span>
                                                </IonChip>
                                            )}
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            ))}
                        </div>
                    </div>
                )}

                {/* FAB para agregar mascota */}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push("/pets/new")}>
                        <IonIcon icon={addOutline} />
                    </IonFabButton>
                </IonFab>

                {/* Action Sheet */}
                <IonActionSheet
                    isOpen={showActionSheet}
                    onDidDismiss={() => setShowActionSheet(false)}
                    buttons={[
                        {
                            text: "Editar",
                            icon: createOutline,
                            handler: () => {
                                if (selectedPet) {
                                    history.push(
                                        `/pets/edit/${selectedPet.id}`
                                    );
                                }
                            },
                        },
                        {
                            text: "Eliminar",
                            role: "destructive",
                            icon: trashOutline,
                            handler: () => {
                                setShowDeleteAlert(true);
                            },
                        },
                        {
                            text: "Cancelar",
                            role: "cancel",
                        },
                    ]}
                />

                {/* Alert de eliminación */}
                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header="Eliminar mascota"
                    message={`¿Estás seguro de eliminar a ${selectedPet?.name}?`}
                    buttons={[
                        {
                            text: "Cancelar",
                            role: "cancel",
                        },
                        {
                            text: "Eliminar",
                            role: "destructive",
                            handler: handleDeletePet,
                        },
                    ]}
                />
            </IonContent>
        </IonPage>
    );
};

export default PetsPage;
