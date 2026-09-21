import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/auth";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const res = await authApi.motDePasseOublie(email);
      setMessage(res.data.message);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors
          ? Object.values(errors).flat().join(" ")
          : err.response?.data?.message || "Une erreur est survenue.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-lightbg min-h-screen flex items-center justify-center px-6 font-sans">
      <div className="w-full max-w-sm">
        <p className="font-mono-tag text-[11px] tracking-widest text-primary/70 mb-2">
          ESPACE CHANTIER
        </p>
        <h2 className="font-display text-2xl font-semibold text-primary mb-1">
          Mot de passe oublié
        </h2>
        <p className="text-muted text-sm mb-8">
          Indiquez votre email, l'administrateur sera notifié pour réinitialiser
          votre mot de passe.
        </p>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          {message ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-[#1C9F93]/10 text-[#1C9F93] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-600">{message}</p>
              <Link
                to="/login"
                className="inline-block mt-6 text-sm font-medium text-primary hover:underline"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 mb-6 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@dimagroupe.com"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-white py-2.5 rounded-md font-medium text-sm hover:bg-accent transition-colors disabled:opacity-60"
              >
                {submitting ? "Envoi..." : "Envoyer la demande"}
              </button>

              <Link
                to="/login"
                className="block text-center text-xs text-slate-400 hover:text-slate-600 mt-5"
              >
                ← Retour à la connexion
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
