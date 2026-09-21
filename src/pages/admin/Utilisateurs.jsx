import { useState, useEffect, useCallback } from "react";
import { usersApi } from "../../api/users";
import { rolesApi } from "../../api/roles";
import { demandesResetApi } from "../../api/demandesReset";
import { usePageHeader } from "../../context/PageHeaderContext";
import Modal from "../../components/Modal";
import RoleSelector from "../../components/RoleSelector";
import UserSection from "./components/UserSection";

const EMPTY_FORM = { nomUser: "", prenomUser: "", email: "", telUser: "" };
const ROLES_ADMINISTRATIFS = [
  "admin",
  "directeur_travaux",
  "daf",
  "responsable_rh",
];

export default function Utilisateurs() {
  const { setPageHeader } = usePageHeader();

  const [users, setUsers] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [demandesReset, setDemandesReset] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setPageHeader(
      "Gestion des utilisateurs",
      "Créez et gérez les comptes de votre équipe.",
    );
  }, [setPageHeader]);

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      usersApi.list(1, 100), // on récupère tout, le regroupement se fait côté front
      rolesApi.list(),
      demandesResetApi.list(),
    ])
      .then(([usersRes, rolesRes, demandesRes]) => {
        setUsers(usersRes.data.data);
        setAllRoles(rolesRes.data);
        setDemandesReset(demandesRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Regroupement des utilisateurs (équivalent du grouping Blade) ──
  const usersAdministratifs = users.filter((u) =>
    u.roles.some((r) => ROLES_ADMINISTRATIFS.includes(r.nom)),
  );
  const usersChefProjet = users.filter((u) =>
    u.roles.some((r) => r.nom === "chef_projet"),
  );
  const usersPointeur = users.filter((u) =>
    u.roles.some((r) => r.nom === "pointeur"),
  );

  // ── Modal création/édition ──
  const openCreateModal = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setSelectedRoles([]);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      nomUser: user.nomUser,
      prenomUser: user.prenomUser,
      email: user.email,
      telUser: user.telUser,
    });
    setSelectedRoles(
      user.roles.map((r) => ({
        id: r.id,
        ...(r.nom === "daf"
          ? {
              gere_approvisionnements: r.gere_approvisionnements,
              gere_depenses: r.gere_depenses,
            }
          : {}),
      })),
    );
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (selectedRoles.length === 0) {
      setErrors({ roles: "Sélectionnez au moins un rôle." });
      return;
    }

    setSubmitting(true);
    const payload = { ...form, roles: selectedRoles };

    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, payload);
      } else {
        await usersApi.create(payload);
        setNotification({
          type: "creation",
          texte: `Compte créé pour ${payload.prenomUser} ${payload.nomUser}. Les identifiants ont été envoyés par email.`,
        });
      }
      setModalOpen(false);
      loadAll();
    } catch (err) {
      setErrors(
        err.response?.data?.errors || { general: "Une erreur est survenue." },
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Actions sur une ligne ──
  const handleToggle = async (user) => {
    await usersApi.toggleActif(user.id);
    loadAll();
  };

  const handleReset = async (user) => {
    if (!confirm(`Réinitialiser le mot de passe de ${user.nomComplet} ?`))
      return;
    await usersApi.reinitialiserMotDePasse(user.id);
    setNotification({
      type: "reinit",
      texte: `Mot de passe réinitialisé pour ${user.nomComplet}. Le nouveau mot de passe a été envoyé par email.`,
    });
  };

  const handleResoudreDemande = async (demande) => {
    await demandesResetApi.resoudre(demande.id);
    setNotification({
      type: "reinit",
      texte: `Mot de passe réinitialisé pour ${demande.user?.nomComplet ?? demande.email}. Envoyé par email.`,
    });
    loadAll();
  };

  return (
    <>
      {/* Alerte compte créé */}
      {notification && (
        <div className="bg-[#1C9F93]/10 border border-[#1C9F93]/30 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#1C9F93] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-white"
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
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-700">{notification.texte}</p>
                <button
                  onClick={() => setNotification(null)}
                  className="text-slate-400 hover:text-slate-600 ml-4"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Demandes de réinitialisation en attente */}
      {demandesReset.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p className="font-semibold text-red-700 text-sm">
              {demandesReset.length} demande(s) de réinitialisation en attente
            </p>
          </div>
          <div className="space-y-2">
            {demandesReset.map((demande) => (
              <div
                key={demande.id}
                className="bg-white border border-red-100 rounded-lg px-4 py-3 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">
                    {demande.user
                      ? (demande.user.nomComplet ??
                        `${demande.user.prenomUser} ${demande.user.nomUser}`)
                      : demande.email}
                  </p>
                  <p className="text-xs text-slate-400">
                    {demande.email} ·{" "}
                    {new Date(demande.created_at).toLocaleString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleResoudreDemande(demande)}
                  className="px-4 py-2 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  Réinitialiser et envoyer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {users.length} utilisateur(s) au total
        </p>
        <button
          onClick={openCreateModal}
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
          Nouvel utilisateur
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">
            Aucun utilisateur pour le moment.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 mt-4 bg-[#1C9F93] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#178a7f]"
          >
            Créer le premier utilisateur
          </button>
        </div>
      ) : (
        <>
          <UserSection
            title="Personnel administratif"
            colorKey="administratif"
            users={usersAdministratifs}
            onEdit={openEditModal}
            onReset={handleReset}
            onToggle={handleToggle}
          />
          <UserSection
            title="Chefs de projet"
            colorKey="chef_projet"
            users={usersChefProjet}
            onEdit={openEditModal}
            onReset={handleReset}
            onToggle={handleToggle}
          />
          <UserSection
            title="Pointeurs"
            colorKey="pointeur"
            users={usersPointeur}
            onEdit={openEditModal}
            onReset={handleReset}
            onToggle={handleToggle}
          />
        </>
      )}

      {/* Modal création/édition */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                value={form.prenomUser}
                onChange={(e) =>
                  setForm({ ...form, prenomUser: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                value={form.nomUser}
                onChange={(e) => setForm({ ...form, nomUser: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              value={form.telUser}
              onChange={(e) => setForm({ ...form, telUser: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <RoleSelector
            allRoles={allRoles}
            selectedRoles={selectedRoles}
            onChange={setSelectedRoles}
          />
          {errors.roles && (
            <p className="text-red-500 text-xs">
              {Array.isArray(errors.roles) ? errors.roles[0] : errors.roles}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-accent disabled:opacity-60"
            >
              {submitting
                ? "Enregistrement..."
                : editingUser
                  ? "Mettre à jour"
                  : "Créer"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
