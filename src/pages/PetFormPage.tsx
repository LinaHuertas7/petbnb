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
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonToggle,
    IonSpinner,
    IonIcon,
    IonAlert,
} from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { cameraOutline, saveOutline } from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import { storage } from "../service/storage";
import "./PetFormPage.css";

interface PetFormParams {
    id?: string;
}

const PetFormPage: React.FC = () => {
    const { id } = useParams<PetFormParams>();
    const { user } = useAuth();
    const history = useHistory();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        species: "dog" as "dog" | "cat" | "other",
        breed: "",
        age: 1,
        size: "medium" as "small" | "medium" | "large",
        weight: 0,
        photo: "",
        specialInstructions: "",
        medicalConditions: "",
        vaccinated: false,
        neutered: false,
    });

    useEffect(() => {
        if (isEditMode && id) {
            loadPet(id);
        }
    }, [id]);

    const loadPet = async (petId: string) => {
        setLoading(true);
        try {
            const pet = await storage.getPetById(petId);
            if (pet) {
                setFormData({
                    name: pet.name || "",
                    species: pet.species || "dog",
                    breed: pet.breed || "",
                    age: pet.age || 1,
                    size: pet.size || "medium",
                    weight: pet.weight || 0,
                    photo: pet.photo || "",
                    specialInstructions: pet.specialInstructions || "",
                    medicalConditions: pet.medicalConditions || "",
                    vaccinated: pet.vaccinated || false,
                    neutered: pet.neutered || false,
                });
            }
        } catch (error) {
            console.error("Error loading pet:", error);
        } finally {
            setLoading(false);
        }
    };

    const takePicture = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 80,
                allowEditing: true,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Prompt,
            });

            if (image.dataUrl) {
                setFormData({ ...formData, photo: image.dataUrl });
            }
        } catch (error) {
            console.error("Error taking picture:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setAlertMessage("Debes iniciar sesión para agregar mascotas");
            setShowAlert(true);
            return;
        }

        if (!formData.name || !formData.breed) {
            setAlertMessage("Por favor completa los campos obligatorios");
            setShowAlert(true);
            return;
        }

        setLoading(true);
        try {
            const petData = {
                id: isEditMode ? id : `pet_${Date.now()}`,
                userId: user.id,
                ...formData,
            };

            await storage.savePet(petData);
            history.goBack();
        } catch (error) {
            console.error("Error saving pet:", error);
            setAlertMessage("Error al guardar la mascota");
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
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

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/tabs/tab3" />
                    </IonButtons>
                    <IonTitle>
                        {isEditMode ? "Editar Mascota" : "Nueva Mascota"}
                    </IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent
                className="pet-form-content"
                scrollY={true}
                scrollEvents={true}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-container">
                        {/* Foto */}
                        <div className="photo-section">
                            <div
                                className="photo-preview"
                                onClick={takePicture}
                            >
                                {formData.photo ? (
                                    <img src={formData.photo} alt="Mascota" />
                                ) : (
                                    <div className="photo-placeholder">
                                        <IonIcon icon={cameraOutline} />
                                        <p>Agregar foto</p>
                                    </div>
                                )}
                            </div>
                            <IonButton fill="outline" onClick={takePicture}>
                                <IonIcon icon={cameraOutline} slot="start" />
                                {formData.photo ? "Cambiar foto" : "Tomar foto"}
                            </IonButton>
                        </div>

                        <IonList className="form-list">
                            {/* Información básica */}
                            <div className="section-header">
                                <h2>Información Básica</h2>
                            </div>

                            <IonItem>
                                <IonLabel position="stacked">
                                    Nombre <span className="required">*</span>
                                </IonLabel>
                                <IonInput
                                    value={formData.name}
                                    onIonChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.detail.value || "",
                                        })
                                    }
                                    placeholder="Ej: Max, Luna, Rocky..."
                                    required
                                />
                            </IonItem>

                            <IonItem>
                                <IonLabel position="stacked">
                                    Especie <span className="required">*</span>
                                </IonLabel>
                                <IonSelect
                                    value={formData.species}
                                    onIonChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            species: e.detail.value,
                                        })
                                    }
                                >
                                    <IonSelectOption value="dog">
                                        🐕 Perro
                                    </IonSelectOption>
                                    <IonSelectOption value="cat">
                                        🐈 Gato
                                    </IonSelectOption>
                                    <IonSelectOption value="other">
                                        🐾 Otro
                                    </IonSelectOption>
                                </IonSelect>
                            </IonItem>

                            <IonItem>
                                <IonLabel position="stacked">
                                    Raza <span className="required">*</span>
                                </IonLabel>
                                <IonInput
                                    value={formData.breed}
                                    onIonChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            breed: e.detail.value || "",
                                        })
                                    }
                                    placeholder="Ej: Labrador, Persa, Mestizo..."
                                    required
                                />
                            </IonItem>

                            <IonItem>
                                <IonLabel position="stacked">
                                    Edad (años)
                                </IonLabel>
                                <IonInput
                                    type="number"
                                    value={formData.age}
                                    onIonChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            age: parseInt(
                                                e.detail.value || "1"
                                            ),
                                        })
                                    }
                                    min="0"
                                    max="30"
                                />
                            </IonItem>

                            <IonItem>
                                <IonLabel position="stacked">Tamaño</IonLabel>
                                <IonSelect
                                    value={formData.size}
                                    onIonChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            size: e.detail.value,
                                        })
                                    }
                                >
                                    <IonSelectOption value="small">
                                        Pequeño (0-10 kg)
                                    </IonSelectOption>
                                    <IonSelectOption value="medium">
                                        Mediano (10-25 kg)
                                    </IonSelectOption>
                                    <IonSelectOption value="large">
                                        Grande (25+ kg)
                                    </IonSelectOption>
                                </IonSelect>
                            </IonItem>

                            <IonItem>
                                <IonLabel position="stacked">
                                    Peso (kg)
                                </IonLabel>
                                <IonInput
                                    type="number"
                                    value={formData.weight}
                                    onIonChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            weight: parseFloat(
                                                e.detail.value || "0"
                                            ),
                                        })
                                    }
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="Opcional"
                                />
                            </IonItem>

                            {/* Salud */}
                            <div className="section-header">
                                <h2>Información de Salud</h2>
                            </div>

                            <IonItem>
                                <IonLabel>Vacunado</IonLabel>
                                <IonToggle
                                    checked={formData.vaccinated}
                                    onIonChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            vaccinated: e.detail.checked,
                                        })
                                    }
                                />
                            </IonItem>

                            <IonItem>
                                <IonLabel>Esterilizado/Castrado</IonLabel>
                                <IonToggle
                                    checked={formData.neutered}
                                    onIonChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            neutered: e.detail.checked,
                                        })
                                    }
                                />
                            </IonItem>

                            <IonItem>
                                <IonLabel position="stacked">
                                    Condiciones Médicas
                                </IonLabel>
                                <IonTextarea
                                    value={formData.medicalConditions}
                                    onIonChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            medicalConditions:
                                                e.detail.value || "",
                                        })
                                    }
                                    placeholder="Alergias, enfermedades crónicas, medicamentos..."
                                    rows={3}
                                />
                            </IonItem>

                            {/* Indicaciones especiales */}
                            <div className="section-header">
                                <h2>Indicaciones Especiales</h2>
                            </div>

                            <IonItem>
                                <IonLabel position="stacked">
                                    Instrucciones de cuidado
                                </IonLabel>
                                <IonTextarea
                                    value={formData.specialInstructions}
                                    onIonChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            specialInstructions:
                                                e.detail.value || "",
                                        })
                                    }
                                    placeholder="Horarios de comida, comportamiento, necesidades especiales..."
                                    rows={4}
                                />
                            </IonItem>
                        </IonList>

                        {/* Botón de guardar */}
                        <div className="form-actions">
                            <IonButton
                                expand="block"
                                type="submit"
                                disabled={loading}
                                className="save-button"
                            >
                                {loading ? (
                                    <IonSpinner name="dots" />
                                ) : (
                                    <>
                                        <IonIcon
                                            icon={saveOutline}
                                            slot="start"
                                        />
                                        {isEditMode
                                            ? "Guardar cambios"
                                            : "Agregar mascota"}
                                    </>
                                )}
                            </IonButton>
                        </div>
                    </div>
                </form>

                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header="Atención"
                    message={alertMessage}
                    buttons={["OK"]}
                />
            </IonContent>
        </IonPage>
    );
};

export default PetFormPage;
