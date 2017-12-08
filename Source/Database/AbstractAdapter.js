

class AbstractAdapter {

	reloadIndices() {

	}

	getPlaylists() {

	}

	savePlaylist(pl) {

	}

	deletePlaylist(pl) {

	}

	updateFile(data) {

	}

	searchFilesByPath(regex) {

	}

	searchFilesByArtist(artist,album,song) {

	}

	getFilesByIds(ids) {

	}

	getFileReadStream() {

	}

	getFileWriteStream() {

	}

	getIndexView(type,path) {

	}

	getIndexSearch(type,search) {

	}

	getFilesByIndex(type,input) {

	}

	getSetting(key) {

	}

	setSetting(key,val) {
		
	}
}

module.exports = AbstractAdapter;