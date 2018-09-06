var mongoose = require('mongoose')

var gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  }
  // TODO future upc, publisher, platform, counts
})

mongoose.model('Game', gameSchema)
