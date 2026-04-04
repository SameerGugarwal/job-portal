import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "student" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || form.name.length < 2) return setError("Name must be at least 2 characters.");
    if (!form.email) return setError("Email is required.");
    if (!form.password || form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");

    setSubmitting(true);
    try {
      const u = await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      navigate(u.role === "recruiter" ? "/dashboard" : "/");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card p-4">
        <h3 className="text-center mb-4"><i className="bi bi-person-plus me-2"></i>Register</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" value={form.name} onChange={set("name")} placeholder="John Doe" />
          </div>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input type="email" className="form-control" value={form.email} onChange={set("email")} placeholder="you@example.com" />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={form.password} onChange={set("password")} placeholder="Min 6 characters" />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-control" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Re-enter password" />
          </div>
          <div className="mb-4">
            <label className="form-label d-block">I am a:</label>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="role" value="student" checked={form.role === "student"} onChange={set("role")} id="r-student" />
              <label className="form-check-label" htmlFor="r-student">Student</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="role" value="recruiter" checked={form.role === "recruiter"} onChange={set("role")} id="r-recruiter" />
              <label className="form-check-label" htmlFor="r-recruiter">Recruiter</label>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
            {submitting ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
