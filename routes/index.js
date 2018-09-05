var express = require('express')
var router = express.Router()

var passport = require('passport')
var pug = require('pug')

var mongoose = require('mongoose')
mongoose.Promise = global.Promise
var User = mongoose.model('User')

/* GET home page. */
router.get('/', (req, res) => {
  const html = pug.renderFile('./views/index.pug', { title: 'Landing' })
  res.send(html)
})

// authentication
router.post('/register', (req, res) => {
  if (!req.body.name ||
      !req.body.email ||
      !req.body.confirmEmail ||
      !req.body.password ||
      !req.body.confirmPassword) {
    const html = pug.renderFile('./views/register.pug', { message: 'All fields are required.' })
    res.send(html)
    return
  }

  if (req.body.email !== req.body.confirmEmail) {
    const html = pug.renderFile('./views/register.pug', { message: 'Email fields do not match, try again.' })
    res.send(html)
    return
  }

  if (req.body.password !== req.body.confirmPassword) {
    const html = pug.renderFile('./views/register.pug', { message: 'Password fields do not match, try again.' })
    res.send(html)
    return
  }

  var user = new User()

  user.name = req.body.name
  user.email = req.body.email

  user.setPassword(req.body.password)

  user.save(function (err) {
    if (err) {
      res.status(400).send(err)
      return
    }

    var token = user.generateJwt()
    return res.cookie('token', token).redirect('/users/' + user._id + '/books')
  })
})

router.get('/logout', (req, res) => {
  return res.cookie('token', '').redirect('/login')
})

router.get('/login', (req, res) => {
  const html = pug.renderFile('./views/login.pug')
  res.send(html)
})

router.get('/register', (req, res) => {
  const html = pug.renderFile('./views/register.pug')
  res.send(html)
})

router.post('/login', function (req, res, next) {
  if (!req.body.email || !req.body.password) {
    const html = pug.renderFile('./views/login.pug', { message: 'All fields are required.' })
    return res.send(html)
  }

  passport.authenticate('local', function (err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      const html = pug.renderFile('./views/login.pug', { message: 'Incorrect email or password.' })
      return res.send(html)
    }
    req.logIn(user, function (err) {
      if (err) { return next(err) }

      var token = user.generateJwt()
      return res.cookie('token', token).redirect('/users/' + user._id + '/books')
    })
  })(req, res, next)
})

module.exports = router
