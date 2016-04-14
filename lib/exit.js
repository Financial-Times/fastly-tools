'use strict';

module.exports = log => {
	return msg => {
		log.error(msg);
		if (require.main === module) {
			process.exit(1);
		}
	}
};
