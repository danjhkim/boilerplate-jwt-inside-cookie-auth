const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

/// unique required so no multiple accounts with same email
/// lowercase because unique is not case sensitive
/// neither are email addresses
const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
	},
});

// On Save Hook, encrypt password
// Before saving a model, run this function
userSchema.pre('save', function (next) {
	// get access to the user model
	const user = this;

	// generate a salt then run callback
	bcrypt.genSalt(10, function (err, salt) {
		if (err) {
			return next(err);
		}

		// hash (encrypt) our password using the salt
		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) {
				return next(err);
			}

			// overwrite plain text password with encrypted password FOR MONGO
			user.password = hash;
			next();
		});
	});
});

//methods property you can just add functions
userSchema.methods.comparePassword = function (candidatePassword, callback) {
	bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
		if (err) {
			//callback is bcrypt its return the error whenever it is called
			return callback(err);
		}

		callback(null, isMatch);
		// is returning the boolean isMatch
	});
};

const User = mongoose.model('User', userSchema);

module.exports = User;

//this is a mongodb schema
// template to format the db to send to DB
