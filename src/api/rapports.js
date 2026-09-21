import api from "./axios";

export const rapportsApi = {
  formOptions: () => api.get("/rapports/form-options"),
  list: (params = {}) => api.get("/rapports", { params }),
  create: (data) => api.post("/rapports", data),
  update: (id, data) => api.put(`/rapports/${id}`, data),
  remove: (id) => api.delete(`/rapports/${id}`),
};
