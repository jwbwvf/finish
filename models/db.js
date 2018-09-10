var mongoose = require('mongoose')

const dbURI = process.env.NODE_ENV === 'production' ? process.env.AWS_MONGO_URI : 'mongodb://localhost/finish'

mongoose.Promise = global.Promise
mongoose.connect(dbURI, { useNewUrlParser: true })

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
