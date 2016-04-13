'use strict';
var sinon = require('sinon');
var expect = require('chai').expect;
process.env.FASTLY_APIKEY ='12345';
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var fastlyMock = require('./mocks/fastly.mock.js');
const fs = require('fs');

var path = require('path');

describe('Deploy Task', function(){

	var deployVcl;

	before(function(){
		deployVcl = proxyquire('../tasks/deploy', {'fastly' : fastlyMock});
	});

	afterEach(() => {
		for(let method of Object.keys(fastlyMock())){
			fastlyMock()[method].reset();
		}
	});

	it('Should be able to deploy some vcl', function(){
		return deployVcl(path.resolve(__dirname, './fixtures/vcl')+'/', {service:fastlyMock.fakeServiceId, disableLogs:false}).then(function(){
			sinon.assert.called(fastlyMock().updateVcl);
		});
	});

	it('Should replace placeholders with environment vars', function(){
		var value = "value";
		process.env.AUTH_KEY = value;
		return deployVcl(
			path.resolve(__dirname, './fixtures/vcl')+'/',
			{service:fastlyMock.fakeServiceId,vars:['AUTH_KEY'], disableLogs:true})
			.then(function(){
				var vcl = fastlyMock().updateVcl.lastCall.args[1].content;
				expect(vcl).to.contain(value);
				expect(vcl).not.to.contain('${AUTH_KEY}');
			});
	});

	it('Should upload given backends and healthchecks from .json file via the api', () => {
		let fixture = require('./fixtures/backends.json');
		return deployVcl(path.resolve(__dirname, './fixtures/vcl')+'/', {service:fastlyMock.fakeServiceId, backends:'test/fixtures/backends.json', disableLogs:true}).then(function(){
			let callCount = fastlyMock().updateBackend.callCount;
			expect(callCount).to.equal(fixture.backends.length);
			for(var i=0; i<callCount; i++){
				let call = fastlyMock().updateBackend.getCall(i);
				try{
					expect(call.args[1]).to.deep.equal(fixture.backends[i]);
				}catch(e){
					console.log(call.args[1]);
					console.log(fixture.backends[i]);
					throw err;
				}

			}
		});
	});

	it('Should upload given backends and healthchecks from .vcl file via the api', () => {
		let fixture = require('./fixtures/backends.json');
		return deployVcl(path.resolve(__dirname, './fixtures/vcl')+'/', {service:fastlyMock.fakeServiceId, backends:'test/fixtures/backends.vcl', disableLogs:true}).then(function(){
			let callCount = fastlyMock().updateBackend.callCount;
			expect(callCount).to.equal(fixture.backends.length);
			for(var i=0; i<callCount; i++){
				let call = fastlyMock().updateBackend.getCall(i);
				try{
					expect(call.args[1]).to.deep.equal(fixture.backends[i]);
				}catch(e){
					console.log(call.args[1]);
					console.log(fixture.backends[i]);
					throw err;
				}

			}
		});
	});
});
