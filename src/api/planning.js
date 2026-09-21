import api from "./axios";

export const planningApi = {
  // Phases
  indexPhases: (chantierId, statut = "actives") =>
    api.get(`/mes-chantiers/${chantierId}/phases`, { params: { statut } }),
  prochainOrdre: (chantierId) =>
    api.get(`/mes-chantiers/${chantierId}/phases/prochain-ordre`),
  storePhase: (chantierId, data) =>
    api.post(`/mes-chantiers/${chantierId}/phases`, data),
  updatePhase: (chantierId, phaseId, data) =>
    api.put(`/mes-chantiers/${chantierId}/phases/${phaseId}`, data),
  destroyPhase: (chantierId, phaseId) =>
    api.delete(`/mes-chantiers/${chantierId}/phases/${phaseId}`),

  // Tâches
  indexTaches: (chantierId, phaseId) =>
    api.get(`/mes-chantiers/${chantierId}/phases/${phaseId}/taches`),
  tachesDisponibles: (chantierId, phaseId) =>
    api.get(
      `/mes-chantiers/${chantierId}/phases/${phaseId}/taches-disponibles`,
    ),
  storeTache: (chantierId, phaseId, data) =>
    api.post(`/mes-chantiers/${chantierId}/phases/${phaseId}/taches`, data),
  updateTache: (chantierId, phaseId, tacheId, data) =>
    api.put(
      `/mes-chantiers/${chantierId}/phases/${phaseId}/taches/${tacheId}`,
      data,
    ),
  destroyTache: (chantierId, phaseId, tacheId) =>
    api.delete(
      `/mes-chantiers/${chantierId}/phases/${phaseId}/taches/${tacheId}`,
    ),
  avancement: (chantierId, phaseId, tacheId, avancement) =>
    api.patch(
      `/mes-chantiers/${chantierId}/phases/${phaseId}/taches/${tacheId}/avancement`,
      { avancement },
    ),
};
