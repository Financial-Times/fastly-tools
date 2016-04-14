'use strict';
const loadBackendData = require('../lib/loadBackendData');
const log = require('../lib/logger');
const exit = require('../lib/exit')(log);

module.exports = vclFilePath => {
	try{
		let json = loadBackendData(vclFilePath);
		let result = JSON.stringify(json, null, 2);
		if(require.main === module){
			process.stdout.write(result);
		}else{
			return result;
		}
	}catch(e){
		exit(e);
	}
};
