'use strict';
const loadBackendData = require('../lib/loadBackendData');
const log = require('../lib/logger');
const exit = require('../lib/exit')(log);

module.exports = (vclFilePath, opts) => {
	let options = Object.assign({output:false}, opts);
	try{
		let json = loadBackendData(vclFilePath);
		let result = JSON.stringify(json, null, 2);
		if(options.output){
			process.stdout.write(result);
		}else{
			return result;
		}
	}catch(e){
		exit(e);
	}
};
