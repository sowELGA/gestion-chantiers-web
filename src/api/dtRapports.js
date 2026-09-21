import api from "./axios";

export const dtRapportsApi = {
  formOptions: () => api.get("/dt/rapports/form-options"),
  list: (params = {}) => api.get("/dt/rapports", { params }),
  show: (id) => api.get(`/dt/rapports/${id}`),

  telechargerPdf: async (id, titre) => {
    const res = await api.get(`/dt/rapports/${id}/pdf`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(
      new Blob([res.data], { type: "application/pdf" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `rapport-${titre ?? id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
