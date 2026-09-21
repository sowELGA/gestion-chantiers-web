import { useState, useEffect } from "react";

const EMPTY = {
  nomPhase: "",
  ordre: 1,
  typePhase: "gros_oeuvre",
  sous_traitant: "",
  date_debut: "",
  date_fin_prevue: "",
};

export default function PhaseForm({
  initialData,
  prochainOrdre,
  onSubmit,
  onCancel,
  submitting,
  errors,
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (initialData) {
      setForm({
        nomPhase: initialData.nomPhase,
        ordre: initialData.ordre,
        typePhase: initialData.typePhase,
        sous_traitant: initialData.sous_traitant ?? "",
        date_debut: initialData.date_debut,
        date_fin_prevue: initialData.date_fin_prevue,
      });
    } else {
      setForm({ ...EMPTY, ordre: prochainOrdre ?? 1 });
    }
  }, [initialData, prochainOrdre]);

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
          Nom de la phase
        </label>
        <input
          value={form.nomPhase}
          onChange={(e) => setForm({ ...form, nomPhase: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ordre
          </label>
          <input
            type="number"
            min="1"
            value={form.ordre}
            onChange={(e) => setForm({ ...form, ordre: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={form.typePhase}
            onChange={(e) => setForm({ ...form, typePhase: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="gros_oeuvre">Gros œuvre</option>
            <option value="second_oeuvre">Second œuvre</option>
            <option value="finitions">Finitions</option>
            <option value="autre">Autre</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sous-traitant (optionnel)
        </label>
        <input
          value={form.sous_traitant}
          onChange={(e) => setForm({ ...form, sous_traitant: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <input
            type="date"
            value={form.date_debut}
            onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin prévue
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

      {errors?.date_debut && (
        <p className="text-red-500 text-xs">{errors.date_debut[0]}</p>
      )}
      {errors?.date_fin_prevue && (
        <p className="text-red-500 text-xs">{errors.date_fin_prevue[0]}</p>
      )}

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
