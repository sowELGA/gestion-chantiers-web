import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { chantiersApi } from "../../api/chantiers";
import { usePageHeader } from "../../context/PageHeaderContext";
import Modal from "../../components/Modal";
import Dropdown from "../../components/Dropdown";
import ChantierForm from "./components/ChantierForm";
import AffectationCard from "./components/AffectationCard";
import PhaseSummaryRow from "./components/PhaseSummaryRow";

const STATUT_CONFIG = {
  en_attente: {
    label: "En attente",
    class: "bg-amber-50 text-amber-700 border-amber-200",
  },
  en_cours: {
    label: "En cours",
    class: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  suspendu: {
    label: "Suspendu",
    class: "bg-rose-50 text-rose-700 border-rose-200",
  },
  livre: { label: "Livré", class: "bg-teal-50 text-teal-700 border-teal-200" },
};

function fmtMontant(v) {
  return new Intl.NumberFormat("fr-FR").format(v);
}

function fmtDate(v) {
  if (!v) return "—";
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
}

export default function ChantierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setPageHeader } = usePageHeader();

  const [chantier, setChantier] = useState(null);
  const [chefsProjets, setChefsProjets] = useState([]);
  const [pointeurs, setPointeurs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    chantiersApi
      .show(id)
      .then((res) => {
        setChantier(res.data.chantier);
        setChefsProjets(res.data.chefsProjets);
        setPointeurs(res.data.pointeurs);
        setPageHeader(
          res.data.chantier.nomChantier,
          res.data.chantier.localisation,
        );
      })
      .catch(() => navigate("/chantiers", { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate, setPageHeader]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !chantier) {
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );
  }

  const config = STATUT_CONFIG[chantier.statut] ?? {
    label: chantier.statut,
    class: "bg-slate-50 text-slate-700 border-slate-200",
  };
  const transitions = Object.entries(chantier.transitions_disponibles ?? {});

  const handleChangerStatut = async (statut) => {
    if (
      statut === "livre" &&
      !confirm(
        "Marquer ce chantier comme livré ?\nCette action est définitive.",
      )
    )
      return;
    try {
      const res = await chantiersApi.changerStatut(chantier.id, statut);
      setChantier(res.data.chantier);
    } catch (err) {
      alert(err.response?.data?.message || "Action impossible.");
    }
  };

  const handleEditSubmit = async (formData) => {
    setEditSubmitting(true);
    setEditErrors({});
    try {
      const payload = {
        ...formData,
        budget_prevu:
          formData.budget_prevu === "" ? null : formData.budget_prevu,
      };
      const res = await chantiersApi.update(chantier.id, payload);
      setChantier((prev) => ({ ...prev, ...res.data.chantier }));
      setEditModalOpen(false);
    } catch (err) {
      setEditErrors(
        err.response?.data?.errors || { general: "Une erreur est survenue." },
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleAffecterChef = async (chefProjetId) => {
    const res = await chantiersApi.affecterChefProjet(
      chantier.id,
      chefProjetId,
    );
    setChantier(res.data.chantier);
    load(); // recharge pour rafraîchir l'historique
  };

  const handleAffecterPointeur = async (pointeurId) => {
    const res = await chantiersApi.affecterPointeur(chantier.id, pointeurId);
    setChantier(res.data.chantier);
    load();
  };

  return (
    <div className="space-y-6">
      {/* En-tête actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.class}`}
        >
          <span className="w-2 h-2 rounded-full bg-current"></span>
          {config.label}
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {chantier.statut !== "livre" && (
            <Dropdown
              align="right"
              trigger={(toggle, open) => (
                <button
                  onClick={toggle}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <span>Changer le statut</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}
            >
              {(close) =>
                transitions.length === 0 ? (
                  <p className="px-4 py-2 text-xs text-slate-400">
                    Aucune action disponible
                  </p>
                ) : (
                  transitions.map(([statut, label]) => (
                    <button
                      key={statut}
                      onClick={() => {
                        close();
                        handleChangerStatut(statut);
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      {label}
                    </button>
                  ))
                )
              }
            </Dropdown>
          )}

          <button
            onClick={() => setEditModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-[#1C9F93] hover:bg-[#178a7f] text-white rounded-xl transition-colors shadow-sm"
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
            <span>Modifier</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Budget Prévu
          </span>
          <div className="mt-3">
            {chantier.budget_prevu !== null ? (
              <>
                <span className="text-2xl font-bold text-slate-900">
                  {fmtMontant(chantier.budget_prevu)}
                </span>
                <span className="text-xs font-medium text-slate-400 ml-1">
                  FCFA
                </span>
              </>
            ) : (
              <>
                <span className="text-lg font-semibold text-slate-400 italic">
                  Non défini
                </span>
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="block text-xs text-[#1C9F93] hover:underline mt-1"
                >
                  Renseigner un budget
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Budget Consommé
            </span>
            {chantier.pourcentage_budget !== null && (
              <span
                className={`text-xs font-bold ${chantier.pourcentage_budget > 90 ? "text-rose-600" : "text-slate-600"}`}
              >
                {chantier.pourcentage_budget}%
              </span>
            )}
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold ${chantier.pourcentage_budget !== null && chantier.pourcentage_budget > 90 ? "text-rose-600" : "text-slate-900"}`}
            >
              {fmtMontant(chantier.budget_consomme)}{" "}
              <span className="text-xs font-medium text-slate-400">FCFA</span>
            </div>
            {chantier.pourcentage_budget !== null ? (
              <>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${chantier.pourcentage_budget > 90 ? "bg-rose-500" : chantier.pourcentage_budget > 70 ? "bg-amber-500" : "bg-[#1C9F93]"}`}
                    style={{
                      width: `${Math.min(100, chantier.pourcentage_budget)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Reste :{" "}
                  <span className="font-semibold text-slate-700">
                    {fmtMontant(chantier.budget_restant)} FCFA
                  </span>
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-400 italic mt-2">
                Définissez un budget pour suivre la consommation.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avancement Global
            </span>
            <span className="text-xs font-bold text-slate-600">
              {chantier.avancement_global}%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {chantier.avancement_global}%
            </span>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${Math.min(100, chantier.avancement_global)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Échéance Prévue
          </span>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold ${chantier.est_en_retard ? "text-rose-600" : "text-slate-900"}`}
            >
              {fmtDate(chantier.date_fin_prevue)}
            </div>
            {chantier.est_en_retard ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 mt-2">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Chantier en retard
              </span>
            ) : (
              <span className="text-xs text-slate-400 mt-2 block">
                Dans les temps
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Phases de travaux (branché au module Planning) */}
      {/* Phases de travaux (branché au module Planning) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">
            Phases de travaux
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
            {chantier.phases?.length ?? 0} phase(s)
          </span>
        </div>
        <div className="p-4 space-y-3">
          {!chantier.phases || chantier.phases.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">
              Aucune phase enregistrée pour le moment.
            </p>
          ) : (
            chantier.phases.map((phase) => (
              <PhaseSummaryRow key={phase.id} phase={phase} />
            ))
          )}
        </div>
      </div>

      {/* Affectations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AffectationCard
          titre="Chef de Projet"
          personne={chantier.chef_projet}
          options={chefsProjets}
          historique={chantier.historique_chefs_projets ?? []}
          currentId={chantier.chef_projet?.id}
          onSave={handleAffecterChef}
          avatarColor="bg-[#1C9F93]/10 text-[#1C9F93]"
        />
        <AffectationCard
          titre="Pointeur"
          personne={chantier.pointeur}
          options={pointeurs}
          historique={chantier.historique_pointeurs ?? []}
          currentId={chantier.pointeur?.id}
          onSave={handleAffecterPointeur}
          avatarColor="bg-slate-200 text-slate-600"
        />
      </div>

      <div className="pt-2">
        <Link
          to="/chantiers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Retour aux chantiers
        </Link>
      </div>

      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Modifier le chantier"
      >
        <ChantierForm
          initialData={chantier}
          chefsProjets={chefsProjets}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditModalOpen(false)}
          submitting={editSubmitting}
          errors={editErrors}
        />
      </Modal>
    </div>
  );
}
