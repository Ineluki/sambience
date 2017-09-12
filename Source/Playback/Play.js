const spawn = require('child_process').spawn;
const debug = require('debug')('sambience');

const player = require('../Util/Config.js').get('playback.player');

const methods = {};

let audio;

methods.start = function(file) {
	methods.stop();
	return new Promise(function(resolve, reject) {
		const closed = function(err) {
			if (err && !err.killed) {
				reject(err);
			} else {
				debug("stopped",audioLocal ? audioLocal.pid : 0, audio ? audio.pid : 0,
						audioLocal === audio ? 'same' : '');
				if (audioLocal === audio) {
					resolve();
				}
			}
		};
		let audioLocal;
		audioLocal = audio = spawn(player, [file], {
			stdio: 'ignore',
			detached: false
		});
		audioLocal.on('close',closed);
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