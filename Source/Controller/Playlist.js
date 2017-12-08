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
	let playlist;
	return Lib.getPlaylist(params.id)
	.then((pl) => {
		playlist = pl;
		return Lib.getStorage().getFilesByIndex(params.type,params.value);
	})
	.then((items) => {
		playlist.addMultiple(items);
		return Lib.savePlaylist(playlist);
	})
	.then(() => {
		return playlist;
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
	return Lib.getPlaylist(params.id)
	.then((pl) => {
		pl.orderSong(params.group, params.oldpos, params.group, params.newpos);
		return Lib.savePlaylist(pl)
		.then(() => { return pl; });
	});
};
methods['GET /moveitem'].params = ['id','oldpos','newpos','group'];

methods['GET /movegroup'] = (params) => {
	return Lib.getPlaylist(params.id)
	.then((pl) => {
		pl.orderGroup(params.oldpos, params.newpos);
		return Lib.savePlaylist(pl)
		.then(() => { return pl; });
	});
};
methods['GET /movegroup'].params = ['id','oldpos','newpos'];

methods['GET /sort'] = (params) => {
	return Lib.getPlaylist(params.id)
	.then((pl) => {
		pl.sort();
		return Lib.savePlaylist(pl)
		.then(() => { return pl; });
	});
};
methods['GET /sort'].params = ['id'];

methods['GET /removegroup'] = (params) => {
	return Lib.getPlaylist(params.id)
	.then((pl) => {
		pl.removeGroup(params.pos);
		return Lib.savePlaylist(pl)
		.then(() => { return pl; });
	});
};
methods['GET /removegroup'].params = ['id','pos'];

methods['GET /removesong'] = (params) => {
	return Lib.getPlaylist(params.id)
	.then((pl) => {
		pl.removeSong(params.grp,params.song);
		return Lib.savePlaylist(pl)
		.then(() => { return pl; });
	});
};
methods['GET /removesong'].params = ['id','grp','song'];


methods['GET /save'] = (params) => {
	let meta = params.obj;
	return Lib.getPlaylist(meta._id)
	.then((pl) => {
		if (meta.delete) {
			return Lib.deletePlaylist(pl);
		} else {
			pl.name = meta.name;
			return Lib.savePlaylist(pl)
			.then(() => {
				return pl.getMeta();
			});
		}
	});
};
methods['GET /save'].params = ['obj'];

module.exports = function(router) {
	ReqRes.fillRouter(router,methods);
};