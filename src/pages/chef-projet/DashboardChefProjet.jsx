import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePageHeader } from "../../context/PageHeaderContext";
import { dashboardChefProjetApi } from "../../api/dashboardChefProjet";

function fmtRelatif(dateStr) {
  const diffMs = new Date(dateStr) - new Date();
  const diffJours = Math.round(diffMs / 86400000);
  if (diffJours === 0) return "aujourd'hui";
  if (diffJours < 0) return `il y a ${Math.abs(diffJours)} j`;
  return `dans ${diffJours} j`;
}

export default function DashboardChefProjet() {
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
    dashboardChefProjetApi
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

  const {
    kpi,
    chantiers_avancement,
    taches_en_retard,
    fiches_soumises,
    semaine,
    annee,
  } = data;

  const barColor = (a) =>
    a >= 80 ? "bg-[#1C9F93]" : a >= 40 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-[#1C9F93]">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Mes chantiers
          </p>
          <p className="text-3xl font-extrabold text-[#0F172A] mt-2">
            {kpi.mes_chantiers}
          </p>
          <Link
            to="/mes-chantiers"
            className="text-xs text-[#1C9F93] hover:underline mt-1 inline-block"
          >
            Voir →
          </Link>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-blue-400">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Tâches en cours
          </p>
          <p className="text-3xl font-extrabold text-blue-500 mt-2">
            {kpi.taches_en_cours}
          </p>
          <p className="text-xs text-slate-400 mt-1">En progression</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-red-400">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Tâches en retard
          </p>
          <p className="text-3xl font-extrabold text-red-500 mt-2">
            {kpi.taches_en_retard}
          </p>
          <p className="text-xs text-slate-400 mt-1">À traiter en priorité</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-amber-400">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Fiches à valider
          </p>
          <p
            className={`text-3xl font-extrabold mt-2 ${kpi.fiches_a_valider > 0 ? "text-amber-500" : "text-[#0F172A]"}`}
          >
            {kpi.fiches_a_valider}
          </p>
          <p className="text-xs text-slate-400 mt-1">Semaine {semaine}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-purple-400">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Demandes appro
          </p>
          <p className="text-3xl font-extrabold text-purple-500 mt-2">
            {kpi.demandes_attente}
          </p>
          <Link
            to="/approvisionnements"
            className="text-xs text-[#1C9F93] hover:underline mt-1 inline-block"
          >
            Voir →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-[#0F172A]">
              Avancement de mes chantiers
            </h3>
          </div>
          {chantiers_avancement.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-400">Aucun chantier actif.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {chantiers_avancement.map((item) => (
                <Link
                  key={item.chantier.id}
                  to={`/mes-chantiers/${item.chantier.id}/phases`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {item.chantier.nomChantier}
                      </p>
                      {item.en_retard > 0 && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {item.en_retard} en retard
                        </span>
                      )}
                    </div>
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${barColor(item.avancement)}`}
                        style={{ width: `${item.avancement}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right flex-shrink-0">
                    <p className="text-xl font-bold text-[#0F172A]">
                      {item.avancement}%
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-[#0F172A]">
              Tâches en retard
              {taches_en_retard.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                  {taches_en_retard.length}
                </span>
              )}
            </h3>
          </div>
          {taches_en_retard.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-[#1C9F93]/10 rounded-full flex items-center justify-center mx-auto mb-3">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-400">Aucune tâche en retard !</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {taches_en_retard.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#0F172A] truncate">
                      {t.nomTache}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t.chantier.nomChantier} · {t.phase.nomPhase}
                    </p>
                  </div>
                  <div className="ml-3 flex-shrink-0 text-right">
                    <span className="text-xs font-semibold text-red-500">
                      {fmtRelatif(t.date_fin_prevue)}
                    </span>
                    <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1">
                      <div
                        className="h-1.5 rounded-full bg-red-400"
                        style={{ width: `${t.avancement}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {fiches_soumises.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-[#0F172A]">
              Fiches de pointage soumises — Semaine {semaine}
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {fiches_soumises.map((f) => (
              <div
                key={f.chantier_id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {f.nom_chantier}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {f.nb_ouvriers} ouvrier(s) · Semaine {semaine}
                  </p>
                </div>
                <Link
                  to={`/mes-chantiers/${f.chantier_id}/recap?semaine=${semaine}&annee=${annee}`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors"
                >
                  Valider →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
