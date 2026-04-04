// requireAuth — blocks access if the user is not logged in
// Usage: router.get("/protected", requireAuth, controller)

const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Not authenticated. Please log in." });
  }
  next(); // user is logged in, continue to the next handler
};

module.exports = requireAuth;
