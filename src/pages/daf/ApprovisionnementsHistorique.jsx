import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { dafApprovisionnementsApi } from "../../api/dafApprovisionnements";
import { usePageHeader } from "../../context/PageHeaderContext";
import StatCard from "../../components/StatCard";

const STATUT_CONFIG = {
  cloturee: ["Clôturée", "bg-slate-100 text-slate-500"],
  rejetee: ["Rejetée", "bg-red-100 text-red-500"],
};

export default function ApprovisionnementsHistorique() {
  const { setPageHeader } = usePageHeader();
  const today = new Date().toISOString().slice(0, 10);
  const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const [filters, setFilters] = useState({
    date_debut: debutMois,
    date_fin: today,
  });
  const [demandes, setDemandes] = useState([]);
  const [stats, setStats] = useState({ cloturees: 0, rejetees: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageHeader(
      "Historique des approvisionnements",
      "Demandes clôturées et rejetées.",
    );
  }, [setPageHeader]);

  const load = useCallback(
    (f = filters) => {
      setLoading(true);
      dafApprovisionnementsApi
        .historique(f)
        .then((res) => {
          setDemandes(res.data.demandes);
          setStats(res.data.stats);
        })
        .finally(() => setLoading(false));
    },
    [filters],
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Link
        to="/daf/approvisionnements"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1C9F93] transition-colors"
      >
        ← Retour aux demandes en cours
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(filters);
          }}
          className="flex items-end gap-4 flex-wrap"
        >
          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1.5">
              Du
            </label>
            <input
              type="date"
              value={filters.date_debut}
              max={filters.date_fin}
              onChange={(e) =>
                setFilters({ ...filters, date_debut: e.target.value })
              }
              className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1.5">
              Au
            </label>
            <input
              type="date"
              value={filters.date_fin}
              min={filters.date_debut}
              max={today}
              onChange={(e) =>
                setFilters({ ...filters, date_fin: e.target.value })
              }
              className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors"
          >
            Filtrer
          </button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          borderColor="border-[#1C9F93]"
        />
        <StatCard
          label="Clôturées"
          value={stats.cloturees}
          borderColor="border-slate-400"
        />
        <StatCard
          label="Rejetées"
          value={stats.rejetees}
          borderColor="border-red-400"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      ) : demandes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">
            Aucune demande sur cette période.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-50">
          {demandes.map((d) => {
            const [label, badgeClass] = STATUT_CONFIG[d.statutAppro] ?? [
              d.statutAppro,
              "",
            ];
            return (
              <div
                key={d.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A] truncate">
                    {d.designation}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {d.quantite_demandee} {d.unite} · {d.chantier.nomChantier} ·{" "}
                    {d.demandeur.nomComplet}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${badgeClass}`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
