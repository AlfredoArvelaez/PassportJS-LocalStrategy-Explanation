const mongoStore = require('connect-mongo')

const session = {
  secret: process.env.SESSION_KEY,
  resave: false,
  saveUninitialized: true,

  // =========== Sessions storage ===========
  store: mongoStore.create({ 
    mongoUrl: process.env.DB_CONNECTION_STRING,
    collectionName: 'user-sessions'
  }),
  // =========== =========== ===========
  
  cookie: {
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}

module.exports = session