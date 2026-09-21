export default function StatCard({ label, value, borderColor }) {
  return (
    <div
      className={`bg-white rounded-xl p-5 shadow-sm border-t-4 ${borderColor}`}
    >
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <h3 className="text-3xl font-extrabold text-[#0F172A] mt-2">{value}</h3>
    </div>
  );
}
