const Lib = require('../Source/Library/Main.js');
let path = '/home/ineluki/Music/Iced Earth/Alive in Athens/';
let l = new Lib(path);
//l.scan();
// l.updateLib();

// l.storage.searchByPath('/home/ineluki/Music/Iced Earth/Alive in Athens/')
// .then((docs) => {
// 	console.log("res",docs);
// },(err) => { console.log(err); });

l.getArtistIndex()
.then((tree) => {
	console.log(tree);
},err => {console.log(err);});