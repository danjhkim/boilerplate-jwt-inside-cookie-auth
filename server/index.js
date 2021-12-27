const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

var whitelist = ['http://localhost:3090', 'http://localhost:3000'];
var corsOptions = {
	credentials: true,
	origin: whitelist,
	origin: true,
};

const keycon = require('./config/keys');

//App setup
const routes = require('./routers/router');
//mongoDB connect

mongoose
	.connect(keycon.mongoURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(result => console.log('connected to db'))
	.catch(err => console.log(err));

//middlewares

app.use(cors(corsOptions));
//morgan is a logging framework
//logs incoming requests mostly for debugging
app.use(morgan('combined'));
// this parses
// app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser(keycon.cookieKey));

app.use(routes);

if (process.env.NODE_ENV === 'production') {
	//! only production cuz development u dont wanna constantly build you just run dev on client and setup a proxy
	//if in production and the routes arent in authroutes anb billingroutes check react
	const path = require('path');

	// serve production assets e.g. main.js if route exists
	//! checking reach folders
	app.use(express.static('../client/build'));

	// serve index.html if route is not recognized
	//! if not found just send the index.html
	app.get('*', (req, res) => {
		res.sendFile(
			path.resolve(__dirname, '..', 'client', 'build', 'index.html'),
		);
	});
}

//Server setup
const PORT = process.env.PORT || 3090;

app.listen(PORT, () => {
	console.log(`Listening port ${PORT}`);
});
