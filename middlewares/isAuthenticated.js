const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(403).json({ message: 'User not authenticated' })
  }

  next()
}

module.exports = { isAuthenticated }