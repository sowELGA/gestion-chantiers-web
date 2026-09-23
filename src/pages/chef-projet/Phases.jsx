import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { mesChantiersApi } from "../../api/mesChantiers";
import { planningApi } from "../../api/planning";
import { usePageHeader } from "../../context/PageHeaderContext";
import Modal from "../../components/Modal";
import StatCard from "../../components/StatCard";
import PhaseCard from "./components/PhaseCard";
import PhaseForm from "./components/PhaseForm";

const FILTRES = [
  { valeur: "actives", label: "En cours & en attente" },
  { valeur: "toutes", label: "Toutes" },
  { valeur: "en_attente", label: "En attente" },
  { valeur: "en_cours", label: "En cours" },
  { valeur: "terminee", label: "Terminées" },
];

export default function Phases() {
  const { id: chantierId } = useParams();
  const { setPageHeader } = usePageHeader();

  const [chantier, setChantier] = useState(null);
  const [phases, setPhases] = useState([]);
  const [statutFiltre, setStatutFiltre] = useState("actives");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [prochainOrdre, setProchainOrdre] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const load = useCallback(
    (statut = statutFiltre) => {
      setLoading(true);
      Promise.all([
        mesChantiersApi.show(chantierId),
        planningApi.indexPhases(chantierId, statut),
      ])
        .then(([chantierRes, phasesRes]) => {
          setChantier(chantierRes.data);
          setPhases(phasesRes.data.phases);
          setPageHeader("Phases du chantier", chantierRes.data.nomChantier);
        })
        .finally(() => setLoading(false));
    },
    [chantierId, statutFiltre, setPageHeader],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleFiltre = (valeur) => {
    setStatutFiltre(valeur);
    load(valeur);
  };

  const openCreate = async () => {
    setEditing(null);
    setErrors({});
    const res = await planningApi.prochainOrdre(chantierId);
    setProchainOrdre(res.data.prochain_ordre);
    setModalOpen(true);
  };

  const openEdit = (phase) => {
    setEditing(phase);
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setErrors({});
    try {
      if (editing) {
        await planningApi.updatePhase(chantierId, editing.id, formData);
      } else {
        await planningApi.storePhase(chantierId, formData);
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

  const handleDelete = async (phase) => {
    if (!confirm(`Supprimer la phase « ${phase.nomPhase} » ?`)) return;
    try {
      await planningApi.destroyPhase(chantierId, phase.id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Suppression impossible.");
    }
  };

  if (loading || !chantier)
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );

  const totalPhases = phases.length;
  const phasesEnCours = phases.filter(
    (p) => p.statutPhase === "en_cours",
  ).length;
  const totalTaches = phases.reduce(
    (sum, p) => sum + (p.taches?.length ?? 0),
    0,
  );
  const avancementGlobal =
    totalPhases > 0
      ? Math.round(phases.reduce((s, p) => s + p.avancement, 0) / totalPhases)
      : 0;
  const chantierModifiable = chantier.statut !== "livre";

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/mes-chantiers"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#1C9F93] transition-colors"
        >
          ← Mes chantiers
        </Link>
        {chantierModifiable && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors"
          >
            + Nouvelle phase
          </button>
        )}
        <Link
          to={`/mes-chantiers/${chantierId}/recap`}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Validation des pointages
        </Link>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {FILTRES.map((f) => (
          <button
            key={f.valeur}
            onClick={() => handleFiltre(f.valeur)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              statutFiltre === f.valeur
                ? "bg-[#0F3D37] text-white border-[#0F3D37]"
                : "bg-white text-slate-600 border-slate-200 hover:border-[#1C9F93] hover:text-[#1C9F93]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {phases.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
          <p className="text-slate-600 font-medium">Aucune phase créée</p>
          <p className="text-slate-400 text-sm mt-1">
            Commencez par créer les grandes phases de votre chantier.
          </p>
          {chantierModifiable && (
            <button
              onClick={openCreate}
              className="inline-flex mt-5 px-5 py-2.5 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors"
            >
              Créer la première phase
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total phases"
              value={totalPhases}
              borderColor="border-[#1C9F93]"
            />
            <StatCard
              label="En cours"
              value={phasesEnCours}
              borderColor="border-blue-400"
            />
            <StatCard
              label="Tâches"
              value={totalTaches}
              borderColor="border-amber-400"
            />
            <StatCard
              label="Avancement global"
              value={`${avancementGlobal}%`}
              borderColor="border-[#D4AF37]"
            />
          </div>

          <div className="space-y-4">
            {phases.map((phase) => (
              <PhaseCard
                key={phase.id}
                chantier={chantier}
                phase={phase}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier la phase" : "Nouvelle phase"}
      >
        <PhaseForm
          initialData={editing}
          prochainOrdre={prochainOrdre}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
          errors={errors}
        />
      </Modal>
    </>
  );
}
