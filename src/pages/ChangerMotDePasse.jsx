import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";

export default function ChangerMotDePasse() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await authApi.changePassword(password, passwordConfirmation);
      updateUser(res.data.user);
      navigate("/", { replace: true });
    } catch (err) {
      const messages = err.response?.data?.errors;
      setError(
        messages
          ? Object.values(messages).flat().join(" ")
          : "Une erreur est survenue.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-lightbg flex items-center justify-center px-6 font-sans">
      <div className="w-full max-w-sm">
        <h2 className="font-display text-2xl font-semibold text-primary mb-1">
          Choisissez un mot de passe
        </h2>
        <p className="text-muted text-sm mb-8">
          C'est votre première connexion, merci de définir un nouveau mot de
          passe.
        </p>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-2.5 rounded-md font-medium text-sm hover:bg-accent transition-colors disabled:opacity-60"
            >
              {submitting ? "Enregistrement..." : "Valider"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
