import { useState, useEffect, useCallback } from "react";
import { ouvriersApi } from "../../../api/rh";
import PosteAutocomplete from "../../../components/PosteAutocomplete";

const EMPTY = {
  nomOuvrier: "",
  prenomOuvrier: "",
  telOuvrier: "",
  poste_id: "",
  chantier_id: "",
};

export default function OuvrierForm({
  initialData,
  chantiers,
  onSubmit,
  onCancel,
  submitting,
  errors,
}) {
  const [form, setForm] = useState(EMPTY);
  const [postesDisponibles, setPostesDisponibles] = useState([]);
  const [loadingPostes, setLoadingPostes] = useState(false);
  const [erreurPoste, setErreurPoste] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        nomOuvrier: initialData.nomOuvrier,
        prenomOuvrier: initialData.prenomOuvrier,
        telOuvrier: initialData.telOuvrier,
        poste_id: initialData.poste?.id ?? "",
        chantier_id: initialData.chantier?.id ?? "",
      });
    } else {
      setForm(EMPTY);
      setPostesDisponibles([]);
    }
    setErreurPoste("");
  }, [initialData]);

  const chargerPostes = useCallback((chantierId, conserverPoste = false) => {
    if (!chantierId) {
      setPostesDisponibles([]);
      return;
    }
    setLoadingPostes(true);
    ouvriersApi
      .postesDisponibles(chantierId)
      .then((res) => {
        setPostesDisponibles(res.data);
        if (!conserverPoste) {
          setForm((f) => ({ ...f, poste_id: "" }));
        }
      })
      .finally(() => setLoadingPostes(false));
  }, []);

  useEffect(() => {
    if (initialData?.chantier?.id) {
      chargerPostes(initialData.chantier.id, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleChantierChange = (chantierId) => {
    setForm((f) => ({ ...f, chantier_id: chantierId }));
    chargerPostes(chantierId);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.poste_id) {
      setErreurPoste("Sélectionnez un poste dans la liste proposée.");
      return;
    }
    setErreurPoste("");
    onSubmit(form);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {errors?.general && (
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
            value={form.prenomOuvrier}
            onChange={(e) =>
              setForm({ ...form, prenomOuvrier: e.target.value })
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
            value={form.nomOuvrier}
            onChange={(e) => setForm({ ...form, nomOuvrier: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone
        </label>
        <input
          value={form.telOuvrier}
          onChange={(e) => setForm({ ...form, telOuvrier: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chantier affecté
        </label>
        <select
          value={form.chantier_id}
          onChange={(e) => handleChantierChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          <option value="">— Non affecté —</option>
          {chantiers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nomChantier}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Poste
        </label>
        <PosteAutocomplete
          options={postesDisponibles}
          value={form.poste_id}
          onChange={(id) => {
            setForm((f) => ({ ...f, poste_id: id }));
            if (id) setErreurPoste("");
          }}
          disabled={!form.chantier_id || loadingPostes}
          placeholder={
            !form.chantier_id
              ? "Choisissez d'abord un chantier"
              : loadingPostes
                ? "Chargement..."
                : "Tapez pour rechercher un poste..."
          }
          emptyMessage="Aucun poste tarifé sur ce chantier"
        />
        {erreurPoste && (
          <p className="text-red-500 text-xs mt-1">{erreurPoste}</p>
        )}
        {form.chantier_id &&
          postesDisponibles.length === 0 &&
          !loadingPostes && (
            <p className="text-amber-600 text-xs mt-1">
              Configurez d'abord les taux de salaire de ce chantier.
            </p>
          )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
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
            : initialData
              ? "Mettre à jour"
              : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
