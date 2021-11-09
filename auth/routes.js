const router = require('express').Router()
const { passportAuth } = require('./passportAuth')

router.post('/login', passportAuth, (req, res) => {
  res.send('Login route')
})

router.get('/logout', (req, res) => {
  req.logOut()

  res.send('Successful logout')
})

module.exports = router