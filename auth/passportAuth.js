const passport = require('passport')

const passportAuth = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    // If some colateral error occurs, handle it
    if (err) { return next(err) }

    // If not user found by the verify function, return the error message sent by done(null, false, { message: ... }) in json format (custom error handler)
    if (!user) {
      return res.status(401).json({ message: info.message })
    }

    // If the verify function check the user successfully, logIn
    req.logIn(user, (err) => {
      if (err) { return next(err) }

      next()
    })

  })(req, res, next)
}

module.exports = { passportAuth }
