'use strict';
const log = require('./logger')();

module.exports = function exit(msg){
	log.error(msg);
	process.exit(1);
};

