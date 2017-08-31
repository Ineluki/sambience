
const Lib = require('../Library/Main.js');

const methods = {};

methods['GET /create'] = async (ctx,next) => {
	let name = ctx.request.query.name || 'new';
	await Lib.createPlaylist(name)
	.then((pl) => {
		ctx.body = JSON.stringify({
			name: pl.name,
			_id: pl._id
		});
	});
};

methods['GET /additems'] = async (ctx,next) => {
	let id = ctx.request.query.id;
	let pathtype = ctx.request.query.type;
	let pathvalue = ctx.request.query.value;

	let pl = Lib.getPlaylist(id);
	if (!pl || !pathtype || !pathvalue) {
		ctx.body = JSON.stringify({
			error: true,
			message: 'missing parameter'
		});
	} else {
		
	}
};


module.exports = function(router) {
	for(let r in methods) {
		router.addRoute(r,methods[r]);
	}
};