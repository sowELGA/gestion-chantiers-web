import api from "./axios";

export const rolesApi = {
  list: () => api.get("/roles"),
};
