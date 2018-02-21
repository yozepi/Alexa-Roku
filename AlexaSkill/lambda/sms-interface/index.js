"use strict"

var rokuService = require('shared-services').roku.rokuHttpService;
var MessageHandler = require('./snsHandler').default;

exports.handler = (event, context, callback) => {
    var handler = new MessageHandler({rokuService: rokuService, logger: console});
    var msg = event.Records[0].Sns;
    handler.handleMessage(msg, callback);
};