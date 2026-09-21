const STATUT_CONFIG = {
  en_attente: ["En attente", "bg-slate-100 text-slate-600"],
  soumise: ["Soumise", "bg-amber-100 text-amber-700"],
  rejetee: ["Rejetée", "bg-red-100 text-red-600"],
  validee_cp: ["Validée", "bg-[#1C9F93]/10 text-[#1C9F93]"],
  envoyee_direction: ["Transmise", "bg-slate-100 text-slate-500"],
};

export default function RecapHistorique({
  historique,
  semaineActive,
  annee,
  onSelect,
  actions,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
      {historique.map((h) => {
        const [label, badgeClass] = STATUT_CONFIG[h.statut] ?? [h.statut, ""];
        const isActive = h.semaine === semaineActive && h.annee === annee;
        return (
          <div
            key={`${h.semaine}-${h.annee}`}
            className={`flex items-center justify-between px-5 py-3.5 transition-colors ${isActive ? "bg-[#1C9F93]/5" : "hover:bg-slate-50"}`}
          >
            <button
              onClick={() => onSelect(h.semaine, h.annee)}
              className="text-left flex-1 min-w-0"
            >
              <p
                className={`text-sm font-medium truncate ${isActive ? "text-[#1C9F93]" : "text-[#0F172A]"}`}
              >
                {h.label}
              </p>
            </button>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
              >
                {label}
              </span>
              {actions && h.statut === "soumise" && actions(h)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
