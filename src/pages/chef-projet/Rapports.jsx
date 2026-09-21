import { useState, useEffect, useCallback } from "react";
import { rapportsApi } from "../../api/rapports";
import { usePageHeader } from "../../context/PageHeaderContext";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import RapportForm from "./components/RapportForm";

const TYPE_CONFIG = {
  avancement: ["Avancement", "bg-blue-100 text-blue-700"],
  incident: ["Incident", "bg-red-100 text-red-600"],
  livraison: ["Livraison", "bg-emerald-100 text-emerald-700"],
  reunion: ["Réunion", "bg-amber-100 text-amber-700"],
  autre: ["Autre", "bg-slate-100 text-slate-600"],
};

function fmtDate(v) {
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

export default function Rapports() {
  const { setPageHeader } = usePageHeader();
  const [rapports, setRapports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ chantier_id: "", type: "tous" });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setPageHeader(
      "Mes rapports",
      "Rédigez et consultez vos rapports de chantier.",
    );
  }, [setPageHeader]);

  const load = useCallback(
    (params = filters, page = 1) => {
      setLoading(true);
      rapportsApi
        .list({ ...params, page })
        .then((res) => {
          setRapports(res.data.data);
          setPagination(res.data.meta ?? null);
        })
        .finally(() => setLoading(false));
    },
    [filters],
  );

  useEffect(() => {
    load();
    rapportsApi.formOptions().then((res) => setChantiers(res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (patch) => {
    const f = { ...filters, ...patch };
    setFilters(f);
    load(f);
  };

  const openCreate = () => {
    setEditing(null);
    setErrors({});
    setModalOpen(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setErrors({});
    try {
      if (editing) await rapportsApi.update(editing.id, formData);
      else await rapportsApi.create(formData);
      setModalOpen(false);
      load();
    } catch (err) {
      setErrors(
        err.response?.data?.errors || { general: "Une erreur est survenue." },
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (r) => {
    if (!confirm("Supprimer ce rapport ?")) return;
    await rapportsApi.remove(r.id);
    load();
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-56">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Chantier
          </label>
          <select
            value={filters.chantier_id}
            onChange={(e) =>
              handleFilterChange({ chantier_id: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
          >
            <option value="">Tous mes chantiers</option>
            {chantiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nomChantier}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange({ type: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
          >
            <option value="tous">Tous les types</option>
            <option value="avancement">Avancement</option>
            <option value="incident">Incident</option>
            <option value="livraison">Livraison</option>
            <option value="reunion">Réunion</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <button
          onClick={openCreate}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors"
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
          Nouveau rapport
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      ) : rapports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">
            Aucun rapport pour le moment.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 mt-4 bg-[#1C9F93] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#178a7f]"
          >
            Rédiger le premier rapport
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {rapports.map((r) => {
              const [label, badgeClass] = TYPE_CONFIG[r.type] ?? [r.type, ""];
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {r.titre}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}`}
                      >
                        {label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {r.chantier.nomChantier} · {fmtDate(r.date_rapport)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(r)}
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
                      onClick={() => handleDelete(r)}
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
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination
            pagination={
              pagination
                ? {
                    page: pagination.current_page,
                    pages: pagination.last_page,
                    total: pagination.total,
                    debut: pagination.from,
                    fin: pagination.to,
                  }
                : null
            }
            onPageChange={(p) => load(filters, p)}
          />
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier le rapport" : "Nouveau rapport"}
      >
        <RapportForm
          initialData={editing}
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
