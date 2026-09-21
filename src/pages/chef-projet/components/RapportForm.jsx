import { useState, useEffect } from "react";

const EMPTY = {
  titre: "",
  date_rapport: new Date().toISOString().slice(0, 10),
  type: "avancement",
  contenu: "",
  chantier_id: "",
};

export default function RapportForm({
  initialData,
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
        titre: initialData.titre,
        date_rapport: initialData.date_rapport,
        type: initialData.type,
        contenu: initialData.contenu,
        chantier_id: initialData.chantier.id,
      });
    } else {
      setForm({ ...EMPTY, chantier_id: chantiers[0]?.id ?? "" });
    }
  }, [initialData, chantiers]);

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
          Chantier
        </label>
        <select
          value={form.chantier_id}
          onChange={(e) => setForm({ ...form, chantier_id: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {chantiers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nomChantier}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="avancement">Avancement</option>
            <option value="incident">Incident</option>
            <option value="livraison">Livraison</option>
            <option value="reunion">Réunion</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date du rapport
          </label>
          <input
            type="date"
            value={form.date_rapport}
            onChange={(e) => setForm({ ...form, date_rapport: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre
        </label>
        <input
          value={form.titre}
          onChange={(e) => setForm({ ...form, titre: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contenu
        </label>
        <textarea
          rows={6}
          value={form.contenu}
          onChange={(e) => setForm({ ...form, contenu: e.target.value })}
          required
          minLength={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
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
              : "Publier le rapport"}
        </button>
      </div>
    </form>
  );
}
