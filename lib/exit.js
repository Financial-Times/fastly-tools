'use strict';
const log = require('./logger')();

module.exports = function exit(msg){
	log.error(msg);
	if(require.main === module){
		process.exit(1);
	}
};

