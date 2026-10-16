import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "./useAuth";
export default function ProtectedRoute() {
  const { ready, isAuthenticated } = useAuth();
  const location = useLocation();
  if (!ready) return <p role="status">Checking your session...</p>;
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      state={{ from: location.pathname + location.search }}
      replace
    />
  );
}
