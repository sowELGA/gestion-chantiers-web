import { useState, useEffect } from "react";

const LIGNE_VIDE = {
  designation: "",
  quantite_demandee: "",
  unite: "",
  date_livraison_souhaitee: "",
};

export default function ApprovisionnementForm({
  chantiers,
  initialData,
  onSubmit,
  onCancel,
  submitting,
  errors,
}) {
  const [chantierId, setChantierId] = useState("");
  const [lignes, setLignes] = useState([{ ...LIGNE_VIDE }]);

  useEffect(() => {
    if (initialData) {
      setChantierId(initialData.chantier.id);
      setLignes([
        {
          designation: initialData.designation,
          quantite_demandee: initialData.quantite_demandee,
          unite: initialData.unite,
          date_livraison_souhaitee: initialData.date_livraison_souhaitee,
        },
      ]);
    } else {
      setChantierId(chantiers[0]?.id ?? "");
      setLignes([{ ...LIGNE_VIDE }]);
    }
  }, [initialData, chantiers]);

  const updateLigne = (index, field, value) => {
    setLignes(
      lignes.map((l, i) => (i === index ? { ...l, [field]: value } : l)),
    );
  };

  const ajouterLigne = () => setLignes([...lignes, { ...LIGNE_VIDE }]);
  const supprimerLigne = (index) =>
    setLignes(lignes.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ chantier_id: chantierId, demandes: lignes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors?.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
          {errors.general}
        </div>
      )}
      {errors?.chantier_id && (
        <p className="text-red-500 text-xs">{errors.chantier_id[0]}</p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chantier
        </label>
        <select
          value={chantierId}
          onChange={(e) => setChantierId(e.target.value)}
          disabled={!!initialData}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white disabled:bg-slate-50"
        >
          {chantiers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nomChantier}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {lignes.map((ligne, i) => (
          <div
            key={i}
            className="border border-slate-200 rounded-lg p-3 space-y-2 relative"
          >
            {lignes.length > 1 && (
              <button
                type="button"
                onClick={() => supprimerLigne(i)}
                className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
              >
                &times;
              </button>
            )}
            <input
              placeholder="Désignation (ex : Sac de ciment 50kg)"
              value={ligne.designation}
              onChange={(e) => updateLigne(i, "designation", e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="Quantité"
                value={ligne.quantite_demandee}
                onChange={(e) =>
                  updateLigne(i, "quantite_demandee", e.target.value)
                }
                required
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                placeholder="Unité (sac, m³...)"
                value={ligne.unite}
                onChange={(e) => updateLigne(i, "unite", e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="date"
                value={ligne.date_livraison_souhaitee}
                onChange={(e) =>
                  updateLigne(i, "date_livraison_souhaitee", e.target.value)
                }
                required
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        ))}
      </div>

      {!initialData && (
        <button
          type="button"
          onClick={ajouterLigne}
          className="text-sm text-primary hover:underline font-medium"
        >
          + Ajouter une autre ligne
        </button>
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
              : "Envoyer la demande"}
        </button>
      </div>
    </form>
  );
}
