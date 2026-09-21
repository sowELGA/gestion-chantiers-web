import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { dafApprovisionnementsApi } from "../../api/dafApprovisionnements";
import { usePageHeader } from "../../context/PageHeaderContext";
import DateLivraisonModal from "./components/DateLivraisonModal";

const STATUT_CONFIG = {
  validee: ["Validée", "bg-blue-100 text-blue-700"],
  en_cours_livraison: ["En livraison", "bg-[#1C9F93]/10 text-[#1C9F93]"],
  partiellement_recue: ["Partiellement reçue", "bg-purple-100 text-purple-700"],
};

function fmtDate(v) {
  if (!v) return null;
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

export default function Approvisionnements() {
  const { setPageHeader } = usePageHeader();
  const [enAttente, setEnAttente] = useState([]);
  const [enCours, setEnCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { demande, mode: 'commande' | 'date' }

  useEffect(() => {
    setPageHeader(
      "Gestion des approvisionnements",
      "Validez et suivez les demandes de vos chantiers.",
    );
  }, [setPageHeader]);

  const load = useCallback(() => {
    setLoading(true);
    dafApprovisionnementsApi
      .index()
      .then((res) => {
        setEnAttente(res.data.demandesEnAttente);
        setEnCours(res.data.demandesEnCours);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleValider = async (demande) => {
    try {
      await dafApprovisionnementsApi.valider(demande.id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Action impossible.");
    }
  };

  const handleRejeter = async (demande) => {
    if (!confirm("Rejeter cette demande ?")) return;
    try {
      await dafApprovisionnementsApi.rejeter(demande.id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Action impossible.");
    }
  };

  const handleSaveModal = async (date) => {
    const { demande, mode } = modal;
    if (mode === "commande") {
      await dafApprovisionnementsApi.commander(demande.id, date);
    } else {
      await dafApprovisionnementsApi.definirDateLivraison(demande.id, date);
    }
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <h3 className="font-semibold text-[#0F172A]">Demandes en attente</h3>
          <span className="text-xs text-slate-400">({enAttente.length})</span>
        </div>

        {enAttente.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-400">Aucune demande en attente.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {enAttente.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div
                    className={`w-1 h-10 rounded-full flex-shrink-0 ${d.priorite === "urgent" ? "bg-red-500" : "bg-slate-300"}`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {d.designation}
                      </p>
                      {d.priorite === "urgent" && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {d.quantite_demandee} {d.unite} · {d.chantier.nomChantier}{" "}
                      · Demandé par {d.demandeur.nomComplet}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <button
                    onClick={() => handleRejeter(d)}
                    className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Rejeter
                  </button>
                  <button
                    onClick={() => handleValider(d)}
                    className="px-3 py-1.5 text-xs font-medium bg-[#1C9F93] text-white rounded-lg hover:bg-[#178a7f] transition-colors"
                  >
                    Valider
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {enCours.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1C9F93]"></span>
            <h3 className="font-semibold text-[#0F172A]">En cours</h3>
            <span className="text-xs text-slate-400">({enCours.length})</span>
          </div>
          <div className="divide-y divide-slate-50">
            {enCours.map((d) => {
              const [label, badgeClass] = STATUT_CONFIG[d.statutAppro] ?? [
                d.statutAppro,
                "",
              ];
              const peutDefinirDate = [
                "en_cours_livraison",
                "partiellement_recue",
              ].includes(d.statutAppro);
              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div
                      className={`w-1 h-10 rounded-full flex-shrink-0 ${d.priorite === "urgent" ? "bg-red-500" : "bg-slate-300"}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {d.designation}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {d.quantite_demandee} {d.unite} ·{" "}
                        {d.chantier.nomChantier}
                        {d.statutAppro === "partiellement_recue" && (
                          <>
                            {" "}
                            · Restant :{" "}
                            <strong className="text-purple-600">
                              {d.quantite_restante} {d.unite}
                            </strong>
                          </>
                        )}
                      </p>
                      {peutDefinirDate && (
                        <p className="text-xs mt-0.5">
                          {d.date_livraison_prevue ? (
                            <>
                              <span className="text-slate-500">
                                Livraison prévue :
                              </span>{" "}
                              <strong className="text-[#0F172A]">
                                {fmtDate(d.date_livraison_prevue)}
                              </strong>
                            </>
                          ) : (
                            <span className="text-slate-400 italic">
                              Date de livraison non définie
                            </span>
                          )}
                          <button
                            onClick={() =>
                              setModal({ demande: d, mode: "date" })
                            }
                            className="text-[#1C9F93] hover:underline ml-1 font-medium"
                          >
                            {d.date_livraison_prevue ? "Modifier" : "Définir"}
                          </button>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
                    >
                      {label}
                    </span>
                    {d.statutAppro === "validee" && (
                      <button
                        onClick={() =>
                          setModal({ demande: d, mode: "commande" })
                        }
                        className="px-3 py-1.5 text-xs font-medium bg-[#0F172A] text-white rounded-lg hover:bg-[#1e293b] transition-colors"
                      >
                        Passer la commande
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Link
          to="/daf/approvisionnements/historique"
          className="text-sm text-[#1C9F93] hover:underline"
        >
          Voir l'historique complet →
        </Link>
      </div>

      <DateLivraisonModal
        demande={modal?.demande}
        mode={modal?.mode}
        open={!!modal}
        onClose={() => setModal(null)}
        onSave={handleSaveModal}
      />
    </>
  );
}
