import api from "./axios";

export const validationRecapApi = {
  index: (chantierId, params = {}) =>
    api.get(`/mes-chantiers/${chantierId}/recap`, { params }),
  valider: (chantierId, semaine, annee) =>
    api.post(`/mes-chantiers/${chantierId}/recap/valider`, { semaine, annee }),
  rejeter: (chantierId, semaine, annee, motif_rejet) =>
    api.post(`/mes-chantiers/${chantierId}/recap/rejeter`, {
      semaine,
      annee,
      motif_rejet,
    }),
};
