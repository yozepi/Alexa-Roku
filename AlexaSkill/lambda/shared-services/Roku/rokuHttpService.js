'use strict';

require('dotenv').config();
var request = require('request-promise');
var Promise = require('promise');

//This is the "real" implementation of the service that 
//Calls the API hosted in my house.

//Lists the Rokus on my local network.
var listRokus = function () {

    var uri = getBaseUrl();

    return makeRequest(uri, function (result) {
        return result;
    });

};

//Send a command to a Roku.
var sendCommand = function (options) {
    var cmd = options.executionCommand;
    var count = options.executionCount;
    var rokuId = options.rokuId;

    var uri = getBaseUrl() + '/' + rokuId + '/send/' + cmd;
    if (count) {
        uri += '/' + count;
    }

    return makeRequest(uri, function (result) {
        return true;
    });
};

//Send literal text to a Roku.
var sendText = function (options) {
    var text = options.text ? encodeURIComponent(options.text) : '';
    var rokuId = options.rokuId;

    var uri = getBaseUrl() + '/' + rokuId + '/type?text=' + text;

    return makeRequest(uri, function (result) {
        return true;
    });
};

//Invoke a Roku search.
var search = function (options) {
    var text = options.text ? encodeURIComponent(options.text) : '';
    var rokuId = options.rokuId;

    var uri = getBaseUrl() + '/' + rokuId + '/search?text=' + text;

    return makeRequest(uri, function (result) {
        return true;
    });
};

//Launch an app.
var launchApp = function (options) {
    var callback = options.callback;
    var filter = options.filter ? encodeURIComponent(options.filter) : '';
    var rokuId = options.rokuId;

    var uri = getBaseUrl() + '/' + rokuId + '/apps/launch?filter=' + filter;

    return makeRequest(uri, function (result) {
        return result;
    });
};

//Shared method for all requests.
//TODO: Authorization
var makeRequest = function (url, whenDone) {
    return new Promise(function (resolve, reject) {
        request({
            method: 'GET',
            uri: url,
            json: true,
            headers: {
                'User-Agent': 'Roku Alexa Lambda'
            }
        }).then((result) => {
            try {
                var retVal = whenDone(result);
                resolve(retVal);
            } catch (err) {
                throw err;
            }
        }).catch(function (err) {
            if (err.error) {
                reject(err.error);
            }
            else {
                reject(err);
            }
        });
    });
};


var getBaseUrl = function () {
    //Eventually I want to connect a user to their "home" api server via an Amazon account.
    //But since I'm the only one using this right now I hard wired it to my home IP.
    var url = 'http://' + process.env.SERVICE_HOST + '/api/rokus';
    return url;
};

module.exports = {
    listRokus: listRokus,
    sendCommand: sendCommand,
    sendText: sendText,
    search: search,
    launchApp: launchApp
};