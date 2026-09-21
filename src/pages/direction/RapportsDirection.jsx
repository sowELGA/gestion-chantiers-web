import { useState, useEffect, useCallback } from "react";
import { dtRapportsApi } from "../../api/dtRapports";
import { usePageHeader } from "../../context/PageHeaderContext";
import StatCard from "../../components/StatCard";
import Pagination from "../../components/Pagination";
import RapportDetailModal from "./components/RapportDetailModal";

const TYPE_CONFIG = {
  avancement: ["Avancement", "bg-blue-100 text-blue-700"],
  incident: ["Incident", "bg-red-100 text-red-600"],
  livraison: ["Livraison", "bg-emerald-100 text-emerald-700"],
  reunion: ["Réunion", "bg-amber-100 text-amber-700"],
  autre: ["Autre", "bg-slate-100 text-slate-600"],
};

function fmtDate(v) {
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

export default function RapportsDirection() {
  const { setPageHeader } = usePageHeader();
  const [rapports, setRapports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    ce_mois: 0,
    incidents: 0,
    chantiers: 0,
  });
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [filters, setFilters] = useState({
    chantier_id: "",
    type: "tous",
    recherche: "",
    date_debut: "",
    date_fin: "",
  });

  useEffect(() => {
    setPageHeader(
      "Rapports de chantier",
      "Consultez tous les rapports rédigés par les chefs de projet.",
    );
  }, [setPageHeader]);

  const load = useCallback(
    (params = filters, page = 1) => {
      setLoading(true);
      dtRapportsApi
        .list({ ...params, page })
        .then((res) => {
          const r = res.data.rapports;
          setRapports(Array.isArray(r) ? r : (r?.data ?? []));
          setPagination(r?.meta ?? null);
          setStats(res.data.stats);
        })
        .finally(() => setLoading(false));
    },
    [filters],
  );

  useEffect(() => {
    load();
    dtRapportsApi.formOptions().then((res) => setChantiers(res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    load(filters);
  };

  const openDetail = (r) => setSelected(r);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total rapports"
          value={stats.total}
          borderColor="border-[#1C9F93]"
        />
        <StatCard
          label="Ce mois-ci"
          value={stats.ce_mois}
          borderColor="border-blue-400"
        />
        <StatCard
          label="Incidents"
          value={stats.incidents}
          borderColor="border-red-400"
        />
        <StatCard
          label="Chantiers concernés"
          value={stats.chantiers}
          borderColor="border-[#D4AF37]"
        />
      </div>

      <form
        onSubmit={handleFilterSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-end gap-3"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Recherche
          </label>
          <input
            value={filters.recherche}
            onChange={(e) =>
              setFilters({ ...filters, recherche: e.target.value })
            }
            placeholder="Titre ou contenu..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
          />
        </div>
        <div className="w-full sm:w-52">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Chantier
          </label>
          <select
            value={filters.chantier_id}
            onChange={(e) =>
              setFilters({ ...filters, chantier_id: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
          >
            <option value="">Tous les chantiers</option>
            {chantiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nomChantier}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-40">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
          >
            <option value="tous">Tous les types</option>
            <option value="avancement">Avancement</option>
            <option value="incident">Incident</option>
            <option value="livraison">Livraison</option>
            <option value="reunion">Réunion</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Du
          </label>
          <input
            type="date"
            value={filters.date_debut}
            onChange={(e) =>
              setFilters({ ...filters, date_debut: e.target.value })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Au
          </label>
          <input
            type="date"
            value={filters.date_fin}
            onChange={(e) =>
              setFilters({ ...filters, date_fin: e.target.value })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors"
        >
          Filtrer
        </button>
      </form>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      ) : rapports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">
            Aucun rapport ne correspond à ces critères.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rapports.map((r) => {
            const [label, badgeClass] = TYPE_CONFIG[r.type] ?? [r.type, ""];
            return (
              <button
                key={r.id}
                onClick={() => openDetail(r)}
                className="text-left bg-white rounded-xl shadow-sm border border-slate-200 hover:border-[#1C9F93]/50 hover:shadow-md transition-all p-5"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
                  >
                    {label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {fmtDate(r.date_rapport)}
                  </span>
                </div>
                <h3 className="font-semibold text-[#0F172A] text-sm mb-1 line-clamp-1">
                  {r.titre}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {r.contenu}
                </p>
                <p className="text-xs text-slate-400 mt-3">
                  {r.chantier.nomChantier} · {r.auteur.nomComplet}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <Pagination
        pagination={
          pagination
            ? {
                page: pagination.current_page,
                pages: pagination.last_page,
                total: pagination.total,
                debut: pagination.from,
                fin: pagination.to,
              }
            : null
        }
        onPageChange={(p) => load(filters, p)}
      />

      <RapportDetailModal
        rapport={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
