/* ── Register — split-screen auth + role card selector ─────── */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const pickRole = (role) => setForm({ ...form, role });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || form.name.length < 2) return setError("Name must be at least 2 characters.");
    if (!form.email) return setError("Email is required.");
    if (!form.password || form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");

    setSubmitting(true);
    try {
      const u = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
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
          <h2>Join JobPortal</h2>
          <p>
            Create a free account in seconds. Whether you're hunting for your first
            role or searching for top talent, we've got you covered.
          </p>
          <ul className="auth-feature-list">
            <li><i className="bi bi-check-lg"></i> 100% free to join</li>
            <li><i className="bi bi-check-lg"></i> No credit card required</li>
            <li><i className="bi bi-check-lg"></i> Instant access to jobs</li>
          </ul>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <h3><i className="bi bi-person-plus-fill me-2 text-primary"></i>Create Account</h3>
          <p className="auth-subtitle">Fill in your details to get started</p>

          {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Role Selector */}
            <div className="mb-3">
              <label className="form-label">I am a…</label>
              <div className="row g-2">
                <div className="col-6">
                  <div
                    className={"role-card" + (form.role === "student" ? " selected" : "")}
                    onClick={() => pickRole("student")}
                  >
                    <i className="bi bi-mortarboard-fill"></i>
                    <div className="role-title">Student</div>
                  </div>
                </div>
                <div className="col-6">
                  <div
                    className={"role-card" + (form.role === "recruiter" ? " selected" : "")}
                    onClick={() => pickRole("recruiter")}
                  >
                    <i className="bi bi-briefcase-fill"></i>
                    <div className="role-title">Recruiter</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={set("name")}
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min 6 chars"
                  autoComplete="new-password"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Confirm</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="Re-enter"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={submitting}>
              {submitting ? (
                <><i className="bi bi-hourglass-split me-1"></i>Creating account…</>
              ) : (
                <><i className="bi bi-person-plus me-1"></i>Create Account</>
              )}
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
