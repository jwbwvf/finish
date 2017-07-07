var mongoose = require('mongoose');

var bookSchema = new mongoose.Schema({
    title: {
        type : String,
        required : true,
        unique : true
    }
    //TODO future isbn, author, counts
});

mongoose.model('Book', bookSchema);