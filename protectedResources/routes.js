const router = require('express').Router()
const { isAuthenticated, verifyRole } = require('../middlewares')

router.get('/resource', isAuthenticated, (req, res) => {
  res.send('Hello from protected route')
})

router.get('/admin-resource', [isAuthenticated, verifyRole('ADMIN')], (req, res) => {
  res.send('Hello from ADMIN route')
})

module.exports = router