require('dotenv').config()
const express = require('express')
const expressSession = require('express-session')
const config = require('./config')

const app = express()
config.connectDB()

app.use(express.json())

// Session: middleware to handle session data
app.use(expressSession(config.session))



// Routes
app.get('/', (req, res) => {
  res.send('Working')
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running')
})


