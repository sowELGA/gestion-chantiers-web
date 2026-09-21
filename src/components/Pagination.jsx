export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
      <p className="text-xs text-slate-500">
        Ouvriers{" "}
        <strong className="text-[#0F172A]">
          {pagination.debut}–{pagination.fin}
        </strong>{" "}
        sur <strong className="text-[#0F172A]">{pagination.total}</strong>
      </p>
      <div className="flex items-center gap-1">
        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === pagination.page ? "bg-[#0F172A] text-white" : "text-slate-500 hover:bg-slate-200"}`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
