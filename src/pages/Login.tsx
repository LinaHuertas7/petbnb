import React, { useState } from "react";
import {
    IonPage,
    IonContent,
    IonInput,
    IonButton,
    IonText,
    IonIcon,
    IonSpinner,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
    eyeOutline,
    eyeOffOutline,
    mailOutline,
    lockClosedOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const history = useHistory();
    const { login } = useAuth();

    const handleLogin = async () => {
        setError("");

        if (!email || !password) {
            setError("Por favor completa todos los campos");
            return;
        }

        if (!email.includes("@")) {
            setError("Por favor ingresa un email válido");
            return;
        }

        setLoading(true);

        try {
            await login(email, password);
            history.push("/tabs/tab1");
        } catch (err) {
            setError("Credenciales inválidas");
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage>
            <IonContent className="login-content">
                <div className="login-container">
                    {/* Logo y título */}
                    <div className="login-header">
                        <div className="logo">🐾</div>
                        <h1>Bienvenido a PetBnB</h1>
                        <p className="subtitle">
                            El hogar perfecto para tu mascota
                        </p>
                    </div>

                    {/* Formulario */}
                    <div className="login-form">
                        {error && (
                            <div className="error-message">
                                <IonText color="danger">{error}</IonText>
                            </div>
                        )}

                        <div className="input-group">
                            <IonIcon
                                icon={mailOutline}
                                className="input-icon"
                            />
                            <IonInput
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onIonInput={(e) =>
                                    setEmail(e.detail.value || "")
                                }
                                onKeyPress={(e) =>
                                    e.key === "Enter" && handleLogin()
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
                                placeholder="Contraseña"
                                value={password}
                                onIonInput={(e) =>
                                    setPassword(e.detail.value || "")
                                }
                                onKeyPress={(e) =>
                                    e.key === "Enter" && handleLogin()
                                }
                                className="custom-input"
                            />
                            <IonIcon
                                icon={showPassword ? eyeOffOutline : eyeOutline}
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>

                        <div className="forgot-password">
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        <IonButton
                            expand="block"
                            onClick={handleLogin}
                            disabled={loading}
                            className="login-button"
                        >
                            {loading ? (
                                <IonSpinner name="dots" />
                            ) : (
                                "Iniciar sesión"
                            )}
                        </IonButton>

                        <div className="divider">
                            <span>o continúa con</span>
                        </div>

                        <div className="social-buttons">
                            <button className="social-button">
                                <span className="social-icon">🔵</span>
                                Facebook
                            </button>
                            <button className="social-button">
                                <span className="social-icon">🔴</span>
                                Google
                            </button>
                        </div>

                        <div className="signup-link">
                            ¿No tienes una cuenta?{" "}
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    history.push("/register");
                                }}
                            >
                                Regístrate
                            </a>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="login-footer">
                        <p>Al continuar, aceptas nuestros</p>
                        <p>
                            <a href="#">Términos de servicio</a> y{" "}
                            <a href="#">Política de privacidad</a>
                        </p>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Login;
