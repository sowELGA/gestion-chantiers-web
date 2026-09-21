import api from "./axios";

export const usersApi = {
  list: (page = 1) => api.get(`/admin/utilisateurs?page=${page}`),
  create: (data) => api.post("/admin/utilisateurs", data),
  update: (id, data) => api.put(`/admin/utilisateurs/${id}`, data),
  toggleActif: (id) => api.patch(`/admin/utilisateurs/${id}/toggle`),
  reinitialiserMotDePasse: (id) =>
    api.patch(`/admin/utilisateurs/${id}/reinitialiser`),
};
