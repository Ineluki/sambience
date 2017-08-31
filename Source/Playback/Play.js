const player = require('play-sound');

const methods = {};

var audio;

methods.start = function(file) {
	methods.stop();
	return new Promise(function(resolve, reject) {
		audio = player.play(file, function(err){
			audio = null;
			if (err && !err.killed) reject(err);
			else resolve();
		});
	});
};

methods.stop = function() {
	if (audio) {
		audio.kill();
		audio = null;
	}
};

module.exports = methods;