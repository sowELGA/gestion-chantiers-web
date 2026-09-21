import { Link } from "react-router-dom";

const TYPE_CONFIG = {
  gros_oeuvre: ["Gros œuvre", "bg-amber-100 text-amber-700 border-amber-200"],
  second_oeuvre: [
    "Second œuvre",
    "bg-purple-100 text-purple-700 border-purple-200",
  ],
  finitions: ["Finitions", "bg-pink-100 text-pink-700 border-pink-200"],
  autre: ["Autre", "bg-slate-100 text-slate-600 border-slate-200"],
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

export default function PhaseCard({ chantier, phase, onEdit, onDelete }) {
  const nbTaches = phase.taches?.length ?? 0;
  const nbTerminees =
    phase.taches?.filter((t) => t.statutTache === "terminee").length ?? 0;
  const nbEnCours =
    phase.taches?.filter((t) => t.statutTache === "en_cours").length ?? 0;
  const nbEnRetard = phase.taches?.filter((t) => t.est_en_retard).length ?? 0;

  const [typeLabel, typeClass] =
    TYPE_CONFIG[phase.typePhase] ?? TYPE_CONFIG.autre;
  const [statutLabel, statutClass] =
    STATUT_CONFIG[phase.statutPhase] ?? STATUT_CONFIG.en_attente;
  const barColor =
    phase.statutPhase === "terminee"
      ? "bg-[#1C9F93]"
      : phase.statutPhase === "en_cours"
        ? "bg-blue-500"
        : "bg-slate-300";

  const canModifier = chantier.statut !== "livre";
  const canSupprimer = canModifier && nbTaches === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between p-6 gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-xl bg-[#0F3D37] text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
            {phase.ordre}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-[#0F172A] text-base truncate">
                {phase.nomPhase}
              </h3>
              {phase.est_en_retard && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 flex-shrink-0">
                  ⚠ En retard
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${typeClass}`}
              >
                {typeLabel}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statutClass}`}
              >
                {statutLabel}
              </span>
            </div>
            {phase.sous_traitant && (
              <p className="text-xs text-slate-500 mt-2">
                Sous-traitant : <strong>{phase.sous_traitant}</strong>
              </p>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-extrabold text-[#0F172A]">
            {phase.avancement}%
          </p>
          <p className="text-xs text-slate-400 mt-0.5">avancement</p>
        </div>
      </div>

      <div className="px-6 pb-4">
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${barColor}`}
            style={{ width: `${phase.avancement}%` }}
          />
        </div>
      </div>

      <div className="px-6 pb-4 grid grid-cols-3 gap-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
            Période
          </p>
          <p className="text-xs font-medium text-[#0F172A]">
            {fmtDate(phase.date_debut)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            → {fmtDate(phase.date_fin_prevue)}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
            Tâches
          </p>
          <p className="text-sm font-bold text-[#0F172A]">
            {nbTerminees}{" "}
            <span className="font-normal text-slate-400">/ {nbTaches}</span>{" "}
            terminées
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            {nbEnCours > 0 && (
              <span className="text-[10px] text-blue-600 font-medium">
                {nbEnCours} en cours
              </span>
            )}
            {nbEnRetard > 0 && (
              <span className="text-[10px] text-red-500 font-medium">
                {nbEnRetard} en retard
              </span>
            )}
            {nbTaches === 0 && (
              <span className="text-[10px] text-slate-400">Aucune tâche</span>
            )}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
            Durée prévue
          </p>
          <p className="text-sm font-bold text-[#0F172A]">—</p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
        <Link
          to={`/mes-chantiers/${chantier.id}/phases/${phase.id}/taches`}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors"
        >
          Voir les tâches
          {nbTaches > 0 && (
            <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              {nbTaches}
            </span>
          )}
        </Link>

        {canModifier && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(phase)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-white hover:shadow-sm transition-all"
            >
              Modifier
            </button>
            {canSupprimer ? (
              <button
                onClick={() => onDelete(phase)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Supprimer
              </button>
            ) : (
              <div
                className="px-4 py-2.5 text-sm text-slate-300 border border-slate-200 rounded-lg cursor-not-allowed select-none"
                title="Suppression impossible : cette phase contient des tâches"
              >
                Verrouillé
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
