import { Redirect, Route } from "react-router-dom";
import {
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs,
} from "@ionic/react";
import { searchOutline, addCircleOutline, personOutline } from "ionicons/icons";
import Tab1 from "./Tab1";
import Tab2 from "./Tab2";
import Tab3 from "./Tab3";

const Tabs = () => {
    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route exact path="/tabs/tab1" component={Tab1} />
                <Route exact path="/tabs/tab2" component={Tab2} />
                <Route exact path="/tabs/tab3" component={Tab3} />
                <Route exact path="/tabs">
                    <Redirect to="/tabs/tab1" />
                </Route>
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
                <IonTabButton tab="tab1" href="/tabs/tab1">
                    <IonIcon icon={searchOutline} />
                    <IonLabel>Buscar</IonLabel>
                </IonTabButton>

                <IonTabButton tab="tab2" href="/tabs/tab2">
                    <IonIcon icon={addCircleOutline} />
                    <IonLabel>Publicar</IonLabel>
                </IonTabButton>

                <IonTabButton tab="tab3" href="/tabs/tab3">
                    <IonIcon icon={personOutline} />
                    <IonLabel>Perfil</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default Tabs;
