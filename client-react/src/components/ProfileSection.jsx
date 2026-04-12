export default function ProfileSection({ title, onEdit, children, editLabel = "Edit" }) {
  return (
    <div className="card shadow-sm mb-4 border-0 rounded-4" style={{ overflow: "hidden" }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title fw-bold m-0">{title}</h5>
          {onEdit && (
            <button className="btn btn-link link-primary p-0 text-decoration-none fw-medium" onClick={onEdit}>
              <i className="bi bi-pencil me-1"></i> {editLabel}
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
