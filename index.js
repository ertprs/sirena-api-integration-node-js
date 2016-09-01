/**
 * IMPORTANT! This module version is exclusive for Sirena API v1.0.0
 *
 * Code generated with Swagger JS Codegen and a bit modified by the Sirena Team
 * Swagger File: http://api.getsirena.com/swagger.json
 * More info at: 
 * - https://www.npmjs.com/package/swagger-js-codegen
 * - http://ayuda.getsirena.com/
 * 
 */

/**
 * Sirena API Module for lead providers and prospect data manipulation
 * @class Sirena
 * @param {string} [apiKey] - The client API Key
 * @param {boolean} [isQuery] - Optional. "true" if send the token as query param, otherwise, send as header param
 * @param {string} [apiUrl] - Optional. The API Url
 */
var Sirena = (function() {
	'use strict';

	var request = require('request');
	var Q = require('q');

	function Sirena(options) {

		if (!options) {
			throw new Error('An options object parameter is necessary to use the Sirena API Module.');
		}

		if (!options.apiKey || typeof options.apiKey !== 'string') {
			throw new Error('An API Key string parameter is necessary to connect with the Sirena API.');
		}

		this.domain = options.apiUrl || 'http://api.getsirena.com/v1';
		this.token = {
			apiKey: options.apiKey,
			isQuery: options.isQuery || true,
			headerOrQueryName: 'api-key'
		};

		console.log('\nSirena API Module has been set up.\n- API URL: ' + this.domain + '\n- API Key:' + this.token.apiKey + '\n');
	}

	Sirena.prototype.request = function(method, url, parameters, body, headers, queryParameters, form, deferred) {
		var req = {
			method: method,
			uri: url,
			qs: queryParameters,
			headers: headers,
			body: body
		};
		if (Object.keys(form).length > 0) {
			req.form = form;
		}
		if (typeof(body) === 'object' && !(body instanceof Buffer)) {
			req.json = true;
		}
		request(req, function(error, response, body) {
			if (error) {
				deferred.reject(error);
			} else {
				if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
					try {
						body = JSON.parse(body);
					} catch (e) {}
				}
				if (response.statusCode === 204) {
					deferred.resolve({
						response: response
					});
				} else if (response.statusCode >= 200 && response.statusCode <= 299) {
					deferred.resolve({
						response: response,
						body: body
					});
				} else {
					deferred.reject({
						response: response,
						body: body
					});
				}
			}
		});
	};

	/**
	 * Set Token
	 * @method
	 * @name Sirena#setToken
	 * @param {string} value - token's value
	 * @param {string} headerOrQueryName - the header or query name to send the token at
	 * @param {boolean} isQuery - true if send the token as query param, otherwise, send as header param
	 *
	 */
	Sirena.prototype.setToken = function(value, headerOrQueryName, isQuery) {
		this.token.value = value;
		this.token.headerOrQueryName = headerOrQueryName;
		this.token.isQuery = isQuery;
	};

	/**
	 * Vehicle industry only. Processes lead data and returns the matching prospect. If the prospect already exists, previous lead data will not be returned.
	 * @method
	 * @name Sirena#newVehicleLead
	 * @param {} lead - Sirena API for lead providers and prospect data manipulation
	 * @param {string} format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
	 * 
	 */
	Sirena.prototype.newVehicleLead = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/lead/vehicle';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		if (parameters['lead'] !== undefined) {
			body = parameters['lead'];
		}

		if (parameters['lead'] === undefined) {
			deferred.reject(new Error('Missing required  parameter: lead'));
			return deferred.promise;
		}

		if (parameters['format'] !== undefined) {
			queryParameters['format'] = parameters['format'];
		}

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};
	/**
	 * Saving plan industry only. Processes lead data and returns the matching prospect. If the prospect already exists, previous lead data will not be returned.
	 * @method
	 * @name Sirena#newSavingPlanLead
	 * @param {} lead - Sirena API for lead providers and prospect data manipulation
	 * @param {string} format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
	 * 
	 */
	Sirena.prototype.newSavingPlanLead = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/lead/saving-plan';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		if (parameters['lead'] !== undefined) {
			body = parameters['lead'];
		}

		if (parameters['lead'] === undefined) {
			deferred.reject(new Error('Missing required  parameter: lead'));
			return deferred.promise;
		}

		if (parameters['format'] !== undefined) {
			queryParameters['format'] = parameters['format'];
		}

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};
	/**
	 * Returns information about the lead categories available for lead creation in each industry. The response includes the name and other details about each category. The default category is returned first.
	 * @method
	 * @name Sirena#getCategories
	 * 
	 */
	Sirena.prototype.getCategories = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/leads/categories';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};
	/**
	 * Returns information about the applicable defaults for lead creation. These defaults are only used if no value is specified when creating a lead. The response includes the default currency and category (by industry). Note that the default category can also be found using the Categories endpoint.
	 * @method
	 * @name Sirena#getDefaults
	 * 
	 */
	Sirena.prototype.getDefaults = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/leads/defaults';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};
	/**
	 * Returns a filterable list of prospects
	 * @method
	 * @name Sirena#getProspects
	 * @param {string} search - A search string to filter prospects. It can be a phone number, an email address or a name.
	 * @param {string} category - The category to filter prospects
	 * @param {string} status - The status to filter prospects
	 * @param {string} agent - The id of an agent to filter prospects
	 * @param {string} start - The start date to filter prospects by their creation date
	 * @param {string} end - The end date to filter prospects by their creation date
	 * @param {string} format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
	 * 
	 */
	Sirena.prototype.getProspects = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/prospects';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		if (parameters['search'] !== undefined) {
			queryParameters['search'] = parameters['search'];
		}

		if (parameters['category'] !== undefined) {
			queryParameters['category'] = parameters['category'];
		}

		if (parameters['status'] !== undefined) {
			queryParameters['status'] = parameters['status'];
		}

		if (parameters['agent'] !== undefined) {
			queryParameters['agent'] = parameters['agent'];
		}

		if (parameters['start'] !== undefined) {
			queryParameters['start'] = parameters['start'];
		}

		if (parameters['end'] !== undefined) {
			queryParameters['end'] = parameters['end'];
		}

		if (parameters['format'] !== undefined) {
			queryParameters['format'] = parameters['format'];
		}

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};
	/**
	 * Returns an specific prospect by its ID
	 * @method
	 * @name Sirena#getProspectById
	 * @param {string} prospectId - The id of the prospect
	 * @param {string} format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
	 * 
	 */
	Sirena.prototype.getProspectById = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/prospect/{prospectId}';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		path = path.replace('{prospectId}', parameters['prospectId']);

		if (parameters['prospectId'] === undefined) {
			deferred.reject(new Error('Missing required  parameter: prospectId'));
			return deferred.promise;
		}

		if (parameters['format'] !== undefined) {
			queryParameters['format'] = parameters['format'];
		}

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};
	/**
	 * Delete a prospect
	 * @method
	 * @name Sirena#deleteProspect
	 * @param {string} prospectId - The id of the prospect
	 * @param {string} format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
	 * 
	 */
	Sirena.prototype.deleteProspect = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/prospect/{prospectId}';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		path = path.replace('{prospectId}', parameters['prospectId']);

		if (parameters['prospectId'] === undefined) {
			deferred.reject(new Error('Missing required  parameter: prospectId'));
			return deferred.promise;
		}

		if (parameters['format'] !== undefined) {
			queryParameters['format'] = parameters['format'];
		}

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('DELETE', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};
	/**
	 * Returns a filterable list of interactions related to a prospect
	 * @method
	 * @name Sirena#getProspectInteractions
	 * @param {string} status - The status to filter interactions
	 * @param {string} start - The start date to filter interactions by their creation date
	 * @param {string} end - The end date to filter interactions by their creation date
	 * @param {string} prospectId - The id of the prospect
	 * @param {string} format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
	 * 
	 */
	Sirena.prototype.getProspectInteractions = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/prospect/{prospectId}/interactions';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		if (parameters['status'] !== undefined) {
			queryParameters['status'] = parameters['status'];
		}

		if (parameters['start'] !== undefined) {
			queryParameters['start'] = parameters['start'];
		}

		if (parameters['end'] !== undefined) {
			queryParameters['end'] = parameters['end'];
		}

		path = path.replace('{prospectId}', parameters['prospectId']);

		if (parameters['prospectId'] === undefined) {
			deferred.reject(new Error('Missing required  parameter: prospectId'));
			return deferred.promise;
		}

		if (parameters['format'] !== undefined) {
			queryParameters['format'] = parameters['format'];
		}

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};
	/**
	 * Returns an interaction by its prospect and interaction IDs
	 * @method
	 * @name Sirena#getInteractionById
	 * @param {string} prospectId - The id of the prospect
	 * @param {string} interactionId - The id of the interaction
	 * @param {string} format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
	 * 
	 */
	Sirena.prototype.getInteractionById = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/prospect/{prospectId}/interaction/{interactionId}';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		path = path.replace('{prospectId}', parameters['prospectId']);

		if (parameters['prospectId'] === undefined) {
			deferred.reject(new Error('Missing required  parameter: prospectId'));
			return deferred.promise;
		}

		path = path.replace('{interactionId}', parameters['interactionId']);

		if (parameters['interactionId'] === undefined) {
			deferred.reject(new Error('Missing required  parameter: interactionId'));
			return deferred.promise;
		}

		if (parameters['format'] !== undefined) {
			queryParameters['format'] = parameters['format'];
		}

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};
	/**
	 * Returns a filterable list of interactions
	 * @method
	 * @name Sirena#getInteractions
	 * @param {string} agent - The id of the agent to filter
	 * @param {string} status - The status to filter
	 * @param {string} start - The start date to filter interactions by their creation date
	 * @param {string} end - The end date to filter interactions by their creation date
	 * @param {string} format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
	 * 
	 */
	Sirena.prototype.getInteractions = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/prospects/interactions';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		if (parameters['agent'] !== undefined) {
			queryParameters['agent'] = parameters['agent'];
		}

		if (parameters['status'] !== undefined) {
			queryParameters['status'] = parameters['status'];
		}

		if (parameters['start'] !== undefined) {
			queryParameters['start'] = parameters['start'];
		}

		if (parameters['end'] !== undefined) {
			queryParameters['end'] = parameters['end'];
		}

		if (parameters['format'] !== undefined) {
			queryParameters['format'] = parameters['format'];
		}

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};
	/**
	 * Returns information about the available notification topics. Topics can be subscribed to using Subscriptions.
	 * @method
	 * @name Sirena#getTopics
	 * @param {string} format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
	 * 
	 */
	Sirena.prototype.getTopics = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/notifications/topics';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		if (parameters['format'] !== undefined) {
			queryParameters['format'] = parameters['format'];
		}

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};
	/**
	 * Returns the list of active subscriptions. Note that subscriptions are currently limited to one per group.
	 * @method
	 * @name Sirena#getActiveSubscriptions
	 * @param {string} format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
	 * 
	 */
	Sirena.prototype.getActiveSubscriptions = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/notifications/subscriptions';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		if (parameters['format'] !== undefined) {
			queryParameters['format'] = parameters['format'];
		}

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};
	/**
	 * Subscribe to notification topics. Note that subscriptions are currently limited to one per group, and subscribing twice will result in the first subscription being deactivated.
	 * @method
	 * @name Sirena#newSubscription
	 * @param {} subscription - Sirena API for lead providers and prospect data manipulation
	 * @param {string} format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
	 * 
	 */
	Sirena.prototype.newSubscription = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/notifications/subscriptions';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		if (parameters['subscription'] !== undefined) {
			body = parameters['subscription'];
		}

		if (parameters['subscription'] === undefined) {
			deferred.reject(new Error('Missing required  parameter: subscription'));
			return deferred.promise;
		}

		if (parameters['format'] !== undefined) {
			queryParameters['format'] = parameters['format'];
		}

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};
	/**
	 * Returns an active notification subscription by its ID
	 * @method
	 * @name Sirena#getActiveSubscriptionById
	 * @param {string} subscriptionId - The id of the subscription
	 * @param {string} format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
	 * 
	 */
	Sirena.prototype.getActiveSubscriptionById = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/notifications/subscription/{subscriptionId}';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		path = path.replace('{subscriptionId}', parameters['subscriptionId']);

		if (parameters['subscriptionId'] === undefined) {
			deferred.reject(new Error('Missing required  parameter: subscriptionId'));
			return deferred.promise;
		}

		if (parameters['format'] !== undefined) {
			queryParameters['format'] = parameters['format'];
		}

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};
	/**
	 * Deactivates a subscription by its ID
	 * @method
	 * @name Sirena#deactivateSubscription
	 * @param {string} subscriptionId - The id of the subscription
	 * @param {string} format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
	 * 
	 */
	Sirena.prototype.deactivateSubscription = function(parameters) {
		if (parameters === undefined) {
			parameters = {};
		}
		var deferred = Q.defer();

		var domain = this.domain;
		var path = '/notifications/subscription/{subscriptionId}';

		var body;
		var queryParameters = {};
		var headers = {};
		var form = {};

		if (this.token.isQuery) {
			queryParameters[this.token.headerOrQueryName] = this.token.value;
		} else if (this.token.headerOrQueryName) {
			headers[this.token.headerOrQueryName] = this.token.value;
		} else {
			headers['Authorization'] = 'Bearer ' + this.token.value;
		}

		headers['Content-Type'] = ['application/json'];

		path = path.replace('{subscriptionId}', parameters['subscriptionId']);

		if (parameters['subscriptionId'] === undefined) {
			deferred.reject(new Error('Missing required  parameter: subscriptionId'));
			return deferred.promise;
		}

		if (parameters['format'] !== undefined) {
			queryParameters['format'] = parameters['format'];
		}

		if (parameters.$queryParameters) {
			Object.keys(parameters.$queryParameters)
				.forEach(function(parameterName) {
					var parameter = parameters.$queryParameters[parameterName];
					queryParameters[parameterName] = parameter;
				});
		}

		this.request('DELETE', domain + path, parameters, body, headers, queryParameters, form, deferred);

		return deferred.promise;
	};

	return Sirena;
})();

module.exports = Sirena;
