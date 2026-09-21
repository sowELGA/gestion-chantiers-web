import ChantierRow from "./ChantierRow";

export default function ChantierSection({
  titre,
  couleur,
  chantiers,
  onEdit,
  onDelete,
}) {
  if (chantiers.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${couleur}`}></span>
        <h3 className="font-semibold text-[#0F172A]">{titre}</h3>
        <span className="text-xs text-slate-400">({chantiers.length})</span>
      </div>
      <div className="divide-y divide-slate-50">
        {chantiers.map((c) => (
          <ChantierRow
            key={c.id}
            chantier={c}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
