import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { dafDepensesApi } from "../../api/dafDepenses";
import { usePageHeader } from "../../context/PageHeaderContext";

const STATUT_CONFIG = {
  en_attente: ["En attente", "bg-amber-50 text-amber-700 border-amber-200"],
  en_cours: ["En cours", "bg-blue-50 text-blue-700 border-blue-200"],
  suspendu: ["Suspendu", "bg-red-50 text-red-700 border-red-200"],
  livre: ["Livré", "bg-emerald-50 text-emerald-700 border-emerald-200"],
};

const FILTRES = [
  { valeur: "en_cours", label: "En cours" },
  { valeur: "toutes", label: "Tous" },
  { valeur: "en_attente", label: "En attente" },
  { valeur: "suspendu", label: "Suspendus" },
  { valeur: "livre", label: "Livrés" },
];

export default function Depenses() {
  const { setPageHeader } = usePageHeader();
  const [chantiers, setChantiers] = useState([]);
  const [statutFiltre, setStatutFiltre] = useState("en_cours");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageHeader(
      "Suivi des dépenses",
      "Sélectionnez un chantier pour consulter ses dépenses.",
    );
  }, [setPageHeader]);

  const load = useCallback(
    (statut = statutFiltre) => {
      setLoading(true);
      dafDepensesApi
        .index({ statut })
        .then((res) => setChantiers(res.data.chantiers))
        .finally(() => setLoading(false));
    },
    [statutFiltre],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleFiltre = (valeur) => {
    setStatutFiltre(valeur);
    load(valeur);
  };

  if (loading)
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {FILTRES.map((f) => (
          <button
            key={f.valeur}
            onClick={() => handleFiltre(f.valeur)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              statutFiltre === f.valeur
                ? "bg-[#0F3D37] text-white border-[#0F3D37]"
                : "bg-white text-slate-600 border-slate-200 hover:border-[#1C9F93] hover:text-[#1C9F93]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        <strong className="text-[#0F172A] font-semibold">
          {chantiers.length}
        </strong>{" "}
        chantier(s){statutFiltre !== "toutes" ? "" : " au total"}
      </p>

      {chantiers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-sm font-medium text-slate-600">
            Aucun chantier{statutFiltre !== "toutes" ? " avec ce statut" : ""}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {chantiers.map((c) => {
            const [sLabel, sClass] = STATUT_CONFIG[c.statut] ?? [
              c.statut,
              "bg-slate-50 text-slate-700 border-slate-200",
            ];
            const depensesTotal = c.depenses_sum_montant ?? 0;
            const pct =
              c.budget_prevu > 0
                ? Math.round((depensesTotal / c.budget_prevu) * 100)
                : null;
            const estLivre = c.statut === "livre";

            return (
              <Link
                key={c.id}
                to={`/daf/depenses/${c.id}`}
                className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:border-[#1C9F93]/50 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="h-1 w-full bg-[#1C9F93] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 bg-[#1C9F93]/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#1C9F93] transition-colors">
                      <svg
                        className="w-5 h-5 text-[#1C9F93] group-hover:text-white transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {estLivre && (
                        <span className="text-slate-400" title="Lecture seule">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${sClass}`}
                      >
                        {sLabel}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-[#0F172A] text-base group-hover:text-[#1C9F93] transition-colors line-clamp-1">
                      {c.nomChantier}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {c.localisation ?? "Adresse non renseignée"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Budget consommé</span>
                      {pct !== null ? (
                        <span
                          className={`font-semibold ${pct > 90 ? "text-red-500" : "text-[#0F172A]"}`}
                        >
                          {pct}%
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">
                          Budget non défini
                        </span>
                      )}
                    </div>
                    {pct !== null && (
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-[#1C9F93]"}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50/80 rounded-lg p-2.5 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Total dépensé
                    </span>
                    <span className="text-sm font-extrabold text-[#0F172A]">
                      {new Intl.NumberFormat("fr-FR").format(depensesTotal)}{" "}
                      <span className="text-[10px] font-normal text-slate-400">
                        FCFA
                      </span>
                    </span>
                  </div>
                </div>
                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    <strong className="text-[#0F172A] font-semibold">
                      {c.depenses_count}
                    </strong>{" "}
                    dépense(s)
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#1C9F93] group-hover:translate-x-0.5 transition-transform">
                    {estLivre ? "Consulter (lecture seule)" : "Consulter"}
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
