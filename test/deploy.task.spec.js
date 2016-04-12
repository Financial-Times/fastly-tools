'use strict';
var sinon = require('sinon');
var expect = require('chai').expect;
process.env.FASTLY_APIKEY ='12345';
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var fastlyMock = require('./mocks/fastly.mock.js');

var path = require('path');

describe('Deploy Task', function(){

	var deployVcl;

	before(function(){
		deployVcl = proxyquire('../tasks/deploy', {'fastly' : fastlyMock}).task;
	});

	it('Should be able to deploy some vcl', function(){
		return deployVcl(path.resolve(__dirname, './fixtures/vcl')+'/', {service:fastlyMock.fakeServiceId}).then(function(){
			sinon.assert.called(fastlyMock().updateVcl);
		});
	});

	it('Should replace placeholders with environment vars', function(){
		var value = "value";
		process.env.AUTH_KEY = value;
		return deployVcl(
			path.resolve(__dirname, './fixtures/vcl')+'/',
			{service:fastlyMock.fakeServiceId,vars:['AUTH_KEY'], verbose:true})
			.then(function(){
				var vcl = fastlyMock().updateVcl.lastCall.args[1].content;
				expect(vcl).to.contain(value);
				expect(vcl).not.to.contain('${AUTH_KEY}');
			});
	});

});
