import { useState } from "react";
import Modal from "../../../components/Modal";

export default function DateLivraisonModal({
  demande,
  open,
  onClose,
  onSave,
  mode,
}) {
  const [date, setDate] = useState(demande?.date_livraison_prevue ?? "");
  const [saving, setSaving] = useState(false);

  if (!demande) return null;

  const isCommande = mode === "commande";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(date || null);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isCommande ? "Passer la commande" : "Date de livraison prévue"}
    >
      <p className="text-xs text-slate-500 mb-4">
        {demande.designation} · {demande.chantier?.nomChantier}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            Date de livraison prévue{" "}
            <span className="text-slate-400 font-normal">(optionnel)</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={isCommande ? new Date().toISOString().slice(0, 10) : undefined}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30 focus:border-[#1C9F93]"
          />
          <p className="text-xs text-slate-400 mt-1.5">
            {isCommande
              ? "Vous pourrez la renseigner ou la corriger plus tard."
              : "Laissez vide pour effacer la date actuellement définie."}
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-[#1C9F93] text-white text-sm font-medium rounded-lg hover:bg-[#178a7f] transition-colors disabled:opacity-60"
          >
            {saving
              ? "Enregistrement..."
              : isCommande
                ? "Confirmer la commande"
                : "Enregistrer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
