

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

}

module.exports = AbstractAdapter;