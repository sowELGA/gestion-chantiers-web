import { useState, useEffect } from "react";

const EMPTY = {
  nomChantier: "",
  localisation: "",
  budget_prevu: "",
  date_debut: "",
  date_fin_prevue: "",
  chef_projet_id: "",
};

export default function ChantierForm({
  initialData,
  chefsProjets,
  onSubmit,
  onCancel,
  submitting,
  errors,
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (initialData) {
      setForm({
        nomChantier: initialData.nomChantier ?? "",
        localisation: initialData.localisation ?? "",
        budget_prevu: initialData.budget_prevu ?? "",
        date_debut: initialData.date_debut ?? "",
        date_fin_prevue: initialData.date_fin_prevue ?? "",
        chef_projet_id: initialData.chef_projet?.id ?? "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors?.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
          {errors.general}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom du chantier
        </label>
        <input
          value={form.nomChantier}
          onChange={(e) => setForm({ ...form, nomChantier: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors?.nomChantier && (
          <p className="text-red-500 text-xs mt-1">{errors.nomChantier[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Localisation
        </label>
        <input
          value={form.localisation}
          onChange={(e) => setForm({ ...form, localisation: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Budget prévu (optionnel)
        </label>
        <input
          type="number"
          min="1"
          value={form.budget_prevu}
          onChange={(e) => setForm({ ...form, budget_prevu: e.target.value })}
          placeholder="Ex : 50000000"
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

      {!initialData && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chef de projet (optionnel)
          </label>
          <select
            value={form.chef_projet_id}
            onChange={(e) =>
              setForm({ ...form, chef_projet_id: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          >
            <option value="">Aucun pour l'instant</option>
            {chefsProjets.map((cp) => (
              <option key={cp.id} value={cp.id}>
                {cp.prenomUser} {cp.nomUser}
              </option>
            ))}
          </select>
        </div>
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
