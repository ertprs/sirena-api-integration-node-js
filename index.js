/*jshint -W069 */
/**
 * Sirena API for lead providers and prospect data manipulation.
 * @class Sirena
 * @param {(string|object)} [domainOrOptions] - The project domain or options object. If object, see the object's optional properties.
 * @param {string} [domainOrOptions.domain] - The project domain
 * @param {object} [domainOrOptions.token] - auth token - object with value property and optional headerOrQueryName and isQuery properties
 */
var Sirena = (function() {
    'use strict';

    var request = require('request');
    var Q = require('q');

	function Sirena(options, debug) {
        if (!options) {
            throw new Error('An options object parameter is necessary to use the Sirena API Module.');
        }

        if (!options.apiKey || typeof options.apiKey !== 'string') {
            throw new Error('An API Key string parameter is necessary to connect with the Sirena API.');
        }

        this.domain = options.apiUrl || 'https://api.getsirena.com/v1';
        this.token = {
            value: options.apiKey,
            isQuery: options.isQuery || true,
            headerOrQueryName: 'api-key'
        };
        this.apiKey = {
            value: options.apiKey,
            isQuery: options.isQuery || true,
            headerOrQueryName: 'api-key'
        };

        if (debug) {
            console.log('\nSirena API Module has been set up.\n- API URL: ' + this.domain + '\n- API Key: ' + this.token.value + '\n');
        }
    }


    function mergeQueryParams(parameters, queryParameters) {
        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                .forEach(function(parameterName) {
                    var parameter = parameters.$queryParameters[parameterName];
                    queryParameters[parameterName] = parameter;
                });
        }
        return queryParameters;
    }

    /**
     * HTTP Request
     * @method
     * @name Sirena#request
     * @param {string} method - http method
     * @param {string} url - url to do request
     * @param {object} parameters
     * @param {object} body - body parameters / object
     * @param {object} headers - header parameters
     * @param {object} queryParameters - querystring parameters
     * @param {object} form - form data object
     * @param {object} deferred - promise object
     */
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
     */
    Sirena.prototype.setToken = function(value, headerOrQueryName, isQuery) {
        this.token.value = value;
        this.token.headerOrQueryName = headerOrQueryName;
        this.token.isQuery = isQuery;
    };
    /**
     * Set Api Key
     * @method
     * @name Sirena#setApiKey
     * @param {string} value - apiKey's value
     * @param {string} headerOrQueryName - the header or query name to send the apiKey at
     * @param {boolean} isQuery - true if send the apiKey as query param, otherwise, send as header param
     */
    Sirena.prototype.setApiKey = function(value, headerOrQueryName, isQuery) {
        this.apiKey.value = value;
        this.apiKey.headerOrQueryName = headerOrQueryName;
        this.apiKey.isQuery = isQuery;
    };
    /**
     * Set Auth headers
     * @method
     * @name Sirena#setAuthHeaders
     * @param {object} queryParams - headers object
     */
    Sirena.prototype.setAuthQueries = function(queryParams) {
        var queries = queryParams ? queryParams : {};
        if (this.token.isQuery && this.token.headerOrQueryName) {
            queries[this.token.headerOrQueryName] = this.token.value;
        }
        if (this.apiKey.isQuery && this.apiKey.headerOrQueryName) {
            queries[this.apiKey.headerOrQueryName] = this.apiKey.value;
        }
        return queries;
    };
    /**
     * Set Auth headers
     * @method
     * @name Sirena#setAuthHeaders
     * @param {object} headerParams - headers object
     */
    Sirena.prototype.setAuthHeaders = function(headerParams) {
        var headers = headerParams ? headerParams : {};
        if (!this.token.isQuery) {
            if (this.token.headerOrQueryName) {
                headers[this.token.headerOrQueryName] = this.token.value;
            } else if (this.token.value) {
                headers['Authorization'] = 'Bearer ' + this.token.value;
            }
        }
        if (!this.apiKey.isQuery && this.apiKey.headerOrQueryName) {
            headers[this.apiKey.headerOrQueryName] = this.apiKey.value;
        }
        return headers;
    };

    /**
     * Check if API Key exists and if it is enabled.
     * @method
     * @name Sirena#checkCredentials
     * @param {object} parameters - method options and parameters
     * @param {string} parameters.apiKey - API Key to check.
     */
    Sirena.prototype.checkCredentials = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/checkCredentials';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        if (parameters['apiKey'] !== undefined) {
            queryParameters['api-key'] = parameters['apiKey'];
        }

        if (parameters['apiKey'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: apiKey'));
            return deferred.promise;
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Processes lead data and returns the matching prospect. If the prospect already exists, previous lead data will not be returned.
     * @method
     * @name Sirena#newRetailLead
     * @param {object} parameters - method options and parameters
     * @param {} parameters.lead - Sirena API for lead providers and prospect data manipulation.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.newRetailLead = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/lead/retail';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
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

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Processes lead data and returns the matching prospect. If the prospect already exists, previous lead data will not be returned.
     * @method
     * @name Sirena#newInsuranceLead
     * @param {object} parameters - method options and parameters
     * @param {} parameters.lead - Sirena API for lead providers and prospect data manipulation.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.newInsuranceLead = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/lead/insurance';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
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

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Vehicle industry only. Processes lead data and returns the matching prospect. If the prospect already exists, previous lead data will not be returned.
     * @method
     * @name Sirena#newVehicleLead
     * @param {object} parameters - method options and parameters
     * @param {} parameters.lead - Sirena API for lead providers and prospect data manipulation.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.newVehicleLead = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/lead/vehicle';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
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

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Saving plan industry only. Processes lead data and returns the matching prospect. If the prospect already exists, previous lead data will not be returned.
     * @method
     * @name Sirena#newSavingPlanLead
     * @param {object} parameters - method options and parameters
     * @param {} parameters.lead - Sirena API for lead providers and prospect data manipulation.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.newSavingPlanLead = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/lead/saving-plan';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
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

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Saving real estate indrustry only. Processes lead data and returns the matching prospect. If the prospect already exists, previous lead data will not be returned.
     * @method
     * @name Sirena#newRealEstateLead
     * @param {object} parameters - method options and parameters
     * @param {} parameters.lead - Sirena API for lead providers and prospect data manipulation.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.newRealEstateLead = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/lead/real-estate';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
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

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns information about the lead categories available for lead creation. Note that groups can define custom rules as to when a category is valid for a given lead or not.
     * @method
     * @name Sirena#getCategories
     * @param {object} parameters - method options and parameters
     */
    Sirena.prototype.getCategories = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/leads/categories';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns information about the applicable defaults for lead creation. These defaults are only used if no value is specified when creating a lead. The response includes the default currency and distance unit.
     * @method
     * @name Sirena#getDefaults
     * @param {object} parameters - method options and parameters
     */
    Sirena.prototype.getDefaults = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/leads/defaults';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns a filterable list of prospects.
     * @method
     * @name Sirena#getProspects
     * @param {object} parameters - method options and parameters
         * @param {string} parameters.before - Limits the results only to the prospects created before the one provided in this parameter (not included)
         * @param {string} parameters.after - Limits the results only to the prospects created after the one provided in this parameter (not included)
         * @param {number} parameters.limit - The maximum number of items that must be returned (A multiple number of 100 and no more than 1000 is recommended)
         * @param {string} parameters.search - A search string to filter prospects. It can be a phone number, an email address or a name.
         * @param {string} parameters.category - The category to filter prospects.
         * @param {string} parameters.status - The status to filter prospects.
         * @param {string} parameters.agent - The id of an agent to filter prospects
         * @param {string} parameters.createdAfter - The start date to filter prospects by their creation date
         * @param {string} parameters.start - @deprecated - use createdAfter
    The start date to filter prospects by their creation date (alias of createdAfter).

         * @param {string} parameters.createdBefore - The end date to filter prospects by their creation date.
         * @param {string} parameters.end - @deprecated - use createdBefore
    The end date to filter prospects by their creation date (alias of createdBefore).

         * @param {string} parameters.claimedAfter - The start date to filter prospects by their claim date.
         * @param {string} parameters.claimStart - The start date to filter prospects by their claim date (alias of claimAfter).
         * @param {string} parameters.claimedBefore - The end date to filter prospects by their claim date.
         * @param {string} parameters.claimEnd - The end date to filter prospects by their claim date (alias of claimBefore).
         * @param {string} parameters.group - The id of a group to filter prospects
         * @param {array} parameters.additionalData - List of filters for additionalData on format `[FIELD][OPERATOR][VALUE]`.
    * FIELD: Can be any additional data field
    * OPERATOR: Can be =, >=, >, <=, < or ~ (contains)
    * VALUE\: Any string

    `/prospects?api-key{API_KEY}&additionalData[]=finance=1`
    Filter all prospect that have additionalData.finance and is equal to `1`.

    `/prospects?api-key{API_KEY}&additionalData[]=birthdate<01/01/2000&additionalData[]=birthdate>=01/01/1990`
    Filter all prospect that have additionalData.birthdate, is greater or equal than `01/01/1990` and lower than `01/01/2000`.


    `/prospects?api-key{API_KEY}&additionalData[]=style~blue`
    Filter all prospect that have additionalData.style and contains `blue` string.

         * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.getProspects = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/prospects';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        if (parameters['before'] !== undefined) {
            queryParameters['before'] = parameters['before'];
        }

        if (parameters['after'] !== undefined) {
            queryParameters['after'] = parameters['after'];
        }

        if (parameters['limit'] !== undefined) {
            queryParameters['limit'] = parameters['limit'];
        }

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

        if (parameters['createdAfter'] !== undefined) {
            queryParameters['createdAfter'] = parameters['createdAfter'];
        }

        if (parameters['start'] !== undefined) {
            queryParameters['start'] = parameters['start'];
        }

        if (parameters['createdBefore'] !== undefined) {
            queryParameters['createdBefore'] = parameters['createdBefore'];
        }

        if (parameters['end'] !== undefined) {
            queryParameters['end'] = parameters['end'];
        }

        if (parameters['claimedAfter'] !== undefined) {
            queryParameters['claimedAfter'] = parameters['claimedAfter'];
        }

        if (parameters['claimStart'] !== undefined) {
            queryParameters['claimStart'] = parameters['claimStart'];
        }

        if (parameters['claimedBefore'] !== undefined) {
            queryParameters['claimedBefore'] = parameters['claimedBefore'];
        }

        if (parameters['claimEnd'] !== undefined) {
            queryParameters['claimEnd'] = parameters['claimEnd'];
        }

        if (parameters['group'] !== undefined) {
            queryParameters['group'] = parameters['group'];
        }

        if (parameters['additionalData'] !== undefined) {
            queryParameters['additionalData'] = parameters['additionalData'];
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns an specific prospect by its ID.
     * @method
     * @name Sirena#getProspectById
     * @param {object} parameters - method options and parameters
     * @param {string} parameters.prospectId - The id of the prospect.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.getProspectById = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/prospect/{prospectId}';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        path = path.replace('{prospectId}', parameters['prospectId']);

        if (parameters['prospectId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: prospectId'));
            return deferred.promise;
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Delete a prospect.
     * @method
     * @name Sirena#deleteProspect
     * @param {object} parameters - method options and parameters
     * @param {string} parameters.prospectId - The id of the prospect.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.deleteProspect = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/prospect/{prospectId}';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        path = path.replace('{prospectId}', parameters['prospectId']);

        if (parameters['prospectId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: prospectId'));
            return deferred.promise;
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('DELETE', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns a filterable list of interactions related to a prospect.
     * @method
     * @name Sirena#getProspectInteractions
     * @param {object} parameters - method options and parameters
         * @param {string} parameters.status - The status to filter interactions.
         * @param {string} parameters.createdAfter - The start date to filter interactions by their creation date.
         * @param {string} parameters.start - @deprecated - use createdAfter
    The start date to filter interactions by their creation date (alias of createdAfter).

         * @param {string} parameters.createdBefore - The end date to filter interactions by their creation date.
         * @param {string} parameters.end - @deprecated - use createdBefore
    The end date to filter interactions by their creation date (alias of createdBefore).

         * @param {array} parameters.via - Sirena API for lead providers and prospect data manipulation.
         * @param {string} parameters.prospectId - The id of the prospect.
         * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.getProspectInteractions = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/prospect/{prospectId}/interactions';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        if (parameters['status'] !== undefined) {
            queryParameters['status'] = parameters['status'];
        }

        if (parameters['createdAfter'] !== undefined) {
            queryParameters['createdAfter'] = parameters['createdAfter'];
        }

        if (parameters['start'] !== undefined) {
            queryParameters['start'] = parameters['start'];
        }

        if (parameters['createdBefore'] !== undefined) {
            queryParameters['createdBefore'] = parameters['createdBefore'];
        }

        if (parameters['end'] !== undefined) {
            queryParameters['end'] = parameters['end'];
        }

        if (parameters['via'] !== undefined) {
            queryParameters['via'] = parameters['via'];
        }

        path = path.replace('{prospectId}', parameters['prospectId']);

        if (parameters['prospectId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: prospectId'));
            return deferred.promise;
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns an interaction by its prospect and interaction IDs.
     * @method
     * @name Sirena#getInteractionById
     * @param {object} parameters - method options and parameters
     * @param {string} parameters.prospectId - The id of the prospect.
     * @param {string} parameters.interactionId - The id of the interaction.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.getInteractionById = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/prospect/{prospectId}/interaction/{interactionId}';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
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

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns a filterable list of interactions.
     * @method
     * @name Sirena#getInteractions
     * @param {object} parameters - method options and parameters
         * @param {string} parameters.before - Limits the results only to the prospects created before the one provided in this parameter (not included)
         * @param {string} parameters.after - Limits the results only to the prospects created after the one provided in this parameter (not included)
         * @param {number} parameters.limit - The maximum number of items that must be returned (A multiple number of 100 and no more than 1000 is recommended)
         * @param {string} parameters.agent - The id of the agent to filter.
         * @param {string} parameters.status - The status to filter.
         * @param {string} parameters.createdAfter - The start date to filter interactions by their creation date.
         * @param {string} parameters.start - @deprecated - use createdAfter
    The start date to filter interactions by their creation date (alias of createdAfter).

         * @param {string} parameters.createdBefore - The end date to filter interactions by their creation date.
         * @param {string} parameters.end - @deprecated - use createdBefore
    The end date to filter interactions by their creation date (alias of createdBefore).

         * @param {array} parameters.via - Sirena API for lead providers and prospect data manipulation.
         * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.getInteractions = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/prospects/interactions';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        if (parameters['before'] !== undefined) {
            queryParameters['before'] = parameters['before'];
        }

        if (parameters['after'] !== undefined) {
            queryParameters['after'] = parameters['after'];
        }

        if (parameters['limit'] !== undefined) {
            queryParameters['limit'] = parameters['limit'];
        }

        if (parameters['agent'] !== undefined) {
            queryParameters['agent'] = parameters['agent'];
        }

        if (parameters['status'] !== undefined) {
            queryParameters['status'] = parameters['status'];
        }

        if (parameters['createdAfter'] !== undefined) {
            queryParameters['createdAfter'] = parameters['createdAfter'];
        }

        if (parameters['start'] !== undefined) {
            queryParameters['start'] = parameters['start'];
        }

        if (parameters['createdBefore'] !== undefined) {
            queryParameters['createdBefore'] = parameters['createdBefore'];
        }

        if (parameters['end'] !== undefined) {
            queryParameters['end'] = parameters['end'];
        }

        if (parameters['via'] !== undefined) {
            queryParameters['via'] = parameters['via'];
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns a filterable list of quotes related to a prospect.
     * @method
     * @name Sirena#getProspectQuotes
     * @param {object} parameters - method options and parameters
     * @param {string} parameters.status - The status to filter.
     * @param {string} parameters.createdBefore - The start date to filter quotes by their creation date.
     * @param {string} parameters.createdAfter - The end date to filter quotes by their creation date.
     * @param {string} parameters.acceptedBefore - The start date to filter quotes by their accepted date.
     * @param {string} parameters.acceptedAfter - The end date to filter quotes by their accepted date.
     * @param {string} parameters.rejectedBefore - The start date to filter quotes by their rejected date.
     * @param {string} parameters.rejectedAfter - The end date to filter quotes by their rejected date.
     * @param {string} parameters.prospectId - The id of the prospect.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.getProspectQuotes = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/prospect/{prospectId}/quotes';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        if (parameters['status'] !== undefined) {
            queryParameters['status'] = parameters['status'];
        }

        if (parameters['createdBefore'] !== undefined) {
            queryParameters['createdBefore'] = parameters['createdBefore'];
        }

        if (parameters['createdAfter'] !== undefined) {
            queryParameters['createdAfter'] = parameters['createdAfter'];
        }

        if (parameters['acceptedBefore'] !== undefined) {
            queryParameters['acceptedBefore'] = parameters['acceptedBefore'];
        }

        if (parameters['acceptedAfter'] !== undefined) {
            queryParameters['acceptedAfter'] = parameters['acceptedAfter'];
        }

        if (parameters['rejectedBefore'] !== undefined) {
            queryParameters['rejectedBefore'] = parameters['rejectedBefore'];
        }

        if (parameters['rejectedAfter'] !== undefined) {
            queryParameters['rejectedAfter'] = parameters['rejectedAfter'];
        }

        path = path.replace('{prospectId}', parameters['prospectId']);

        if (parameters['prospectId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: prospectId'));
            return deferred.promise;
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Create quote for prospect.
     * @method
     * @name Sirena#newProspectQuote
     * @param {object} parameters - method options and parameters
     * @param {} parameters.quote - Sirena API for lead providers and prospect data manipulation.
     * @param {string} parameters.prospectId - The id of the prospect.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.newProspectQuote = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/prospect/{prospectId}/quotes';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        if (parameters['quote'] !== undefined) {
            body = parameters['quote'];
        }

        if (parameters['quote'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: quote'));
            return deferred.promise;
        }

        path = path.replace('{prospectId}', parameters['prospectId']);

        if (parameters['prospectId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: prospectId'));
            return deferred.promise;
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns a quote by its prospect and quote IDs.
     * @method
     * @name Sirena#getQuoteById
     * @param {object} parameters - method options and parameters
     * @param {string} parameters.prospectId - The id of the prospect.
     * @param {string} parameters.quoteId - The id of the quote.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.getQuoteById = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/prospect/{prospectId}/quote/{quoteId}';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        path = path.replace('{prospectId}', parameters['prospectId']);

        if (parameters['prospectId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: prospectId'));
            return deferred.promise;
        }

        path = path.replace('{quoteId}', parameters['quoteId']);

        if (parameters['quoteId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: quoteId'));
            return deferred.promise;
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Update quote for prospect by prospect and quote IDs.
     * @method
     * @name Sirena#updateProspectQuote
     * @param {object} parameters - method options and parameters
     * @param {} parameters.quote - Sirena API for lead providers and prospect data manipulation.
     * @param {string} parameters.prospectId - The id of the prospect.
     * @param {string} parameters.quoteId - The id of the quote.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.updateProspectQuote = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/prospect/{prospectId}/quote/{quoteId}';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        if (parameters['quote'] !== undefined) {
            body = parameters['quote'];
        }

        if (parameters['quote'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: quote'));
            return deferred.promise;
        }

        path = path.replace('{prospectId}', parameters['prospectId']);

        if (parameters['prospectId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: prospectId'));
            return deferred.promise;
        }

        path = path.replace('{quoteId}', parameters['quoteId']);

        if (parameters['quoteId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: quoteId'));
            return deferred.promise;
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('PUT', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns a filterable list of quotes.
     * @method
     * @name Sirena#getQuotes
     * @param {object} parameters - method options and parameters
     * @param {string} parameters.before - Limits the results only to the prospects created before the one provided in this parameter (not included)
     * @param {string} parameters.after - Limits the results only to the prospects created after the one provided in this parameter (not included)
     * @param {number} parameters.limit - The maximum number of items that must be returned (A multiple number of 100 and no more than 1000 is recommended)
     * @param {string} parameters.status - The status to filter.
     * @param {string} parameters.createdBefore - The start date to filter quotes by their creation date.
     * @param {string} parameters.createdAfter - The end date to filter quotes by their creation date.
     * @param {string} parameters.acceptedBefore - The start date to filter quotes by their accepted date.
     * @param {string} parameters.acceptedAfter - The end date to filter quotes by their accepted date.
     * @param {string} parameters.rejectedBefore - The start date to filter quotes by their rejected date.
     * @param {string} parameters.rejectedAfter - The end date to filter quotes by their rejected date.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.getQuotes = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/prospects/quotes';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        if (parameters['before'] !== undefined) {
            queryParameters['before'] = parameters['before'];
        }

        if (parameters['after'] !== undefined) {
            queryParameters['after'] = parameters['after'];
        }

        if (parameters['limit'] !== undefined) {
            queryParameters['limit'] = parameters['limit'];
        }

        if (parameters['status'] !== undefined) {
            queryParameters['status'] = parameters['status'];
        }

        if (parameters['createdBefore'] !== undefined) {
            queryParameters['createdBefore'] = parameters['createdBefore'];
        }

        if (parameters['createdAfter'] !== undefined) {
            queryParameters['createdAfter'] = parameters['createdAfter'];
        }

        if (parameters['acceptedBefore'] !== undefined) {
            queryParameters['acceptedBefore'] = parameters['acceptedBefore'];
        }

        if (parameters['acceptedAfter'] !== undefined) {
            queryParameters['acceptedAfter'] = parameters['acceptedAfter'];
        }

        if (parameters['rejectedBefore'] !== undefined) {
            queryParameters['rejectedBefore'] = parameters['rejectedBefore'];
        }

        if (parameters['rejectedAfter'] !== undefined) {
            queryParameters['rejectedAfter'] = parameters['rejectedAfter'];
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Transfer a Prospect to a group
     * @method
     * @name Sirena#transferProspect
     * @param {object} parameters - method options and parameters
     * @param {} parameters.transfer - Define the destination user or group.
     * @param {string} parameters.prospectId - The id of the prospect.
     */
    Sirena.prototype.transferProspect = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/prospect/{prospectId}/transfer';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        if (parameters['transfer'] !== undefined) {
            body = parameters['transfer'];
        }

        if (parameters['transfer'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: transfer'));
            return deferred.promise;
        }

        path = path.replace('{prospectId}', parameters['prospectId']);

        if (parameters['prospectId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: prospectId'));
            return deferred.promise;
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns information about the available notification topics. Topics can be subscribed to using Subscriptions.
     * @method
     * @name Sirena#getTopics
     * @param {object} parameters - method options and parameters
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.getTopics = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/notifications/topics';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns the list of active subscri.ptions. Note that subscriptions are currently limited to one per group.
     * @method
     * @name Sirena#getActiveSubscriptions
     * @param {object} parameters - method options and parameters
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.getActiveSubscriptions = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/notifications/subscriptions';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Subscribe to notification topics. Note that subscriptions are currently limited to one per group, and subscribing twice will result in the first subscription being deactivated.
     * @method
     * @name Sirena#newSubscription
     * @param {object} parameters - method options and parameters
     * @param {} parameters.subscription - Sirena API for lead providers and prospect data manipulation.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.newSubscription = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/notifications/subscriptions';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
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

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns an active notification subscription by its ID.
     * @method
     * @name Sirena#getActiveSubscriptionById
     * @param {object} parameters - method options and parameters
     * @param {string} parameters.subscriptionId - The id of the subscription.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.getActiveSubscriptionById = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/notifications/subscription/{subscriptionId}';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        path = path.replace('{subscriptionId}', parameters['subscriptionId']);

        if (parameters['subscriptionId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: subscriptionId'));
            return deferred.promise;
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Deactivates a subscription by its ID.
     * @method
     * @name Sirena#deactivateSubscription
     * @param {object} parameters - method options and parameters
     * @param {string} parameters.subscriptionId - The id of the subscription.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.deactivateSubscription = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/notifications/subscription/{subscriptionId}';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        path = path.replace('{subscriptionId}', parameters['subscriptionId']);

        if (parameters['subscriptionId'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: subscriptionId'));
            return deferred.promise;
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('DELETE', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns the active integration
     * @method
     * @name Sirena#getIntegrations
     * @param {object} parameters - method options and parameters
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.getIntegrations = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/integrations';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };
    /**
     * Returns the agents from group
     * @method
     * @name Sirena#getAgents
     * @param {object} parameters - method options and parameters
     * @param {string} parameters.group - The groups to get the agents.
     * @param {string} parameters.active - Status of the agent/s.
     * @param {string} parameters.format - An optional flag to force a response format. Note that the API also supports content negotiation and honors the Accept header.
     */
    Sirena.prototype.getAgents = function(parameters) {
        if (parameters === undefined) {
            parameters = {};
        }
        var deferred = Q.defer();
        var domain = this.domain,
            path = '/agents';
        var body = {},
            queryParameters = {},
            headers = {},
            form = {};

        queryParameters = this.setAuthQueries(queryParameters);
        headers = this.setAuthHeaders(headers);
        headers['Accept'] = ['application/json, text/csv, text/plain'];
        headers['Content-Type'] = ['application/json'];

        if (parameters['group'] !== undefined) {
            queryParameters['group'] = parameters['group'];
        }

        if (parameters['group'] === undefined) {
            deferred.reject(new Error('Missing required  parameter: group'));
            return deferred.promise;
        }

        if (parameters['active'] !== undefined) {
            queryParameters['active'] = parameters['active'];
        }

        if (parameters['format'] !== undefined) {
            queryParameters['format'] = parameters['format'];
        }

        queryParameters = mergeQueryParams(parameters, queryParameters);

        this.request('GET', domain + path, parameters, body, headers, queryParameters, form, deferred);

        return deferred.promise;
    };

    return Sirena;
})();

module.exports = Sirena;