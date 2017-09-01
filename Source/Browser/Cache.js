
const store = localStorage;

const methods = {};

methods.currentPlaylist = function(set=null) {
	if (set !== null) {
		store.setItem('currentList',set);
	}
	return store.getItem('currentList');
}

module.exports = methods;