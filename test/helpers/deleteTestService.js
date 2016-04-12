'use strict';
const fetch = require('node-fetch');

module.exports = function deleteTestService(){
	return fetch(
		'https://api.fastly.com/service/' + FASTLY_TEST_SERVICE.id,
		{
			method: 'DELETE',
			headers : {
				'Fastly-Key': process.env.FASTLY_API_KEY,
				'Content-Type': 'application/x-www-form-urlencoded',
				'Accept': 'application/json'
			},
		}
	).then(response => {
		if(!response.ok){
			throw new Error('Failed to delete service, response was ' + response.status);
		}

	})
}
