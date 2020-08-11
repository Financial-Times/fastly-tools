#!/usr/bin/env node
'use strict';
const program = require('commander');

function list (val) {
	return val.split(',');
}

program
	.command('deploy [folder]')
	.description('Deploys VCL in [folder] to the specified fastly service.  Requires FASTLY_APIKEY env var')
	.option('-m, --main <main>', 'Set the name of the main vcl file (the entry point).  Defaults to "main.vcl"')
	.option('-v, --vars <vars>', 'A way of injecting environment vars into the VCL.  So if you pass --vars AUTH_KEY,FOO the values {$AUTH_KEY} and ${FOO} in the vcl will be replaced with the values of the environmemnt variable.  If you include SERVICEID it will be populated with the current --service option', list)
	.option('-e, --env', 'Load environment variables from local .env file (use when deploying from a local machine')
	.option('-s, --service <service>', 'REQUIRED.  The ID of the fastly service to deploy to.')
	.option('-V --verbose', 'Verbose log output')
	.option('-b --backends <backends>', 'Upload the backends specified in <backends> via the api')
	.option('-k --api-keys <keys>', 'list of alternate api keys to try should the key stored in process.env.FASTLY_API_KEY hit its rate limit', list)
	.option('--skip-conditions <conditions>', 'list of conditions to skip deleting', list)
	.action(function (folder, options) {
		const deploy = require('../tasks/deploy');
		const log = require('../lib/logger')({verbose:options.verbose, disabled:options.disableLogs});
		const exit = require('../lib/exit')(log, true);

		const symbols = require('../lib/symbols');
		deploy(folder, options).catch(err => {
			if(typeof err === 'string'){
				log.error(err);
			}else if(err.type && err.type === symbols.VCL_VALIDATION_ERROR){
				log.error('VCL Validation Error');
				log.error(err.validation);
			}else{
				log.error(err.stack);
			}
			exit('Bailing...', log);
		});

	});

program.parse(process.argv);
