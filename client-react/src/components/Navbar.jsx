/* ── Navbar — sticky glass nav with brand mark + user pill ──── */

import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ProfileSidePanel from "./ProfileSidePanel";

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <nav className={"navbar navbar-expand-lg app-navbar" + (scrolled ? " scrolled" : "")}>
        <div className="container">
          {/* Brand */}
          <Link className="navbar-brand" to="/">
            <span className="brand-mark">
              <i className="bi bi-briefcase-fill"></i>
            </span>
            <span className="brand-text">JobPortal</span>
          </Link>

          {/* Mobile toggler */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Nav links + right side */}
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
              <li className="nav-item">
                <NavLink className="nav-link" to="/" end>
                  <i className="bi bi-house me-1"></i>Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/jobs">
                  <i className="bi bi-search me-1"></i>Browse Jobs
                </NavLink>
              </li>
              {user?.role === "student" && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/applications">
                    <i className="bi bi-file-earmark-text me-1"></i>My Applications
                  </NavLink>
                </li>
              )}
              {user?.role === "recruiter" && (
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i>Dashboard
                  </NavLink>
                </li>
              )}
            </ul>

            {/* Right side */}
            <div className="d-flex align-items-center gap-2">
              {user ? (
                <>
                  {/* User pill — opens side panel */}
                  <button
                    className="navbar-user-btn"
                    onClick={() => setShowPanel(true)}
                    title="My Account"
                  >
                    <span className="nav-avatar">{getInitials(user.name)}</span>
                    <span className="nav-user-info d-none d-lg-block">
                      <span className="nav-user-name">{user.name}</span>
                      <span className="nav-user-role">{user.role}</span>
                    </span>
                    <i className="bi bi-chevron-down nav-chevron d-none d-lg-block"></i>
                  </button>

                  {/* Logout — visible on desktop */}
                  <button
                    className="btn btn-outline-danger btn-sm d-none d-lg-flex align-items-center gap-1"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn btn-outline-primary btn-sm" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i>Login
                  </Link>
                  <Link className="btn btn-primary btn-sm" to="/register">
                    <i className="bi bi-person-plus me-1"></i>Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile side panel */}
      <ProfileSidePanel
        show={showPanel}
        onClose={() => setShowPanel(false)}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
}
