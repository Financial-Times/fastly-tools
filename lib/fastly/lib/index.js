/**
 * Fastly API client.
 *
 * @package fastly
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
const request = require('request');
const Q = require('q');
const debug = require('debug')('fastly');

/**
 * Constructor
 */
function Fastly (apikey, service, options) {

	var opts = options || {};
	this.apikey = apikey || '';
	this.service = service || '';
	this.verbose = (opts.verbose) ? true : false;

	var self = this;

	// For each API method create a function
	require('./api').forEach(function (a) {
		if (a.fn && (a.fn !== '')) {

			self[a.fn] = function () {

				var url = a.url;
				var method = a.method;

				var interpolateUrl = function (url, tokens) {
					return url
							.split('/')
							.map( function (a) {
								return /^\%/.test(a) ? tokens.pop() : a; // pop. not idempotent.
							})
							.join('/');
				};

				var args = [].slice.call(arguments).reverse().concat([self.service]);

				// In the cases where we want a POST body we pass the
				// parameters as the last argument, so after the arguments have
				// been converted to an array and reversed we can detect an
				// object has been passed in an unshift it.
				var params = (args[0] && typeof args[0] === 'object') ? args.shift() : null;

				var endPoint = interpolateUrl(url, args);

				return self.request(method, endPoint, params);

			};
		}
	});
}

/**
 * Adapter helper method.
 *
 * @param {string} Method
 * @param {string} URL
 * @param {params} Optional params to update.
 *
 * @return {Object}
 */
Fastly.prototype.request = function (method, url, params) {

	var deferred = Q.defer();
	var self = this;

	// Allow for optional update params.
	if (typeof params === 'function') {
		params = null;
	}

	debug('Request: ' + method + ', ' + url);

	// Construct headers
	var headers = { 'fastly-key': self.apikey };

	// HTTP request
	request({
		method: method,
		url: 'https://api.fastly.com' + url,
		headers: headers,
		form: params
	}, function (err, response, body) {

		if (self.verbose) {
			debug('Response: ' + response.statusCode + ' ' + body);
		}

		if (err) return deferred.reject(body);
		if (response.statusCode > 302) return deferred.resolve(body);
		if (response.statusCode >= 400) return deferred.reject(body);

		if (response.headers['content-type'] === 'application/json') {
			try {
				body = JSON.parse(body);
			} catch (error) {
				return deferred.reject(error);
			}
		}

		deferred.resolve(body);
	});

	return deferred.promise;
};

// -------------------------------------------------------

Fastly.prototype.purge = function (host, url) {
	return this.request('POST', '/purge/' + host + url);
};

Fastly.prototype.purgeAll = function (service) {
	var url = '/service/' + encodeURIComponent(service) + '/purge_all';
	return this.request('POST', url);
};

Fastly.prototype.purgeKey = function (service, key) {
	var url = '/service/' + encodeURIComponent(service) + '/purge/' + key;
	return this.request('POST', url);
};

Fastly.prototype.stats = function (service) {
	var url = '/service/' + encodeURIComponent(service) + '/stats/summary';
	return this.request('GET', url);
};

Fastly.prototype.stats = function (service) {
	var url = '/service/' + encodeURIComponent(service) + '/stats/summary';
	return this.request('GET', url);
};

/**
 * Export
 */
module.exports = function (apikey, service, opts) {
	return new Fastly(apikey, service, opts);
};
