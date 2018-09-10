var express = require('express')
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var passport = require('passport')
var compression = require('compression')

require('./models/db')
require('./auth/passport')

var index = require('./routes/index')
var users = require('./routes/users')

var app = express()

app.use(compression())

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(passport.initialize())

app.use('/', index)
app.use('/users', users)

// compile and cache all templates
app.enable('view cache')
var pug = require('pug')
var fs = require('fs')

fs.readdir('./views', (err, files) => {
  if (err) {
    console.error(err)
    return
  }
  files.forEach((file, index) => {
    pug.compileFile('./views/' + file)
  })
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
