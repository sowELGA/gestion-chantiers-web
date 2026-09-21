import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { validationRecapApi } from "../../api/validationRecap";
import { usePageHeader } from "../../context/PageHeaderContext";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";

const STATUT_CONFIG = {
  en_attente: ["En attente de soumission", "bg-slate-100 text-slate-600"],
  soumise: ["Soumise — À valider", "bg-amber-100 text-amber-700"],
  rejetee: ["Rejetée", "bg-red-100 text-red-600"],
  validee_cp: ["Validée", "bg-[#1C9F93]/10 text-[#1C9F93]"],
  envoyee_direction: [
    "Transmise à la direction",
    "bg-slate-100 text-slate-500",
  ],
};

export default function ValidationRecap() {
  const { id: chantierId } = useParams();
  const { setPageHeader } = usePageHeader();
  const [data, setData] = useState(null);
  const [semaineSel, setSemaineSel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [rejetModalOpen, setRejetModalOpen] = useState(false);
  const [motif, setMotif] = useState("");
  const [errorMotif, setErrorMotif] = useState("");

  const load = useCallback(
    (params = {}) => {
      setLoading(true);
      validationRecapApi
        .index(chantierId, params)
        .then((res) => {
          setData(res.data);
          setSemaineSel(`${res.data.semaine}-${res.data.annee}`);
          setPageHeader(
            "Validation des pointages",
            `${res.data.chantier.nomChantier} · Semaine ${res.data.semaine}`,
          );
        })
        .finally(() => setLoading(false));
    },
    [chantierId, setPageHeader],
  );

  const handlePageChange = (page) => {
    setTableLoading(true);
    validationRecapApi
      .index(chantierId, { semaine: data.semaine, annee: data.annee, page })
      .then((res) => {
        setData((prev) => ({
          ...prev,
          lignes: res.data.lignes,
          pagination: res.data.pagination,
        }));
      })
      .finally(() => setTableLoading(false));
  };

  useEffect(() => {
    load();
  }, [load]);

  const handleChangeSemaine = (val) => {
    setSemaineSel(val);
    const [semaine, annee] = val.split("-");
    load({ semaine, annee });
  };

  const handleValider = async () => {
    if (!confirm("Valider cette fiche et la transmettre à la direction ?"))
      return;
    setSubmitting(true);
    try {
      await validationRecapApi.valider(chantierId, data.semaine, data.annee);
      load({ semaine: data.semaine, annee: data.annee });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejeter = async (e) => {
    e.preventDefault();
    if (motif.trim().length < 10) {
      setErrorMotif("Le motif doit contenir au moins 10 caractères.");
      return;
    }
    setSubmitting(true);
    try {
      await validationRecapApi.rejeter(
        chantierId,
        data.semaine,
        data.annee,
        motif,
      );
      setRejetModalOpen(false);
      setMotif("");
      load({ semaine: data.semaine, annee: data.annee });
    } catch (err) {
      setErrorMotif(
        err.response?.data?.errors?.motif_rejet?.[0] ||
          "Une erreur est survenue.",
      );
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
      <Link
        to={`/mes-chantiers/${chantierId}/phases`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1C9F93] transition-colors"
      >
        ← Retour au chantier
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${badgeClass}`}
        >
          {label}
        </span>
        {data.peutValider && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRejetModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Rejeter
            </button>
            <button
              onClick={handleValider}
              disabled={submitting}
              className="px-5 py-2 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors disabled:opacity-60"
            >
              {submitting ? "Validation..." : "Valider et transmettre"}
            </button>
          </div>
        )}
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

      <Modal
        open={rejetModalOpen}
        onClose={() => setRejetModalOpen(false)}
        title="Rejeter la fiche"
      >
        <form onSubmit={handleRejeter} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motif du rejet
            </label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={4}
              required
              minLength={10}
              placeholder="Expliquez au pointeur ce qui doit être corrigé..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errorMotif && (
              <p className="text-red-500 text-xs mt-1">{errorMotif}</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setRejetModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 disabled:opacity-60"
            >
              {submitting ? "Envoi..." : "Rejeter la fiche"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
