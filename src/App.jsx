import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { FullScreenLoader } from "./components/Spinner";

import ProtectedLayout from "./layouts/ProtectedLayout";

import Home from "./pages/Home";
import Journal from "./pages/Journal";
import CheckIn from "./pages/CheckIn";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import Streaks from "./pages/Streaks";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Habits from "./pages/Habits";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================== */}

      <Route
        path="/"
        element={
          user
            ? <Navigate to="/home" replace />
            : <Login />
        }
      />

      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/home" replace />
            : <Login />
        }
      />

      <Route
        path="/register"
        element={
          user
            ? <Navigate to="/home" replace />
            : <Register />
        }
      />

      <Route
        path="/forgot-password"
        element={
          user
            ? <Navigate to="/home" replace />
            : <ForgotPassword />
        }
      />


      {/* =========================
          PROTECTED ROUTES
      ========================== */}

      <Route element={<ProtectedLayout />}>

        <Route
          path="/home"
          element={<Home />}
        />

        <Route
          path="/journal"
          element={<Journal />}
        />

        <Route
          path="/check-in"
          element={<CheckIn />}
        />

        <Route
          path="/goals"
          element={<Goals />}
        />

        <Route
          path="/habits"
          element={<Habits />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/streaks"
          element={<Streaks />}
        />

        <Route
          path="/insights"
          element={<Insights />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

      </Route>


      {/* =========================
          UNKNOWN ROUTES
      ========================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}