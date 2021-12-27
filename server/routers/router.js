const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const passportService = require('../services/passport');
const Authentication = require('../controllers/authentication');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

router.get('/test', requireAuth, function (req, res) {
	res.send({ hi: 'there' });
});

router.get('/user', requireAuth, Authentication.checkuser);
router.post('/signup', Authentication.signup);
router.post('/signin', requireSignin, Authentication.signin);
router.get('/signout', Authentication.signout);

module.exports = router;
