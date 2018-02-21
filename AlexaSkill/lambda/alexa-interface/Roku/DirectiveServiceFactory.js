var Alexa = require('alexa-sdk');

var enqueueFactory = function (event, message) {
    var requestId = event.request.requestId;
    var token = event.context.System.apiAccessToken;
    var endpoint = event.context.System.apiEndpoint;
    var ds = new Alexa.services.DirectiveService();

    var directive = new Alexa.directives.VoicePlayerSpeakDirective(requestId, message);
        const progressiveResponse = ds.enqueue(directive, endpoint, token)
        .catch((err) => {
            // catch API errors so skill processing an continue
        });
    return directive;
}

module.exports = {enqueue: enqueueFactory};