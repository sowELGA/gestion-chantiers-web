import { useState, useEffect } from "react";

const EMPTY = {
  nomOuvrier: "",
  prenomOuvrier: "",
  telOuvrier: "",
  poste_id: "",
  chantier_id: "",
};

export default function OuvrierForm({
  initialData,
  postes,
  chantiers,
  onSubmit,
  onCancel,
  submitting,
  errors,
}) {
  const [form, setForm] = useState(EMPTY);

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
    }
  }, [initialData]);

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
          Poste
        </label>
        <select
          value={form.poste_id}
          onChange={(e) => setForm({ ...form, poste_id: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          <option value="">Sélectionner</option>
          {postes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.libelle}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chantier affecté
        </label>
        <select
          value={form.chantier_id}
          onChange={(e) => setForm({ ...form, chantier_id: e.target.value })}
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
