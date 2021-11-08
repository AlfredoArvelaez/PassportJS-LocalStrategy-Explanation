const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('../models/User')

const strategy = new LocalStrategy(async (username, password, done) => {
  try {
    const fetchedUser = await User.findOne({ username })

    if (!fetchedUser) {
      return done(null, false)
    }

    if (fetchedUser.password !== password) {
      return done(null, false)
    }

    return done(null, fetchedUser)

  } catch(err) {
    done(err)
  }
})

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const fetchedUser = await User.findById(id)

    if (!fetchedUser) {
      return done(new Error('User not found'))
    }

  done(null, { username: fetchedUser.username, role: fetchedUser.role })

  } catch(err) {
    done(err)
  }
})

passport.use(strategy)

module.exports = passport