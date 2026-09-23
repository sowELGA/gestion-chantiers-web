import { useState, useEffect, useCallback } from "react";
import { receptionApi } from "../../api/reception";
import { usePageHeader } from "../../context/PageHeaderContext";
import LivraisonCard from "./components/LivraisonCard";

export default function Livraisons() {
  const { setPageHeader } = usePageHeader();
  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successBon, setSuccessBon] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    receptionApi
      .livraisons()
      .then((res) => {
        setLivraisons(res.data.livraisons);
        setPageHeader("Livraisons en cours", res.data.chantier.nomChantier);
      })
      .finally(() => setLoading(false));
  }, [setPageHeader]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReceptionne = (bon) => {
    setSuccessBon(bon);
    load();
  };

  if (loading)
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );

  return (
    <>
      {successBon && (
        <div className="bg-[#1C9F93]/10 border border-[#1C9F93]/30 rounded-xl p-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-[#1C9F93]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-[#0F172A]">
              Réception enregistrée avec succès.
            </p>
          </div>
          <button
            onClick={() => receptionApi.telechargerBonPdf(successBon.id)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Télécharger le bon de réception PDF
          </button>
        </div>
      )}

      {livraisons.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <svg
            className="w-12 h-12 text-slate-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-slate-400 text-sm">Aucune livraison en cours.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {livraisons.map((d) => (
            <LivraisonCard
              key={d.id}
              demande={d}
              onReceptionne={handleReceptionne}
            />
          ))}
        </div>
      )}
    </>
  );
}
