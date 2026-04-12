/* ── Login — split-screen auth layout ────────────────────────── */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === "recruiter" ? "/dashboard" : "/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    try {
      const u = await login(email, password);
      navigate(u.role === "recruiter" ? "/dashboard" : "/");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-side">
        <div className="auth-side-content">
          <h2>Welcome Back!</h2>
          <p>
            Sign in to continue your job search or manage your recruitment pipeline.
            Thousands of opportunities await.
          </p>
          <ul className="auth-feature-list">
            <li><i className="bi bi-check-lg"></i> Track all your applications</li>
            <li><i className="bi bi-check-lg"></i> Get real-time email updates</li>
            <li><i className="bi bi-check-lg"></i> Connect with top recruiters</li>
          </ul>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <h3><i className="bi bi-box-arrow-in-right me-2 text-primary"></i>Sign In</h3>
          <p className="auth-subtitle">Enter your credentials to access your account</p>

          {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div className="input-icon">
                <i className="bi bi-envelope"></i>
                <input
                  id="login-email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-icon">
                <i className="bi bi-lock"></i>
                <input
                  id="login-password"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={submitting}>
              {submitting ? (
                <><i className="bi bi-hourglass-split me-1"></i>Signing in…</>
              ) : (
                <><i className="bi bi-box-arrow-in-right me-1"></i>Sign In</>
              )}
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            Don't have an account? <Link to="/register">Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
