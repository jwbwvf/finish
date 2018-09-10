const passport = require('passport')
const { isPasswordValid } = require('../auth/security')
const { Strategy: LocalStrategy } = require('passport-local')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const User = mongoose.model('User')

passport.use(new LocalStrategy({ usernameField: 'email' },
  function (username, password, done) {
    User.findOne({ email: username }, (err, user) => {
      if (err) { return done(err) }

      if (!user) {
        return done(null, false, {
          message: 'Incorrect username or password'
        })
      }

      if (!isPasswordValid(password, user.salt, user.hash)) {
        return done(null, false, {
          message: 'Incorrect username or password'
        })
      }

      user.hash = undefined
      user.salt = undefined
      return done(null, user)
    })
  })
)

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})
