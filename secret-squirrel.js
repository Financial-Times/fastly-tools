module.exports = {
	files: {
		allow: [
			'art/superman.ascii',
			'art/tea.ascii'
		],
		allowOverrides: []
	},
	strings: {
		deny: [],
		denyOverrides: [
			'deleteLoggingS3ByName', // lib/fastly/lib/api.js:748, tasks/deploy.js:147, test/mocks/fastly.mock.js:41
			'andrew@diy\\.org' // lib/fastly/lib/index.js:5
		]
	}
};
