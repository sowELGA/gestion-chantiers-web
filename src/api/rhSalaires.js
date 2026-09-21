import api from "./axios";

export const rhSalairesApi = {
  index: (params = {}) => api.get("/rh/salaires", { params }),
  apercu: (chantierId, params = {}) =>
    api.get(`/rh/salaires/${chantierId}/apercu`, { params }),

  telechargerPdf: async (chantierId, semaine, annee) => {
    const res = await api.get(`/rh/salaires/${chantierId}/pdf`, {
      params: { semaine, annee },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(
      new Blob([res.data], { type: "application/pdf" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `fiche-paie-chantier-${chantierId}-S${semaine}-${annee}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
