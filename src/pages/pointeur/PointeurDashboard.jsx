import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePageHeader } from "../../context/PageHeaderContext";
import { dashboardPointeurApi } from "../../api/dashboardPointeur";

const STATUT_CHANTIER = {
  en_attente: ["En attente", "bg-amber-500"],
  en_cours: ["En cours", "bg-[#1C9F93]"],
  suspendu: ["Suspendu", "bg-red-500"],
  livre: ["Livré", "bg-slate-500"],
};

const STATUT_RECAP = {
  en_attente: ["En attente de soumission", "bg-slate-100 text-slate-600", "🕐"],
  soumise: [
    "Soumise — En attente du chef",
    "bg-amber-100 text-amber-700",
    "📤",
  ],
  rejetee: ["Rejetée — Corrections requises", "bg-red-100 text-red-600", "❌"],
  validee_cp: [
    "Validée par le chef de projet",
    "bg-[#1C9F93]/10 text-[#1C9F93]",
    "✅",
  ],
  envoyee_direction: [
    "Transmise à la direction",
    "bg-slate-100 text-slate-500",
    "📋",
  ],
};

export default function PointeurDashboard() {
  const { user } = useAuth();
  const { setPageHeader } = usePageHeader();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageHeader(
      "Tableau de bord",
      `Bonjour ${user?.prenomUser} — ${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`,
    );
  }, [setPageHeader, user]);

  useEffect(() => {
    dashboardPointeurApi
      .index()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data)
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );

  if (!data.chantier) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <svg
          className="w-16 h-16 text-slate-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <p className="text-slate-400 text-sm font-medium">
          Aucun chantier ne vous est affecté pour le moment.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Contactez l'administrateur pour être affecté à un chantier.
        </p>
      </div>
    );
  }

  const { chantier, fiche_jour, recap, livraisons, today } = data;
  const [sLabel, sColor] = STATUT_CHANTIER[chantier.statut] ?? [
    "—",
    "bg-slate-400",
  ];
  const [labelRecap, badgeRecap, emoji] = STATUT_RECAP[recap.statut] ?? [
    "—",
    "",
    "❓",
  ];
  const pctPresence =
    fiche_jour.total > 0
      ? Math.round((fiche_jour.presents / fiche_jour.total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="bg-[#0F3D37] rounded-xl p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1C9F93]/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-[#1C9F93]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-lg">
              {chantier.nomChantier}
            </p>
            <p className="text-slate-400 text-sm">{chantier.localisation}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-semibold text-white ${sColor}`}
        >
          {sLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#0F172A]">Fiche du jour</h3>
            <span className="text-xs text-slate-400 capitalize">
              {new Date(today).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
          <div className="p-6">
            {!fiche_jour.enregistree ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Fiche non encore enregistrée
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {fiche_jour.total} ouvrier(s) actif(s) sur le chantier
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#1C9F93]">
                      {fiche_jour.presents}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Présents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-400">
                      {fiche_jour.absents}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Absents</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                  <div
                    className="h-2 rounded-full bg-[#1C9F93] transition-all"
                    style={{ width: `${pctPresence}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 text-right">
                  {pctPresence}% de présence
                </p>
              </>
            )}

            {chantier.statut === "en_cours" && (
              <Link
                to="/pointeur/pointage/fiche"
                className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${fiche_jour.enregistree ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-[#1C9F93] text-white hover:bg-[#178a7f]"}`}
              >
                {fiche_jour.enregistree
                  ? "Modifier la fiche"
                  : "Saisir le pointage"}
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#0F172A]">Récap hebdomadaire</h3>
            <span className="text-xs text-slate-400">
              Semaine {data.semaine}
            </span>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 bg-slate-50 border border-slate-200">
                {emoji}
              </div>
              <div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeRecap}`}
                >
                  {labelRecap}
                </span>
                {recap.statut === "rejetee" && recap.motif_rejet && (
                  <p className="text-xs text-red-500 mt-2 italic">
                    "{recap.motif_rejet.slice(0, 80)}
                    {recap.motif_rejet.length > 80 ? "…" : ""}"
                  </p>
                )}
              </div>
            </div>
            <Link
              to="/pointeur/pointage/recap"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1C9F93] text-white rounded-lg text-sm font-medium hover:bg-[#178a7f] transition-colors"
            >
              Voir le récap de la semaine
            </Link>
          </div>
        </div>
      </div>

      {livraisons.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#0F172A]">
              Livraisons en cours
              <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1C9F93]/10 text-[#1C9F93]">
                {livraisons.length}
              </span>
            </h3>
            <Link
              to="/pointeur/livraisons"
              className="text-xs text-[#1C9F93] hover:underline"
            >
              Tout voir →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {livraisons.map((l) => {
              const totalRecu = l.quantite_demandee - l.quantite_restante;
              const pct =
                l.quantite_demandee > 0
                  ? Math.round((totalRecu / l.quantite_demandee) * 100)
                  : 0;
              return (
                <div
                  key={l.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${l.priorite === "urgent" ? "bg-red-500" : "bg-[#1C9F93]"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#0F172A] truncate">
                          {l.designation}
                        </p>
                        {l.priorite === "urgent" && (
                          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            URGENT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-[#1C9F93]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {pct}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {totalRecu} / {l.quantite_demandee} {l.unite} reçus
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/pointeur/livraisons"
                    className="ml-4 px-3 py-1.5 text-xs font-medium bg-[#1C9F93] text-white rounded-lg hover:bg-[#178a7f] transition-colors flex-shrink-0"
                  >
                    Réceptionner
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
