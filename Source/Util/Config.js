const Conf = require('conf');
const FS = require('fs');

const data = FS.readFileSync('./settings.json',{ encoding: 'utf8' });

if (!data) {
	console.log("settings.json not found. Please use settings.sample.json as a template and place it in the installation base directory");
	process.exit(5);
}

const config = new Conf();
config.store = JSON.parse(data);

module.exports = config;