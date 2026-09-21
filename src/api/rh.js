import api from "./axios";

export const ouvriersApi = {
  list: (filters = {}) => api.get("/rh/ouvriers", { params: filters }),
  formOptions: () => api.get("/rh/ouvriers/form-options"),
  create: (data) => api.post("/rh/ouvriers", data),
  update: (id, data) => api.put(`/rh/ouvriers/${id}`, data),
  toggleStatut: (id) => api.patch(`/rh/ouvriers/${id}/toggle`),
  remove: (id) => api.delete(`/rh/ouvriers/${id}`),
};

export const postesApi = {
  list: () => api.get("/rh/postes"),
  create: (data) => api.post("/rh/postes", data),
  update: (id, data) => api.put(`/rh/postes/${id}`, data),
  remove: (id) => api.delete(`/rh/postes/${id}`),
};

export const tauxSalairesApi = {
  chantiers: () => api.get("/rh/taux-salaires"),
  show: (chantierId) => api.get(`/rh/taux-salaires/${chantierId}`),
  update: (chantierId, taux) =>
    api.put(`/rh/taux-salaires/${chantierId}`, { taux }),
};
