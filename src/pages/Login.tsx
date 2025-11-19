import React, { useState } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonFooter,
} from "@ionic/react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import "./Login.css";

const Login: React.FC = () => {
    const { register, handleSubmit } = useForm();
    const history = useHistory();
    const [error, setError] = useState("");

    const onSubmit = (data: any) => {
        // Implement login logic here
        console.log(data);
        // Redirect to another page on successful login
        history.push("/tab1");
    };

    return (
        <IonPage className="login-page">
            <IonHeader>
                <IonToolbar className="login-toolbar">
                    <IonTitle className="login-title">Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="login-content">
                <IonCard className="login-card">
                    <IonCardHeader className="login-card-header">
                        <IonCardTitle className="login-card-title">
                            Bienvenido
                        </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent className="login-card-content">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="login-form"
                        >
                            <IonItem className="login-item">
                                <IonLabel position="floating">Nombre</IonLabel>
                                <IonInput
                                    {...register("nombre")}
                                    required
                                    className="login-input"
                                ></IonInput>
                            </IonItem>
                            <IonItem className="login-item">
                                <IonLabel position="floating">
                                    Contraseña
                                </IonLabel>
                                <IonInput
                                    type="password"
                                    {...register("password")}
                                    required
                                    className="login-input"
                                ></IonInput>
                            </IonItem>
                            {error && <p className="login-error">{error}</p>}
                            <IonButton
                                expand="full"
                                type="submit"
                                className="login-submit-btn"
                            >
                                Ingresar
                            </IonButton>
                        </form>
                    </IonCardContent>
                </IonCard>
            </IonContent>
            <IonFooter className="login-footer">
                <IonToolbar className="login-footer-toolbar">
                    <div className="footer-content">
                        <IonButton fill="clear" className="footer-btn">
                            ¿No tienes cuenta?
                        </IonButton>
                        <IonButton
                            expand="block"
                            fill="clear"
                            className="footer-register-btn"
                        >
                            Regístrate aquí
                        </IonButton>
                    </div>
                </IonToolbar>
            </IonFooter>
        </IonPage>
    );
};

export default Login;
