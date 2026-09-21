import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { tauxSalairesApi } from "../../api/rh";
import { usePageHeader } from "../../context/PageHeaderContext";

function formatMillier(v) {
  return v ? new Intl.NumberFormat("fr-FR").format(v) : "";
}

export default function TauxSalaireEdit() {
  const { id: chantierId } = useParams();
  const { setPageHeader } = usePageHeader();

  const [chantier, setChantier] = useState(null);
  const [matrice, setMatrice] = useState([]);
  const [valeurs, setValeurs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    tauxSalairesApi
      .show(chantierId)
      .then((res) => {
        setChantier(res.data.chantier);
        setMatrice(res.data.matrice);
        setPageHeader(
          "Configuration des taux salariaux",
          res.data.chantier.nomChantier,
        );
        const initial = {};
        res.data.matrice.forEach((l) => {
          initial[l.poste_id] = {
            taux_journalier: l.taux_journalier ?? "",
            taux_heure_sup: l.taux_heure_sup ?? "",
          };
        });
        setValeurs(initial);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chantierId]);

  const updateValeur = (posteId, champ, raw) => {
    const num = raw.replace(/\D/g, "");
    setValeurs((prev) => ({
      ...prev,
      [posteId]: { ...prev[posteId], [champ]: num },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tauxSalairesApi.update(chantierId, valeurs);
      alert("Taux salariaux enregistrés avec succès.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !chantier)
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link
            to="/salaires/taux"
            className="hover:text-[#1C9F93] transition-colors flex items-center gap-1"
          >
            ← Taux salariaux
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#0F172A] font-semibold truncate">
            {chantier.nomChantier}
          </span>
        </nav>
      </div>

      {matrice.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <h3 className="text-base font-semibold text-[#0F172A] mb-1">
            Aucun poste disponible
          </h3>
          <p className="text-slate-500 text-xs mb-6">
            Vous devez d'abord créer des postes de travail avant de pouvoir leur
            attribuer des taux salariaux.
          </p>
          <Link
            to="/postes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C9F93] text-white text-xs font-medium rounded-lg hover:bg-[#178a7f] transition-colors shadow-sm"
          >
            Créer des postes
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-[#0F172A] text-base">
                  Définition des grilles tarifaires
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Renseignez les montants en FCFA. Laissez vide les postes non
                  applicables à ce chantier.
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 self-start md:self-auto">
                {matrice.length} poste(s) au total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Intitulé du Poste</th>
                    <th className="px-4 py-3.5 text-center min-w-[200px]">
                      Taux journalier
                    </th>
                    <th className="px-4 py-3.5 text-center min-w-[200px]">
                      Taux heure supplémentaire
                    </th>
                    <th className="px-6 py-3.5 text-right w-32">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matrice.map((ligne) => {
                    const v = valeurs[ligne.poste_id] ?? {
                      taux_journalier: "",
                      taux_heure_sup: "",
                    };
                    const estConfigure = v.taux_journalier || v.taux_heure_sup;
                    return (
                      <tr
                        key={ligne.poste_id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-3.5 font-semibold text-[#0F172A]">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${estConfigure ? "bg-[#1C9F93]" : "bg-slate-300"}`}
                            ></span>
                            {ligne.poste_libelle}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatMillier(v.taux_journalier)}
                              onChange={(e) =>
                                updateValeur(
                                  ligne.poste_id,
                                  "taux_journalier",
                                  e.target.value,
                                )
                              }
                              placeholder="0"
                              className="w-full pl-3 pr-14 py-2 border border-slate-300 rounded-lg text-sm text-right font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/20 focus:border-[#1C9F93] transition-all"
                            />
                            <span className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                              FCFA
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formatMillier(v.taux_heure_sup)}
                              onChange={(e) =>
                                updateValeur(
                                  ligne.poste_id,
                                  "taux_heure_sup",
                                  e.target.value,
                                )
                              }
                              placeholder="0"
                              className="w-full pl-3 pr-14 py-2 border border-slate-300 rounded-lg text-sm text-right font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/20 focus:border-[#1C9F93] transition-all"
                            />
                            <span className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                              FCFA
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          {estConfigure ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Configuré
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                              Non défini
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/salaires/taux"
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-[#0F172A] hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1C9F93] text-white text-xs font-semibold rounded-lg hover:bg-[#178a7f] transition-all shadow-sm disabled:opacity-60"
              >
                {saving ? "Enregistrement..." : "Enregistrer la configuration"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
