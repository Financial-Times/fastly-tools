'use strict';
const fs = require('fs');
const co = require('co');
require('array.prototype.includes');
require('array.prototype.find');
const log = require('../lib/logger')();
const exit = require('../lib/exit');
const loadVcl = require('../lib/loadVcl');
const loadBackendData = require('../lib/loadBackendData');

const VCL_VALIDATION_ERROR = Symbol();


function list(val) {
	return val.split(',');
}

function task (folder, opts) {
	let options = Object.assign({
		main: 'main.vcl',
		env: false,
		service: null,
		vars: [],
		verbose: false,
		disableLogs: false,
		backends: null
	}, opts);

	if (options.env) {
		require('dotenv').load();
	}

	const log = require('../lib/logger')({verbose:options.verbose, disabled:options.disableLogs});

	return co(function*() {
		if (!options.service) {
			throw new Error('the service parameter is required set to the service id of a environment variable name');
		}

		if (!process.env.FASTLY_APIKEY) {
			throw new Error('FASTLY_APIKEY not found');
		}

		const fastlyApiKey = process.env.FASTLY_APIKEY;
		const serviceId = process.env[opts.service] || opts.service;

		if (!serviceId) {
			throw new Error('No service ');
		}

		const fastly = require('fastly')(fastlyApiKey, encodeURIComponent(serviceId), {verbose: false});

		// if service ID is needed use the given serviceId
		if (options.vars.includes('SERVICEID')) {
			process.env.SERVICEID = serviceId;
		}

		let vcls = loadVcl(folder, options.vars);

		// get the current service and active version
		let service = yield fastly.getServices().then(services => services.find(s => s.id === serviceId));
		let activeVersion = service.version;

		// clone new version from current active version
		log.verbose(`Cloning active version ${activeVersion} of ${service.name}`);
		let cloneResponse = yield fastly.cloneVersion(activeVersion);
		log.verbose(`Successfully cloned version ${cloneResponse.number}`);
		let newVersion = cloneResponse.number;
		log.info('Cloned new version');

		// delete old vcl
		let oldVcl = yield fastly.getVcl(newVersion);
		yield Promise.all(oldVcl.map(vcl => {
			log.verbose(`Deleting "${vcl.name}" for version ${newVersion}`);
			return fastly.deleteVcl(newVersion, vcl.name);
		}));
		log.info('Deleted old vcl');

		//upload new vcl
		log.info(`Uploading new VCL`);
		yield Promise.all(vcls.map(vcl => {
			log.verbose(`Uploading new VCL ${vcl.name} with version ${newVersion}`);
			return fastly.updateVcl(newVersion, {
				name: vcl.name,
				content: vcl.content
			});
		}));

		// set the main vcl file
		log.info(`Set "${options.main}" as the main entry point`);
		yield fastly.setVclAsMain(newVersion, options.main);

		// validate
		log.verbose(`Validate version ${newVersion}`);
		let validationResponse = yield fastly.validateVersion(newVersion)
			.catch(err => {
				let error = new Error('VCL Validation Error');
				error.type = VCL_VALIDATION_ERROR;
				error.validation = err;
				throw err;
			});
		if (validationResponse.status === 'ok') {
			log.info(`Version  ${newVersion} looks ok`);
			yield fastly.activateVersion(newVersion);
		} else {
			throw new Error('VCL failed validation for some unknown reason');
		}

		if(options.backends){
			log.verbose(`Backends option specified.  Loading backends from ${options.backends}`);
			let backendData = loadBackendData(options.backends);
			let currentBackends = yield fastly.getBackend(newVersion);
			yield Promise.all(currentBackends.map(b => fastly.deleteBackendByName(newVersion, b.name)));
			log.info('Deleted old backends');
			yield Promise.all(backendData.backends.map(b => fastly.updateBackend(newVersion, b)));
			log.info('Upload new backends');
		}

		log.success('Your VCL has been deployed.');
		log.art('superman', 'success');




	}).catch((err => {
		if(err.type && err.type === VCL_VALIDATION_ERROR){
			log.error('VCL Validation Error');
			log.error(err.validation);
		}else{
			log.error(err.stack);
		}
		exit('Bailing...');
	}));
}


module.exports = task;
