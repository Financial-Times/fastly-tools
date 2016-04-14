'use strict';
const expect = require('chai').expect;
const path = require('path');

describe('Convert Task', () => {

	const convert = require('../tasks/convert');
	const fixtureFilePath = path.resolve(__dirname, 'fixtures/backends.vcl');
	const fixtureJson = require('./fixtures/backends.json');

	it('Should be able to convert backends written in vcl to the correct json format for fastly', () => {
		let result = JSON.parse(convert(fixtureFilePath));
		expect(result).to.deep.equal(fixtureJson);
	});

});
