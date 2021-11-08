const { Schema, model } = require('mongoose')

const userSchema = Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    default: 'USER',
    enum: ['USER', 'ADMIN']
  }
})

module.exports = model('User', userSchema)
