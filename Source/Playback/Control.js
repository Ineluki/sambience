const Play = require('./Play.js');

const methods = {};

let playlist;
let mode;

let queue = [];

let playing = false;

function queueNext() {
	let next;
	switch(mode) {
		case methods.MODE_NORMAL:
			next = () => { return playlist.moveToNextSong(); };
		break;

		case methods.MODE_RANDOM_SONG:
			next = () => { return playlist.moveToRandomSong(); };
		break;

		case methods.MODE_RANDOM_GROUP:
			next = () => { return playlist.moveToRandom(); };
		break;

		default:
			throw new Error("unknown mode: "+JSON.stringify(mode));
	}
	let moved = next();
	if (!moved) {
		throw new Error("unable to move to next song");
	}
	let meta = playlist.getCurrentSong();
	return Play.start(meta.file);
}

function playNext() {

}

methods.start = function() {
	if (!playing) {
		playing = true;
		Play.start(file)
		.then(queueNext)
		.catch((err) => {
			playing = false;
			console.error(err);
		});
	}
};

methods.stop = function() {
	if (playing) {
		Play.stop();
	}
};

methods.jumpNext = function() {

};
methods.jumpPrev = function() {

};

methods.setPlaylist = function(pl) {
	playlist = pl.clone();
};

methods.setMode = function(m) {
	mode = m;
};
methods.MODE_NORMAL = 0;
methods.MODE_RANDOM_SONG = 1;
methods.MODE_RANDOM_GROUP = 2;
methods.MODE_REPEAT_SONG = 3;



module.exports = methods;