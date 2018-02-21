'use strict';

require('dotenv').config();
var Promise = require('promise');
var AWS = require('aws-sdk');
AWS.config.region = process.env.REGION; //'us-west-2'

//Send a command to a Roku.
var sendCommand = function (options) {

    var msg = {
        subject: 'Roku',
        message: { action: "command", options: options }
    };

    return publishMessage(msg, function (result) {
        return true;
    });
};

var publishMessage = function (msg, whenDone) {

    //Wrap the call to SNS into a promise and return the promise.
    return new Promise(function (resolve, reject) {
        var sns = new AWS.SNS();
        sns.publish({
            Subject: msg.subject,
            Message: JSON.stringify(msg.message),
            TopicArn: process.env.TOPIC_ARN
        }, function (err, data) {
            if (err) {
                reject(err);
            }
            try {
                var retVal = whenDone(data);
                resolve(retVal);
            } catch (whenDoneErr) {
                reject(whenDoneErr);
            }
        });
    });
};

module.exports = {
    sendCommand: sendCommand
};