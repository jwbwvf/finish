var mongoose = require('mongoose')

var dbURI = 'mongodb://localhost/finish'

if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.AWS_MONGO_URI
}

mongoose.Promise = global.Promise
mongoose.connect(dbURI)

var db = mongoose.connection

db.on('connected', () => {
  console.log('mongoose connected to ' + dbURI)
})

db.on('error', (error) => {
  console.log('mongoose error ' + error)
})

db.on('disconnected', () => {
  console.log('mongoose disconnected')
})

require('./users')
require('./books')
