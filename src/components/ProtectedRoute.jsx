import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, loading, hasAnyRole, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightbg">
        <p className="text-muted text-sm">Chargement...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const isChangePasswordPage = location.pathname === '/changer-mot-de-passe'

  if (user?.premiere_connexion && !isChangePasswordPage) {
    return <Navigate to="/changer-mot-de-passe" replace />
  }

  if (roles.length > 0 && !hasAnyRole(roles)) {
    return <Navigate to="/non-autorise" replace />
  }

  return children
}