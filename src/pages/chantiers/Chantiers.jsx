import { useState, useEffect, useCallback } from "react";
import { chantiersApi } from "../../api/chantiers";
import { usePageHeader } from "../../context/PageHeaderContext";
import StatCard from "../../components/StatCard";
import Modal from "../../components/Modal";
import ChantierSection from "./components/ChantierSection";
import ChantierForm from "./components/ChantierForm";

const SECTIONS = [
  { key: "en_cours", titre: "En cours", couleur: "bg-blue-500" },
  { key: "en_attente", titre: "En attente", couleur: "bg-amber-500" },
  { key: "suspendu", titre: "Suspendus", couleur: "bg-red-400" },
  { key: "livre", titre: "Livrés", couleur: "bg-[#D4AF37]" },
];

export default function Chantiers() {
  const { setPageHeader } = usePageHeader();

  const [chantiers, setChantiers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    en_cours: 0,
    en_attente: 0,
    livre: 0,
  });
  const [chefsProjets, setChefsProjets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    nomChantier: "",
    statut: "en_cours",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setPageHeader(
      "Suivi des chantiers",
      "Gérez et suivez tous vos chantiers de construction.",
    );
  }, [setPageHeader]);

  const load = useCallback(
    (appliedFilters = filters) => {
      setLoading(true);
      chantiersApi
        .list(appliedFilters)
        .then((res) => {
          setChantiers(res.data.chantiers); // ← retiré le ".data" en trop
          setStats(res.data.stats);
        })
        .finally(() => setLoading(false));
    },
    [filters],
  );

  useEffect(() => {
    load();
    chantiersApi
      .chefsProjetsDisponibles()
      .then((res) => setChefsProjets(res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    load(filters);
  };

  const resetFilters = () => {
    const cleared = { nomChantier: "", statut: "en_cours" };
    setFilters(cleared);
    load(cleared);
  };

  const grouped = SECTIONS.map((s) => ({
    ...s,
    chantiers: chantiers.filter((c) => c.statut === s.key),
  }));
  const hasAnyResult = chantiers.length > 0;

  const openCreate = () => {
    setEditing(null);
    setErrors({});
    setModalOpen(true);
  };
  const openEdit = (chantier) => {
    setEditing(chantier);
    setErrors({});
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setErrors({});
    const payload = {
      ...formData,
      budget_prevu: formData.budget_prevu === "" ? null : formData.budget_prevu,
    };

    try {
      if (editing) {
        await chantiersApi.update(editing.id, payload);
      } else {
        await chantiersApi.create(payload);
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

  const handleDelete = async (chantier, confirmer = false) => {
    if (
      !confirmer &&
      !confirm(`Supprimer le chantier "${chantier.nomChantier}" ?`)
    )
      return;
    try {
      await chantiersApi.remove(chantier.id, confirmer);
      load();
    } catch (err) {
      if (
        err.response?.status === 409 &&
        err.response.data.confirmation_requise
      ) {
        if (confirm(err.response.data.message)) {
          handleDelete(chantier, true);
        }
        return;
      }
      alert(err.response?.data?.message || "Suppression impossible.");
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          borderColor="border-[#1C9F93]"
        />
        <StatCard
          label="En cours"
          value={stats.en_cours}
          borderColor="border-blue-500"
        />
        <StatCard
          label="En attente"
          value={stats.en_attente}
          borderColor="border-amber-500"
        />
        <StatCard
          label="Livrés"
          value={stats.livre}
          borderColor="border-[#D4AF37]"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Nom du chantier
            </label>
            <input
              type="text"
              value={filters.nomChantier}
              onChange={(e) =>
                setFilters({ ...filters, nomChantier: e.target.value })
              }
              placeholder="Rechercher un chantier..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93] transition-colors"
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Statut
            </label>
            <select
              value={filters.statut}
              onChange={(e) =>
                setFilters({ ...filters, statut: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93] bg-white transition-colors"
            >
              <option value="toutes">Tous les statuts</option>
              <option value="en_cours">En cours</option>
              <option value="en_attente">En attente</option>
              <option value="suspendu">Suspendu</option>
              <option value="livre">Livré</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors"
            >
              Filtrer
            </button>
            {(filters.statut !== "en_cours" || filters.nomChantier) && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {stats.total} chantier(s) au total
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1C9F93] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#178a7f] transition-colors"
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
          Nouveau chantier
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      ) : !hasAnyResult ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <svg
            className="w-12 h-12 text-slate-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          {filters.statut !== "en_cours" || filters.nomChantier ? (
            <>
              <p className="text-slate-400 text-sm">
                Aucun chantier ne correspond à ces filtres.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-[#1C9F93] hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </>
          ) : (
            <>
              <p className="text-slate-400 text-sm">
                Aucun chantier pour le moment.
              </p>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 mt-4 bg-[#1C9F93] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#178a7f]"
              >
                Créer le premier chantier
              </button>
            </>
          )}
        </div>
      ) : (
        grouped.map((s) => (
          <ChantierSection
            key={s.key}
            titre={s.titre}
            couleur={s.couleur}
            chantiers={s.chantiers}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Modifier le chantier" : "Nouveau chantier"}
      >
        <ChantierForm
          initialData={editing}
          chefsProjets={chefsProjets}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          submitting={submitting}
          errors={errors}
        />
      </Modal>
    </>
  );
}
