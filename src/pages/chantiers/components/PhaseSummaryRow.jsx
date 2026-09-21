import { useState } from "react";

const TYPE_LABELS = {
  gros_oeuvre: "Gros œuvre",
  second_oeuvre: "Second œuvre",
  finitions: "Finitions",
  autre: "Autre",
};
const STATUT_CONFIG = {
  en_cours: ["En cours", "bg-blue-50 text-blue-700 border-blue-200"],
  terminee: ["Terminée", "bg-[#1C9F93]/10 text-[#1C9F93] border-[#1C9F93]/20"],
  en_attente: ["En attente", "bg-slate-100 text-slate-600 border-slate-200"],
};

function fmtDate(v) {
  if (!v) return "—";
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

export default function PhaseSummaryRow({ phase }) {
  const [expanded, setExpanded] = useState(false);
  const [statutLabel, statutClass] =
    STATUT_CONFIG[phase.statutPhase] ?? STATUT_CONFIG.en_attente;
  const barColor =
    phase.statutPhase === "terminee"
      ? "bg-[#1C9F93]"
      : phase.statutPhase === "en_cours"
        ? "bg-blue-500"
        : "bg-slate-300";
  const nbTaches = phase.taches?.length ?? 0;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-lg bg-[#0F3D37] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
            {phase.ordre}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-[#0F172A] text-sm truncate">
                {phase.nomPhase}
              </p>
              {phase.est_en_retard && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 border border-red-200">
                  ⚠
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {TYPE_LABELS[phase.typePhase] ?? "Autre"} ·{" "}
              {fmtDate(phase.date_debut)} → {fmtDate(phase.date_fin_prevue)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statutClass}`}
          >
            {statutLabel}
          </span>
          <div className="text-right w-16">
            <p className="text-sm font-bold text-[#0F172A]">
              {phase.avancement}%
            </p>
          </div>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      <div className="px-4 pb-3">
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${barColor}`}
            style={{ width: `${phase.avancement}%` }}
          />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-2">
          {nbTaches === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Aucune tâche pour cette phase.
            </p>
          ) : (
            phase.taches.map((t) => {
              const [tLabel, tClass] =
                STATUT_CONFIG[t.statutTache] ?? STATUT_CONFIG.en_attente;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2 border border-slate-100"
                >
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium text-[#0F172A] truncate ${t.statutTache === "terminee" ? "line-through text-slate-400" : ""}`}
                    >
                      {t.nomTache}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {fmtDate(t.date_debut_prevue)} →{" "}
                      {fmtDate(t.date_fin_prevue)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {t.est_en_retard && (
                      <span className="text-[10px] font-bold text-red-500">
                        ⚠
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${tClass}`}
                    >
                      {tLabel}
                    </span>
                    <span className="text-xs font-bold text-[#0F172A] w-9 text-right">
                      {t.avancement}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
