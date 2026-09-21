import { useState } from "react";
import { receptionApi } from "../../../api/reception";

function fmtDate(v) {
  if (!v) return null;
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

export default function LivraisonCard({ demande, onReceptionne }) {
  const [showForm, setShowForm] = useState(false);
  const [quantite, setQuantite] = useState("");
  const [observation, setObservation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalRecu = demande.quantite_demandee - demande.quantite_restante;
  const pct =
    demande.quantite_demandee > 0
      ? Math.round((totalRecu / demande.quantite_demandee) * 100)
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await receptionApi.receptionner(demande.id, {
        quantite_recue: quantite,
        observation: observation || null,
      });
      setShowForm(false);
      setQuantite("");
      setObservation("");
      onReceptionne(res.data.bon);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-1 h-12 rounded-full flex-shrink-0 ${demande.priorite === "urgent" ? "bg-red-500" : "bg-[#1C9F93]"}`}
            />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-[#0F172A]">
                  {demande.designation}
                </p>
                {demande.priorite === "urgent" && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                    URGENT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Livraison prévue :{" "}
                {demande.date_livraison_prevue ? (
                  <strong className="text-[#0F172A]">
                    {fmtDate(demande.date_livraison_prevue)}
                  </strong>
                ) : (
                  <span className="italic text-slate-400">non définie</span>
                )}
              </p>

              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>
                    Reçu : {totalRecu} / {demande.quantite_demandee}{" "}
                    {demande.unite}
                  </span>
                  <span>{pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-[#1C9F93] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Restant :{" "}
                  <strong className="text-[#0F172A]">
                    {demande.quantite_restante} {demande.unite}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex-shrink-0 ${showForm ? "bg-slate-100 text-slate-600" : "bg-[#1C9F93] text-white hover:bg-[#178a7f]"}`}
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {showForm ? "Annuler" : "Valider réception"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm mb-3">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#0F172A] mb-1.5">
                  Quantité reçue ({demande.unite}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={demande.quantite_restante}
                  value={quantite}
                  onChange={(e) => setQuantite(e.target.value)}
                  placeholder="Ex : 25"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Max : {demande.quantite_restante} {demande.unite}
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#0F172A] mb-1.5">
                  Observation{" "}
                  <span className="text-slate-400">(optionnel)</span>
                </label>
                <input
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Ex : Livraison partielle, emballage endommagé..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors disabled:opacity-60"
              >
                {submitting ? "Enregistrement..." : "Confirmer la réception"}
              </button>
            </div>
          </form>
        </div>
      )}

      {demande.bonReceptions?.length > 0 && (
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50">
          <p className="text-xs font-medium text-slate-500 mb-2">
            Réceptions précédentes :
          </p>
          <div className="space-y-1">
            {demande.bonReceptions.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-slate-500">
                  {fmtDate(b.date_reception)} — {b.quantite_recue}{" "}
                  {demande.unite}
                </span>
                <button
                  onClick={() => receptionApi.telechargerBonPdf(b.id)}
                  className="text-[#1C9F93] hover:underline flex items-center gap-1"
                >
                  <svg
                    className="w-3 h-3"
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
                  Bon de réception
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
