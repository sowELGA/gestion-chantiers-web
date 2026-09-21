import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { pointageApi } from "../../api/pointage";
import { usePageHeader } from "../../context/PageHeaderContext";

export default function ModifierJour() {
  const { date } = useParams();
  const navigate = useNavigate();
  const { setPageHeader } = usePageHeader();
  const [data, setData] = useState(null);
  const [lignes, setLignes] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    pointageApi
      .modifierJour(date)
      .then((res) => {
        setData(res.data);
        setPageHeader(
          "Modifier le pointage",
          new Date(date).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }),
        );
        const init = {};
        res.data.personnel.forEach((p) => {
          init[p.id] = {
            statutPointage: p.statutPointage,
            heures_sup: p.heures_sup,
          };
        });
        setLignes(init);
      })
      .catch((err) => setError(err.response?.data?.message || "Erreur"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const toggleStatut = (id) => {
    setLignes((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        statutPointage:
          prev[id].statutPointage === "present" ? "absent" : "present",
      },
    }));
  };
  const updateHeuresSup = (id, val) =>
    setLignes((prev) => ({ ...prev, [id]: { ...prev[id], heures_sup: val } }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const pointages = Object.entries(lignes).map(([ouvrier_id, v]) => ({
        ouvrier_id: Number(ouvrier_id),
        statutPointage: v.statutPointage,
        heures_sup: v.statutPointage === "present" ? v.heures_sup || 0 : 0,
      }));
      await pointageApi.enregistrerModificationJour(date, pointages);
      navigate(
        `/pointeur/pointage/recap?semaine=${data.semaine}&annee=${data.annee}`,
      );
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );
  if (error && !data)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        {error}
      </div>
    );

  return (
    <>
      <Link
        to="/pointeur/pointage/recap"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1C9F93] transition-colors"
      >
        ← Retour au récap
      </Link>

      {data.motif_rejet && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm italic mt-4">
          "{data.motif_rejet}"
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm mt-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
        <div className="divide-y divide-slate-100">
          {data.personnel.map((p) => {
            const ligne = lignes[p.id];
            const isPresent = ligne?.statutPointage === "present";
            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {p.nomComplet}
                  </p>
                  <p className="text-xs text-slate-400">{p.poste}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {isPresent && (
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-slate-400">H. sup</label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={ligne.heures_sup}
                        onChange={(e) => updateHeuresSup(p.id, e.target.value)}
                        className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/30"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => toggleStatut(p.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${isPresent ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}
                  >
                    {isPresent ? "Présent" : "Absent"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-[#1C9F93] text-white text-sm font-semibold rounded-lg hover:bg-[#178a7f] transition-colors disabled:opacity-60"
          >
            {submitting ? "Enregistrement..." : "Enregistrer la correction"}
          </button>
        </div>
      </div>
    </>
  );
}
