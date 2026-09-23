import api from "./axios";

export const chantiersApi = {
  list: (filters = {}) => api.get("/chantiers", { params: filters }),
  chefsProjetsDisponibles: () =>
    api.get("/chantiers/chefs-projets-disponibles"),
  create: (data) => api.post("/chantiers", data),
  show: (id) => api.get(`/chantiers/${id}`),
  update: (id, data) => api.put(`/chantiers/${id}`, data),
  remove: (id, confirmer = false) =>
    api.delete(`/chantiers/${id}`, { params: { confirmer } }),
  affecterChefProjet: (id, chef_projet_id) =>
    api.patch(`/chantiers/${id}/chef-projet`, { chef_projet_id }),
  affecterPointeur: (id, pointeur_id) =>
    api.patch(`/chantiers/${id}/pointeur`, { pointeur_id }),
  changerStatut: (id, statut) => api.patch(`/chantiers/${id}/statut/${statut}`),
};
