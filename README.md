# PassportJS: **Local Strategy Explanation**
----------
***Passport JS*** is a kind of framework developed to wrap into a set of *middlewares*, the *authentication and authorization* processes, in order to abstract their logic and ease the access control to our app resources.

In ***Passport JS*** you can use over 500 *strategies*, which have been developed by different programmers around the world.

Although the objective of ***Passport JS*** is abstract the *authentication and authorization* logic, there is not many handful documentation about how to use it following some kind of "standard".

In this case, we will treat the all the setup to config **Local Strategy**, which is based in **sessions** and **basic credentials (username & password)**.

## Setting up Database Connection & Session config
First of all, we need to setup a simply database connection. In this case, we will use *MongoDB and Mongoose* to handle our session persistence.

**Database initialization**
```javascript
// config/database.js
const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    console.log('Database connected')
  } catch(err) {
    console.log(err)
  }
}

module.exports = { connectDB }
```
**Session setup**
```javascript
const mongoStore = require('connect-mongo')

const session = {
  resave: false,
  saveUnitialized: true,
  store: mongoStore.create({ 
    mongoUrl: process.env.DB_CONNECTION_STRING,
    collectionName: 'user-sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60
  }
}

module.exports = session
```

