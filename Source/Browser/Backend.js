import Vue from 'vue';

const sse = new EventSource('/sse/');
const bus = new Vue();

let bindEvents = ['status'];
bindEvents.forEach(event => {
	sse.addEventListener(event,function(e) {
		let data = JSON.parse(e.data);
		bus.$emit(event,data);
	});
});

sse.onerror = function(e) {
	console.error("see-error",e);
};

const pl = new Playlist();

const getPlaylistData = function() {
	return pl.toJSON();
}

const moveGroup = function(oldIndex,newIndex) {
	pl.orderGroup(oldIndex,newIndex);
}

const moveSong = function(grp,oldIndex,newIndex) {
	pl.orderSong(grp, oldIndex, grp, newIndex);
}

const addPathToList = function(list,path) {
	data.forEach(i => {
		if (i.file && i.file.substr(0,path.length) === path) {
			pl.addFile(i);
		}
	});
	bus.$emit('playlist-update');
};