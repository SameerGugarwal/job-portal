import { Link } from "react-router-dom";

function getInitials(name) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function ProfileSidePanel({ show, onClose, user, onLogout }) {
  if (!user) return null;

  // We can add some logic to calculate profile performance. Let's mock it for now as requested.
  const profileStrength = 75;

  return (
    <>
      {/* Backdrop */}
      {show && (
        <div 
          className="offcanvas-backdrop fade show" 
          onClick={onClose}
          style={{ zIndex: 1040 }}
        ></div>
      )}

      {/* Offcanvas Drawer */}
      <div 
        className={`offcanvas offcanvas-end ${show ? 'show' : ''}`} 
        tabIndex="-1" 
        style={{ visibility: show ? 'visible' : 'hidden', zIndex: 1045 }}
        aria-labelledby="profileSidePanelLabel"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title" id="profileSidePanelLabel">My Account</h5>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
        </div>

        <div className="offcanvas-body p-0">
          {/* User Info Section */}
          <div className="p-4 text-center bg-light border-bottom">
            {user.studentProfile?.profilePic ? (
              <img 
                src={user.studentProfile.profilePic} 
                alt={user.name} 
                className="rounded-circle shadow-sm mb-3 border" 
                style={{ width: "80px", height: "80px", objectFit: "cover" }}
              />
            ) : (
              <div 
                className="rounded-circle bg-primary text-white d-inline-flex justify-content-center align-items-center mb-3 shadow-sm"
                style={{ width: "80px", height: "80px", fontSize: "2rem" }}
              >
                {getInitials(user.name)}
              </div>
            )}
            <h5 className="mb-1 text-dark fw-bold">{user.name}</h5>
            {user.role === "student" && user.studentProfile?.education?.[0] && (
               <p className="text-muted small mb-0">
                 {user.studentProfile.education[0].qualification} - {user.studentProfile.education[0].specialization}
                 <br />
                 {user.studentProfile.education[0].institute}
               </p>
            )}
            {user.role === "student" && (
                <Link to="/profile" className="btn btn-outline-primary btn-sm mt-3 w-100 fw-bold" onClick={onClose}>
                    View & Update Profile
                </Link>
            )}
          </div>

          {/* Profile Performance Section for Students */}
          {user.role === "student" && (
            <div className="p-4 border-bottom">
              <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: "0.8rem" }}>Profile Performance</h6>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="mb-0 fw-bold text-dark">12</h4>
                  <small className="text-muted">Search appearances</small>
                </div>
                <div>
                  <h4 className="mb-0 fw-bold text-dark">3</h4>
                  <small className="text-muted">Recruiter actions</small>
                </div>
              </div>
              <div>
                 <div className="d-flex justify-content-between mb-1">
                    <small className="fw-bold">Profile completion</small>
                    <small className="text-primary fw-bold">{profileStrength}%</small>
                 </div>
                 <div className="progress" style={{ height: "6px" }}>
                    <div 
                       className="progress-bar bg-primary rounded-pill" 
                       role="progressbar" 
                       style={{ width: `${profileStrength}%` }} 
                       aria-valuenow={profileStrength} 
                       aria-valuemin="0" 
                       aria-valuemax="100"
                    ></div>
                 </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="list-group list-group-flush mt-2">
            <a href="#" className="list-group-item list-group-item-action py-3 border-0">
               <i className="bi bi-compass me-3 text-secondary"></i>
               <span className="fw-medium">Career guidance</span>
            </a>
            <a href="#" className="list-group-item list-group-item-action py-3 border-0">
               <i className="bi bi-gear me-3 text-secondary"></i>
               <span className="fw-medium">Settings</span>
            </a>
            <a href="#" className="list-group-item list-group-item-action py-3 border-0">
               <i className="bi bi-question-circle me-3 text-secondary"></i>
               <span className="fw-medium">FAQs</span>
            </a>
            <button onClick={() => { onClose(); onLogout(); }} className="list-group-item list-group-item-action py-3 border-0 text-danger text-start">
               <i className="bi bi-box-arrow-right me-3"></i>
               <span className="fw-bold">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
