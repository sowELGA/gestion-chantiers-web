import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pointageApi } from "../../api/pointage";
import { usePageHeader } from "../../context/PageHeaderContext";
import Pagination from "../../components/Pagination";

const STATUT_CONFIG = {
  en_attente: ["En attente de soumission", "bg-slate-100 text-slate-600"],
  soumise: ["Soumise — En attente CP", "bg-amber-100 text-amber-700"],
  rejetee: ["Rejetée — Corrections requises", "bg-red-100 text-red-600"],
  validee_cp: [
    "Validée par le chef de projet",
    "bg-[#1C9F93]/10 text-[#1C9F93]",
  ],
  envoyee_direction: [
    "Transmise à la direction",
    "bg-slate-100 text-slate-500",
  ],
};

function fmtDateCourt(d) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

export default function RecapSemaine() {
  const { setPageHeader } = usePageHeader();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [semaineSel, setSemaineSel] = useState(null);
  const [loading, setLoading] = useState(true); // chargement initial complet (toute la page)
  const [tableLoading, setTableLoading] = useState(false); // chargement léger (juste le tableau)
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(
    (params = {}) => {
      setLoading(true);
      pointageApi
        .recapSemaine(params)
        .then((res) => {
          setData(res.data);
          setSemaineSel(`${res.data.semaine}-${res.data.annee}`);
          setPageHeader(
            "Récapitulatif hebdomadaire",
            `Semaine ${res.data.semaine} — du ${fmtDateCourt(res.data.debut)} au ${fmtDateCourt(res.data.fin)}`,
          );
        })
        .finally(() => setLoading(false));
    },
    [setPageHeader],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handlePageChange = (page) => {
    setTableLoading(true);
    pointageApi
      .recapSemaine({ semaine: data.semaine, annee: data.annee, page })
      .then((res) => {
        setData((prev) => ({
          ...prev,
          lignes: res.data.lignes,
          pagination: res.data.pagination,
        }));
      })
      .finally(() => setTableLoading(false));
  };

  const handleChangeSemaine = (val) => {
    setSemaineSel(val);
    const [semaine, annee] = val.split("-");
    load({ semaine, annee });
  };

  const handleSoumettre = async () => {
    if (
      !confirm(
        "Confirmer la soumission au chef de projet ?\nLes pointages seront verrouillés.",
      )
    )
      return;
    setSubmitting(true);
    try {
      await pointageApi.soumettreSemaine(data.semaine, data.annee);
      load({ semaine: data.semaine, annee: data.annee });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data)
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );

  const [label, badgeClass] = STATUT_CONFIG[data.statut] ?? [data.statut, ""];

  return (
    <>
      {data.statut === "rejetee" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <p className="font-semibold text-red-700">
            Fiche rejetée par le chef de projet
          </p>
          <p className="text-sm text-red-600 mt-1 italic">
            "{data.motif_rejet}"
          </p>
          <p className="text-xs text-red-500 mt-2">
            Cliquez sur "Modifier" à côté du jour à corriger, puis soumettez à
            nouveau.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${badgeClass}`}
        >
          {label}
        </span>
        <div className="flex items-center gap-3">
          <Link
            to="/pointeur/pointage/fiche"
            className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            ← Fiche du jour
          </Link>
          {data.soumettable && (
            <button
              onClick={handleSoumettre}
              disabled={submitting}
              className="px-5 py-2 bg-[#0F172A] text-white text-sm font-medium rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-60"
            >
              {submitting ? "Envoi..." : "Soumettre au chef de projet"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <label className="block text-xs font-medium text-[#0F172A] mb-1.5">
          Semaine
        </label>
        <select
          value={semaineSel ?? ""}
          onChange={(e) => handleChangeSemaine(e.target.value)}
          className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93] bg-white min-w-[20rem]"
        >
          {data.semaines.map((s) => (
            <option
              key={`${s.semaine}-${s.annee}`}
              value={`${s.semaine}-${s.annee}`}
            >
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {data.lignes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center">
          <p className="text-slate-400 text-sm">
            Aucun pointage enregistré cette semaine.
          </p>
          <Link
            to="/pointeur/pointage/fiche"
            className="inline-flex mt-3 px-4 py-2 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f]"
          >
            Saisir le pointage du jour
          </Link>
        </div>
      ) : data.statut === "rejetee" ? (
        <div className="space-y-2">
          {data.jours.map((jour, i) => {
            const nbPresents = data.lignes.reduce(
              (sum, l) => sum + (l.jours[i].statut === "present" ? 1 : 0),
              0,
            );
            const isFuture =
              new Date(jour) > new Date() &&
              jour !== new Date().toISOString().slice(0, 10);
            return (
              <div
                key={jour}
                className="bg-white rounded-xl shadow-sm border border-slate-200 px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm bg-slate-100 text-slate-500">
                    {jour.split("-")[2]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#0F172A] capitalize">
                      {new Date(jour).toLocaleDateString("fr-FR", {
                        weekday: "long",
                      })}
                    </p>
                    <p className="text-xs text-slate-400">
                      {nbPresents} présent(s)
                    </p>
                  </div>
                </div>
                <button
                  disabled={isFuture}
                  onClick={() =>
                    navigate(`/pointeur/pointage/modifier/${jour}`)
                  }
                  className="px-4 py-2 text-xs font-medium bg-[#1C9F93]/10 text-[#1C9F93] rounded-lg hover:bg-[#1C9F93]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Modifier
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-left">Ouvrier</th>
                  <th className="py-3 px-4 text-left">Poste</th>
                  {data.jours.map((j) => (
                    <th key={j} className="py-3 px-2 text-center">
                      {new Date(j).toLocaleDateString("fr-FR", {
                        weekday: "short",
                      })}
                      <br />
                      {j.split("-")[2]}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center">Présents</th>
                  <th className="py-3 px-4 text-center">Total H. sup</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y divide-slate-100 transition-opacity ${tableLoading ? "opacity-40" : ""}`}
              >
                {data.lignes.map((l, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-medium text-[#0F172A]">
                      {l.ouvrier.nomComplet}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {l.poste ?? "-"}
                    </td>
                    {l.jours.map((j, i) => (
                      <td key={i} className="py-3 px-2 text-center">
                        {j.statut === "present" ? (
                          <span className="inline-flex flex-col items-center leading-tight">
                            <span className="text-[#1C9F93] font-bold">✓</span>
                            {j.h_sup > 0 && (
                              <span className="text-[10px] font-semibold text-amber-600">
                                +{j.h_sup}h
                              </span>
                            )}
                          </span>
                        ) : j.statut === "absent" ? (
                          <span className="text-red-500 font-bold">✗</span>
                        ) : (
                          <span className="text-slate-200">·</span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-center font-semibold text-[#0F172A]">
                      {l.jours_present}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      {l.total_h_sup}h
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold text-[#0F172A]">
                <tr>
                  <td
                    colSpan={2}
                    className="py-3 px-4 text-right text-xs uppercase tracking-wider text-slate-500"
                  >
                    Total présents / jour
                  </td>
                  {data.jours.map((j, i) => (
                    <td key={j} className="py-3 px-2 text-center">
                      {data.totaux.totaux_par_jour[i]}
                    </td>
                  ))}
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
            <Pagination
              pagination={data.pagination}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </>
  );
}
