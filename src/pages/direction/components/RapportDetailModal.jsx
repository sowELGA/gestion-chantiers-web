import Modal from "../../../components/Modal";
import { dtRapportsApi } from "../../../api/dtRapports";

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

export default function RapportDetailModal({ rapport, open, onClose }) {
  if (!rapport) return null;
  const [label, badgeClass] = TYPE_CONFIG[rapport.type] ?? [rapport.type, ""];

  return (
    <Modal open={open} onClose={onClose} title={rapport.titre}>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
        >
          {label}
        </span>
        <span className="text-xs text-slate-400">
          {rapport.chantier.nomChantier} · {fmtDate(rapport.date_rapport)}
        </span>
      </div>

      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
        {rapport.contenu}
      </p>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Rédigé par{" "}
          <strong className="text-slate-600">
            {rapport.auteur.nomComplet}
          </strong>
        </p>
        <button
          onClick={() =>
            dtRapportsApi.telechargerPdf(rapport.id, rapport.titre)
          }
          className="flex items-center gap-2 px-4 py-2 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors"
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
          Télécharger le PDF
        </button>
      </div>
    </Modal>
  );
}
