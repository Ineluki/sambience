process.on('unhandledRejection', r => console.log(r));

const app = require(__dirname+"/../Source/Server.js");