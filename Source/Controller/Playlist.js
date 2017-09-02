const ReqRes = require('../Util/Reqres.js');
const Lib = require('../Library/Main.js');

const methods = {};

methods['GET /create'] = (params) => {
	return Lib.createPlaylist(params.name)
	.then((pl) => {
		return { _id: pl._id, name: pl.name }
	});
};
methods['GET /create'].params = ['name'];

methods['GET /additems'] = (params) => {
	let pl = Lib.getPlaylist(params.id);
	if (!pl) return Promise.reject(new Error("unknown playlist"));
	let index = Lib.getIndex(params.type);
	return index.handleInput(params.value)
	.then((items) => {
		items.forEach((item) => {
			pl.addFile(item);
		});
		Lib.savePlaylist(pl);
		return pl;
	});
};
methods['GET /additems'].params = ['id','type','value'];

methods['GET /'] = (params) => {
	return Promise.resolve( Lib.getPlaylistOverview() );
};
methods['GET /'].params = [];


methods['GET /get'] = (params) => {
	return Promise.resolve( Lib.getPlaylist(params.id) );
};
methods['GET /get'].params = ['id'];

methods['GET /moveitem'] = (params) => {
	let pl = Lib.getPlaylist(params.id);
	pl.orderSong(params.group, params.oldpos, params.group, params.newpos);
	Lib.savePlaylist(pl);
	return Promise.resolve( pl );
};
methods['GET /moveitem'].params = ['id','oldpos','newpos','group'];

methods['GET /movegroup'] = (params) => {
	let pl = Lib.getPlaylist(params.id);
	pl.orderGroup(params.group, params.oldpos, params.newpos);
	Lib.savePlaylist(pl);
	return Promise.resolve( pl );
};
methods['GET /movegroup'].params = ['id','oldpos','newpos'];

module.exports = function(router) {
	ReqRes.fillRouter(router,methods);
};