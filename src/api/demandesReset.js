import api from "./axios";

export const demandesResetApi = {
  list: () => api.get("/admin/demandes-reset"),
  resoudre: (id) => api.patch(`/admin/demandes-reset/${id}/resoudre`),
};
