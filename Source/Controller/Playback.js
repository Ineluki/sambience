const ReqRes = require('../Util/Reqres.js');
const Control = require('../Playback/Control.js');
const Status = require('../Playback/Status.js');
const Lib = require('../Library/Main.js');

const methods = {};

methods['/'] = function(params) {
	if (!Control[params.cmd]) {
		return Promise.reject(new Error("unknown command: "+params.cmd));
	}
	return Promise.resolve(Control[params.cmd]());

};
methods['/'].params = ['cmd'];


methods['/setmode'] = function(params) {
	Control.setMode(~~(params.mode));
	return Lib.getStorage().setSetting('playmode',~~(params.mode));
};
methods['/setmode'].params = ['mode'];

methods['/getmode'] = function() {
	return Promise.resolve( Control.getMode() );
};


methods['/setposition'] = function(params) {
	let p;
	if (!Control.getPlaylist() || Control.getPlaylist().getId() !== params.playlist) {
		p = Lib.getStorage().loadPlaylist(params.playlist);
		p = p.then((pl) => {
			Control.setPlaylist(pl);
		});
	} else {
		p = Promise.resolve();
	}
	return p.then(() => {
		Control.setPosition(params.group, params.song);
	});
};
methods['/setposition'].params = ['playlist','group','song'];


module.exports = function(router) {
	ReqRes.fillRouter(router,methods);
};