var mongoose = require('mongoose');//.set('debug', true);
var bookSchema = require('./books');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
	email : {
		type : String,
		required : true,
		unique : true
	},
	name : {
		type : String,
		required : true
	},
	hash : {
		type: String,
		require: true
	},
	salt : 	{
		type: String,
		require: true
	},
    books: [bookSchema]
});

var iterations = 1000;
var size = 16;
var digest = 'SHA1';

//can't use arrow function in the methods below or it doesn't bind this
userSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, iterations, size, digest).toString('hex');
};

userSchema.methods.validPassword = function (password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, iterations, size, digest).toString('hex');
	return this.hash === hash;
};

userSchema.methods.generateJwt = function () {
	var expiry = new Date();
	expiry.setDate(expiry.getDate() + 7); //set expire in seven days

	return jwt.sign({
		_id : this._id,
		email : this.email,
		name : this.name,
		exp : parseInt(expiry.getTime() / 1000)
	}, "12345678");//process.env.JWT_SECRET);
};

userSchema.methods.verifyJwt = function (token) {
	return jwt.verify(token, "12345678");//process.env.JWT_SECRET);
}

userSchema.methods.addBook = function (book) {
	if (!book || !book.title) {
		return;
	}

	//toUpperCase won't work for unicode characters
	const alreadyExists = this.books.some(x => x.title.toUpperCase() === book.title.toUpperCase());
	if (alreadyExists) {
		return;
	}

	this.books.push(book);

	var books = this.books;

	//this sorting algorithm was from MDN Array.prototype.sort() Sorting with map
	var mapped = books.map((element,i) => { return {index: i, value: element.title.toLowerCase()}});
	mapped.sort((a,b) => {
		return +(a.value > b.value) || +(a.value === b.value) - 1;
	});

	this.books = mapped.map((element) => {return books[element.index];});
};

userSchema.methods.removeBookById = function (bookId) {
	//book._id is an ObjectId, bookId is a string
	var index = this.books.findIndex(book => book._id.toString() === bookId);
	if (index > -1) {
		this.books.splice(index, 1);
	}
}

mongoose.model('User', userSchema);