const player = require('play-sound');
const debug = require('debug')('music');

const methods = {};

let audio;

methods.start = function(file) {
	methods.stop();
	return new Promise(function(resolve, reject) {
		debug("playing "+file);
		audio = setTimeout(resolve,3300);
		return;
		audio = player.play(file, function(err){
			audio = null;
			if (err && !err.killed) reject(err);
			else resolve();
		});
	});
};

methods.stop = function() {
	debug("stop play");
	if (audio) {
		clearTimeout(audio);
		//audio.kill();
		audio = null;
	}
};

module.exports = methods;