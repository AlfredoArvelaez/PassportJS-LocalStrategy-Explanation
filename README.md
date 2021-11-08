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
// config/session.js
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

## Passport Verify Callback
***Passport JS*** is a global framework on which specific *strategies* for **authentication and authorization** of a user can be applied.

In this case, when using the **Local Strategy**, we must provide a **verification function**, on which ***Passport JS*** will be based to verify the credentials of a user. 

This **verification function** will be called when the ***passport.authenticate('local')*** is called.

```javascript
// config/passport.js
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
```
Notice **LocalStrategy** takes three arguments: **username, password** and **done**.

**Username** and **Password** corresponds to the credentials brought by the **req.body** object from the **POST request**.

In other way, **done(err, user)** argument is a *callback* used to terminate the **verify function**. Its first parameter indicates if there is some error (usually takes **null**), and second parameter indicates the **user** to be seralized *(read below)*. If some condition doesn't allow us to verify credentials successfully (*i.e user not found, user doesn't exists, credentials are incorrect...*), we set the second parameter as **false**.

## Serialize and Deserialize user
These are two functions used by ***Passport JS*** in order to transform the **user object** (with its credentials duly validated) into some kind of *string* that will be attached at the **session** to get a short reference about the user data (usually identifier).

```javascript
// config/passport.js
...
passport.serializeUser((user, done) => {
  done(null, user._id) // Session object only will store the user id
})

passport.deserializeUser(async (id, done) => {
  try {
    const fetchedUser = await User.findById(id) // Find user based in the previous serialized data (in this case, id)

    if(!fetchedUser) {
      return done(new Error('User not found'))
    }

    done(null, { username: fetchedUser.username, role: fetchedUser.role }) // This is the data that will be attached at the req.user object
  } catch(err) {
    done(err)
  }
})

module.exports = passport // Not forget to export the setup passport object
```
