const router = require('express').Router()
const { passportAuth } = require('./passportAuth')

router.post('/login', passportAuth, (req, res) => {
  res.send('Login route')
})

module.exports = router