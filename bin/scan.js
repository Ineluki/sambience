const lib = require('../Source/Library/Main.js');
let path = process.argv[ process.argv.length - 1 ];
if (!path) {
	console.log("specify full path as last argument");
	process.exit(1);
}
lib.scan(path);
