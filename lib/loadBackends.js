'use strict';
const fs = require('fs');

module.exports = function loadBackends(backendsFile){
	var backendData = fs.readFileSync(backendsFile, { encoding: 'utf-8' } );
	const envVarsToReplace = [ "LOGENTRIES_TOKEN" ];

	for(var i=0; i<envVarsToReplace.length; i++) {
		var key = envVarsToReplace[i]
		var val = process.env[key];
		if( val ) {
			var regex = new RegExp('\\\$\\\{'+ key.trim()+'\\\}', 'gm');
			backendData = backendData.replace(regex, val);
		}
	}

	return JSON.parse(backendData);
};
