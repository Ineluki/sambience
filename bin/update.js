const lib = require('../Source/Library/Main.js');
const Lib = require('../Source/Library/Library.js');
let path = process.argv[ process.argv.length - 1 ];
lib.waitForIndices.then(() => {
	if (!path) {
		path = '/'+lib.getIndex(Lib.INDEX_DIR).getRoot().getFullPath().join('/');
	}
	lib.updateLib(path);
});
