const Status = require('../Playback/Status.js');
const debug = require('debug')('sambience');

module.exports = function(router) {

	router.addRoute('GET /', async (ctx,next) => {
		Status.subscribe(ctx.res);
		ctx.respond = false;
	});

}