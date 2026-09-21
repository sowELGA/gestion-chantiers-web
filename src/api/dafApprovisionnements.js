import api from "./axios";

export const dafApprovisionnementsApi = {
  index: () => api.get("/daf/approvisionnements"),
  historique: (filters = {}) =>
    api.get("/daf/approvisionnements/historique", { params: filters }),
  valider: (id) => api.patch(`/daf/approvisionnements/${id}/valider`),
  rejeter: (id) => api.patch(`/daf/approvisionnements/${id}/rejeter`),
  commander: (id, date_livraison_prevue) =>
    api.patch(`/daf/approvisionnements/${id}/commander`, {
      date_livraison_prevue,
    }),
  definirDateLivraison: (id, date_livraison_prevue) =>
    api.patch(`/daf/approvisionnements/${id}/date-livraison`, {
      date_livraison_prevue,
    }),
};
