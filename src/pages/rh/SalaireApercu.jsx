import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { rhSalairesApi } from "../../api/rhSalaires";
import { usePageHeader } from "../../context/PageHeaderContext";
import { formatMontant } from '../../utils/format'

function fmtDateCourt(v) {
  const [y, m, d] = v.split("-");
  return `${d}/${m}`;
}

export default function SalaireApercu() {
  const { id: chantierId } = useParams();
  const [searchParams] = useSearchParams();
  const { setPageHeader } = usePageHeader();

  const semaine = searchParams.get("semaine");
  const annee = searchParams.get("annee");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [telechargement, setTelechargement] = useState(false);

  useEffect(() => {
    rhSalairesApi
      .apercu(chantierId, { semaine, annee })
      .then((res) => {
        setData(res.data);
        setPageHeader(
          "Détail des salaires",
          `${res.data.chantier.nomChantier} — Semaine ${res.data.semaine}`,
        );
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chantierId, semaine, annee]);

  const handleTelecharger = async () => {
    setTelechargement(true);
    try {
      await rhSalairesApi.telechargerPdf(chantierId, data.semaine, data.annee);
    } finally {
      setTelechargement(false);
    }
  };

  if (loading || !data)
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/salaires"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1C9F93] transition-colors"
        >
          ← Retour à la liste
        </Link>
        <button
          onClick={handleTelecharger}
          disabled={telechargement}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1C9F93] text-white text-sm font-semibold rounded-lg hover:bg-[#178a7f] transition-colors disabled:opacity-60"
        >
          <svg
            className="w-4 h-4"
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
          {telechargement
            ? "Génération..."
            : "Télécharger la fiche de paie (PDF)"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Chantier
          </p>
          <p className="text-sm font-semibold text-[#0F172A] mt-1">
            {data.chantier.nomChantier}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Période
          </p>
          <p className="text-sm font-semibold text-[#0F172A] mt-1">
            {fmtDateCourt(data.debut)} → {fmtDateCourt(data.fin)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Ouvriers concernés
          </p>
          <p className="text-sm font-semibold text-[#0F172A] mt-1">
            {data.nb_ouvriers}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total à payer
          </p>
          <p className="text-sm font-bold text-[#1C9F93] mt-1">
            {formatMontant(data.total_general)} F
          </p>
        </div>
      </div>

      {Object.values(data.groupes).map((groupe) => (
        <div
          key={groupe.famille}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="px-6 py-3 bg-[#1C9F93] text-white">
            <h3 className="font-bold text-sm">
              {groupe.famille} ({groupe.lignes.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4 text-left">Ouvrier</th>
                  <th className="py-2.5 px-4 text-left">Poste</th>
                  {data.jours.map((j) => (
                    <th key={j} className="py-2.5 px-2 text-center">
                      {new Date(j).toLocaleDateString("fr-FR", {
                        weekday: "short",
                      })}
                      <br />
                      {j.split("-")[2]}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-center">J.P</th>
                  <th className="py-2.5 px-3 text-center">H.S</th>
                  <th className="py-2.5 px-3 text-right">Sal. base</th>
                  <th className="py-2.5 px-3 text-right">Sal. H.S</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groupe.lignes.map((l, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-medium text-[#0F172A]">
                      {l.ouvrier.nomComplet}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">
                      {l.poste ?? "-"}
                    </td>
                    {l.jours.map((j, i) => (
                      <td key={i} className="py-2.5 px-2 text-center">
                        {j.statut === "present" ? (
                          <span className="inline-flex flex-col items-center leading-tight">
                            <span className="text-[#1C9F93] font-bold">P</span>
                            {j.h_sup > 0 && (
                              <span className="text-[10px] font-semibold text-amber-600">
                                +{j.h_sup}h
                              </span>
                            )}
                          </span>
                        ) : j.statut === "absent" ? (
                          <span className="text-slate-400">A</span>
                        ) : (
                          <span className="text-slate-200">—</span>
                        )}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-center font-semibold text-[#0F172A]">
                      {l.jours_presents}
                    </td>
                    <td className="py-2.5 px-3 text-center text-amber-600 font-medium">
                      {l.total_heures_sup > 0 ? `${l.total_heures_sup}h` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {formatMontant(l.salaire_base)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {l.salaire_heures_sup > 0
                        ? formatMontant(
                            l.salaire_heures_sup,
                          )
                        : "—"}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-[#0F172A]">
                      {formatMontant(l.salaire_total)} F
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-emerald-50 font-bold text-emerald-800">
                <tr>
                  <td
                    colSpan={2 + data.jours.length + 4}
                    className="py-2.5 px-4 text-right"
                  >
                    Sous-total {groupe.famille}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {formatMontant(
                      groupe.lignes.reduce((s, l) => s + l.salaire_total, 0),
                    )}{" "}
                    F
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}

      <div className="bg-[#0F172A] rounded-xl p-5 flex items-center justify-between">
        <p className="text-white font-semibold text-sm">
          Total général à payer — Semaine {data.semaine}/{data.annee}
        </p>
        <p className="text-2xl font-extrabold text-[#1C9F93]">
          {formatMontant(data.total_general)}{" "}
          <span className="text-xs font-normal text-slate-400">FCFA</span>
        </p>
      </div>
    </>
  );
}
