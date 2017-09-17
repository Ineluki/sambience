
const store = localStorage;

const methods = {};

const createMethod = function(key) {
	methods[key] = function(set=null) {
		if (set !== null) {
			store.setItem(key,set);
		}
		return store.getItem(key);
	}
};

['playlistMode','currentPlaylist'].forEach(key => { createMethod(key); });

module.exports = methods;