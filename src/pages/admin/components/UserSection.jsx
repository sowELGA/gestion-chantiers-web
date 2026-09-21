import UserRow from "./UserRow";

const DOT_COLORS = {
  administratif: "bg-[#D4AF37]",
  chef_projet: "bg-[#1C9F93]",
  pointeur: "bg-slate-400",
};

export default function UserSection({
  title,
  colorKey,
  users,
  onEdit,
  onReset,
  onToggle,
}) {
  if (users.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${DOT_COLORS[colorKey]}`}></span>
        <h3 className="font-semibold text-[#0F172A]">{title}</h3>
        <span className="text-xs text-slate-400 ml-1">({users.length})</span>
      </div>
      <div className="divide-y divide-slate-50">
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            onEdit={onEdit}
            onReset={onReset}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
