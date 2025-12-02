import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ListingDetailPage from "./pages/ListingDetailPage";
import PetsPage from "./pages/PetsPage";
import { AuthProvider } from "./context/AuthContext";
import BookingPage from "./pages/BookingPage";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import Tabs from "./pages/Tabs";
import PetFormPage from "./pages/PetFormPage";

setupIonicReact();

const App: React.FC = () => (
    <IonApp>
        <AuthProvider>
            <IonReactRouter>
                <IonRouterOutlet>
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/register" component={Register} />
                    <Route path="/tabs" component={Tabs} />
                    <Route
                        exact
                        path="/listing/:id"
                        component={ListingDetailPage}
                    />
                    <Route exact path="/booking/:id" component={BookingPage} />
                    <Route exact path="/pets" component={PetsPage} />
                    <Route exact path="/pets/new" component={PetFormPage} />
                    <Route
                        exact
                        path="/pets/edit/:id"
                        component={PetFormPage}
                    />
                    <Route exact path="/">
                        <Redirect to="/tabs/tab1" />
                    </Route>
                </IonRouterOutlet>
            </IonReactRouter>
        </AuthProvider>
    </IonApp>
);

export default App;
