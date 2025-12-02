import { useAuth } from '../context/AuthContext';
import { IonButton, IonAlert } from '@ionic/react';
import { useState } from 'react';

const BookingPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const history = useHistory();

    const handleBooking = () => {
        if (!isAuthenticated) {
            setShowLoginAlert(true);
            return;
        }
        // Proceder con la reserva
    };

    return (
        <>
            <IonButton onClick={handleBooking}>
                Reservar ahora
            </IonButton>

            <IonAlert
                isOpen={showLoginAlert}
                onDidDismiss={() => setShowLoginAlert(false)}
                header="Inicia sesión"
                message="Debes iniciar sesión para hacer una reserva"
                buttons={[
                    {
                        text: 'Cancelar',
                        role: 'cancel',
                    },
                    {
                        text: 'Iniciar sesión',
                        handler: () => {
                            history.push('/login');
                        },
                    },
                ]}
            />
        </>
    );
};