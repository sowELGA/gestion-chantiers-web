const STATUT_CONFIG = {
  en_attente: ["En attente", "bg-amber-100 text-amber-700"],
  validee: ["Validée", "bg-blue-100 text-blue-700"],
  en_cours_livraison: ["En livraison", "bg-[#1C9F93]/10 text-[#1C9F93]"],
  partiellement_recue: ["Part. reçue", "bg-purple-100 text-purple-700"],
  rejetee: ["Rejetée", "bg-red-100 text-red-500"],
  cloturee: ["Clôturée", "bg-slate-100 text-slate-500"],
};

function fmtDate(v) {
  if (!v) return null;
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

export default function ApprovisionnementRow({ demande, onEdit, onDelete }) {
  const [label, badgeClass] = STATUT_CONFIG[demande.statutAppro] ?? [
    demande.statutAppro,
    "",
  ];
  const afficherDateLivraison = [
    "en_cours_livraison",
    "partiellement_recue",
  ].includes(demande.statutAppro);
  const peutModifier = demande.statutAppro === "en_attente";
  const peutSupprimer = ["en_attente", "validee"].includes(demande.statutAppro);

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div
          className={`w-1 h-10 rounded-full flex-shrink-0 ${demande.priorite === "urgent" ? "bg-red-500" : "bg-slate-300"}`}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#0F172A] truncate">
              {demande.designation}
            </p>
            {demande.priorite === "urgent" && (
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                URGENT
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${badgeClass}`}
            >
              {label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {demande.quantite_demandee} {demande.unite} ·{" "}
            {demande.chantier.nomChantier}
          </p>
          {demande.statutAppro === "partiellement_recue" && (
            <p className="text-xs text-purple-600 mt-0.5 font-medium">
              Restant : {demande.quantite_restante} {demande.unite}
            </p>
          )}
          {afficherDateLivraison && (
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
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {peutModifier && (
          <button
            onClick={() => onEdit(demande)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        )}
        {peutSupprimer && (
          <button
            onClick={() => onDelete(demande)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
