import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { mesChantiersApi } from "../../api/mesChantiers";
import { usePageHeader } from "../../context/PageHeaderContext";
import StatCard from "../../components/StatCard";

const STATUT_CONFIG = {
  en_attente: {
    label: "En attente",
    class: "bg-amber-50 text-amber-700 border-amber-200",
  },
  en_cours: {
    label: "En cours",
    class: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  suspendu: {
    label: "Suspendu",
    class: "bg-rose-50 text-rose-700 border-rose-200",
  },
  livre: { label: "Livré", class: "bg-teal-50 text-teal-700 border-teal-200" },
};

const FILTRES = [
  { valeur: "en_cours", label: "En cours" },
  { valeur: "toutes", label: "Tous" },
  { valeur: "en_attente", label: "En attente" },
  { valeur: "suspendu", label: "Suspendus" },
  { valeur: "livre", label: "Livrés" },
];

export default function MesChantiers() {
  const { setPageHeader } = usePageHeader();
  const [chantiers, setChantiers] = useState([]);
  const [stats, setStats] = useState({ total: 0, en_cours: 0, livre: 0 });
  const [statutFiltre, setStatutFiltre] = useState("en_cours");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageHeader("Mes chantiers", "Les chantiers dont vous êtes responsable.");
  }, [setPageHeader]);

  const load = useCallback(
    (statut = statutFiltre) => {
      setLoading(true);
      mesChantiersApi
        .list({ statut })
        .then((res) => {
          setChantiers(res.data.chantiers);
          setStats(res.data.stats);
        })
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

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          borderColor="border-[#1C9F93]"
        />
        <StatCard
          label="En cours"
          value={stats.en_cours}
          borderColor="border-blue-500"
        />
        <StatCard
          label="Livrés"
          value={stats.livre}
          borderColor="border-[#D4AF37]"
        />
      </div>

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

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      ) : chantiers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">
            Aucun chantier{statutFiltre !== "toutes" ? " avec ce statut" : ""}.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {chantiers.map((c) => {
            const config = STATUT_CONFIG[c.statut] ?? STATUT_CONFIG.en_attente;
            return (
              <Link
                key={c.id}
                to={`/mes-chantiers/${c.id}/phases`}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#0F172A]">
                      {c.nomChantier}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {c.localisation}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.class}`}
                  >
                    {config.label}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Avancement</span>
                    <span className="font-semibold text-slate-700">
                      {c.avancement_global}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{
                        width: `${Math.min(100, c.avancement_global)}%`,
                      }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
