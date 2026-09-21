import { useState } from "react";
import Modal from "../../../components/Modal";

export default function AvancementModal({ tache, open, onClose, onSave }) {
  const [val, setVal] = useState(tache?.avancement ?? 0);
  const [saving, setSaving] = useState(false);

  if (!tache) return null;

  const handleSave = async () => {
    if (
      parseInt(val) === 100 &&
      !confirm("Valider définitivement cette tâche ?")
    )
      return;
    setSaving(true);
    try {
      await onSave(parseInt(val));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Avancement">
      <h4 className="font-bold text-[#0F172A] text-base mb-4">
        {tache.nomTache}
      </h4>

      <div className="flex items-center gap-4 mb-3">
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full accent-[#1C9F93] cursor-pointer h-2 bg-slate-100 rounded-lg"
        />
        <span className="text-xl font-black text-[#0F172A] w-14 text-right">
          {val}%
        </span>
      </div>

      {parseInt(val) === 100 && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          ⚠ Valider à 100% verrouillera cette tâche définitivement.
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex-1 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 ${
            parseInt(val) === 100
              ? "bg-[#1C9F93] hover:bg-[#178a7f]"
              : "bg-[#0F172A] hover:bg-[#1e293b]"
          }`}
        >
          {saving
            ? "Enregistrement..."
            : parseInt(val) === 100
              ? "✓ Valider"
              : "Enregistrer"}
        </button>
      </div>
    </Modal>
  );
}
