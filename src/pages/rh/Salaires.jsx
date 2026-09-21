import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { rhSalairesApi } from "../../api/rhSalaires";
import { usePageHeader } from "../../context/PageHeaderContext";

const STATUT_CONFIG = {
  validee_cp: ["Prête à générer", "bg-amber-100 text-amber-700"],
  envoyee_direction: [
    "Fiche de paie générée",
    "bg-[#1C9F93]/10 text-[#1C9F93]",
  ],
};

export default function Salaires() {
  const { setPageHeader } = usePageHeader();
  const [chantiers, setChantiers] = useState([]);
  const [semaines, setSemaines] = useState([]);
  const [semaineSel, setSemaineSel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageHeader(
      "Fiches de paie",
      "Sélectionnez une semaine puis un chantier pour consulter le détail des salaires.",
    );
  }, [setPageHeader]);

  const load = useCallback((params = {}) => {
    setLoading(true);
    rhSalairesApi
      .index(params)
      .then((res) => {
        setChantiers(res.data.chantiers);
        setSemaines(res.data.semaines);
        setSemaineSel(`${res.data.semaine}-${res.data.annee}`);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleChangeSemaine = (val) => {
    setSemaineSel(val);
    const [semaine, annee] = val.split("-");
    load({ semaine, annee });
  };

  if (loading)
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );

  const [semaineActuelle, anneeActuelle] = semaineSel?.split("-") ?? [];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <label className="block text-xs font-medium text-[#0F172A] mb-1.5">
          Semaine
        </label>
        <select
          value={semaineSel ?? ""}
          onChange={(e) => handleChangeSemaine(e.target.value)}
          className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93] bg-white min-w-[20rem]"
        >
          {semaines.map((s) => (
            <option
              key={`${s.semaine}-${s.annee}`}
              value={`${s.semaine}-${s.annee}`}
            >
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {chantiers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">
            Aucun récap validé par un chef de projet pour cette semaine.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {chantiers.map((c) => {
            const [label, badgeClass] = STATUT_CONFIG[c.statut] ?? [
              c.statut,
              "",
            ];
            return (
              <Link
                key={c.chantier.id}
                to={`/salaires/${c.chantier.id}?semaine=${semaineActuelle}&annee=${anneeActuelle}`}
                className="bg-white rounded-xl shadow-sm border border-slate-200 hover:border-[#1C9F93]/50 hover:shadow-md transition-all p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="font-bold text-[#0F172A] text-base">
                    {c.chantier.nomChantier}
                  </h3>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badgeClass}`}
                  >
                    {label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {c.nb_ouvriers} ouvrier(s)
                  </span>
                  <span className="font-bold text-[#0F172A]">
                    {new Intl.NumberFormat("fr-FR").format(c.total_salaires)} F
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
