import { useState, useEffect } from "react";
import { postesApi } from "../../api/rh";
import { usePageHeader } from "../../context/PageHeaderContext";

export default function Postes() {
  const { setPageHeader } = usePageHeader();
  const [postes, setPostes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [libelle, setLibelle] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    setPageHeader(
      "Gestion des postes",
      "Définissez les différents postes et qualifications utilisés sur vos chantiers.",
    );
  }, [setPageHeader]);

  const load = () => {
    setLoading(true);
    postesApi
      .list()
      .then((res) => setPostes(res.data))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await postesApi.create({ libelle });
      setLibelle("");
      load();
    } catch (err) {
      setError(
        err.response?.data?.errors?.libelle?.[0] || "Une erreur est survenue.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditValue(p.libelle);
  };
  const cancelEdit = () => setEditingId(null);

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    await postesApi.update(id, { libelle: editValue });
    setEditingId(null);
    load();
  };

  const handleDelete = async (p) => {
    if (!confirm("Supprimer définitivement ce poste ?")) return;
    try {
      await postesApi.remove(p.id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Suppression impossible.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-1">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1C9F93]"></div>
          <h3 className="font-bold text-sm text-[#0F172A]">Nouveau poste</h3>
        </div>
        <form onSubmit={handleCreate} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Libellé du poste *
            </label>
            <input
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              placeholder="Ex : Chef Maçon, Grutier, Manœuvre..."
              required
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93] transition-all ${error ? "border-red-400 bg-red-50/30" : "border-slate-200"}`}
            />
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-[#1C9F93] hover:bg-[#178a7f] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60"
          >
            {submitting ? "Ajout..." : "Ajouter le poste"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
            <span>Postes enregistrés</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              {postes.length}
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-400">Chargement...</p>
          </div>
        ) : postes.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-slate-600">
              Aucun poste créé pour le moment
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Utilisez le formulaire à gauche pour ajouter vos qualifications.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {postes.map((p) => (
              <div
                key={p.id}
                className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors"
              >
                {editingId === p.id ? (
                  <form
                    onSubmit={(e) => handleUpdate(e, p.id)}
                    className="flex items-center gap-2"
                  >
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      required
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#1C9F93] hover:bg-[#178a7f] text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#0F172A]/5 flex items-center justify-center shrink-0">
                        <svg
                          className="w-4 h-4 text-[#0F172A]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {p.libelle}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${p.ouvriers_count > 0 ? "bg-[#1C9F93]/10 text-[#1C9F93]" : "bg-slate-100 text-slate-400"}`}
                      >
                        {p.ouvriers_count} personne
                        {p.ouvriers_count > 1 ? "s" : ""}
                      </span>
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                        <button
                          onClick={() => startEdit(p)}
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
                        {p.ouvriers_count === 0 ? (
                          <button
                            onClick={() => handleDelete(p)}
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
                            title="Impossible de supprimer un poste attribué"
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
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
