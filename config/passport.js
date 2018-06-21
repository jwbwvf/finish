var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var mongoose = require('mongoose')
mongoose.Promise = global.Promise
var User = mongoose.model('User')

passport.use(new LocalStrategy({ usernameField: 'email' },
  function (username, password, done) {
    console.log('inside passport.use username password: ' + username + ' ' + password)
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
