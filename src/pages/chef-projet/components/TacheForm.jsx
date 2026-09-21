import { useState, useEffect } from "react";

const EMPTY = {
  nomTache: "",
  date_debut_prevue: "",
  date_fin_prevue: "",
  tache_precedente_id: "",
};

export default function TacheForm({
  initialData,
  tachesDisponibles,
  onSubmit,
  onCancel,
  submitting,
  errors,
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (initialData) {
      setForm({
        nomTache: initialData.nomTache,
        date_debut_prevue: initialData.date_debut_prevue,
        date_fin_prevue: initialData.date_fin_prevue,
        tache_precedente_id: initialData.tache_precedente?.id ?? "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [initialData]);

  const autresTaches = tachesDisponibles.filter(
    (t) => t.id !== initialData?.id,
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      {errors?.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
          {errors.general}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom de la tâche
        </label>
        <input
          value={form.nomTache}
          onChange={(e) => setForm({ ...form, nomTache: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Début prévu
          </label>
          <input
            type="date"
            value={form.date_debut_prevue}
            onChange={(e) =>
              setForm({ ...form, date_debut_prevue: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fin prévue
          </label>
          <input
            type="date"
            value={form.date_fin_prevue}
            onChange={(e) =>
              setForm({ ...form, date_fin_prevue: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      {errors?.date_debut_prevue && (
        <p className="text-red-500 text-xs">{errors.date_debut_prevue[0]}</p>
      )}
      {errors?.date_fin_prevue && (
        <p className="text-red-500 text-xs">{errors.date_fin_prevue[0]}</p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tâche précédente (optionnel)
        </label>
        <select
          value={form.tache_precedente_id}
          onChange={(e) =>
            setForm({ ...form, tache_precedente_id: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          <option value="">Aucune</option>
          {autresTaches.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nomTache}
            </option>
          ))}
        </select>
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
              : "Créer"}
        </button>
      </div>
    </form>
  );
}
