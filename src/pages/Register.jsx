import { useState } from "react";
import { Link } from "react-router-dom";
import { signUp } from "../services/authService";
import AuthCard from "../components/AuthCard.jsx";
import AuthInput from "../components/AuthInput.jsx";
import AuthButton from "../components/AuthButton.jsx";
import "./Auth.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await signUp(name.trim(), email.trim(), password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthCard
        icon="✉️"
        title="Check Your Email"
        subtitle={
          <>
            We've sent a verification link to
            <br />
            <strong>{email}</strong>
            <br />
            <br />
            Verify your account, then sign in.
          </>
        }
        footer={<Link to="/login" className="secondary-button">Back to Login</Link>}
      />
    );
  }

  return (
    <AuthCard
      icon="🚀"
      title={<>Create Your <span>Life OS</span></>}
      subtitle="Begin building the person you want to become."
      footer={
        <>
          <div className="divider"><span>OR</span></div>
          <Link to="/login" className="secondary-button">Already have an account?</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Full Name"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <AuthInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="john@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthInput
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <AuthInput
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="auth-error">{error}</p>}

        <AuthButton type="submit" loading={loading} loadingLabel="Creating Account…">
          Create Account
        </AuthButton>
      </form>
    </AuthCard>
  );
}
