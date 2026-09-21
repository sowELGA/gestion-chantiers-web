import api from "./axios";
export const dashboardPointeurApi = {
  index: () => api.get("/pointeur/dashboard"),
};
