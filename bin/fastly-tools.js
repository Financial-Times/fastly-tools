#!/usr/bin/env node
'use strict';
const program = require('commander');
const log = require('../lib/logger');
const exit = require('../lib/exit')(log);

function list(val) {
	return val.split(',');
}

program
	.command('deploy [folder]')
	.description('Deploys VCL in [folder] to the specified fastly service.  Requires FASTLY_KEY env var')
	.option('-m, --main <main>', 'Set the name of the main vcl file (the entry point).  Defaults to "main.vcl"')
	.option('-v, --vars <vars>', 'A way of injecting environment vars into the VCL.  So if you pass --vars AUTH_KEY,FOO the values {$AUTH_KEY} and ${FOO} in the vcl will be replaced with the values of the environmemnt variable.  If you include SERVICEID it will be populated with the current --service option', list)
	.option('-e, --env', 'Load environment variables from local .env file (use when deploying from a local machine')
	.option('-s, --service <service>', 'REQUIRED.  The ID of the fastly service to deploy to.')
	.option('-V --verbose', 'Verbose log output')
	.option('b --backends <backends>', 'Upload the backends specified in <backends> via the api')
	.action(function(folder, options) {
		const deploy = require('../tasks/deploy');
		if (folder) {
			deploy(folder, options).catch(exit);
		} else {
			exit('Please provide a folder where the .vcl is located');
		}
	});

program.parse(process.argv);
