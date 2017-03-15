'use strict';
var sinon = require('sinon');
var expect = require('chai').expect;
process.env.FASTLY_APIKEY ='12345';
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var fastlyMock = require('./mocks/fastly.mock');

var path = require('path');

describe('Deploy Task', function(){

	var deployVcl;

	before(function(){
		deployVcl = proxyquire('../tasks/deploy', {'./../lib/fastly/lib' : fastlyMock});
	});

	afterEach(() => {
		for(let method of Object.keys(fastlyMock())){
			if (typeof fastlyMock()[method] === 'function') {
				fastlyMock()[method].reset();
			}
		}
	});

	it('Should be able to deploy some vcl', function(){
		return deployVcl(
			path.resolve(__dirname, './fixtures/vcl')+'/',
			{
				service:fastlyMock.fakeServiceId,
				apiKeys: ['dummy-key'],
				skipConditions: [],
				disableLogs:true
			})
			.then(function(){
				sinon.assert.called(fastlyMock().updateVcl);
			});
	});

	it('Should replace placeholders with environment vars', function(){
		var value = "value";
		process.env.AUTH_KEY = value;
		return deployVcl(
			path.resolve(__dirname, './fixtures/vcl')+'/',
			{
				service:fastlyMock.fakeServiceId,
				apiKeys: ['dummy-key'],
				skipConditions: [],
				vars:['AUTH_KEY'],
				disableLogs:true
			})
			.then(function(){
				var vcl = fastlyMock().updateVcl.lastCall.args[1].content;
				expect(vcl).to.contain(value);
				expect(vcl).not.to.contain('${AUTH_KEY}');
			});
	});

	it('Should upload given backends from .json file via the api', () => {
		let fixture = require('./fixtures/backends.json');
		return deployVcl(
			path.resolve(__dirname, './fixtures/vcl')+'/',
			{
				service:fastlyMock.fakeServiceId,
				apiKeys: ['dummy-key'],
				skipConditions: [],
				backends:'test/fixtures/backends.json',
				disableLogs:true
			})
			.then(function(){
			let callCount = fastlyMock().createBackend.callCount;
			expect(callCount).to.equal(fixture.backends.length);
			for(var i=0; i<callCount; i++){
				let call = fastlyMock().createBackend.getCall(i);
				try{
					expect(call.args[1]).to.deep.equal(fixture.backends[i]);
				}catch(err){
					console.log(call.args[1]);
					console.log(fixture.backends[i]);
					throw err;
				}
			}
		});
	});

	it('Should upload given healthchecks from .json file via the api', () => {
		let fixture = require('./fixtures/backends.json');
		return deployVcl(
			path.resolve(__dirname, './fixtures/vcl')+'/',
			{
				service:fastlyMock.fakeServiceId,
				apiKeys: ['dummy-key'],
				skipConditions: [],
				backends:'test/fixtures/backends.json',
				disableLogs:true
			})
			.then(function(){
				let callCount = fastlyMock().createHealthcheck.callCount;
				expect(callCount).to.equal(fixture.healthchecks.length);
				for(var i=0; i<callCount; i++){
					let call = fastlyMock().createHealthcheck.getCall(i);
					expect(call.args[1]).to.deep.equal(fixture.healthchecks[i]);
				}
			});
	});

	it('Should upload given conditions from .json file via the api', () => {
		let fixture = require('./fixtures/backends.json');
		return deployVcl(
			path.resolve(__dirname, './fixtures/vcl')+'/',
			{
				service:fastlyMock.fakeServiceId,
				apiKeys: ['dummy-key'],
				skipConditions: [],
				backends:'test/fixtures/backends.json',
				disableLogs:true
			})
			.then(function(){
				let callCount = fastlyMock().createCondition.callCount;
				expect(callCount).to.equal(fixture.conditions.length);
				for(var i=0; i<callCount; i++){
					let call = fastlyMock().createCondition.getCall(i);
					expect(call.args[1]).to.deep.equal(fixture.conditions[i]);
				}
			});
	});
});
