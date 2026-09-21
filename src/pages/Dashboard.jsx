import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePageHeader } from "../context/PageHeaderContext";
import { dashboardApi } from "../api/dashboard";
import { formatMontant } from "../utils/format";
import DashboardCard from "./components/DashboardCard";

const CAT_CONFIG = {
  materiaux: ["Matériaux", "bg-blue-100 text-blue-700"],
  materiels: ["Matériels", "bg-purple-100 text-purple-700"],
  salaires: ["Salaires", "bg-[#1C9F93]/10 text-[#1C9F93]"],
  autre: ["Autre", "bg-slate-100 text-slate-600"],
};

function fmtDate(v) {
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

export default function Dashboard() {
  const { user, hasRole, peutGererApprovisionnements, peutGererDepenses } =
    useAuth();
  const { setPageHeader } = usePageHeader();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageHeader(
      "Tableau de bord",
      `Bienvenue, ${user?.prenomUser} — ${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`,
    );
  }, [setPageHeader, user]);

  useEffect(() => {
    dashboardApi
      .index()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data)
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );

  const dt = data.directeur_travaux;
  const dafAppro = data.daf_approvisionnements;
  const dafDep = data.daf_depenses;
  const rh = data.responsable_rh;

  return (
    <div className="space-y-8">
      {hasRole("admin") && data.admin && (
        <section>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Administration
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DashboardCard
              label="Utilisateurs"
              value={data.admin.total_users}
              sub={`${data.admin.users_actifs} actifs`}
              borderColor="border-[#1C9F93]"
              to="/admin/utilisateurs"
            />
            <DashboardCard
              label="Demandes reset en attente"
              value={data.admin.demandes_reset_attente}
              borderColor="border-red-400"
              to="/admin/utilisateurs"
            />
          </div>
        </section>
      )}

      {hasRole("directeur_travaux") && dt && (
        <section>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Directeur des travaux
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <DashboardCard
              label="Chantiers actifs"
              value={dt.chantiers_actifs}
              borderColor="border-blue-400"
              to="/chantiers"
            />
            <DashboardCard
              label="En attente de démarrage"
              value={dt.chantiers_en_attente}
              borderColor="border-amber-400"
              to="/chantiers?statut=en_attente"
            />
            <DashboardCard
              label="Rapports récents (7j)"
              value={dt.rapports_recents}
              sub="Non encore consultés"
              borderColor="border-purple-400"
              to="/rapports"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-[#0F172A]">
                Chantiers en cours
              </h3>
              <Link
                to="/chantiers"
                className="text-xs text-[#1C9F93] hover:underline"
              >
                Tout voir →
              </Link>
            </div>
            {dt.chantiers_liste.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-400">
                  Aucun chantier en cours.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {dt.chantiers_liste.map((item) => (
                  <Link
                    key={item.chantier.id}
                    to={`/chantiers/${item.chantier.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {item.chantier.nomChantier}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.chantier.chef_projet?.nomComplet ?? "—"} · Budget
                        : {item.pct_budget}% consommé
                      </p>
                      <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-[#1C9F93] transition-all"
                          style={{ width: `${item.avancement}%` }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right flex-shrink-0">
                      <p className="text-lg font-bold text-[#0F172A]">
                        {item.avancement}%
                      </p>
                      <p className="text-xs text-slate-400">avancement</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {peutGererApprovisionnements && dafAppro && (
        <section>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Approvisionnements
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard
              label="Demandes en attente"
              value={dafAppro.en_attente}
              borderColor="border-amber-400"
              to="/daf/approvisionnements"
            />
            <DashboardCard
              label="Urgentes"
              value={dafAppro.urgentes}
              borderColor="border-red-400"
              to="/daf/approvisionnements"
            />
            <DashboardCard
              label="Validées, non commandées"
              value={dafAppro.validees_non_commandees}
              sub="À passer commande"
              borderColor="border-purple-400"
              to="/daf/approvisionnements"
            />
            <DashboardCard
              label="En cours de livraison"
              value={dafAppro.en_cours_livraison}
              borderColor="border-[#1C9F93]"
              to="/daf/approvisionnements"
            />
          </div>
        </section>
      )}

      {peutGererDepenses && dafDep && (
        <section>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Dépenses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <DashboardCard
              label="Dépensé ce mois"
              value={`${formatMontant(dafDep.depenses_ce_mois)} F`}
              borderColor="border-[#D4AF37]"
              to="/daf/depenses"
            />
            <DashboardCard
              label="Chantiers proches du budget"
              value={dafDep.chantiers_proche_budget}
              sub="> 90% consommé"
              borderColor="border-red-400"
              to="/daf/depenses"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-[#0F172A]">
                Dernières dépenses
              </h3>
              <Link
                to="/daf/depenses"
                className="text-xs text-[#1C9F93] hover:underline"
              >
                Tout voir →
              </Link>
            </div>
            {dafDep.dernieres_depenses.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-400">
                  Aucune dépense enregistrée.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-6 py-3">Description</th>
                      <th className="text-left px-4 py-3">Chantier</th>
                      <th className="text-center px-4 py-3">Catégorie</th>
                      <th className="text-center px-4 py-3">Date</th>
                      <th className="text-right px-6 py-3">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {dafDep.dernieres_depenses.map((d) => {
                      const [label, badgeClass] = CAT_CONFIG[d.categorie] ?? [
                        d.categorie,
                        "",
                      ];
                      return (
                        <tr
                          key={d.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-3 font-medium text-[#0F172A]">
                            {d.description}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {d.chantier.nomChantier}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
                            >
                              {label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-slate-500">
                            {fmtDate(d.date_depense)}
                          </td>
                          <td className="px-6 py-3 text-right font-bold text-[#0F172A]">
                            {formatMontant(d.montant)}{" "}
                            <span className="text-xs font-normal text-slate-400">
                              F
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {hasRole("responsable_rh") && rh && (
        <section>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Ressources humaines
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <DashboardCard
              label="Ouvriers actifs"
              value={rh.ouvriers_actifs}
              sub={`${rh.ouvriers_inactifs} inactifs`}
              borderColor="border-[#1C9F93]"
              to="/ouvriers"
            />
            <DashboardCard
              label="Fiches de paie prêtes"
              value={rh.fiches_paie_pretes}
              sub="Chantiers, validées CP"
              borderColor="border-blue-400"
              to="/salaires"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-[#0F172A]">
                Ouvriers actifs par chantier
              </h3>
            </div>
            {rh.ouvriers_par_chantier.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-400">
                  Aucun ouvrier actif affecté.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {rh.ouvriers_par_chantier.map((item) => (
                  <Link
                    key={item.chantier.id}
                    to="/ouvriers"
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-[#0F172A]">
                      {item.chantier.nomChantier}
                    </p>
                    <span className="px-2.5 py-1 bg-[#1C9F93]/10 text-[#1C9F93] rounded-full text-xs font-bold">
                      {item.nb_ouvriers_actifs} ouvrier(s)
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
