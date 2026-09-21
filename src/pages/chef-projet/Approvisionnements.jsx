import { useState, useEffect, useCallback } from "react";
import { approvisionnementsApi } from "../../api/approvisionnements";
import { usePageHeader } from "../../context/PageHeaderContext";
import Modal from "../../components/Modal";
import ApprovisionnementForm from "./components/ApprovisionnementForm";
import ApprovisionnementRow from "./components/ApprovisionnementRow";

const KPI_CONFIG = [
  {
    key: "en_attente",
    label: "En attente",
    border: "border-amber-400",
    text: "text-amber-600",
  },
  {
    key: "en_cours_livraison",
    label: "En cours",
    border: "border-[#1C9F93]",
    text: "text-[#1C9F93]",
  },
  {
    key: "cloturee",
    label: "Clôturées",
    border: "border-slate-400",
    text: "text-slate-600",
  },
  {
    key: "rejetee",
    label: "Rejetées",
    border: "border-red-400",
    text: "text-red-500",
  },
];

export default function Approvisionnements() {
  const { setPageHeader } = usePageHeader();
  const [demandes, setDemandes] = useState([]);
  const [stats, setStats] = useState({
    en_attente: 0,
    en_cours_livraison: 0,
    cloturee: 0,
    rejetee: 0,
  });
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);
  const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const [filters, setFilters] = useState({
    statut: "tous",
    date_debut: debutMois,
    date_fin: today,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setPageHeader(
      "Approvisionnements",
      "Suivez vos demandes d'approvisionnements.",
    );
  }, [setPageHeader]);

  const load = useCallback(
    (f = filters) => {
      setLoading(true);
      approvisionnementsApi
        .list(f)
        .then((res) => {
          setDemandes(res.data.demandes);
          setStats(res.data.stats);
        })
        .finally(() => setLoading(false));
    },
    [filters],
  );

  useEffect(() => {
    load();
    approvisionnementsApi
      .chantiersDisponibles()
      .then((res) => setChantiers(res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    load(filters);
  };
  const applyKpi = (key) => {
    const f = { ...filters, statut: key };
    setFilters(f);
    load(f);
  };

  const RACCOURCIS = [
    { label: "Aujourd'hui", debut: today, fin: today },
    { label: "Ce mois", debut: debutMois, fin: today },
    {
      label: "3 mois",
      debut: new Date(new Date().setMonth(new Date().getMonth() - 3))
        .toISOString()
        .slice(0, 10),
      fin: today,
    },
    { label: "Tout", debut: "2020-01-01", fin: today },
  ];
  const applyRaccourci = (r) => {
    const f = { ...filters, date_debut: r.debut, date_fin: r.fin };
    setFilters(f);
    load(f);
  };

  const openCreate = () => {
    setEditing(null);
    setErrors({});
    setModalOpen(true);
  };
  const openEdit = (demande) => {
    setEditing(demande);
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setErrors({});
    try {
      if (editing) {
        await approvisionnementsApi.update(editing.id, {
          ...payload,
          ...payload.demandes[0],
        });
      } else {
        await approvisionnementsApi.create(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setErrors(
        err.response?.data?.errors || {
          general: err.response?.data?.message || "Une erreur est survenue.",
        },
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (demande) => {
    if (!confirm("Supprimer cette demande ?")) return;
    try {
      await approvisionnementsApi.remove(demande.id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Suppression impossible.");
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CONFIG.map((k) => (
          <button
            key={k.key}
            onClick={() => applyKpi(k.key)}
            className={`bg-white rounded-xl p-5 shadow-sm border-t-4 ${k.border} hover:shadow-md transition-all text-left ${filters.statut === k.key ? "ring-2 ring-[#1C9F93]/30" : ""}`}
          >
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {k.label}
            </p>
            <p className={`text-3xl font-extrabold ${k.text} mt-2`}>
              {stats[k.key]}
            </p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <form
          onSubmit={handleFilterSubmit}
          className="flex items-end gap-4 flex-wrap"
        >
          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1.5">
              Statut
            </label>
            <select
              value={filters.statut}
              onChange={(e) =>
                setFilters({ ...filters, statut: e.target.value })
              }
              className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
            >
              <option value="tous">Tous</option>
              <option value="en_attente">En attente</option>
              <option value="validee">Validées</option>
              <option value="en_cours_livraison">En livraison</option>
              <option value="partiellement_recue">Part. reçues</option>
              <option value="rejetee">Rejetées</option>
              <option value="cloturee">Clôturées</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0F172A] mb-1.5">
              Du
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
              Au
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

          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2.5 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors ml-auto flex items-center gap-2"
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
            Nouvelle demande
          </button>
        </form>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      ) : demandes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm font-medium">
            Aucune demande sur cette période.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 mt-4 bg-[#1C9F93] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#178a7f]"
          >
            Créer une demande
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-sm text-slate-500">
              <strong className="text-[#0F172A]">{demandes.length}</strong>{" "}
              demande(s) trouvée(s)
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {demandes.map((d) => (
              <ApprovisionnementRow
                key={d.id}
                demande={d}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier la demande" : "Nouvelle(s) demande(s)"}
      >
        <ApprovisionnementForm
          chantiers={chantiers}
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
          errors={errors}
        />
      </Modal>
    </>
  );
}
