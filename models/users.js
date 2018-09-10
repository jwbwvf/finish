var mongoose = require('mongoose')// .set('debug', true);

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    require: true
  },
  salt: {
    type: String,
    require: true
  },
  books: [
    {
      title: String
    }
  ],
  games: [
    {
      title: String
    }
  ]
})

mongoose.model('User', userSchema)
