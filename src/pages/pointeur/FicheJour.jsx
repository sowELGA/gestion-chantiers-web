import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { pointageApi } from "../../api/pointage";
import { usePageHeader } from "../../context/PageHeaderContext";

export default function FicheJour() {
  const { setPageHeader } = usePageHeader();
  const [data, setData] = useState(null);
  const [lignes, setLignes] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [bloque, setBloque] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [groupesOuverts, setGroupesOuverts] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    pointageApi
      .ficheJour()
      .then((res) => {
        setData(res.data);
        setPageHeader(
          "Fiche de pointage du jour",
          new Date(res.data.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
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
        setGroupesOuverts({})
      })
      .catch((err) => {
        if (err.response?.status === 423) setBloque(err.response.data.message);
      })
      .finally(() => setLoading(false));
  }, [setPageHeader]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatut = (id, statut) => {
    setLignes((prev) => ({
      ...prev,
      [id]: {
        statutPointage: statut,
        heures_sup: statut === "absent" ? 0 : (prev[id]?.heures_sup ?? 0),
      },
    }));
  };

  const incrementHSup = (id) => {
    setLignes((prev) =>
      prev[id]?.statutPointage !== "present"
        ? prev
        : {
            ...prev,
            [id]: {
              ...prev[id],
              heures_sup: Math.min(12, (prev[id].heures_sup || 0) + 1),
            },
          },
    );
  };
  const decrementHSup = (id) => {
    setLignes((prev) =>
      prev[id]?.statutPointage !== "present"
        ? prev
        : {
            ...prev,
            [id]: {
              ...prev[id],
              heures_sup: Math.max(0, (prev[id].heures_sup || 0) - 1),
            },
          },
    );
  };

  const tousPresents = () =>
    setLignes((prev) => {
      const n = {};
      Object.keys(prev).forEach((id) => {
        n[id] = { ...prev[id], statutPointage: "present" };
      });
      return n;
    });
  const tousAbsents = () =>
    setLignes((prev) => {
      const n = {};
      Object.keys(prev).forEach((id) => {
        n[id] = { statutPointage: "absent", heures_sup: 0 };
      });
      return n;
    });

  const tousPresentsGroupe = (ids) =>
    setLignes((prev) => {
      const n = { ...prev };
      ids.forEach((id) => {
        n[id] = { ...n[id], statutPointage: "present" };
      });
      return n;
    });
  const tousAbsentsGroupe = (ids) =>
    setLignes((prev) => {
      const n = { ...prev };
      ids.forEach((id) => {
        n[id] = { statutPointage: "absent", heures_sup: 0 };
      });
      return n;
    });

  const compter = (statut) =>
    Object.values(lignes).filter((l) => l.statutPointage === statut).length;

  // ── Groupement par poste (comme l'ancien Blade : "Chef X" en premier dans chaque métier) ──
  const groupes = useMemo(() => {
    if (!data) return [];
    const map = {};
    data.personnel.forEach((p) => {
      const cle = normaliserPoste(p.poste);
      if (!map[cle]) map[cle] = [];
      map[cle].push(p);
    });
    Object.keys(map).forEach((cle) => {
      map[cle].sort((a, b) => {
        const aChef = a.poste.toLowerCase().startsWith("chef ") ? 0 : 1;
        const bChef = b.poste.toLowerCase().startsWith("chef ") ? 0 : 1;
        return aChef - bChef;
      });
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [data]);

  const ouvrierVisible = (nom) =>
    !recherche.trim() ||
    nom.toLowerCase().includes(recherche.toLowerCase().trim());
  const groupeVisible = (personnesGroupe) =>
    !recherche.trim() ||
    personnesGroupe.some((p) => ouvrierVisible(p.nomComplet));

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const pointages = Object.entries(lignes).map(([ouvrier_id, v]) => ({
        ouvrier_id: Number(ouvrier_id),
        statutPointage: v.statutPointage,
        heures_sup: v.statutPointage === "present" ? v.heures_sup || 0 : 0,
      }));
      const res = await pointageApi.enregistrerFiche(pointages);
      setMessage({ type: "success", text: res.data.message });
      load();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Une erreur est survenue.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (bloque) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center max-w-lg mx-auto">
        <p className="text-slate-600 font-medium">{bloque}</p>
      </div>
    );
  }
  if (loading || !data)
    return (
      <div className="text-center text-slate-400 text-sm py-12">
        Chargement...
      </div>
    );

  if (data.personnel.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-400 text-sm">
          Aucun ouvrier actif affecté à ce chantier.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-xl p-4 text-sm ${message.type === "success" ? "bg-[#1C9F93]/10 border border-[#1C9F93]/30 text-[#0F172A]" : "bg-red-50 border border-red-200 text-red-700"}`}
        >
          {message.text}
        </div>
      )}

      {!data.modifiable && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-center gap-3 text-sm text-amber-800">
          <svg
            className="w-5 h-5 flex-shrink-0 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>
            Fiche verrouillée — en attente de validation du chef de projet.
          </span>
        </div>
      )}

      {/* Barre supérieure : compteurs + actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-semibold text-emerald-800">
              Présents :{" "}
              <strong className="text-sm font-bold">
                {compter("present")}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-xs font-semibold text-rose-800">
              Absents :{" "}
              <strong className="text-sm font-bold">{compter("absent")}</strong>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 pl-2 border-l border-slate-200">
            Total :{" "}
            <span className="font-bold text-slate-800">
              {data.personnel.length}
            </span>
          </div>
        </div>

        {data.modifiable && (
          <div className="flex items-center gap-2">
            <button
              onClick={tousPresents}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Tous présents
            </button>
            <button
              onClick={tousAbsents}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Tous absents
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-[#1C9F93] hover:bg-[#157f75] text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-60"
            >
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        )}
      </div>

      {/* Recherche */}
      <div className="relative">
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Filtrer par nom d'ouvrier..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1C9F93]/20 focus:border-[#1C9F93] transition-colors"
        />
        <svg
          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Groupes par métier */}
      <div className="space-y-3">
        {groupes.map(([libelleGroupe, personnesGroupe]) => {
          if (!groupeVisible(personnesGroupe)) return null;
          const ids = personnesGroupe.map((p) => p.id);
          const isOpen = groupesOuverts[libelleGroupe] ?? false
          const presents = ids.filter(
            (id) => lignes[id]?.statutPointage === "present",
          ).length;
          const absents = ids.filter(
            (id) => lignes[id]?.statutPointage === "absent",
          ).length;

          return (
            <div
              key={libelleGroupe}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
            >
              <div
                onClick={() =>
                  setGroupesOuverts((prev) => ({
                    ...prev,
                    [libelleGroupe]: !isOpen,
                  }))
                }
                className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <svg
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {libelleGroupe}
                  </h3>
                  <div className="flex items-center gap-1.5 ml-1">
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md text-[11px] font-bold">
                      Total : {ids.length}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[11px] font-semibold">
                      {presents} P
                    </span>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md text-[11px] font-semibold">
                      {absents} A
                    </span>
                  </div>
                </div>

                {data.modifiable && (
                  <div
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => tousPresentsGroupe(ids)}
                      className="text-[11px] text-emerald-700 hover:bg-emerald-100/60 px-2 py-1 rounded transition-colors font-medium"
                    >
                      + Tous présents
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={() => tousAbsentsGroupe(ids)}
                      className="text-[11px] text-rose-700 hover:bg-rose-100/60 px-2 py-1 rounded transition-colors font-medium"
                    >
                      - Tous absents
                    </button>
                  </div>
                )}
              </div>

              {isOpen && (
                <div className="divide-y divide-slate-100">
                  {personnesGroupe.map((p) => {
                    if (!ouvrierVisible(p.nomComplet)) return null;
                    const ligne = lignes[p.id];
                    const isPresent = ligne?.statutPointage === "present";
                    return (
                      <div
                        key={p.id}
                        className={`p-3 sm:px-4 flex items-center justify-between gap-3 transition-colors ${isPresent ? "bg-emerald-50/30" : ""}`}
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold transition-colors ${isPresent ? "text-slate-900" : "text-slate-500"}`}
                          >
                            {p.nomComplet}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {p.poste}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {isPresent && (
                            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                              <button
                                disabled={!data.modifiable}
                                onClick={() => decrementHSup(p.id)}
                                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded-md text-sm font-bold transition-colors disabled:opacity-50"
                              >
                                −
                              </button>
                              <div className="px-2 text-center min-w-[3rem]">
                                <span className="text-xs font-bold text-slate-800">
                                  {ligne.heures_sup || 0} h
                                </span>
                              </div>
                              <button
                                disabled={!data.modifiable}
                                onClick={() => incrementHSup(p.id)}
                                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-white rounded-md text-sm font-bold transition-colors disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                          )}

                          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold">
                            <button
                              disabled={!data.modifiable}
                              onClick={() => setStatut(p.id, "present")}
                              className={`px-3 py-1.5 rounded-md transition-all ${isPresent ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                            >
                              Présent
                            </button>
                            <button
                              disabled={!data.modifiable}
                              onClick={() => setStatut(p.id, "absent")}
                              className={`px-3 py-1.5 rounded-md transition-all ${!isPresent ? "bg-rose-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                            >
                              Absent
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Link
          to="/pointeur/pointage/recap"
          className="text-sm text-[#1C9F93] hover:underline font-medium"
        >
          Voir le récap de la semaine →
        </Link>
      </div>
    </div>
  );
}

function normaliserPoste(libellePoste) {
  return libellePoste.replace(/^chef\s+/i, "").trim();
}
