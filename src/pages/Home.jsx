import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Dashboard from "./Dashboard";

export default function Home() {
  const { hasRole } = useAuth();

  if (hasRole("chef_projet"))
    return <Navigate to="/chef-projet/dashboard" replace />;
  if (hasRole("pointeur")) return <Navigate to="/pointeur/dashboard" replace />;

  return <Dashboard />;
}
