
const Scanner = require('../Library/Scanner.js');

module.exports = function(router) {
	router.addRoute('GET /', async (ctx,next) => {
		ctx.body = "test called";
	});

}