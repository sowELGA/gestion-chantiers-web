import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const result = await login(email, password);

    setSubmitting(false);

    if (result.success) {
      const destination = result.user.premiere_connexion
        ? "/changer-mot-de-passe"
        : "/";
      navigate(destination, { replace: true });
    } else {
      setErrors({ general: result.message });
      setPassword(""); // Fix 2 : vide le mot de passe en cas d'échec
    }
  };

  return (
    <div className="bg-lightbg min-h-screen overflow-hidden font-sans">
      <div className="lg:grid lg:grid-cols-2 min-h-screen">
        {/* Panneau visuel — masqué en mobile */}
        <div className="hidden lg:flex blueprint-grid relative flex-col justify-between overflow-hidden p-12 text-white">
          <div className="flex items-center justify-between font-mono-tag text-[11px] tracking-widest text-teal-100/60">
            <span>
              DIMA GROUPE — PLATEFORME GESTION ET SUIVIE DES CHANTIERS
            </span>
            <span>ÉCH. 1:1</span>
          </div>

          <div className="relative">
            <svg
              viewBox="0 0 420 260"
              className="absolute -right-6 bottom-24 w-72 opacity-90"
              fill="none"
            >
              <path
                className="rig-path"
                d="M40 240 L40 40 L230 40 L230 70"
                stroke="#e2faf5"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                className="rig-path"
                d="M40 40 L20 55"
                stroke="#e2faf5"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                className="rig-path"
                d="M230 70 L230 240"
                stroke="#e2faf5"
                strokeWidth="2"
                strokeOpacity=".5"
                strokeDasharray="4 5"
              />
              <path
                className="rig-path"
                d="M70 240 L70 120 L170 120 L170 240"
                stroke="#e2faf5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                className="rig-path"
                d="M70 160 L170 200 M70 200 L170 160"
                stroke="#e2faf5"
                strokeWidth="1.5"
                strokeOpacity=".6"
              />
              <path
                className="rig-path"
                d="M95 120 L95 90 L145 90 L145 120"
                stroke="#e2faf5"
                strokeWidth="2"
              />
              <circle
                className="rig-path"
                cx="230"
                cy="70"
                r="4"
                stroke="#e2faf5"
                strokeWidth="2"
              />
            </svg>

            <p className="font-mono-tag text-[11px] tracking-widest text-teal-100/60 mb-4">
              ACCÈS PLATEFORME
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight max-w-sm">
              Le meilleur
              <br />
              est à construire.
            </h1>
            <div className="dim-rule w-40 mt-6 mb-6"></div>
            <p className="text-teal-50/70 text-sm max-w-xs leading-relaxed">
              Suivi d'avancement, ressources et planning de chantier, réunis
              dans un seul espace.
            </p>
          </div>

          <div className="flex items-center justify-between font-mono-tag text-[11px] tracking-widest text-teal-100/50">
            <span>© {new Date().getFullYear()} DIMA GROUPE</span>
            <span>DWG—LOGIN—01</span>
          </div>
        </div>

        {/* Panneau formulaire */}
        <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-20">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-10 text-center lg:hidden">
              <p className="font-display text-2xl font-bold text-primary">
                Dima Groupe
              </p>
              <p className="text-muted text-sm mt-1">
                Le meilleur est à construire
              </p>
            </div>

            <p className="font-mono-tag text-[11px] tracking-widest text-primary/70 mb-2">
              ESPACE CHANTIER
            </p>
            <h2 className="font-display text-2xl font-semibold text-primary mb-1">
              Connexion
            </h2>
            <p className="text-muted text-sm mb-8">
              Accédez à vos chantiers et suivez leur avancement en temps réel.
            </p>

            <div className="plan-card bg-white rounded-lg shadow-[0_1px_2px_rgba(16,24,28,.04),0_12px_32px_-16px_rgba(16,24,28,.18)] border border-slate-200 p-8">
              <span className="tick tick-tl"></span>
              <span className="tick tick-tr"></span>
              <span className="tick tick-bl"></span>
              <span className="tick tick-br"></span>

              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 mb-6 text-sm">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@dimagroupe.com"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end mb-6">
                  <Link
                    to="/mot-de-passe-oublie"
                    className="text-xs text-primary hover:underline transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white py-2.5 rounded-md font-medium text-sm tracking-wide hover:bg-accent active:scale-[.99] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Connexion..." : "Se connecter"}
                </button>
              </form>
            </div>

            <p className="text-center text-muted text-xs mt-8 font-mono-tag tracking-wide">
              © {new Date().getFullYear()} DIMA GROUPE — TOUS DROITS RÉSERVÉS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
