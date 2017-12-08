const ReqRes = require('../Util/Reqres.js');
const Control = require('../Playback/Control.js');
const Status = require('../Playback/Status.js');
const Lib = require('../Library/Main.js');

const methods = {};

methods['GET /'] = function(params) {
	if (!Control[params.cmd]) {
		return Promise.reject(new Error("unknown command: "+params.cmd));
	}
	return Promise.resolve(Control[params.cmd]());

};
methods['GET /'].params = ['cmd'];


methods['GET /setmode'] = function(params) {
	Control.setMode(~~(params.mode));
	return Lib.getStorage().setSetting('playmode',~~(params.mode));
};
methods['GET /setmode'].params = ['mode'];

methods['GET /getmode'] = function() {
	return Promise.resolve( Control.getMode() );
};


methods['GET /setposition'] = function(params) {
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
methods['GET /setposition'].params = ['playlist','group','song'];


module.exports = function(router) {
	ReqRes.fillRouter(router,methods);
};