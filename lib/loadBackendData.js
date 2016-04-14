'use strict';

const parser = require('vcl-parser');
const fs = require('fs');
const path = require('path');
const util = require('util');

const requestRegex = /(HEAD|GET) ([a-z\-_\.\/]+) HTTP\/(1.1|1.0)/i;
const hostRegex = /Host: ([a-z-_.]+)/i;



function generateValue(value){
	if(value[0] === 'Duration' && value[2] === 's') {
		return value[1] * 1000;
	}else{
		return value[1];
	}
}

function mapBackendProperty(prop){
	switch(prop){
		case "host": return "hostname";
		case "max_connections": return "max_conn";
		case "dynamic":
		case "host_header":
		case "share_key":
			return null;
		default: return prop;
	}
}

function mapHealthcheckProperty(prop){
	switch(prop){
		case "interval" : "check_interval";
		default: return prop;
	}
}

function parseHealthCheckRequest(node, healthcheck){
	let parts = node[1];
	for(let part of parts){
		if(requestRegex.test(part[1])){
			let matches = requestRegex.exec(part[1]);
			healthcheck.method = matches[1];
			healthcheck.path = matches[2];
			healthcheck.http_version = matches[3];
		}

		if(hostRegex.test(part[1])){
			let matches = hostRegex.exec(part[1]);
			healthcheck.host = matches[1];
		}
	}
}

function generateHealthCheckJson(node, name){
	let data = node[1];
	let healthcheck = {name:name};
	for(let item of data){
		if(item[1].name === 'request'){
			parseHealthCheckRequest(item[1].value, healthcheck);
		}else{
			let prop = mapHealthcheckProperty(item[1].name);
			if(prop){
				healthcheck[prop] = generateValue(item[1].value);
			}
		}
	}

	return healthcheck;
}

function generateBackendJson(node){
	let data = node[1];
	let backend = {
		name : data.name
	};
	for(let item of data.properties){
		if(item[0] === 'SetBackendProperty'){
			let prop = mapBackendProperty(item[1].name);
			if(prop){
				backend[prop] = generateValue(item[1].value);
			}
		}
		if(item[0] === 'Healthcheck'){
			let name = data.name + '_healthcheck';
			backend.healthcheck = generateHealthCheckJson(item, name);
		}
	}

	return backend;
}

function toJson(parsedVCL){
	let json = {backends:[], healthchecks:[]};
	for(let node of parsedVCL){
		if(node[0] === 'Backend'){
			let backend = generateBackendJson(node);
			if(backend.healthcheck){
				let healthcheckName = backend.healthcheck.name;
				json.healthchecks.push(backend.healthcheck);
				backend.healthcheck = healthcheckName;
				json.backends.push(backend);
			}
		}
	}

	return json;
}

module.exports = function loadBackendData(filePath){
	let extension = filePath.split('.').reverse()[0];
	let fileLocation = path.resolve(process.cwd(), filePath);
	let contents = fs.readFileSync(fileLocation, {encoding:'utf8'});
	if(extension === 'json'){
		return JSON.parse(contents);
	}
	if(extension === 'vcl'){
		return toJson(parser.parse(contents));
	}
};
