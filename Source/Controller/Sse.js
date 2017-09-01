const SSE = require('sse-broadcast');

module.exports = function(router) {
	const sse = SSE();
	router.addRoute('GET /', async (ctx,next) => {
		sse.subscribe('channel',ctx.res);
		ctx.respond = false;
	});

}