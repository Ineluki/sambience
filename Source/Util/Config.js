const Conf = require('conf');
const FS = require('fs');

const configPath = process.env.APP_CONFIG || process.cwd()+'/settings.json';

const data = FS.readFileSync(configPath,{ encoding: 'utf8' });

if (!data) {
	console.log(`Config file not found in ${configPath}. Please use settings.sample.json as a template. You can modify the location of the file with ENV: APP_CONFIG`);
	process.exit(5);
}

const config = new Conf();
config.store = JSON.parse(data);

module.exports = config;