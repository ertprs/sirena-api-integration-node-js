Sirena Api Integration for Node JS
===============

This NPM module allows a simple integration with the Sirena API.

You need a Sirena API Key to use this module.

## Getting started

Install the module in your app:

```js
npm install sirena-api-integration-node-js --save
```

Require the module in your app

```js
var Sirena = require('sirena-api-integration-node-js');
```


Create a new instance of the Sirena class, passing an object with options:

```js
var api = new Sirena(options);
```

The options are: 

|   Name        |    Type       |    Description    |
| ------------- | ------------- | ----------------- |
| apiKey        | string        |   **Required.** The API Key provided by Sirena |
| isQuery       | boolean       |   If `true`, sends the token as query param, otherwise, send as header param |
| apiUrl       | boolean       |   Specifies the URL of the API. **Default: `http://api.getsirena.com/v1`**. 
You can change this when developing, to see if the integration you are settings is ok |


#### Example

```js
var options = {
    apiKey: 'YOUR_SIRENA_API_KEY'
}
var api = new Sirena(options);

```


## Use

Once you have initialized the module with the correct options, you can access all the methods in the API through the object where you called the new instance of this module. 

Each method makes the request to the API for you, and returns a ["Q" Promise](https://github.com/kriskowal/q), that you can handle to access the request response. 

#### Example

```js
// Get all the Active Subscriptions in Sirena
api.getActiveSubscriptions()
        .then(function(response) {
            console.log('API response:', response);
        }, function(errorReason) {
            console.log('Error reason:', errorReason.body);
        })
        .catch(function(error) {
            // Handle any error
            console.log('Error :(', error);
        })
        .done();
```


To check all the methods with the API and all the parameters you need for each of them, just [enter here](http://api.getsirena.com)





