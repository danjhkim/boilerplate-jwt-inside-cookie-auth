const home_get = (req, res, next) => {
	res.send({ hi: 'there' });
};

module.exports = {
	home_get,
};
