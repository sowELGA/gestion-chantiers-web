import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { mesChantiersApi } from "../../api/mesChantiers";
import { planningApi } from "../../api/planning";
import { usePageHeader } from "../../context/PageHeaderContext";
import Modal from "../../components/Modal";
import TacheCard from "./components/TacheCard";
import TacheForm from "./components/TacheForm";
import AvancementModal from "./components/AvancementModal";

export default function Taches() {
  const { id: chantierId, phaseId } = useParams();
  const { setPageHeader } = usePageHeader();

  const [chantier, setChantier] = useState(null);
  const [phase, setPhase] = useState(null);
  const [taches, setTaches] = useState([]);
  const [tachesDisponibles, setTachesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [avancementTache, setAvancementTache] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      mesChantiersApi.show(chantierId),
      planningApi.indexTaches(chantierId, phaseId),
      planningApi.tachesDisponibles(chantierId, phaseId),
    ])
      .then(([chantierRes, tachesRes, dispoRes]) => {
        setChantier(chantierRes.data);
        setPhase(tachesRes.data.phase);
        setTaches(tachesRes.data.taches);
        setTachesDisponibles(dispoRes.data);
        setPageHeader(
          "Tâches",
          `${chantierRes.data.nomChantier} · Phase ${tachesRes.data.phase.ordre} : ${tachesRes.data.phase.nomPhase}`,
        );
      })
      .finally(() => setLoading(false));
  }, [chantierId, phaseId, setPageHeader]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setErrors({});
    setModalOpen(true);
  };
  const openEdit = (tache) => {
    setEditing(tache);
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setErrors({});
    const payload = {
      ...formData,
      tache_precedente_id: formData.tache_precedente_id || null,
    };
    try {
      if (editing) {
        await planningApi.updateTache(chantierId, phaseId, editing.id, payload);
      } else {
        await planningApi.storeTache(chantierId, phaseId, payload);
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

  const handleDelete = async (tache) => {
    if (!confirm(`Supprimer définitivement la tâche « ${tache.nomTache} » ?`))
      return;
    try {
      await planningApi.destroyTache(chantierId, phaseId, tache.id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Suppression impossible.");
    }
  };

  const handleAvancement = async (avancement) => {
    await planningApi.avancement(
      chantierId,
      phaseId,
      avancementTache.id,
      avancement,
    );
    load();
  };

  if (loading || !chantier || !phase)
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );

  const nbTotal = taches.length;
  const nbTerminees = taches.filter((t) => t.statutTache === "terminee").length;
  const nbEnCours = taches.filter((t) => t.statutTache === "en_cours").length;
  const nbAttente = taches.filter((t) => t.statutTache === "en_attente").length;
  const nbEnRetard = taches.filter((t) => t.est_en_retard).length;
  const barColor =
    phase.statutPhase === "terminee"
      ? "bg-[#1C9F93]"
      : phase.statutPhase === "en_cours"
        ? "bg-blue-500"
        : "bg-slate-300";
  const chantierModifiable = chantier.statut !== "livre";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          to={`/mes-chantiers/${chantierId}/phases`}
          className="inline-flex items-center gap-1.5 hover:text-[#1C9F93] transition-colors font-medium"
        >
          ← Phases
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-[#0F172A] font-semibold truncate">
          {phase.nomPhase}
        </span>
      </nav>

      <div className="bg-[#0F3D37] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1C9F93]/20 border border-[#1C9F93]/30 flex items-center justify-center flex-shrink-0 font-black text-xl text-[#1C9F93]">
              {phase.ordre}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white">
                  {phase.nomPhase}
                </h1>
                {phase.est_en_retard && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                    ⚠ En retard
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300 flex-wrap">
                <span>
                  📅 {phase.date_debut} → {phase.date_fin_prevue}
                </span>
                {phase.sous_traitant && <span>🏢 {phase.sous_traitant}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/20 p-3.5 rounded-xl border border-white/5 self-start md:self-auto">
            <div className="text-right">
              <p className="text-2xl font-black text-white leading-none">
                {phase.avancement}%
              </p>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold mt-1">
                Avancement Global
              </p>
            </div>
            <div className="w-24 bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor} transition-all duration-500`}
                style={{ width: `${phase.avancement}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1C9F93]"></span>
            <span className="text-slate-600">
              <strong className="text-[#0F172A]">{nbTerminees}</strong>{" "}
              Terminées
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-slate-600">
              <strong className="text-[#0F172A]">{nbEnCours}</strong> En cours
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-300"></span>
            <span className="text-slate-600">
              <strong className="text-[#0F172A]">{nbAttente}</strong> En attente
            </span>
          </div>
          {nbEnRetard > 0 && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-red-50 border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-xs font-bold text-red-600">
                {nbEnRetard} en retard
              </span>
            </div>
          )}
        </div>

        {chantierModifiable && (
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1C9F93] hover:bg-[#178a7f] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            + Nouvelle tâche
          </button>
        )}
      </div>

      {nbTotal === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <h3 className="text-base font-bold text-[#0F172A]">
            Aucune tâche enregistrée
          </h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Décomposez cette phase en sous-tâches pour suivre la progression
            précise du chantier.
          </p>
          {chantierModifiable && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#1C9F93] hover:bg-[#178a7f] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Créer la première tâche
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {taches.map((tache) => (
            <TacheCard
              key={tache.id}
              tache={tache}
              chantierModifiable={chantierModifiable}
              onOpenAvancement={setAvancementTache}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier la tâche" : "Nouvelle tâche"}
      >
        <TacheForm
          initialData={editing}
          tachesDisponibles={tachesDisponibles}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
          errors={errors}
        />
      </Modal>

      <AvancementModal
        tache={avancementTache}
        open={!!avancementTache}
        onClose={() => setAvancementTache(null)}
        onSave={handleAvancement}
      />
    </div>
  );
}
