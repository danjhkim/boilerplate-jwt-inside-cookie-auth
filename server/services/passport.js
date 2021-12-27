const passport = require('passport');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const keyscon = require('../config/keys');
const User = require('../models/User');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local');

// This is possible with the help of done() function. It is an internal passport js
// function that takes care of supplying user credentials after user is authenticated
// successfully. This function attaches the email id to the request object so that it is
// available on the callback url as "req.user".
//! the req.user goes to authenticate controller.
//! req.user is a passportjs create thing
// This function is internally used by passport js to make sure
// that users are logged in before they are going to that url directly.
// It should be used in such a situation when they must be logged
// in order to access a protected url of the application.
// For example, to access dashboard page user must be logged in first.

// passport.serializeUser(function (user, done) {
// 	done(null, user);
// });

// passport.deserializeUser(function (user, done) {
// 	done(null, user);
// });

//Create local strategy
const localOptions = { usernameField: 'email' };
// when u want username just use email
const localLogin = new LocalStrategy(
	localOptions,
	async (email, password, done) => {
		const existingUser = await User.findOne({ email: email });

		//verify user and password, call done
		try {
			if (existingUser) {
				//if user exists compare password with db stored password
				existingUser.comparePassword(password, function (err, isMatch) {
					if (err) {
						return done(err);
					}
					if (!isMatch) {
						return done(null, false);
					}

					return done(null, existingUser);
				});
				done(null, existingUser);
			} else if (!existingUser) {
				return done(null, false);
			}
		} catch (err) {
			// if exists return error
			return done(err, false);
		}
		//otherwise call done with false
	},
);

// Setup options for JWT Strat
// finding token from header
// providing secret

// Setup options for JWT Strategy
const jwtOptions = {
	jwtFromRequest: req => req.signedCookies.jwt,
	secretOrKey: keyscon.jwtSecret,
};

//Create JWT strategy
//! payload is DECODED JWT TOKEN
const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
	//see if user ID exists in db
	try {
		const existingUser = await User.findById(payload.sub);

		if (existingUser) {
			// we already have a record with the given profile ID
			//call done with that user
			done(null, existingUser);
		} else {
			// without user object
			done(null, false);
		}
	} catch (err) {
		return done(err, false);
	}
});

//Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);
