'use strict';
const co = require('co');
require('array.prototype.includes');
const path = require('path');

const loadVcl = require('../lib/loadVcl');
const symbols = require('../lib/symbols');

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
		if(!folder) {
			throw new Error('Please provide a folder where the .vcl is located');
		}

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

		const fastly = require('./../lib/fastly/lib')(fastlyApiKey, encodeURIComponent(serviceId), {verbose: false});

		// if service ID is needed use the given serviceId
		if (options.vars.includes('SERVICEID')) {
			process.env.SERVICEID = serviceId;
		}

		const vcls = loadVcl(folder, options.vars);

		// get the current service and active version
		const service = yield fastly.getServices().then(services => services.find(s => s.id === serviceId));
		const activeVersion = service.version;

		// clone new version from current active version
		log.verbose(`Cloning active version ${activeVersion} of ${service.name}`);
		let cloneResponse = yield fastly.cloneVersion(activeVersion);
		log.verbose(`Successfully cloned version ${cloneResponse.number}`);
		let newVersion = cloneResponse.number;
		log.info('Cloned new version');

		//upload backends via the api
		if(options.backends){
			log.verbose(`Backends option specified.  Loading backends from ${options.backends}`);
			const backendData = require(path.join(process.cwd(), options.backends));

			log.verbose('Now, delete all existing healthchecks');
			const currentHealthchecks = yield fastly.getHealthcheck(newVersion);
			yield Promise.all(currentHealthchecks.map(h => fastly.deleteHealthcheck(newVersion, h.name)));
			log.info('Deleted old healthchecks');
			if (backendData.healthchecks) {
				log.verbose(`About to upload ${backendData.healthchecks.length} healthchecks`);
				yield Promise.all(backendData.healthchecks.map(h => {
					log.verbose(`upload healthcheck ${h.name}`);
					return fastly.createHealthcheck(newVersion, h).then(() => log.verbose(`✓ Healthcheck ${h.name} uploaded`));
				}));
				log.info('Uploaded new healthchecks');
			}

			log.verbose('Now, delete all existing conditions');
			const currentConditions = yield fastly.getConditions(newVersion)
			yield Promise.all(currentConditions.map(h => fastly.deleteCondition(newVersion, h.name)));
			log.info('Deleted old conditions');
			if (backendData.conditions) {
				yield Promise.all(backendData.conditions.map(c => {
					log.verbose(`upload condition ${c.name}`);
					return fastly.createCondition(newVersion, c).then(() => log.verbose(`✓ Condition ${c.name} uploaded`));
				}));
				log.info('Uploaded new conditions');
			}

			log.verbose('Now, delete all existing backends');
			const currentBackends = yield fastly.getBackend(newVersion);
			yield Promise.all(currentBackends.map(b => fastly.deleteBackendByName(newVersion, b.name)));
			log.info('Deleted old backends');
			yield Promise.all(backendData.backends.map(b => {
				log.verbose(`upload backend ${b.name}`);
				return fastly.createBackend(newVersion, b).then(() => log.verbose(`✓ Backend ${b.name} uploaded`));
			}));
			log.info('Uploaded new backends');

			const loggers = {
				'logentries': { 'get':    fastly.getLoggingLogentries,
						'delete': fastly.deleteLoggingLogentriesByName,
						'create': fastly.createLoggingLogentries,
				},
				'ftp':        { 'get':    fastly.getLoggingFtp,
						'delete': fastly.deleteLoggingFtpByName,
						'create': fastly.createLoggingFtp,
				},
				'syslog':     { 'get':    fastly.getLoggingSyslog,
						'delete': fastly.deleteLoggingSyslogByName,
						'create': fastly.createLoggingSyslog,
				},
			};

			for(const logger in loggers) {
				log.verbose(`Now, delete all existing logging ${logger}`);
				const currentLoggers = yield loggers[logger].get(activeVersion);
				yield Promise.all(currentLoggers.map(l => loggers[logger].delete(newVersion, l.name)));
				log.verbose(`Deleted old logging ${logger}`);
				if (backendData.logging && backendData.logging[logger]) {
					yield Promise.all(backendData.logging[logger].map(l => {
						log.verbose(`upload logging ${logger} ${l.name}`);
						return loggers[logger].create(newVersion, l)
							.then(() =>
								log.verbose(`✓ Logger ${logger}/${l.name} uploaded`)
							);
					}));
					log.info(`Uploaded new logging ${logger}`);
				}
			}
		}

		// delete old vcl
		let oldVcl = yield fastly.getVcl(newVersion);
		yield Promise.all(oldVcl.map(vcl => {
			log.verbose(`Deleting "${vcl.name}" for version ${newVersion}`);
			return fastly.deleteVcl(newVersion, vcl.name);
		}));
		log.info('Deleted old vcl');

		//upload new vcl
		log.info('Uploading new VCL');
		yield Promise.all(vcls.map(vcl => {
			log.verbose(`Uploading new VCL ${vcl.name} with version ${newVersion}`);
			return fastly.updateVcl(newVersion, {
				name: vcl.name,
				content: vcl.content
			});
		}));

		// set the main vcl file
		log.verbose(`Try to set "${options.main}" as the main entry point`);
		yield fastly.setVclAsMain(newVersion, options.main);
		log.info(`"${options.main}" set as the main entry point`);

		// validate
		log.verbose(`Validate version ${newVersion}`);
		let validationResponse = yield fastly.validateVersion(newVersion)
		if (validationResponse.status === 'ok') {
			log.info(`Version ${newVersion} looks ok`);
			yield fastly.activateVersion(newVersion);
		} else {
			let error = new Error('VCL Validation Error');
			error.type = symbols.VCL_VALIDATION_ERROR;
			error.validation = validationResponse.msg;
			throw error;
		}

		log.success('Your VCL has been deployed.');
		log.art('superman', 'success');

	});
}

module.exports = task;
