import Dropdown from "../../../components/Dropdown";

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

export default function TacheCard({
  tache,
  chantierModifiable,
  onOpenAvancement,
  onEdit,
  onDelete,
}) {
  const [statutLabel, statutClass] =
    STATUT_CONFIG[tache.statutTache] ?? STATUT_CONFIG.en_attente;
  const isTerminee = tache.statutTache === "terminee";

  const borderAccent = isTerminee
    ? "border-l-[#1C9F93]"
    : tache.statutTache === "en_cours"
      ? tache.est_en_retard
        ? "border-l-red-500"
        : "border-l-blue-500"
      : tache.est_en_retard
        ? "border-l-red-400"
        : "border-l-slate-300";

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${borderAccent} p-5 hover:shadow-md transition-all`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3
              className={`font-bold text-[#0F172A] text-base ${isTerminee ? "line-through text-slate-400" : ""}`}
            >
              {tache.nomTache}
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statutClass}`}
            >
              {statutLabel}
            </span>
            {tache.est_en_retard && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                ⚠ En retard
              </span>
            )}
            {tache.tache_precedente && (
              <span className="text-xs text-slate-400 font-medium">
                ↳ Suit :{" "}
                <span className="text-slate-600">
                  {tache.tache_precedente.nomTache}
                </span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1 border-t border-slate-100">
            <div>
              <span className="text-slate-400 font-medium block">
                Début prévu
              </span>
              <span className="font-semibold text-[#0F172A] mt-0.5 block">
                {fmtDate(tache.date_debut_prevue)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">
                Fin prévue
              </span>
              <span
                className={`font-semibold mt-0.5 block ${tache.est_en_retard ? "text-red-600" : "text-[#0F172A]"}`}
              >
                {fmtDate(tache.date_fin_prevue)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">
                Début réel
              </span>
              <span className="font-semibold text-[#1C9F93] mt-0.5 block">
                {fmtDate(tache.date_debut_reelle)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">
                Fin réelle
              </span>
              <span className="font-semibold text-[#1C9F93] mt-0.5 block">
                {fmtDate(tache.date_fin_reelle)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          {isTerminee ? (
            <div className="text-right">
              <span className="text-xl font-black text-[#1C9F93]">100%</span>
              <p className="text-[10px] text-[#1C9F93] font-bold">✓ Validée</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAvancement(tache)}
              className="text-right group p-1.5 -m-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${tache.avancement}%` }}
                  />
                </div>
                <span className="text-lg font-black text-[#0F172A] group-hover:text-[#1C9F93] transition-colors">
                  {tache.avancement}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 group-hover:text-[#1C9F93] font-medium transition-colors">
                Modifier
              </p>
            </button>
          )}

          {!isTerminee && chantierModifiable ? (
            <Dropdown
              trigger={(toggle) => (
                <button
                  onClick={toggle}
                  className="p-2 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              )}
            >
              {(close) => (
                <>
                  <button
                    onClick={() => {
                      close();
                      onEdit(tache);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Modifier la tâche
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => {
                      close();
                      onDelete(tache);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                  >
                    Supprimer
                  </button>
                </>
              )}
            </Dropdown>
          ) : isTerminee ? (
            <span className="text-xs text-slate-400 font-medium italic">
              Verrouillée
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
