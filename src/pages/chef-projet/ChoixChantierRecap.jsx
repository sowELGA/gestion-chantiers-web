import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { mesChantiersApi } from "../../api/mesChantiers";
import { usePageHeader } from "../../context/PageHeaderContext";

export default function ChoixChantierRecap() {
  const { setPageHeader } = usePageHeader();
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageHeader(
      "Validation des pointages",
      "Sélectionnez le chantier concerné.",
    );
  }, [setPageHeader]);

  useEffect(() => {
    mesChantiersApi
      .list({ statut: "en_cours" })
      .then((res) => setChantiers(res.data.chantiers))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
      {chantiers.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm text-slate-400">Aucun chantier en cours.</p>
        </div>
      ) : (
        chantiers.map((c) => (
          <Link
            key={c.id}
            to={`/mes-chantiers/${c.id}/recap`}
            className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">
                {c.nomChantier}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{c.localisation}</p>
            </div>
            <svg
              className="w-4 h-4 text-slate-400"
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
          </Link>
        ))
      )}
    </div>
  );
}
