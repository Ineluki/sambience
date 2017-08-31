const TreeNode = require('../Source/Model/Tree/Node.js');
const assert = require('assert');

let album1 = { album: 'fiction' };
let album2 = { album: 'the red mirror' };

let songs1 = [
	{ song: 'song 1' },
	{ song: 'song 2' },
	{ song: 'song 3' },
	{ song: 'song 4' },
	{ song: 'song 5' }
];
let songs2 = [
	{ song: 'song 6' },
	{ song: 'song 7' },
	{ song: 'song 8' },
	{ song: 'song 9' }
];

function dumpTree(root,lvl=0) {
	let x = [];
	for(let n of root) {
		//console.log("dump",lvl,n.id,n.content);
		x.push(n.id);
		if (lvl < 1) dumpTree(n,lvl+1);
	}
	console.log("dump "+lvl,JSON.stringify(x));
}

let root = new TreeNode();
let grp1 = root.addChild(album1);
songs1.forEach(sng => { grp1.addChild(sng); });
let grp2 = root.addChild(album2);
songs2.forEach(sng => { grp2.addChild(sng); });

dumpTree(root);

assert(grp1.firstChild.content === songs1[0],'first child of first group is song 1');
assert(grp1.lastChild.content === songs1[4], 'last child is song 5');
assert(grp1.lastChild.getNext() === grp2.firstChild,'lastchild.next is firstchild of next grp');
assert(grp2.lastChild.prev.prev.content = songs2[1], 'penultimate of grp2 is song 7');

let m1 = grp1.removeChild(songs1[1]);
grp1.addChild(m1,3);

dumpTree(root);

assert(grp1.firstChild.next.content === songs1[2],'second child is song 3');
assert(grp1.firstChild.next.prev === grp1.firstChild,'firstchild is linked properly');
assert(grp1.lastChild.prev.content === songs1[1],'penultimate is song 2');

let rng = {};
for (let i=0; i<1000; i++) {
	let leaf = root.getRandomLeaf();
	let key = ""+leaf.id;
	if (key in rng) {
		rng[key] += 1;
	} else {
		rng[key] = 1;
	}
}

console.log(rng);

console.log('done');