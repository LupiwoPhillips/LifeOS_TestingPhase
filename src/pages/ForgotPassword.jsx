import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/authService";
import AuthCard from "../components/AuthCard.jsx";
import AuthInput from "../components/AuthInput.jsx";
import AuthButton from "../components/AuthButton.jsx";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Enter the email on your account.");
      return;
    }

    try {
      setLoading(true);
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthCard
        icon="📩"
        title="Check Your Email"
        subtitle={
          <>
            If an account exists for <strong>{email}</strong>, a reset link is
            on its way.
          </>
        }
        footer={<Link to="/login" className="secondary-button">Back to Login</Link>}
      />
    );
  }

  return (
    <AuthCard
      icon="🔑"
      title="Reset Your Password"
      subtitle="We'll email you a link to get back into your account."
      footer={<Link to="/login" className="secondary-button">Back to Login</Link>}
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

        {error && <p className="auth-error">{error}</p>}

        <AuthButton type="submit" loading={loading} loadingLabel="Sending…">
          Send Reset Link
        </AuthButton>
      </form>
    </AuthCard>
  );
}
