const verifyRole = (...authorizedRoles) => {
  return (req, res, next) => {
    if (!authorizedRoles.some(role => role === req.user.role)) {
      return res.status(403).json({ message: 'User does not have permission to access to this resource' })
    }

    next()
  }
}

module.exports = { verifyRole }