import api from "./axios";

export const dafDepensesApi = {
  index: (filters = {}) => api.get("/daf/depenses", { params: filters }),
  show: (chantierId, filters = {}) =>
    api.get(`/daf/depenses/${chantierId}`, { params: filters }),
  store: (chantierId, data) => api.post(`/daf/depenses/${chantierId}`, data),
  remove: (id) => api.delete(`/daf/depenses/${id}`),
};
