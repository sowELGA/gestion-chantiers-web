import { useState } from "react";

function fmtDate(v) {
  if (!v) return "présent";
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

export default function AffectationCard({
  titre,
  personne,
  options,
  historique,
  currentId,
  onSave,
  avatarColor,
}) {
  const [editing, setEditing] = useState(false);
  const [showHistorique, setShowHistorique] = useState(false);
  const [selected, setSelected] = useState(currentId ?? "");
  const [saving, setSaving] = useState(false);

  const initiales = personne
    ? `${personne.prenomUser?.[0] ?? personne.nomComplet?.[0] ?? ""}${personne.nomUser?.[0] ?? ""}`.toUpperCase()
    : "";

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(selected === "" ? null : Number(selected));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800">{titre}</h3>
        <span className="text-xs font-medium text-slate-400">
          {historique.length} affectation(s)
        </span>
      </div>

      {personne ? (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center font-bold text-xs shrink-0`}
            >
              {initiales}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {personne.nomComplet}
              </p>
              {personne.email && (
                <p className="text-xs text-slate-400 truncate">
                  {personne.email}
                </p>
              )}
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 shrink-0">
            ACTUEL
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-amber-800 font-medium">
          Aucun{titre === "Pointeur" ? "" : ""} {titre.toLowerCase()} affecté.
        </div>
      )}

      <button
        type="button"
        onClick={() => setEditing(!editing)}
        className="w-full py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
      >
        {editing ? "Fermer" : "Gérer l'affectation"}
      </button>

      {editing && (
        <form onSubmit={handleSave} className="pt-2 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Changer de {titre.toLowerCase()}
            </label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1C9F93] focus:outline-none bg-white"
            >
              <option value="">— Aucun (retirer) —</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.prenomUser} {o.nomUser}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 bg-[#1C9F93] hover:bg-[#178a7f] text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-60"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      )}

      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowHistorique(!showHistorique)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <span>Voir l'historique</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${showHistorique ? "rotate-180" : ""}`}
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
        </button>

        {showHistorique && (
          <div className="mt-3 space-y-2">
            {historique.length === 0 ? (
              <p className="text-xs text-slate-400 py-1 italic">
                Aucun historique
              </p>
            ) : (
              historique.map((aff) => (
                <div
                  key={aff.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs"
                >
                  <span className="font-semibold text-slate-700">
                    {aff.user?.nomComplet}
                  </span>
                  <span className="text-slate-400">
                    {fmtDate(aff.debut_affectation)} —{" "}
                    {fmtDate(aff.fin_affectation)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
