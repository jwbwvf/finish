var express = require('express')
var router = express.Router()

var mongoose = require('mongoose')
mongoose.Promise = global.Promise

var User = mongoose.model('User')
var Book = mongoose.model('Book')
var Game = mongoose.model('Game')

var pug = require('pug')

var jwt = require('express-jwt')
var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
})

let category = ''

const factory = {
  'games': Game,
  'books': Book
}

function isLoggedIn (req) {
  if (!req.cookies || !req.cookies.token || !req.user || !req.user.id) {
    return false
  }

  const token = req.cookies.token
  const verifiedJwt = req.user.verifyJwt(token)

  return verifiedJwt.exp > Date.now() / 1000
}

function isLoggedInUser (req) {
  if (!req.cookies || !req.cookies.token || !req.user || !req.user.id) {
    return false
  }

  const token = req.cookies.token
  const verifiedJwt = req.user.verifyJwt(token)

  const loggedInUserId = verifiedJwt._id
  const pageUserId = req.user.id

  return loggedInUserId === pageUserId
}

router.param('userId', (req, res, next, userId) => {
  // pull the category off the end of the url
  const url = req.url
  const splits = url.split('/')
  category = splits[2].toLowerCase()

  User.findById(userId, category, (err, user) => {
    if (!user) {
      return next(new Error('failed to load user'))
    }

    if (err) {
      return next(err)
    }

    if (!user[category]) user[category] = []
    req.user = user
    req.category = category
    next()
  })
})

router.get('/profile', (req, res) => {
  const html = pug.renderFile('./views/profile.pug', {title: 'Profile', isLoggedIn: isLoggedIn(req)})
  res.status(200).send(html)
})

router.get(['/:userId/books', '/:userId/games'], (req, res) => {
  const view = isLoggedInUser(req) ? './views/my-' : './views/'
  const category = req.category
  const html = pug.renderFile(view + category + '.pug', {title: category, [category]: req.user[category], id: req.user.id, isLoggedIn: isLoggedIn(req)})
  res.status(200).send(html)
})

router.post(['/:userId/books', '/:userId/games'], (req, res) => {
  if (isLoggedInUser(req) === false) {
    const html = pug.renderFile('./views/' + category + '.pug', {title: category, [category]: req.user[category], message: 'You are not allowed to add.', isLoggedIn: isLoggedIn(req)})
    res.status(200).send(html)
  }

  if (category === 'books') {
    var book = new factory[category]()
    book.title = req.body.title

    req.user.addBook(book)
  } else if (category === 'games') {
    var game = new factory[category]()
    game.title = req.body.title

    req.user.addGame(game)
  }
  req.user.save((err) => {
    if (err) {
      res.status(400).send(err)
    }

    const category = req.category
    const html = pug.renderFile('./views/my-' + category + '.pug', {title: category, [category]: req.user[category], id: req.user.id, isLoggedIn: isLoggedIn(req)})
    res.status(200).send(html)
  })
})

router.delete('/:userId/books/:bookId', auth, (req, res, next) => {
  if (isLoggedInUser(req) === false) {
    const html = pug.renderFile('./views/' + category + '.pug', {title: category, [category]: req.user[category], message: 'You are not allowed to delete.'})
    res.status(200).send(html)
  }

  var bookId = req.params.bookId

  req.user.removeBookById(bookId)
  req.user.save((err) => {
    if (err) {
      res.status(400).send(err)
    }

    res.status(200).send(req.user)
  })
})

module.exports = router
