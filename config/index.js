const passportSetup = require('./passport')
const { connectDB } = require('./database')
const session = require('./session')

module.exports = {
  connectDB,
  session,
  passportSetup
}