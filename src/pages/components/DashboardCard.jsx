import { Link } from "react-router-dom";

export default function DashboardCard({
  label,
  value,
  sub,
  borderColor = "border-[#1C9F93]",
  to,
}) {
  const content = (
    <div
      className={`bg-white rounded-xl p-5 shadow-sm border-t-4 ${borderColor} h-full ${to ? "hover:shadow-md transition-shadow" : ""}`}
    >
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-3xl font-extrabold text-[#0F172A] mt-2">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}
