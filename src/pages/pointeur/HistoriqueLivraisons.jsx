import { useState, useEffect, useCallback } from "react";
import { receptionApi } from "../../api/reception";
import { usePageHeader } from "../../context/PageHeaderContext";
import StatCard from "../../components/StatCard";

function fmtDate(v) {
  if (!v) return "—";
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

export default function HistoriqueLivraisons() {
  const { setPageHeader } = usePageHeader();
  const today = new Date().toISOString().slice(0, 10);
  const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const [filters, setFilters] = useState({
    date_debut: debutMois,
    date_fin: today,
  });
  const [bons, setBons] = useState([]);
  const [stats, setStats] = useState({ total: 0, completes: 0, partielles: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageHeader(
      "Historique des livraisons",
      "Bons de réception émis pour votre chantier.",
    );
  }, [setPageHeader]);

  const load = useCallback(
    (f = filters) => {
      setLoading(true);
      receptionApi
        .historique(f)
        .then((res) => {
          setBons(res.data.bons);
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
          label="Total bons"
          value={stats.total}
          borderColor="border-[#1C9F93]"
        />
        <StatCard
          label="Réceptions complètes"
          value={stats.completes}
          borderColor="border-emerald-400"
        />
        <StatCard
          label="Réceptions partielles"
          value={stats.partielles}
          borderColor="border-purple-400"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      ) : bons.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">Aucun bon sur cette période.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-50">
          {bons.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between px-6 py-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0F172A] truncate">
                  {b.demande.designation}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {fmtDate(b.date_reception)} · {b.quantite_recue}{" "}
                  {b.demande.unite} reçus · par {b.receptionnee_par.nomComplet}
                </p>
              </div>
              <button
                onClick={() => receptionApi.telechargerBonPdf(b.id)}
                className="flex items-center gap-1.5 text-xs font-medium text-[#1C9F93] hover:underline flex-shrink-0"
              >
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
