const ReqRes = require('../Util/Reqres.js');
const Control = require('../Playback/Control.js');
const Lib = require('../Library/Main.js');

function updateRunning(pl) {
	let opl = Control.getPlaylist();
	console.log("update running",opl.getId(), pl.getId());
	if (opl && ""+opl.getId() === ""+pl.getId()) {
		console.log("setting updated playlist");
		Control.setPlaylist(pl);
		let pos = opl.getNumericPosition();
		console.log("setting updated position",pos);
		pl.moveToPosition(pos[0],pos[1]);
	}
}

const methods = {};

methods['/create'] = (params) => {
	return Lib.createPlaylist(params.name)
	.then((pl) => {
		return pl.getMeta();
	});
};
methods['/create'].params = ['name'];

methods['/additems'] = (params) => {
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
		updateRunning(playlist);
		return playlist;
	});
};
methods['/additems'].params = ['id','type','value'];

methods['/'] = (params) => {
	return Lib.getPlaylistOverview();
};
methods['/'].params = [];


methods['/get'] = (params) => {
	return Lib.getPlaylist(params.id);
};
methods['/get'].params = ['id'];

methods['/moveitem'] = (params) => {
	return Lib.getPlaylist(params.id)
	.then((pl) => {
		pl.orderSong(params.group, params.oldpos, params.group, params.newpos);
		return Lib.savePlaylist(pl)
		.then(() => {
			updateRunning(pl);
			return pl;
		});
	});
};
methods['/moveitem'].params = ['id','oldpos','newpos','group'];

methods['/movegroup'] = (params) => {
	return Lib.getPlaylist(params.id)
	.then((pl) => {
		pl.orderGroup(params.oldpos, params.newpos);
		return Lib.savePlaylist(pl)
		.then(() => {
			updateRunning(pl);
			return pl;
		});
	});
};
methods['/movegroup'].params = ['id','oldpos','newpos'];

methods['/sort'] = (params) => {
	return Lib.getPlaylist(params.id)
	.then((pl) => {
		pl.sort();
		return Lib.savePlaylist(pl)
		.then(() => {
			updateRunning(pl);
			return pl;
		});
	});
};
methods['/sort'].params = ['id'];

methods['/removegroup'] = (params) => {
	return Lib.getPlaylist(params.id)
	.then((pl) => {
		pl.removeGroup(params.pos);
		return Lib.savePlaylist(pl)
		.then(() => {
			updateRunning(pl);
			return pl;
		});
	});
};
methods['/removegroup'].params = ['id','pos'];

methods['/removesong'] = (params) => {
	return Lib.getPlaylist(params.id)
	.then((pl) => {
		pl.removeSong(params.grp,params.song);
		return Lib.savePlaylist(pl)
		.then(() => {
			updateRunning(pl);
			return pl;
		});
	});
};
methods['/removesong'].params = ['id','grp','song'];


methods['/save'] = (params) => {
	let meta = params.obj;
	return Lib.getPlaylist(meta._id)
	.then((pl) => {
		if (meta.delete) {
			return Lib.deletePlaylist(pl)
			.then(() => {
				return {
					deleted: pl._id
				};
			});
		} else {
			pl.name = meta.name;
			return Lib.savePlaylist(pl)
			.then(() => {
				updateRunning(pl);
				return pl.getMeta();
			});
		}
	});
};
methods['/save'].params = ['obj'];

module.exports = function(router) {
	ReqRes.fillRouter(router,methods);
};