import { useState, useRef, useEffect } from "react";

const ICONS = {
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  reset:
    "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
  disable:
    "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
  enable: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  dots: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z",
};

function Icon({ path, className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={path}
      />
    </svg>
  );
}

export default function UserRow({ user, onEdit, onReset, onToggle }) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUp(spaceBelow < 180);
    }
    setOpen(!open);
  };

  const initiales =
    `${user.prenomUser?.[0] ?? ""}${user.nomUser?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors relative">
      {/* Infos utilisateur */}
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
            user.actif
              ? "bg-[#1C9F93]/10 text-[#1C9F93] border-2 border-[#1C9F93]/30"
              : "bg-slate-100 text-slate-400 border-2 border-slate-200"
          }`}
        >
          {initiales}
        </div>
        <div>
          <p
            className={`text-sm font-semibold text-[#0F172A] ${!user.actif ? "opacity-50" : ""}`}
          >
            {user.nomComplet}
          </p>
          <p className="text-xs text-slate-500">
            {user.email}
            {user.telUser && <> · {user.telUser}</>}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {user.roles.map((r) => (
              <span
                key={r.id}
                className="text-[10px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded"
              >
                {r.libelle}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Badges et actions */}
      <div className="flex items-center gap-3">
        {user.actif ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Actif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Inactif
          </span>
        )}

        {user.premiere_connexion && (
          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            Première connexion
          </span>
        )}

        <div className="relative">
          <button
            ref={buttonRef}
            onClick={handleToggleMenu}
            className="p-2 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Icon path={ICONS.dots} className="w-5 h-5" />
          </button>

          {open && (
            <div
              ref={menuRef}
              className={`absolute right-0 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 ${openUp ? "bottom-full mb-2" : "top-full mt-2"}`}
            >
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit(user);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Icon path={ICONS.edit} />
                Modifier
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  onReset(user);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Icon path={ICONS.reset} />
                Réinitialiser mot de passe
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={() => {
                  setOpen(false);
                  onToggle(user);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                  user.actif
                    ? "text-red-500 hover:bg-red-50"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <Icon path={user.actif ? ICONS.disable : ICONS.enable} />
                {user.actif ? "Désactiver le compte" : "Activer le compte"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
