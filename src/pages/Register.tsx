import React, { useState } from "react";
import {
    IonPage,
    IonContent,
    IonInput,
    IonButton,
    IonText,
    IonIcon,
    IonSpinner,
    IonCheckbox,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
    eyeOutline,
    eyeOffOutline,
    mailOutline,
    lockClosedOutline,
    personOutline,
    callOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const history = useHistory();
    const { register } = useAuth();

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleRegister = async () => {
        setError("");

        // Validaciones
        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            setError("Por favor completa todos los campos obligatorios");
            return;
        }

        if (!formData.email.includes("@")) {
            setError("Por favor ingresa un email válido");
            return;
        }

        if (formData.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (!acceptTerms) {
            setError("Debes aceptar los términos y condiciones");
            return;
        }

        setLoading(true);

        try {
            await register(formData);
            history.push("/tabs/tab1");
        } catch (err) {
            setError("Error al crear la cuenta");
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage>
            <IonContent className="register-content">
                <div className="register-container">
                    <div className="register-header">
                        <div className="logo">🐾</div>
                        <h1>Crear cuenta</h1>
                        <p className="subtitle">Únete a la comunidad PetBnB</p>
                    </div>

                    <div className="register-form">
                        {error && (
                            <div className="error-message">
                                <IonText color="danger">{error}</IonText>
                            </div>
                        )}

                        <div className="input-group">
                            <IonIcon
                                icon={personOutline}
                                className="input-icon"
                            />
                            <IonInput
                                type="text"
                                placeholder="Nombre completo *"
                                value={formData.name}
                                onIonInput={(e) =>
                                    handleChange("name", e.detail.value || "")
                                }
                                className="custom-input"
                            />
                        </div>

                        <div className="input-group">
                            <IonIcon
                                icon={mailOutline}
                                className="input-icon"
                            />
                            <IonInput
                                type="email"
                                placeholder="Correo electrónico *"
                                value={formData.email}
                                onIonInput={(e) =>
                                    handleChange("email", e.detail.value || "")
                                }
                                className="custom-input"
                            />
                        </div>

                        <div className="input-group">
                            <IonIcon
                                icon={callOutline}
                                className="input-icon"
                            />
                            <IonInput
                                type="tel"
                                placeholder="Teléfono (opcional)"
                                value={formData.phone}
                                onIonInput={(e) =>
                                    handleChange("phone", e.detail.value || "")
                                }
                                className="custom-input"
                            />
                        </div>

                        <div className="input-group">
                            <IonIcon
                                icon={lockClosedOutline}
                                className="input-icon"
                            />
                            <IonInput
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña *"
                                value={formData.password}
                                onIonInput={(e) =>
                                    handleChange(
                                        "password",
                                        e.detail.value || ""
                                    )
                                }
                                className="custom-input"
                            />
                            <IonIcon
                                icon={showPassword ? eyeOffOutline : eyeOutline}
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>

                        <div className="input-group">
                            <IonIcon
                                icon={lockClosedOutline}
                                className="input-icon"
                            />
                            <IonInput
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirmar contraseña *"
                                value={formData.confirmPassword}
                                onIonInput={(e) =>
                                    handleChange(
                                        "confirmPassword",
                                        e.detail.value || ""
                                    )
                                }
                                className="custom-input"
                            />
                            <IonIcon
                                icon={
                                    showConfirmPassword
                                        ? eyeOffOutline
                                        : eyeOutline
                                }
                                className="toggle-password"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                            />
                        </div>

                        <div className="terms-checkbox">
                            <IonCheckbox
                                checked={acceptTerms}
                                onIonChange={(e) =>
                                    setAcceptTerms(e.detail.checked)
                                }
                            />
                            <label>
                                Acepto los{" "}
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                    términos y condiciones
                                </a>{" "}
                                y la{" "}
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                    política de privacidad
                                </a>
                            </label>
                        </div>

                        <IonButton
                            expand="block"
                            onClick={handleRegister}
                            disabled={loading}
                            className="register-button"
                        >
                            {loading ? (
                                <IonSpinner name="dots" />
                            ) : (
                                "Crear cuenta"
                            )}
                        </IonButton>

                        <div className="login-link">
                            ¿Ya tienes una cuenta?{" "}
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    history.push("/login");
                                }}
                            >
                                Inicia sesión
                            </a>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Register;
