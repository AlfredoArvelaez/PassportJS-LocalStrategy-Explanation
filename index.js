require('dotenv').config()
const express = require('express')
const expressSession = require('express-session')
const passport = require('passport')
const config = require('./config')

const app = express()
config.connectDB()
config.passportSetup

app.use(express.json())
// Session: middleware to handle session data
app.use(expressSession(config.session))

app.use(passport.initialize())
app.use(passport.session())

// Routes
app.get('/', (req, res) => {
  res.send(req.user)
})

app.post('/auth', passport.authenticate('local'), (req, res) => {
  res.send('Success')
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running')
})


