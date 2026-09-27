import Modal from "../../../components/Modal";
import { dtRapportsApi } from "../../../api/dtRapports";

const TYPE_CONFIG = {
  avancement: ["Avancement", "bg-blue-100 text-blue-700"],
  incident: ["Incident", "bg-red-100 text-red-600"],
  livraison: ["Livraison", "bg-amber-100 text-amber-700"],
  reunion: ["Réunion", "bg-purple-100 text-purple-700"],
  autre: ["Autre", "bg-slate-100 text-slate-600"],
};

function fmtDateLongue(v) {
  return new Date(v).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtCreation(v) {
  return new Date(v).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RapportDetailModal({ rapport, open, onClose }) {
  if (!rapport) return null;
  const [label, badgeClass] = TYPE_CONFIG[rapport.type] ?? [rapport.type, ""];

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="-m-6 mb-0 rounded-t-lg overflow-hidden">
        <div className="bg-[#0F3D37] px-6 py-5">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold mb-3 inline-block ${badgeClass}`}
          >
            {label}
          </span>
          <h2 className="text-white font-bold text-xl leading-snug">
            {rapport.titre}
          </h2>
          <div className="flex items-center gap-4 mt-3 flex-wrap text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {fmtDateLongue(rapport.date_rapport)}
            </span>
            <span className="flex items-center gap-1.5">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
                />
              </svg>
              {rapport.chantier.nomChantier}
            </span>
            <span className="flex items-center gap-1.5">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {rapport.auteur.nomComplet}
            </span>
          </div>
        </div>

        <div className="bg-white p-6">
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {rapport.contenu}
          </p>
        </div>

        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Rapport créé le {fmtCreation(rapport.created_at)}
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
      </div>
    </Modal>
  );
}
