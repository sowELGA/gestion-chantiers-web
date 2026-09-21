import { useState, useEffect, useCallback } from "react";
import { ouvriersApi } from "../../api/rh";
import { usePageHeader } from "../../context/PageHeaderContext";
import Modal from "../../components/Modal";
import OuvrierForm from "./components/OuvrierForm";

export default function Ouvriers() {
  const { setPageHeader } = usePageHeader();
  const [personnel, setPersonnel] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
    total: 0,
  });
  const [stats, setStats] = useState({ total: 0, actifs: 0, inactifs: 0 });
  const [postes, setPostes] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    recherche: "",
    chantier_id: "",
    statut: "tous",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setPageHeader(
      "Personnel",
      "Gestion des ouvriers et affectations aux chantiers",
    );
  }, [setPageHeader]);

  const load = useCallback(
    (f = filters, page = 1) => {
      setLoading(true);
      ouvriersApi
        .list({ ...f, page })
        .then((res) => {
          setPersonnel(res.data.personnel.data);
          setPagination(res.data.personnel.meta ?? res.data.personnel);
          setStats(res.data.stats);
        })
        .finally(() => setLoading(false));
    },
    [filters],
  );

  useEffect(() => {
    load();
    ouvriersApi.formOptions().then((res) => {
      setPostes(res.data.postes);
      setChantiers(res.data.chantiers);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    load(filters);
  };
  const resetFilters = () => {
    const f = { recherche: "", chantier_id: "", statut: "tous" };
    setFilters(f);
    load(f);
  };
  const setStatutFiltre = (statut) => {
    const f = { ...filters, statut };
    setFilters(f);
    load(f);
  };

  const openCreate = () => {
    setEditing(null);
    setErrors({});
    setModalOpen(true);
  };
  const openEdit = (o) => {
    setEditing(o);
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setErrors({});
    const payload = { ...formData, chantier_id: formData.chantier_id || null };
    try {
      if (editing) await ouvriersApi.update(editing.id, payload);
      else await ouvriersApi.create(payload);
      setModalOpen(false);
      load(filters, pagination.current_page);
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

  const handleToggle = async (o) => {
    await ouvriersApi.toggleStatut(o.id);
    load(filters, pagination.current_page);
  };
  const handleDelete = async (o) => {
    if (!confirm("Supprimer définitivement cet ouvrier ?")) return;
    try {
      await ouvriersApi.remove(o.id);
      load(filters, pagination.current_page);
    } catch (err) {
      alert(err.response?.data?.message || "Suppression impossible.");
    }
  };

  const hasFilters =
    filters.recherche || filters.chantier_id || filters.statut !== "tous";

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-[#1C9F93]">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total
          </p>
          <p className="text-3xl font-extrabold text-[#0F172A] mt-1">
            {stats.total}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">ouvriers enregistrés</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-blue-400">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Actifs
          </p>
          <p className="text-3xl font-extrabold text-blue-500 mt-1">
            {stats.actifs}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">en service</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-t-4 border-slate-300">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Inactifs
          </p>
          <p className="text-3xl font-extrabold text-slate-400 mt-1">
            {stats.inactifs}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">désactivés</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-col md:flex-row items-end gap-3"
        >
          <div className="w-full md:flex-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Rechercher
            </label>
            <input
              value={filters.recherche}
              onChange={(e) =>
                setFilters({ ...filters, recherche: e.target.value })
              }
              placeholder="Nom ou prénom..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
            />
          </div>
          <div className="w-full md:w-56">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Chantier
            </label>
            <select
              value={filters.chantier_id}
              onChange={(e) => {
                const f = { ...filters, chantier_id: e.target.value };
                setFilters(f);
                load(f);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
            >
              <option value="">Tous les chantiers</option>
              {chantiers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nomChantier}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-auto">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Statut
            </label>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              {[
                ["tous", "Tous"],
                ["actif", "Actifs"],
                ["inactif", "Inactifs"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStatutFiltre(val)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filters.statut === val ? "bg-white text-[#0F172A] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="px-3 py-2 text-xs font-semibold bg-[#1C9F93] text-white rounded-lg hover:bg-[#178a7f]"
          >
            Rechercher
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </form>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <strong className="text-[#0F172A] font-semibold">
            {pagination.total ?? personnel.length}
          </strong>{" "}
          ouvrier(s) trouvé(s)
        </p>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C9F93] hover:bg-[#178a7f] text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
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
          Nouvel ouvrier
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">Chargement...</p>
          </div>
        ) : personnel.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600 font-medium text-sm">
              Aucun ouvrier trouvé
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Ouvrier</th>
                  <th className="py-3 px-4">Poste</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4">Chantier affecté</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {personnel.map((o) => {
                  const initiales =
                    `${o.prenomOuvrier[0]}${o.nomOuvrier[0]}`.toUpperCase();
                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${o.statutOuvrier === "actif" ? "bg-[#1C9F93]/10 text-[#1C9F93]" : "bg-slate-100 text-slate-400"}`}
                          >
                            {initiales}
                          </div>
                          <p className="font-medium text-[#0F172A]">
                            {o.prenomOuvrier} {o.nomOuvrier}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {o.poste?.libelle ?? "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {o.telOuvrier || "-"}
                      </td>
                      <td className="py-3 px-4">
                        {o.chantier ? (
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1C9F93]"></span>
                            {o.chantier.nomChantier}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Non affecté
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${o.statutOuvrier === "actif" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}
                        >
                          {o.statutOuvrier === "actif" ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(o)}
                            title="Modifier"
                            className="p-1.5 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggle(o)}
                            title={
                              o.statutOuvrier === "actif"
                                ? "Désactiver"
                                : "Activer"
                            }
                            className={`p-1.5 rounded-lg transition-colors ${o.statutOuvrier === "actif" ? "text-amber-500 hover:bg-amber-50" : "text-[#1C9F93] hover:bg-[#1C9F93]/10"}`}
                          >
                            {o.statutOuvrier === "actif" ? (
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
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            ) : (
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
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                          </button>
                          {o.statutOuvrier === "inactif" ? (
                            <button
                              onClick={() => handleDelete(o)}
                              title="Supprimer"
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
                          ) : (
                            <span
                              className="p-1.5 text-slate-200 cursor-not-allowed"
                              title="Désactiver d'abord pour supprimer"
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
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination.last_page > 1 && (
          <div className="border-t border-slate-200 px-5 py-3.5 flex items-center justify-center gap-1">
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => load(filters, p)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${p === pagination.current_page ? "bg-[#0F172A] text-white border-[#0F172A]" : "text-slate-500 border-slate-300 hover:bg-slate-50"}`}
                >
                  {p}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier l'ouvrier" : "Nouvel ouvrier"}
      >
        <OuvrierForm
          initialData={editing}
          postes={postes}
          chantiers={chantiers}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
          errors={errors}
        />
      </Modal>
    </>
  );
}
