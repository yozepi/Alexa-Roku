var Promise = require('promise');

"use strict"

//A mocking stub for the Roku Service.
var stub = function (options) {
    var returnVal;
    var error;
    var callback;

    if (options) {
        if (typeof options === 'object') {
            returnVal = options.returnVal;
            error = options.error;
            callback = options.callback;
        }
        else {
            returnVal = options;
        }
    }

    this.listRokus = function () {
        return MakePromise();
    };

    this.sendCommand = function (options) {
        return MakePromise(options);
    };

    this.sendText = function (options) {
        return MakePromise(options);
    };

    this.search = function (options) {
        return MakePromise(options);
    };

    this.launchApp = function (options) {
        return MakePromise(options);
    };

    var MakePromise = function (options) {
        if (callback) {
            callback(options);
        }
        var promise = new Promise(function (resolve, reject) {
            if (error) reject(error);
            else resolve(returnVal);
        });
        return promise;
    };
};

module.exports = stub;