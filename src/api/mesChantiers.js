import api from "./axios";

export const mesChantiersApi = {
  list: (filters = {}) => api.get("/mes-chantiers", { params: filters }),
  show: (id) => api.get(`/mes-chantiers/${id}`),
};
