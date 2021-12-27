const validator = require('email-validator');
const jwt = require('jsonwebtoken');
const keyscon = require('../config/keys');
const User = require('../models/User');

// function that creates jwt token using hashed user id from mongodb
// RSA algoritm required private and public key
function tokenForUser(user) {
	return jwt.sign({ sub: user.id }, keyscon.jwtSecret, {
		algorithm: 'HS256',
		expiresIn: 72 * 60 * 60 * 60,
	});
}

const signin = async (req, res, next) => {
	let token = tokenForUser(req.user);
	//email and password is verified so need to give them token

	res.cookie('jwt', token, {
		httpOnly: true,
		secure: true,
		signed: true,
		expires: new Date(Date.now() + 90000000),
	})
		.status(200)
		.json({
			success: 'Logged in successfully 😊 👌',
			email: req.user.email,
		});
};

const signout = async (req, res, next) => {
	res.clearCookie('jwt', { path: '/' });
	res.status(200).json({
		success: true,
		message: 'User logged out successfully',
	});
};

const checkuser = async (req, res, next) => {
	res.json({
		success: 'User is currently logged in..',
		email: req.user.email,
	}).status(200);
};

const signup = async (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;

	// sending error code if both parameters are not filled
	if (!email || !password || !validator.validate(email)) {
		return res
			.status(422)
			.send({ error: 'You must provide a proper email and password' });
	}

	//see if user exists
	const existingUser = await User.findOne({ email: email });

	try {
		if (existingUser) {
			res.status(422).send({ error: 'Email is in use' });
		}
		// if new user, create and save user record
		const user = await new User({
			email: email,
			password: password,
		}).save();

		// respond to request
		// giving jwt token on successful creation of account
		//httpOnly disallowed accessing the cookie onthe front end
		// so request to server and send it back to client
		let token = tokenForUser(user);
		res.cookie('jwt', token, {
			httpOnly: true,
			secure: true,
			signed: true,
			expires: new Date(Date.now() + 60 * 60 * 1000),
		})
			.status(200)
			.json({
				success: 'Logged in successfully 😊 👌',
				email: email,
			});
	} catch (err) {
		// if exists return error
		next(err);

		//! In general express follows the way of passing errors rather than throwing it,
		//! for any errors in the program you can pass the error object to 'next' ,
		//! also an error handler need to be defined so that all the errors passed to
		//! next can be handled properly
	}
};

module.exports = {
	signup,
	signin,
	checkuser,
	signout,
};
