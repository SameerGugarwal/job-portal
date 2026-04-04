// requireRole — blocks access if the user's role doesn't match
// Usage: router.post("/jobs", requireAuth, requireRole("recruiter"), controller)
// Must be used AFTER requireAuth (depends on req.session.role being set)

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.session.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${roles.join(" or ")} can perform this action.`,
      });
    }
    next();
  };
};

module.exports = requireRole;
