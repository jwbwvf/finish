const passport = require('passport')
const {Strategy: LocalStrategy} = require('passport-local')
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

      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Incorrect username or password'
        })
      }

      user.hash = ''
      user.hash = undefined
      user.salt = ''
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
