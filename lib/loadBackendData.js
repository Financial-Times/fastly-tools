'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function loadBackendData(filePath){
	let fileLocation = path.resolve(process.cwd(), filePath);
	let contents = fs.readFileSync(fileLocation, {encoding:'utf8'});
	return JSON.parse(contents);
};
