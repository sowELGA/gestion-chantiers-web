import api from "./axios";

export const receptionApi = {
  livraisons: () => api.get("/pointeur/livraisons"),
  historique: (filters = {}) =>
    api.get("/pointeur/livraisons/historique", { params: filters }),
  receptionner: (demandeId, data) =>
    api.post(`/pointeur/livraisons/${demandeId}/receptionner`, data),

  telechargerBonPdf: async (bonId) => {
    const res = await api.get(`/pointeur/livraisons/bons/${bonId}/pdf`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(
      new Blob([res.data], { type: "application/pdf" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `bon-reception-${bonId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
