import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          JobPortal <small className="text-muted" style={{ fontSize: "0.6em" }}>React</small>
        </Link>

        <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><Link className="nav-link" to="/">Jobs</Link></li>
            {user?.role === "student" && (
              <li className="nav-item"><Link className="nav-link" to="/applications">My Applications</Link></li>
            )}
            {user?.role === "recruiter" && (
              <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
            )}
          </ul>

          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link text-light">Hi, {user.name} ({user.role})</span>
                </li>
                <li className="nav-item">
                  <button className="nav-link btn btn-outline-light btn-sm ms-2 px-3" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item">
                  <Link className="nav-link btn btn-primary btn-sm ms-2 px-3 text-white" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
