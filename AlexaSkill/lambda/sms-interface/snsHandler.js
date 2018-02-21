"use strict"

var snsHandler = function (options) {
    var rokuService = options.rokuService;
    var logger = options.logger;

    var sendCommand = function (options) {
        var promise = rokuService.sendCommand(options)
            .then(function (success) {
                if (!success) {
                    //Service returned false??
                    throw 'Unable to send command.';
                }
            });

        return promise;
    };

    this.handleMessage = function (msg, callback) {
        try {
            var payload = JSON.parse(msg.Message);
            var action = payload.action;
            var promise;
            switch (action) {
                case 'command':
                    var options = payload.options;
                    logger.log("Send Command: " + options.executionCommand + ", Count: " + options.executionCount + ", Roku ID: " + options.rokuId)
                    promise = rokuService.sendCommand(options);
                    break;

                default:
                    logger.error('Unknown action: "' + action + '" message:\n' + msg.Message);
            }

            if (promise) {
                promise.then((data) => callback(null, "success"))
                    .catch((err) => {
                        logger.error(err);
                        callback(err);
                    });
            }

        } catch (err) {
            logger.error(err);
            logger.error(msg);
            throw err;
        }
    }
};


export default snsHandler;