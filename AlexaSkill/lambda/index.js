"use strict"

var constants = require('./helpers').constants;
var rokuService = require('./services/rokuHttpService');

var rokuIntents = require('./Roku/rokuIntents');
var Alexa = require('alexa-sdk');


exports.handler = function (event, context, callback) {

  var alexa = Alexa.handler(event, context);
  alexa.appId = constants.appId;
  alexa.dynamoDBTableName = 'MyRokuRemoteSession';
  
  var intents = new rokuIntents({rokuService: rokuService, logger: console});

  var intentHandlers = {
    // "this" is going to be an instance of  alexa-sdk's alexaRequestHandler.
    // I pass it into my intent handlers so I can keep them seperated.
    // This enables me to unit test the handlers without mocking a ton
    // of the alexa-sdk infrastructure.
    'NewSession': function () { intents.newSessionIntent(this); },
    'SelectRokuIntent': function () { intents.selectRokuIntent(this); },
    'SelectedRokuIntent': function () { intents.selectedRokuIntent(this); },
    'SendCommandIntent': function () { intents.sendCommandIntent(this); },
    'TypeTextIntent': function () { intents.typeTextIntent(this); },
    'LaunchAppIntent': function () { intents.launchAppIntent(this); },
    'ListRokusIntent': function () { intents.listRokusIntent(this); },
    'AMAZON.HelpIntent': function () { intents.helpIntent(this); },
    'AMAZON.StopIntent': function () { intents.cancelIntent(this); },
    'AMAZON.CancelIntent': function () { intents.cancelIntent(this); }
  };

  alexa.registerHandlers(intentHandlers);
  alexa.execute();

};

