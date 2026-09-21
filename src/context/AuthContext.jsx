import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true tant qu'on vérifie la session au démarrage
  const [authError, setAuthError] = useState(null);

  // Normalise la réponse UserResource (déballe le "data" de Laravel)
  const normalizeUser = (payload) => payload?.data ?? payload;

  // Au premier chargement de l'app : si un token existe, on vérifie qu'il est toujours valide
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((res) => {
        setUser(normalizeUser(res.data));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const res = await authApi.login(email, password);
      const { token, user: userPayload } = res.data;
      const loggedUser = normalizeUser(userPayload);

      localStorage.setItem("token", token);
      setUser(loggedUser);

      return { success: true, user: loggedUser };
    } catch (err) {
      const message =
        err.response?.status === 429
          ? "Trop de tentatives de connexion. Réessayez dans une minute."
          : err.response?.data?.message || "Une erreur est survenue.";
      setAuthError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // même si l'appel échoue (token déjà expiré côté serveur), on nettoie côté client
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(normalizeUser(updatedUser));
  }, []);

  // ── Helpers de rôles, miroir exact du backend (User.php) ──
  const roleNoms = useMemo(() => user?.roles?.map((r) => r.nom) ?? [], [user]);

  const hasRole = useCallback((nom) => roleNoms.includes(nom), [roleNoms]);
  const hasAnyRole = useCallback(
    (noms) => noms.some((n) => roleNoms.includes(n)),
    [roleNoms],
  );

  const dafRole = user?.roles?.find((r) => r.nom === "daf");

  const value = {
    user,
    loading,
    authError,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    isChefProjet: hasRole("chef_projet"),
    isPointeur: hasRole("pointeur"),
    isAdmin: hasRole("admin"),
    peutGererApprovisionnements: !!dafRole?.gere_approvisionnements,
    peutGererDepenses: !!dafRole?.gere_depenses,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un <AuthProvider>",
    );
  }
  return context;
}
