'use strict';

module.exports = (log, actuallyExit) => {
	return msg => {
		log.error(msg);
		if (actuallyExit) {
			process.exit(1);
		}
	}
};
