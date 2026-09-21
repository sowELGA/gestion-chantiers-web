import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { dafDepensesApi } from "../../api/dafDepenses";
import { usePageHeader } from "../../context/PageHeaderContext";

const CAT_CONFIG = {
  materiaux: ["Matériaux", "bg-blue-100 text-blue-700", "bg-blue-500"],
  materiels: ["Matériels", "bg-purple-100 text-purple-700", "bg-purple-500"],
  salaires: ["Salaires", "bg-[#1C9F93]/10 text-[#1C9F93]", "bg-[#1C9F93]"],
  autre: ["Autre", "bg-slate-100 text-slate-600", "bg-slate-400"],
};

const EMPTY_FORM = {
  categorie: "",
  montant: "",
  description: "",
  date_depense: new Date().toISOString().slice(0, 10),
};

export default function DepenseDetail() {
  const { id: chantierId } = useParams();
  const { setPageHeader } = usePageHeader();

  const today = new Date().toISOString().slice(0, 10);
  const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const [chantier, setChantier] = useState(null);
  const [depenses, setDepenses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    nb: 0,
    par_categorie: {},
    total_global: 0,
  });
  const [filters, setFilters] = useState({
    date_debut: debutMois,
    date_fin: today,
  });
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const load = useCallback(
    (f = filters) => {
      setLoading(true);
      dafDepensesApi
        .show(chantierId, f)
        .then((res) => {
          setChantier(res.data.chantier);
          setDepenses(res.data.depenses);
          setStats(res.data.stats);
          setPageHeader("Dépenses du chantier", res.data.chantier.nomChantier);
        })
        .finally(() => setLoading(false));
    },
    [chantierId, filters, setPageHeader],
  );

  useEffect(() => {
    load();
  }, [load]);

  const RACCOURCIS = [
    { label: "Ce mois", debut: debutMois, fin: today },
    {
      label: "Mois dernier",
      debut: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
        .toISOString()
        .slice(0, 10),
      fin: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
        .toISOString()
        .slice(0, 10),
    },
    {
      label: "3 mois",
      debut: new Date(new Date().setMonth(new Date().getMonth() - 3))
        .toISOString()
        .slice(0, 10),
      fin: today,
    },
    {
      label: "Cette année",
      debut: `${new Date().getFullYear()}-01-01`,
      fin: today,
    },
    { label: "Tout", debut: "2020-01-01", fin: today },
  ];
  const applyRaccourci = (r) => {
    const f = { date_debut: r.debut, date_fin: r.fin };
    setFilters(f);
    load(f);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await dafDepensesApi.store(chantierId, form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (depense) => {
    if (!confirm("Supprimer cette dépense ?")) return;
    await dafDepensesApi.remove(depense.id);
    load();
  };

  if (loading || !chantier)
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );

  const estLivre = chantier.statut === "livre";

  const totalPeriode = stats.total || 1;
  const pourcentageBudget = chantier.budget_prevu
    ? Math.round((stats.total_global / chantier.budget_prevu) * 100)
    : null;

  return (
    <>
      <Link
        to="/daf/depenses"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1C9F93] transition-colors"
      >
        ← Retour aux chantiers
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(filters);
          }}
          className="flex items-end gap-4 flex-wrap"
        >
          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1.5">
              Date de début
            </label>
            <input
              type="date"
              value={filters.date_debut}
              max={filters.date_fin}
              onChange={(e) =>
                setFilters({ ...filters, date_debut: e.target.value })
              }
              className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1.5">
              Date de fin
            </label>
            <input
              type="date"
              value={filters.date_fin}
              min={filters.date_debut}
              max={today}
              onChange={(e) =>
                setFilters({ ...filters, date_fin: e.target.value })
              }
              className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors"
          >
            Filtrer
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            {RACCOURCIS.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => applyRaccourci(r)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${filters.date_debut === r.debut && filters.date_fin === r.fin ? "bg-[#1C9F93] text-white border-[#1C9F93]" : "border-slate-300 text-slate-500 hover:border-[#1C9F93] hover:text-[#1C9F93]"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-[#1C9F93]">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total période
          </p>
          <p className="text-2xl font-extrabold text-[#0F172A] mt-2">
            {new Intl.NumberFormat("fr-FR").format(stats.total)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">FCFA</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-slate-400">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Nb opérations
          </p>
          <p className="text-2xl font-extrabold text-[#0F172A] mt-2">
            {stats.nb}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">dépense(s)</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-[#D4AF37]">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Budget prévu
          </p>
          {chantier.budget_prevu !== null ? (
            <>
              <p className="text-2xl font-extrabold text-[#0F172A] mt-2">
                {new Intl.NumberFormat("fr-FR").format(chantier.budget_prevu)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">FCFA</p>
            </>
          ) : (
            <p className="text-lg font-semibold text-slate-400 italic mt-2">
              Non défini
            </p>
          )}
        </div>
        <div
          className={`bg-white rounded-xl p-5 shadow-sm border-t-4 ${pourcentageBudget !== null && pourcentageBudget > 90 ? "border-red-500" : "border-slate-400"}`}
        >
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Budget consommé (total)
          </p>
          {pourcentageBudget !== null ? (
            <p
              className={`text-2xl font-extrabold mt-2 ${pourcentageBudget > 90 ? "text-red-500" : "text-[#0F172A]"}`}
            >
              {pourcentageBudget}%
            </p>
          ) : (
            <p className="text-lg font-semibold text-slate-400 italic mt-2">
              —
            </p>
          )}
          <p className="text-xs text-slate-400 mt-0.5">
            {new Intl.NumberFormat("fr-FR").format(stats.total_global)} FCFA au
            total
          </p>
        </div>
      </div>

      {Object.keys(stats.par_categorie).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="font-semibold text-[#0F172A] mb-4">
            Répartition par catégorie sur la période
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(CAT_CONFIG).map(([cat, [label, , barColor]]) => {
              const montant = stats.par_categorie[cat] ?? 0;
              const pct = Math.round((montant / totalPeriode) * 100);
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>{label}</span>
                    <span className="font-semibold text-[#0F172A]">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                    <div
                      className={`h-2 rounded-full ${barColor} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs font-bold text-[#0F172A]">
                    {new Intl.NumberFormat("fr-FR").format(montant)}{" "}
                    <span className="font-normal text-slate-400">FCFA</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-[#0F172A]">
            Dépenses{" "}
            <span className="text-slate-400 font-normal text-sm ml-1">
              ({depenses.length} sur la période)
            </span>
          </h3>
          {estLivre ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Chantier livré — lecture seule
            </span>
          ) : (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${showForm ? "bg-slate-100 text-slate-600" : "bg-[#1C9F93] text-white hover:bg-[#178a7f]"}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {showForm ? "Annuler" : "Ajouter une dépense"}
            </button>
          )}
        </div>

        {showForm && (
          <div className="border-b border-slate-100 px-6 py-4 bg-slate-50">
            <form onSubmit={handleAdd}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={form.categorie}
                    onChange={(e) =>
                      setForm({ ...form, categorie: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
                  >
                    <option value="">Sélectionner</option>
                    <option value="materiaux">Matériaux</option>
                    <option value="materiels">Matériels</option>
                    <option value="salaires">Salaires</option>
                    <option value="autre">Autre</option>
                  </select>
                  {errors.categorie && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.categorie[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">
                    Montant (FCFA) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex : 250000"
                    value={form.montant}
                    onChange={(e) =>
                      setForm({ ...form, montant: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">
                    Description *
                  </label>
                  <input
                    placeholder="Ex : Achat ciment"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={form.date_depense}
                    onChange={(e) =>
                      setForm({ ...form, date_depense: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors disabled:opacity-60"
                >
                  {submitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        )}

        {depenses.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-400">
              Aucune dépense sur cette période.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3">Description</th>
                <th className="text-center px-4 py-3">Catégorie</th>
                <th className="text-center px-4 py-3">Date</th>
                <th className="text-right px-6 py-3">Montant</th>
                <th className="text-center px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {depenses.map((d) => {
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
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}`}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 text-xs">
                     {d.date_depense.slice(0, 10).split("-").reverse().join("/")}
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-[#0F172A]">
                      {new Intl.NumberFormat("fr-FR").format(d.montant)}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        F
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!estLivre && (
                        <button
                          onClick={() => handleDelete(d)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-3 text-right font-semibold text-slate-600 text-sm"
                >
                  Total période
                </td>
                <td className="px-6 py-3 text-right font-bold text-[#1C9F93]">
                  {new Intl.NumberFormat("fr-FR").format(stats.total)}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    FCFA
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </>
  );
}
