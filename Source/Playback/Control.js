const Play = require('./Play.js');
const debug = require('debug')('music');
const Status = require('./Status.js');

const methods = {};

let playlist;
let mode;

let queue = [];

let playing = false;

function keepPlaying() {
	if (!playing) return Promise.resolve();
	playNext()
	.then(moveQueueForward)
	.then(keepPlaying)
	.catch((err) => {
		playing = false;
		console.error(err);
	});
}

function moveQueueForward() {
	let next;
	switch(mode) {
		case methods.MODE_NORMAL:
			next = () => { return playlist.moveToNextSong(); };
		break;

		case methods.MODE_RANDOM_SONG:
			next = () => { return playlist.moveToRandomSong(); };
		break;

		case methods.MODE_RANDOM_GROUP:
			if (playlist.isAtEndOfGroup()) {
				next = () => { return playlist.moveToRandomGroup(); };
			} else {
				next = () => { return playlist.moveToNextSong(); };
			}
		break;

		case methods.MODE_REPEAT_SONG:
			next = () => { return true; };
		break;

		default:
			throw new Error("unknown mode: "+JSON.stringify(mode));
	}
	let moved = next();
	if (!moved) {
		debug("unable to move to next song");
		return Promise.reject();
	} else {
		debug("moved to next song in mode "+mode);
		return Promise.resolve();
	}
}

function playNext() {
	let meta = playlist.getCurrentSong();
	if (!meta) {
		debug("end of playlist reached");
		return Promise.resolve();
	}
	Status.playback({
		type: 'start',
		song: meta._id,
		playlist: playlist.getId()
	});
	return Play.start(meta.file);
}

methods.start = function() {
	if (!playing) {
		playing = true;
		keepPlaying();
	}
};

methods.stop = function() {
	if (playing) {
		playing = false;
		Play.stop();
		Status.playback({ type: 'stop' });
	}
};

methods.jumpNext = function() {
	methods.stop();
	if (playlist.moveToNextSong()) {
		methods.start();
		return true;
	}
	return false;
};
methods.jumpPrev = function() {
	methods.stop();
	if (playlist.moveToPrevSong()) {
		methods.start();
		return true;
	}
	return false;
};

methods.jumpNextGroup = function() {
	let moved;
	methods.stop();
	if (mode === methods.MODE_RANDOM_GROUP) {
		moved = playlist.moveToRandomGroup();
	} else {
		moved = playlist.moveToNextGroup();
	}
	if (moved) {
		methods.start();
		return true;
	}
	return false;
};

methods.setPosition = function(grp,song) {
	methods.stop();
	if (playlist.moveToPosition(grp,song)) {
		methods.start();
		return true;
	}
	return false;
};

methods.setPlaylist = function(pl) {
	playlist = pl;
};

methods.getPlaylist = function() {
	return playlist;
}

methods.setMode = function(m) {
	mode = m;
};
methods.MODE_NORMAL = 0;
methods.MODE_RANDOM_SONG = 1;
methods.MODE_RANDOM_GROUP = 2;
methods.MODE_REPEAT_SONG = 3;

mode = methods.MODE_NORMAL;

module.exports = methods;