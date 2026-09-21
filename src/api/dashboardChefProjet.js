import api from "./axios";

export const dashboardChefProjetApi = {
  index: () => api.get("/chef-projet/dashboard"),
};
