import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../services/authService";
import AuthCard from "../components/AuthCard.jsx";
import AuthInput from "../components/AuthInput.jsx";
import AuthButton from "../components/AuthButton.jsx";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password);
      navigate("/home");
    } catch (err) {
      setError(mapAuthError(err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      icon="✦"
      title={<>Life OS <span>Beta</span></>}
      subtitle={<>Your personal operating system.<br />Become who you said you would become.</>}
      footer={
        <>
          <div className="divider"><span>OR</span></div>
          <Link to="/register" className="secondary-button">Create Account</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthInput
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="auth-error">{error}</p>}

        <AuthButton type="submit" loading={loading} loadingLabel="Signing In…">
          Sign In
        </AuthButton>
      </form>

      <Link to="/forgot-password" className="forgot-password">
        Forgot Password?
      </Link>
    </AuthCard>
  );
}

function mapAuthError(message = "") {
  if (/invalid login credentials/i.test(message)) {
    return "That email and password combination doesn't match our records.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Please verify your email before signing in — check your inbox.";
  }
  return message || "Something went wrong. Please try again.";
}
