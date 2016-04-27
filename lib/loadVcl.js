'use strict';
const fs = require('fs');
const path = require('path')

function replaceVars(vcls, vars) {
	return vcls.map(function(vcl) {
		vars.forEach(function(v) {
			if (!process.env[v]) {
				throw new Error(`Environment variable ${v} is required to deploy this vcl`);
			}
			var regex = new RegExp('\\\$\\\{'+ v.trim()+'\\\}', 'gm');
			vcl.content = vcl.content.replace(regex, process.env[v]);
		});

		return vcl;
	});
}


module.exports = function loadVcl(folder, vars){
	var vcls = fs.readdirSync(folder).filter(function(fname) {
			return fname.endsWith('.vcl')
		}).map(function (name) {
		return {
			name: name,
			content: fs.readFileSync(path.join(folder,name), { encoding: 'utf-8' })
		};
	});

	// if vars option exists, replace ${VAR} with process.env.VAR
	if(vars.length) {
		vcls = replaceVars(vcls, vars);
	}

	return vcls;
};
