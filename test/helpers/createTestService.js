'use strict';
const fetch = require('node-fetch');

module.exports = function createFastlyService(){
	return fetch(
		'https://api.fastly.com/service',
		{
			method: 'POST',
			headers : {
				'Fastly-Key': process.env.FASTLY_API_KEY,
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json'
			},
			body : 'name=test-service'
		}
	).then(response => {
		if(!response.ok){
			throw new Error('Failed to create new Service')
		}

		return response.json();
	}).then(json => {
		GLOBAL.FASTLY_TEST_SERVICE = json;
	});
}
