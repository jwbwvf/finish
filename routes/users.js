var express = require('express')
var router = express.Router()

var mongoose = require('mongoose')
mongoose.Promise = global.Promise

var User = mongoose.model('User')

const { verifyJwt } = require('../auth/token')

var pug = require('pug')

const categories = require('../config/categories')

function isLoggedIn (req) {
  if (!req.cookies || !req.cookies.token || !req.user || !req.user.id) {
    return false
  }

  const token = req.cookies.token
  const verifiedJwt = verifyJwt(token)

  return verifiedJwt.exp > Date.now() / 1000
}

function isLoggedInUser (req) {
  if (!req.cookies || !req.cookies.token || !req.user || !req.user.id) {
    return false
  }

  const token = req.cookies.token
  const verifiedJwt = verifyJwt(token)

  const loggedInUserId = verifiedJwt.id
  const pageUserId = req.user.id

  return loggedInUserId === pageUserId
}

function isAllowedToDelete (req, res, next) {
  if (isLoggedInUser(req)) next()
}

router.param('category', (req, res, next) => {
  // TODO good place to filter by allowed categories ie books, games, etc
  req.params.category = req.params.category.toLowerCase()
  next()
})

router.param('userId', (req, res, next, userId) => {
  const category = req.params.category.toLowerCase()

  User.findById(userId, category, (err, user) => {
    if (!user) {
      return next(new Error('failed to load user'))
    }

    if (err) {
      return next(err)
    }

    if (!user[category]) user[category] = []
    req.user = user
    next()
  })
})

router.get('/profile', (req, res) => {
  const html = pug.renderFile('./views/profile.pug', { title: 'Profile', isLoggedIn: isLoggedIn(req) })
  return res.status(200).send(html)
})

router.get('/:userId/category/:category', (req, res) => {
  const view = isLoggedInUser(req) ? './views/my-items.pug' : './views/items.pug'
  const category = req.params.category
  const html = pug.renderFile(view, { categories, category, items: req.user[category], id: req.user.id, isLoggedIn: isLoggedIn(req) })
  return res.status(200).send(html)
})

router.post('/:userId/category/:category', (req, res) => {
  const category = req.params.category
  if (isLoggedInUser(req) === false) {
    const html = pug.renderFile('./views/items.pug', { category, items: req.user[category], message: 'You are not allowed to add.', isLoggedIn: isLoggedIn(req) })
    return res.status(200).send(html)
  }

  const categoryObject = { title: req.body.title }

  // toUpperCase won't work for unicode characters
  const alreadyExists = req.user[category].some(x => x.title.toUpperCase() === categoryObject.title.toUpperCase())
  if (alreadyExists) {
    const html = pug.renderFile('./views/my-items.pug', { categories, category, items: req.user[category], id: req.user.id, isLoggedIn: isLoggedIn(req) })
    return res.status(200).send(html)
  }

  req.user[category].push(categoryObject)

  const categoryArray = req.user[category]

  // this sorting algorithm was from MDN Array.prototype.sort() Sorting with map
  var mapped = categoryArray.map((element, i) => { return { index: i, value: element.title.toLowerCase() } })
  mapped.sort((a, b) => {
    return +(a.value > b.value) || +(a.value === b.value) - 1
  })

  req.user[category] = mapped.map((element) => { return categoryArray[element.index] })

  req.user.save((err) => {
    if (err) {
      return res.status(400).send(err)
    }

    const html = pug.renderFile('./views/my-items.pug', { categories, category, items: req.user[category], id: req.user.id, isLoggedIn: isLoggedIn(req) })
    return res.status(200).send(html)
  })
})

router.post('/:userId/category/:category/delete', isAllowedToDelete, (req, res, next) => {
  const category = req.params.category

  const { id } = req.body

  var index = req.user[category].findIndex(x => x._id.toString() === id)
  if (index > -1) {
    req.user[category].splice(index, 1)
  }

  req.user.save((err) => {
    if (err) {
      return res.status(400).send(err)
    }

    const view = isLoggedInUser(req) ? './views/my-items.pug' : './views/items.pug'
    const category = req.params.category
    const html = pug.renderFile(view, { categories, category, items: req.user[category], id: req.user.id, isLoggedIn: isLoggedIn(req) })
    return res.status(200).send(html)
  })
})

module.exports = router
