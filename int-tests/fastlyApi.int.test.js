'use strict';
const fetch = require('node-fetch');
const expect = require('chai').expect;

function waitFor(ms){
	return new Promise(resolve => setTimeout(resolve, ms));
}


describe('Integration Tests', () => {

	describe('Fastly API', () => {

		let fastly, testServiceId;

		function createTestService(){
			return fetch('https://api.fastly.com/service', {
				method: 'POST',
				headers: {
					'Fastly-Key' : process.env.FASTLY_APIKEY,
					'Content-Type': 'application/x-www-form-urlencoded',
					'Accept': 'application/json'
				},
				body: 'name=pauls-test-service'
			}).then(response => response.json());
		}

		function deleteTestService(){
			return fetch('https://api.fastly.com/service/' + testServiceId, {
				method: 'DELETE',
				headers: {
					'Fastly-Key' : process.env.FASTLY_APIKEY,
					'Accept': 'application/json'
				}
			});
		}
		
		before(() => {
			return createTestService()
				.then(svc => {
					console.log('--- test service created');
					//console.log(svc);
					testServiceId = svc.id;
					fastly = require('fastly')(process.env.FASTLY_APIKEY, svc.id);
				})
		});

		after(() => {
			return deleteTestService().then(() => console.log('--- test service deleted'));
		});

		describe('Backends', () => {

			it('Should be able to get all backends for service & version', () => {
				return fastly.getBackend('1')
					.then(response => {
						expect(response).to.exist;
						expect(response).to.be.an.instanceOf(Array);
					});
			});

			it('Should be able to create a new backend', () => {
				let name = 'foo';
				let host = 'blah.ft.com';
				return fastly.createBackend('1', {name:name, hostname:host})
					.then(response => {
						expect(response).to.exist;
						expect(response.name).to.equal(name);
						expect(response.hostname).to.equal(host);
					})
			});

			it('Should be able to delete a backend', () => {
				let name = 'blah';
				return fastly.createBackend('1', {name:name, hostname:'blah.blah.com'})
					.then(backend => {
						return fastly.deleteBackendByName('1', backend.name);
					})
					.then(() => fastly.getBackend('1'))
					.then(backends => {
						let names = backends.map(b => b.name);
						expect(names).not.to.contain(name);
					});
			});

			//todo - backends are limited to 5 unless you request so this test won't pass
			it.skip('Should be able to create 7 backends', () => {
				let items = [1,2,3,4,5,6,7];
				let backends = items.map(i => {
					return {'name':`backend_${i}`, 'hostname': `blah${i}.ft.com`}
				});

				return Promise.all(backends.map(b => {
					return waitFor(1000).then(() => fastly.createBackend('1', b));
				}))
					.then(() => {
						return fastly.getBackend('1');
					})
					.then(backends => {
						console.log(backends);
						expect(backends.length).to.equal(items.length);
					})
			});



		});

	})

});
