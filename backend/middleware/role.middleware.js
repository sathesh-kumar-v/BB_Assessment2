// usage: authorizeRoles('admin', 'editor')
const authorizeRoles = (...permitted) => (req, res, next) => {
  const { user } = req;
  if (!user) return res.status(401).json({ message: 'Authentication required' });
  if (!permitted.includes(user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
  }
  next();
};

module.exports = authorizeRoles;
