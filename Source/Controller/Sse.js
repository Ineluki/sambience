const Status = require('../Playback/Status.js');

module.exports = function(router) {

	router.addRoute('GET /', async (ctx,next) => {
		Status.subscribe(ctx.res);
		ctx.respond = false;
	});

}