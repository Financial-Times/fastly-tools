'use strict';
const fs = require('fs');

module.exports = function loadBackends(backendsFile, vars){
	var backendData = fs.readFileSync(backendsFile, { encoding: 'utf-8' } );

	for(var i=0; i<vars.length; i++) {
		var key = vars[i];
		var val = process.env[key];
		if( val ) {
			var regex = new RegExp('\\\$\\\{'+ key.trim()+'\\\}', 'gm');
			backendData = backendData.replace(regex, val);
		} else {
			throw new Error(`Environment variable ${key} is required to deploy backends`);
		}
	}

	return JSON.parse(backendData);
};
