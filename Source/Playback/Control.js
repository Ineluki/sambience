const Play = require('./Play.js');
const debug = require('debug')('sambience');
const Status = require('./Status.js');
const Error = require('../Util/Error.js');

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
		console.error("error during keepPlaying",err);
		methods.stop();
	});
}

function moveQueueForward() {
	if (!playing) return;
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
			return Promise.reject(new Error("unknown mode: "+JSON.stringify(mode)));
	}
	let moved = next();
	if (!moved) {
		debug("unable to move to next song. probably end of playlist");
		return Promise.reject(new Error("unable to move to next song"));
	} else {
		debug("moved to next song in mode "+mode);
		return Promise.resolve();
	}
}

function playNext() {
	let meta = playlist.getCurrentSong();
	if (!meta) {
		return Promise.reject(new Error("no current song to play"));
	}
	Status.playback({
		type: 'start',
		song: meta._id,
		duration: meta.duration,
		began: Date.now(),
		playlist: playlist.getId()
	});
	return Play.start(meta.file);
}

methods.start = function() {
	if (!playing) {
		debug("starting");
		playing = true;
		keepPlaying();
	}
};

methods.stop = function() {
	if (playing) {
		debug("stopping");
		playing = false;
		Status.playback({
			type: 'stop',
			began: Date.now(),
			playlist: playlist ? playlist.getId() : null
		});
		Play.stop();
	}
};

methods.jumpNext = function() {
	methods.stop();
	if (playlist.moveToNextSong()) {
		methods.start();
	}
};
methods.jumpPrev = function() {
	methods.stop();
	if (playlist.moveToPrevSong()) {
		methods.start();
	}
};

methods.jumpNextGroup = function() {
	methods.stop();
	let moved;
	if (mode === methods.MODE_RANDOM_GROUP) {
		moved = playlist.moveToRandomGroup();
	} else {
		moved = playlist.moveToNextGroup();
	}
	if (moved) {
		methods.start();
	}
};

methods.setPosition = function(grp,song) {
	methods.stop();
	if (playlist.moveToPosition(grp,song)) {
		methods.start();
	}
};

methods.setPlaylist = function(pl) {
	playlist = pl;
};

methods.getPlaylist = function() {
	return playlist;
};

methods.setMode = function(m) {
	mode = m;
};
methods.MODE_NORMAL = 0;
methods.MODE_RANDOM_SONG = 1;
methods.MODE_RANDOM_GROUP = 2;
methods.MODE_REPEAT_SONG = 3;

mode = methods.MODE_NORMAL;

module.exports = methods;