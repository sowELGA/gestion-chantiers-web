import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ChangerMotDePasse from "./pages/ChangerMotDePasse";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import NonAutorise from "./pages/NonAutorise";
import Home from "./pages/Home";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Utilisateurs from "./pages/admin/Utilisateurs";
import Chantiers from "./pages/chantiers/Chantiers";
import ChantierDetail from "./pages/chantiers/ChantierDetail";
import MesChantiers from "./pages/chef-projet/MesChantiers";
import Phases from "./pages/chef-projet/Phases";
import Taches from "./pages/chef-projet/Taches";
import Approvisionnements from "./pages/chef-projet/Approvisionnements";
import DafApprovisionnements from "./pages/daf/Approvisionnements";
import DafApprovisionnementsHistorique from "./pages/daf/ApprovisionnementsHistorique";
import DafDepenses from "./pages/daf/Depenses";
import DafDepenseDetail from "./pages/daf/DepenseDetail";
import Livraisons from "./pages/pointeur/Livraisons";
import HistoriqueLivraisons from "./pages/pointeur/HistoriqueLivraisons";
import Ouvriers from "./pages/rh/Ouvriers";
import Postes from "./pages/rh/Postes";
import TauxSalaires from "./pages/rh/TauxSalaires";
import TauxSalaireEdit from "./pages/rh/TauxSalaireEdit";
import FicheJour from "./pages/pointeur/FicheJour";
import RecapSemaine from "./pages/pointeur/RecapSemaine";
import ModifierJour from "./pages/pointeur/ModifierJour";
import ValidationRecap from "./pages/chef-projet/ValidationRecap";
import PointeurDashboard from "./pages/pointeur/PointeurDashboard";
import ChoixChantierRecap from "./pages/chef-projet/ChoixChantierRecap";
import Salaires from "./pages/rh/Salaires";
import SalaireApercu from "./pages/rh/SalaireApercu";
import DashboardChefProjet from "./pages/chef-projet/DashboardChefProjet";
import Rapports from "./pages/chef-projet/Rapports";
import RapportsDirection from "./pages/direction/RapportsDirection";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
        <Route
          path="/changer-mot-de-passe"
          element={
            <ProtectedRoute>
              <ChangerMotDePasse />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />

          <Route path="/non-autorise" element={<NonAutorise />} />

          <Route
            path="/admin/utilisateurs"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Utilisateurs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chantiers"
            element={
              <ProtectedRoute roles={["directeur_travaux"]}>
                <Chantiers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chantiers/:id"
            element={
              <ProtectedRoute roles={["directeur_travaux"]}>
                <ChantierDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chef-projet/dashboard"
            element={
              <ProtectedRoute roles={["chef_projet"]}>
                <DashboardChefProjet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mes-chantiers"
            element={
              <ProtectedRoute roles={["chef_projet"]}>
                <MesChantiers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mes-chantiers/:id/phases"
            element={
              <ProtectedRoute roles={["chef_projet"]}>
                <Phases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mes-chantiers/:id/phases/:phaseId/taches"
            element={
              <ProtectedRoute roles={["chef_projet"]}>
                <Taches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvisionnements"
            element={
              <ProtectedRoute roles={["chef_projet"]}>
                <Approvisionnements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daf/approvisionnements"
            element={
              <ProtectedRoute roles={["daf"]}>
                <DafApprovisionnements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daf/approvisionnements/historique"
            element={
              <ProtectedRoute roles={["daf"]}>
                <DafApprovisionnementsHistorique />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daf/depenses"
            element={
              <ProtectedRoute roles={["daf"]}>
                <DafDepenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daf/depenses/:id"
            element={
              <ProtectedRoute roles={["daf"]}>
                <DafDepenseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pointeur/livraisons"
            element={
              <ProtectedRoute roles={["pointeur"]}>
                <Livraisons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pointeur/livraisons/historique"
            element={
              <ProtectedRoute roles={["pointeur"]}>
                <HistoriqueLivraisons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ouvriers"
            element={
              <ProtectedRoute roles={["responsable_rh"]}>
                <Ouvriers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/postes"
            element={
              <ProtectedRoute roles={["responsable_rh"]}>
                <Postes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salaires/taux"
            element={
              <ProtectedRoute roles={["responsable_rh"]}>
                <TauxSalaires />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salaires/taux/:id"
            element={
              <ProtectedRoute roles={["responsable_rh"]}>
                <TauxSalaireEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pointeur/pointage/fiche"
            element={
              <ProtectedRoute roles={["pointeur"]}>
                <FicheJour />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pointeur/pointage/recap"
            element={
              <ProtectedRoute roles={["pointeur"]}>
                <RecapSemaine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pointeur/pointage/modifier/:date"
            element={
              <ProtectedRoute roles={["pointeur"]}>
                <ModifierJour />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mes-chantiers/:id/recap"
            element={
              <ProtectedRoute roles={["chef_projet"]}>
                <ValidationRecap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pointeur/dashboard"
            element={
              <ProtectedRoute roles={["pointeur"]}>
                <PointeurDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pointage/validation"
            element={
              <ProtectedRoute roles={["chef_projet"]}>
                <ChoixChantierRecap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salaires"
            element={
              <ProtectedRoute roles={["responsable_rh"]}>
                <Salaires />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salaires/:id"
            element={
              <ProtectedRoute roles={["responsable_rh"]}>
                <SalaireApercu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mes-rapports"
            element={
              <ProtectedRoute roles={["chef_projet"]}>
                <Rapports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rapports"
            element={
              <ProtectedRoute roles={["directeur_travaux"]}>
                <RapportsDirection />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
