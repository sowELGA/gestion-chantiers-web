import { Link } from "react-router-dom";

const ICON_CHANTIER =
  "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4";
const ICON_EDIT =
  "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z";
const ICON_DELETE =
  "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16";

function fmtMontant(v) {
  return v !== null
    ? new Intl.NumberFormat("fr-FR").format(v) + " F"
    : "Non défini";
}

function fmtDate(v) {
  if (!v) return "—";
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

export default function ChantierRow({ chantier, onEdit, onDelete }) {
  const barColor = (pct) =>
    pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-[#1C9F93]";

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 bg-[#1C9F93]/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-[#1C9F93]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={ICON_CHANTIER}
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0F172A] truncate">
            {chantier.nomChantier}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {chantier.localisation}
          </p>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-6 mx-6">
        <div className="text-center">
          <p className="text-xs text-slate-400">Chef de projet</p>
          <p className="text-xs font-medium text-[#0F172A] mt-0.5">
            {chantier.chef_projet?.nomComplet ?? "—"}
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-400">Budget</p>
          <p className="text-xs font-medium text-[#0F172A] mt-0.5">
            {fmtMontant(chantier.budget_prevu)}
          </p>
        </div>

        <div className="w-24">
          <p className="text-xs text-slate-400 mb-1">Consommé</p>
          {chantier.pourcentage_budget === null ? (
            <p className="text-xs text-slate-400 italic">Budget non défini</p>
          ) : (
            <>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${barColor(chantier.pourcentage_budget)}`}
                  style={{
                    width: `${Math.min(100, chantier.pourcentage_budget)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5 text-right">
                {chantier.pourcentage_budget}%
              </p>
            </>
          )}
        </div>

        <div className="w-24">
          <p className="text-xs text-slate-400 mb-1">Avancement</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-blue-500 transition-all"
              style={{ width: `${Math.min(100, chantier.avancement_global)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-0.5 text-right">
            {chantier.avancement_global}%
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-400">Fin prévue</p>
          <p
            className={`text-xs font-medium mt-0.5 ${chantier.est_en_retard ? "text-red-500" : "text-[#0F172A]"}`}
          >
            {fmtDate(chantier.date_fin_prevue)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          to={`/chantiers/${chantier.id}`}
          className="px-3 py-1.5 text-xs font-medium text-[#1C9F93] bg-[#1C9F93]/10 rounded-lg hover:bg-[#1C9F93]/20 transition-colors"
        >
          Voir détail
        </Link>
        <button
          onClick={() => onEdit(chantier)}
          className="p-1.5 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors"
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
              d={ICON_EDIT}
            />
          </svg>
        </button>
        {chantier.statut === "en_attente" && (
          <button
            onClick={() => onDelete(chantier)}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                d={ICON_DELETE}
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
