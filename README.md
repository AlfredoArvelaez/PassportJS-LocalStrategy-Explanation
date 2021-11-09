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
***Passport JS*** is a global framework on which specific *strategies* for **authentication and authorization** of an user can be applied.

In this case, when using the **Local Strategy**, we must provide a **verification function**, on which ***Passport JS*** will be based to verify the credentials of an user. 

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

    done(null, fetchedUser)

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
Once we authenticate the user, our application will be constantly using the *deserializeUser* method to attach the data in the *req.user* object. (This cannot be optimal for the application because in every request, the method will be making queries to our database in order to get the user data and attach it in the *req.user* object).

## Passport.authenticate('local')
This method will be used as a middleware in the **/login route** in order to run the **verify function** and authenticate the user. If the authentication proccess is successful, then ***Passport JS*** will *seralize* the user and will attach it in the **session** object, which will store the user identifier reference and will provide it to *deserialize* user data.

```javascript
// app.js
...
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.send('Successful login')
})
...
```

**Custom error handler**
When the authentication proccess fails by any error (invalid credentials, user does not exist, ...), ***Passport JS*** only sends a string ('Unauthorized') accompanied by a **401 status code**. If we want to customize this behavior, we can use the following verbose code:

```javascript
// /auth/passportAuth.js
const passport = require('passport')

const passportAuth = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    // If some colateral error occurs, handle it
    if (err) { return next(err) }

    // If not user found by the verify function, return the error message sent by done(null, false, { message: ... }) in json format (custom error handler)
    if (!user) {
      return res.status(401).json({ message: info.message })
    }

    // If the verify function check the user successfully, log in using req.logIn method provide by passport
    req.logIn(user, (err) => {
      if (err) { return next(err) }

      next()
    })

  })(req, res, next)
}

module.exports = { passportAuth }
```
Notice that we are wrapping the ***passport.authenticate('local')*** method into another middleware that allows us to response with the error messages sent by the *done(err, false, { message: ... })* callback; this custom error message will be attached in the **info** object, so we can handle errors using this data. 

Finally, as we are handling the **passport.authenticate('local')** method in some kind of manual way, we must call the **req.logIn(user, (err) => { ... })** method to tell to ***Passport JS*** when our user is successfully authenticated.

## isAuthenticated & verifyRole middlewares
If we want to keep access control about the different resources of our application, we need to verify if the user is authenticated and/or if the user has the pertinent permissions to manage protected data.

To do this, we can use manually the **req.isAuthenticated()** method provided by ***Passport JS***, however, we should do this manual verification in every protected route of our application. In order to simplify and unify this functionality, we create a middleware, which can be imported and set in the all protected routes around our application.

**isAuthenticated**
```javascript
// /middlewares/isAuthenticated.js
const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(403).json({ message: 'User not authenticated' })
  }

  next()
}

module.exports = { isAuthenticated }
```
> Middleware used to verify the user authentication.

**verifyRole**
```javascript
// /middlewares/verifyRole.js
const verifyRole = (...authorizedRoles) => {
  return (req, res, next) => {
    if (!authorizedRoles.some(role => role === req.user.role)) {
      return res.status(403).json({ message: 'User does not have permission to access to this resource' })
    }

    next()
  }
}

module.exports = { verifyRole }
```
> Middleware used to verify the user role against a list of authorized roles. Notice that the middleware uses the **req.user** object. In this case, this object must contain the **role** property and the user must be authenticated before verify its role.

**Implementation**
```javascript
// app.js

// Route where user must be authenticated but doesnt matters its role
app.get('/protected/resource', [isAuthenticated], (req, res) => {
  res.send('Hello from protected route')
})

// Route where user must be authenticated and must be have an ADMIN
app.get('/protected/admin-resource', [isAuthenticated, verifyRole('ADMIN')], (req, res) => {
  res.send('Hello from ADMIN resource')
})
```
