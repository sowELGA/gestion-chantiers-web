import api from "./axios";

export const dashboardApi = {
  index: () => api.get("/dashboard"),
};
