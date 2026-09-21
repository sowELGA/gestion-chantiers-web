import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePageHeader } from "../context/PageHeaderContext";
import logoDima from "../assets/logo-dima.svg";

const ICONS = {
  dashboard:
    "M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  chantiers:
    "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  users:
    "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  personnel:
    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  postes:
    "M9 6a3 3 0 116 0v1H9V6zm-3 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8zm4 3a1 1 0 100 2h2a1 1 0 100-2h-2z",
  tauxSalarial:
    "M9 7h6m0 0v10m0-10L9 17M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z",
  fichesPaie: "M9 14l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0zM9 8h6",
  appro: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  depenses:
    "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
  rapportLire:
    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  rapportEcrire:
    "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  validationPointage:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  ficheJour:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm5-5l1.5 1.5L14 12",
  recapSemaine:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm3-8h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01",
  historique: "M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z",
  chevron: "M19 9l-7 7-7-7",
  burger: "M4 6h16M4 12h16M4 18h16",
  close: "M6 18L18 6M6 6l12 12",
  password:
    "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
  logout:
    "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
};

function Icon({ path, className = "w-5 h-5" }) {
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

/**
 * Navigation regroupée par rôle, entièrement à plat (aucun menu déroulant).
 * Chaque groupe n'apparaît que si l'utilisateur possède le rôle / la permission.
 * Les pages de création (nouveau chantier, ajouter un ouvrier) ne sont plus
 * dans le menu : on y accède via le bouton de la page « liste » correspondante.
 * `end: true` = le lien n'est actif que sur l'URL exacte (évite que
 * « Demandes en attente » reste actif sur « Historique »).
 */
function buildNavSections({
  hasRole,
  peutGererApprovisionnements,
  peutGererDepenses,
}) {
  const sections = [];
  if (!hasRole("chef_projet") && !hasRole("pointeur")) {
    sections.push({
      label: "Mes activités",
      items: [
        { to: "/", label: "Dashboard", icon: ICONS.dashboard, end: true },
      ],
    });
  }

  if (hasRole("admin")) {
    sections.push({
      label: "Administrateur",
      items: [
        { to: "/admin/utilisateurs", label: "Utilisateurs", icon: ICONS.users },
      ],
    });
  }

  if (hasRole("directeur_travaux")) {
    sections.push({
      label: "Suivi des chantiers",
      items: [{ to: "/chantiers", label: "Chantiers", icon: ICONS.chantiers }],
    });
    sections.push({
      label: "Rapports",
      items: [
        {
          to: "/rapports",
          label: "Voir les rapports",
          icon: ICONS.rapportLire,
        },
      ],
    });
  }

  const dafItems = [];
  if (peutGererApprovisionnements) {
    dafItems.push(
      {
        to: "/daf/approvisionnements",
        label: "Demandes en attente",
        icon: ICONS.appro,
        end: true,
      },
      {
        to: "/daf/approvisionnements/historique",
        label: "Historique",
        icon: ICONS.historique,
      },
    );
  }
  if (peutGererDepenses) {
    dafItems.push({
      to: "/daf/depenses",
      label: "Dépenses",
      icon: ICONS.depenses,
    });
  }
  if (dafItems.length > 0) {
    sections.push({ label: "DAF", items: dafItems });
  }

  if (hasRole("responsable_rh")) {
    sections.push({
      label: "Ressources humaines",
      items: [
        { to: "/ouvriers", label: "Ouvriers", icon: ICONS.personnel },
        { to: "/postes", label: "Postes", icon: ICONS.postes },
      ],
    });
    sections.push({
      label: "Salaires",
      items: [
        {
          to: "/salaires/taux",
          label: "Taux salariaux",
          icon: ICONS.tauxSalarial,
        },
        { to: "/salaires", label: "Fiches de paie", icon: ICONS.fichesPaie },
      ],
    });
  }

  if (hasRole("chef_projet")) {
    sections.push({
      label: "Mes activités",
      items: [
        {
          to: "/chef-projet/dashboard",
          label: "Dashboard",
          icon: ICONS.dashboard,
        },
      ],
    });
    sections.push({
      label: "Mes chantiers",
      items: [
        { to: "/mes-chantiers", label: "Mes chantiers", icon: ICONS.chantiers },
      ],
    });
    sections.push({
      label: "Approvisionnements",
      items: [
        { to: "/approvisionnements", label: "Mes demandes", icon: ICONS.appro },
      ],
    });
    sections.push({
      label: "Pointage",
      items: [
        {
          to: "/pointage/validation",
          label: "Validation pointages",
          icon: ICONS.validationPointage,
        },
      ],
    });
    sections.push({
      label: "Rapports",
      items: [
        {
          to: "/mes-rapports",
          label: "Mes rapports",
          icon: ICONS.rapportEcrire,
        },
      ],
    });
  }

  if (hasRole("pointeur")) {
    sections.push({
      label: "Mes activités",
      items: [
        {
          to: "/pointeur/dashboard",
          label: "Dashboard",
          icon: ICONS.dashboard,
        },
      ],
    });
    sections.push({
      label: "Pointage",
      items: [
        {
          to: "/pointeur/pointage/fiche",
          label: "Fiche du jour",
          icon: ICONS.ficheJour,
        },
        {
          to: "/pointeur/pointage/recap",
          label: "Récap semaine",
          icon: ICONS.recapSemaine,
        },
      ],
    });
    sections.push({
      label: "Réceptions",
      items: [
        {
          to: "/pointeur/livraisons",
          label: "Livraisons en cours",
          icon: ICONS.appro,
          end: true,
        },
        {
          to: "/pointeur/livraisons/historique",
          label: "Historique réception",
          icon: ICONS.historique,
        },
      ],
    });
  }

  return sections;
}

function NavItem({ item, sidebarOpen, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={sidebarOpen ? undefined : item.label}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
          isActive
            ? "bg-gradient-to-r from-[#1C9F93]/25 via-[#1C9F93]/10 to-transparent text-white border-l-2 border-[#1C9F93]"
            : "text-white/45 hover:bg-white/[0.06] hover:text-white"
        }`
      }
    >
      <Icon path={item.icon} className="w-5 h-5 flex-shrink-0" />
      {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
    </NavLink>
  );
}

function SidebarContent({ sidebarOpen, sections, onNavigate }) {
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {sections.map((section, i) => (
        <div key={section.label ?? "root"}>
          {section.label &&
            (sidebarOpen ? (
              <div className="px-4 pt-4 pb-1.5">
                <p className="font-mono-tag text-[9px] tracking-[0.15em] text-white/30 uppercase">
                  {section.label}
                </p>
              </div>
            ) : (
              i > 0 && <div className="mx-3 my-3 border-t border-white/10" />
            ))}
          <div className="space-y-1">
            {section.items.map((item) => (
              <NavItem
                key={item.to}
                item={item}
                sidebarOpen={sidebarOpen}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const initiales =
    `${user?.prenomUser?.[0] ?? ""}${user?.nomUser?.[0] ?? ""}`.toUpperCase();
  const roleLabel = user?.roles?.[0]?.libelle ?? "";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg px-2 py-1.5 transition-colors"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-[#0F172A]">
            {user?.nomComplet}
          </p>
          <p className="font-mono-tag text-[10px] font-medium text-[#1C9F93] uppercase tracking-wider">
            {roleLabel}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-[#1C9F93] bg-slate-100 flex items-center justify-center font-display font-bold text-[#1C9F93] text-sm flex-shrink-0">
          {initiales}
        </div>
        <Icon
          path={ICONS.chevron}
          className="w-4 h-4 text-slate-400 hidden sm:block"
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="tick-card absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1">
            <span className="tick tick-tl"></span>
            <span className="tick tick-br"></span>
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-[#0F172A]">
                {user?.nomComplet}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <NavLink
              to="/changer-mot-de-passe"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Icon path={ICONS.password} className="w-4 h-4" />
              Changer mot de passe
            </NavLink>
            <div className="border-t border-slate-100 mt-1">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <Icon path={ICONS.logout} className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AppLayout() {
  const {
    user,
    logout,
    hasRole,
    peutGererApprovisionnements,
    peutGererDepenses,
  } = useAuth();
  const { title, subtitle, setPageHeader } = usePageHeader();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMobile, setSidebarMobile] = useState(false);

  const sections = buildNavSections({
    hasRole,
    peutGererApprovisionnements,
    peutGererDepenses,
  });

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="bg-[#F8FAFC] text-[#0F172A] font-sans antialiased min-h-screen">
      {/* Sidebar desktop */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#0F3D37] text-white transition-all duration-300 ease-in-out z-30 flex-col shadow-xl hidden lg:flex ${sidebarOpen ? "w-64" : "w-16"}`}
      >
        <div className="relative sidebar-grid">
          <div className="relative z-10 flex items-center justify-between px-4 py-5">
            {sidebarOpen && (
              <div className="overflow-hidden flex items-center gap-2.5">
                <img
                  src={logoDima}
                  alt="Dima Groupe"
                  className="h-9 w-auto flex-shrink-0 object-contain"
                />
                <span className="font-mono-tag text-[10px] text-[#1C9F93] font-semibold uppercase tracking-wide leading-snug block">
                  Gestion &amp; Suivi
                  <br />
                  des Chantiers
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex-shrink-0 ml-2"
            >
              <Icon path={ICONS.burger} className="w-4 h-4" />
            </button>
          </div>
          <div className="dim-rule-dark mx-4"></div>
        </div>

        <SidebarContent sidebarOpen={sidebarOpen} sections={sections} />

        <div className="px-4 py-4 border-t border-white/10">
          {sidebarOpen ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 font-mono-tag text-[9px] uppercase tracking-wider">
              <div>
                <p className="text-white/30">Système</p>
                <p className="text-white/70 mt-0.5">v1.0</p>
              </div>
              <div className="text-right">
                <p className="text-white/30">© {new Date().getFullYear()}</p>
                <p className="text-white/70 mt-0.5">Dima Groupe</p>
              </div>
            </div>
          ) : (
            <p className="font-mono-tag text-[9px] text-white/40 text-center tracking-wider">
              v1.0
            </p>
          )}
        </div>
      </aside>

      {/* Overlay + sidebar mobile */}
      {sidebarMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarMobile(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0F3D37] text-white z-30 flex-col shadow-xl lg:hidden transition-transform duration-300 ${sidebarMobile ? "translate-x-0 flex" : "-translate-x-full hidden"}`}
      >
        <div className="relative sidebar-grid">
          <div className="relative z-10 flex items-center justify-between px-4 py-5">
            <div className="flex items-center gap-2.5">
              <img
                src={logoDima}
                alt="Dima Groupe"
                className="h-9 w-auto object-contain"
              />
              <span className="font-mono-tag text-[10px] text-[#1C9F93] font-semibold uppercase tracking-wide leading-snug block">
                Gestion &amp; Suivi
                <br />
                des Chantiers
              </span>
            </div>
            <button
              onClick={() => setSidebarMobile(false)}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
            >
              <Icon path={ICONS.close} className="w-4 h-4" />
            </button>
          </div>
          <div className="dim-rule-dark mx-4"></div>
        </div>
        <SidebarContent
          sidebarOpen={true}
          sections={sections}
          onNavigate={() => setSidebarMobile(false)}
        />
        <div className="px-4 py-4 border-t border-white/10">
          <p className="font-mono-tag text-[9px] text-white/40 text-center uppercase tracking-wider">
            © {new Date().getFullYear()} Dima Groupe — v1.0
          </p>
        </div>
      </aside>

      {/* Contenu principal */}
      <div
        className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col ${sidebarOpen ? "lg:ml-64" : "lg:ml-16"}`}
      >
        <header className="h-[76px] flex-shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarMobile(true)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:text-[#0F172A] hover:border-slate-300 transition-colors"
            >
              <Icon path={ICONS.burger} className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-[#0F172A]">
                {title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>
          </div>

          <UserMenu user={user} onLogout={handleLogout} />
        </header>

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          <Outlet context={{ setPageHeader }} />
        </main>

        <footer className="bg-white border-t border-slate-200 px-6 py-3">
          <div className="flex items-center justify-between font-mono-tag text-[10px] uppercase tracking-wider text-slate-400">
            <div className="flex items-center gap-4">
              <span>Dima Groupe</span>
              <span className="hidden sm:inline h-3 w-px bg-slate-200"></span>
              <span className="hidden sm:inline">
                Gestion &amp; Suivi des Chantiers
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-[#1C9F93]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C9F93]"></span>
              {user?.roles?.[0]?.libelle}
            </div>
            <div className="flex items-center gap-4">
              <span>v1.0</span>
              <span className="hidden sm:inline h-3 w-px bg-slate-200"></span>
              <span>© {new Date().getFullYear()} · Tous droits réservés</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
