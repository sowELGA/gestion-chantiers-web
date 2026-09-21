import api from "./axios";

export const pointageApi = {
  ficheJour: () => api.get("/pointeur/pointage/fiche"),
  enregistrerFiche: (pointages) =>
    api.post("/pointeur/pointage/fiche", { pointages }),
  recapSemaine: (params = {}) =>
    api.get("/pointeur/pointage/recap", { params }),
  soumettreSemaine: (semaine, annee) =>
    api.post("/pointeur/pointage/soumettre", { semaine, annee }),
  modifierJour: (date) => api.get(`/pointeur/pointage/modifier/${date}`),
  enregistrerModificationJour: (date, pointages) =>
    api.post("/pointeur/pointage/modifier", { date, pointages }),
};
