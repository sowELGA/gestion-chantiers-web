import api from "./axios";

export const approvisionnementsApi = {
  chantiersDisponibles: () =>
    api.get("/approvisionnements/chantiers-disponibles"),
  list: (filters = {}) => api.get("/approvisionnements", { params: filters }),
  create: (data) => api.post("/approvisionnements", data),
  update: (id, data) => api.put(`/approvisionnements/${id}`, data),
  remove: (id) => api.delete(`/approvisionnements/${id}`),
};
