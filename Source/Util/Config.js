const Conf = require('conf');
const FS = require('fs');

const data = FS.readFileSync('./settings.json',{ encoding: 'utf8' });

const config = new Conf();
config.store = JSON.parse(data);

module.exports = config;