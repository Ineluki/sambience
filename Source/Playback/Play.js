const spawn = require('child_process').spawn;
const debug = require('debug')('sambience-play');
const Error = require('../Util/Error.js');

const player = require('../Util/Config.js').get('playback.player');

const methods = {};

let audio;

methods.start = function(file) {
	methods.stop();
	return new Promise(function(resolve, reject) {
		const closed = function(code,signal) {
			if (code > 0 && !audioLocal.killedByUser) {
				debug("play err",code,signal);
				reject(new Error("child-process exit code "+code));
			} else {
				debug("stopped",audioLocal ? audioLocal.pid : 0,code,signal);
				if (audioLocal === audio) {
					debug("play cb");
					resolve();
				}
			}
			audioLocal = null;
		};
		let audioLocal;
		audioLocal = audio = spawn(player, [file], {
			stdio: 'pipe',
			detached: false
		});
		//we do this instead of ignore pipes because some programs (gst123) dont start properly on ignore
		audioLocal.stdout.on('data',() => {});
		audioLocal.stderr.on('data',() => {});
		audioLocal.on('close',closed);
		debug("playing "+file,audio.pid);
	});
};

methods.stop = function() {
	if (audio) {
		debug("stopping", audio ? audio.pid : 0);
		audio.killedByUser = true;
		audio.kill();
		audio = null;
	}
};

module.exports = methods;