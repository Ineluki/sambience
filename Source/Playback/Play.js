const player = require('play-sound')();
const debug = require('debug')('sambience');

const methods = {};

let audio;

methods.start = function(file) {
	methods.stop();
	return new Promise(function(resolve, reject) {
		let audioLocal;
		audioLocal = audio = player.play(file, function(err) {
			if (err && !err.killed) {
				reject(err);
			} else {
				debug("stopped",audioLocal ? audioLocal.pid : 0, audio ? audio.pid : 0, audioLocal === audio ? 'same' : '');
				if (audioLocal === audio) {
					resolve();
				}
			}
		});
		debug("playing "+file,audio.pid);
	});
};

methods.stop = function() {

	if (audio) {
		debug("stop play", audio ? audio.pid : 0);
		audio.kill();
		audio = null;
	}
};

module.exports = methods;