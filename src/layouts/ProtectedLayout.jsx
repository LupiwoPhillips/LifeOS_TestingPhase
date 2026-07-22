import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomNav from "../components/BottomNav";

export default function ProtectedLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-shell">
      <Outlet />
      <BottomNav />
    </div>
  );
}