const ReqRes = require('../Util/Reqres.js');
const Lib = require('../Library/Main.js');

const methods = {};

methods['GET /create'] = (params) => {
	return Lib.createPlaylist(params.name)
	.then((pl) => {
		return pl.getMeta();
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
		return Lib.savePlaylist(pl)
		.then(() => { return pl; });
	});
};
methods['GET /additems'].params = ['id','type','value'];

methods['GET /'] = (params) => {
	return Lib.getPlaylistOverview();
};
methods['GET /'].params = [];


methods['GET /get'] = (params) => {
	return Lib.getPlaylist(params.id);
};
methods['GET /get'].params = ['id'];

methods['GET /moveitem'] = (params) => {
	let pl = Lib.getPlaylist(params.id);
	pl.orderSong(params.group, params.oldpos, params.group, params.newpos);
	return Lib.savePlaylist(pl)
	.then(() => { return pl; });
};
methods['GET /moveitem'].params = ['id','oldpos','newpos','group'];

methods['GET /movegroup'] = (params) => {
	let pl = Lib.getPlaylist(params.id);
	pl.orderGroup(params.group, params.oldpos, params.newpos);
	return Lib.savePlaylist(pl)
	.then(() => { return pl; });
};
methods['GET /movegroup'].params = ['id','oldpos','newpos'];

methods['GET /removegroup'] = (params) => {
	let pl = Lib.getPlaylist(params.id);
	pl.removeGroup(params.pos);
	return Lib.savePlaylist(pl)
	.then(() => { return pl; });
};
methods['GET /removegroup'].params = ['id','pos'];

methods['GET /removesong'] = (params) => {
	let pl = Lib.getPlaylist(params.id);
	pl.removeSong(params.grp,params.song);
	return Lib.savePlaylist(pl)
	.then(() => { return pl; });
};
methods['GET /removesong'].params = ['id','grp','song'];


methods['GET /save'] = (params) => {
	let meta = params.obj;
	let pl = Lib.getPlaylist(meta._id);
	if (meta.delete) {
		return Lib.deletePlaylist(pl);
	} else {
		pl.name = meta.name;
		return Lib.savePlaylist(pl)
		.then(() => {
			return pl.getMeta();
		});
	}
};
methods['GET /save'].params = ['obj'];

module.exports = function(router) {
	ReqRes.fillRouter(router,methods);
};