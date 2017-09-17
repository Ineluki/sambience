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
	return Promise.resolve();
};
methods['GET /setmode'].params = ['mode'];


methods['GET /setposition'] = function(params) {
	if (Control.getPlaylist().getId() !== params.playlist) {
		let pl = Lib.getPlaylist(params.playlist);
		if (!pl) return Promise.reject(new Error("unknown playlist: "+params.playlist));
		Control.setPlaylist(pl);
	}
	Control.setPosition(params.group, params.song);
	return Promise.resolve();
};
methods['GET /setposition'].params = ['playlist','group','song'];


module.exports = function(router) {
	ReqRes.fillRouter(router,methods);
};