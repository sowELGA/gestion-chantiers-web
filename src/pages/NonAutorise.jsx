import { Link } from "react-router-dom";

export default function NonAutorise() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18.364 5.636a9 9 0 11-12.728 0M12 9v3m0 4h.01"
          />
        </svg>
      </div>
      <h1 className="font-display text-xl font-semibold text-[#0F172A]">
        Accès non autorisé
      </h1>
      <p className="text-slate-500 text-sm mt-2 max-w-sm">
        Vous n'avez pas les droits nécessaires pour accéder à cette page.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
