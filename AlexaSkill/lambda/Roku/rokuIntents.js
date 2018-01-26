'use strict';

var Promise = require('promise');
var constants = require('../helpers').constants;
var helpers = require('../helpers');
var RokuCommands = require('../Roku/RokuCommands');

/* These are the intents Alexa will call when implementing the Roku remote skill */

var intents = function (options) {
    var speachQueue = [];
    var rokuService = options.rokuService;
    var logger = options.logger;

    // A helper command to get and cache a list of roku remotes.
    // There are a few cases where an intent will pass control to another intent.
    // If both intents need the roku list then this avoids making a costly double call
    var rokus;
    var getRokus = function () {
        return new Promise(function (resolve, reject) {
            if (rokus) {
                resolve(rokus);
            }
            else {
                rokuService.listRokus()
                    .then(function (svrRokus) {
                        rokus = svrRokus;
                        resolve(rokus);
                    })
                    .catch(function (err) { reject(err); });
            }
        });
    };


    //This intent is called every time a session begins with
    //Alexa.
    this.newSessionIntent = function (alexa) {

        //"welcome..."
        speachQueue.push(constants.newSessionIntent.startupSpeech);

        if (!alexa.attributes[constants.attributes.selectedRoku]) {
            //No roku currently selected. Let's go select a Roku.
            getRokus()
                .then(function (rokus) {
                    //"here's what I can do..."
                    speachQueue.push(constants.newSessionIntent.introductorySpeech)
                    if (rokus.length > 1) {
                        //"lets pick a Roku..."
                        speachQueue.push(constants.newSessionIntent.selectRokuSpeech)
                    }
                    //Let the selectRokuIntent take over to continue selecting a Roku.
                    alexa.emitWithState(constants.intents.SelectRokuIntent)
                })
                .catch(function (err) {
                    logger.error(err);
                    //"something's broken..."
                    speachQueue.push(constants.selectRokuIntent.unableToListRokus);
                    alexa.emit(':tell', speachQueue.join(' '));
                });
        }
        else {
            //Check if the intent is one of the action intents.
            if (constants.intents[alexa.event.request.intent.name]) {
                //Let the intent take over.
                alexa.emitWithState(alexa.event.request.intent.name)
            }
            else {
                //Otherwise we're ready to begin!
                alexa.emit(':ask', speachQueue.join(' '), constants.newSessionIntent.repromptSpeech);
            }
        }
    };


    //This intent prompts the user to select a roku remote.
    this.selectRokuIntent = function (alexa) {

        getRokus()
            .then(function (rokus) {

                if (rokus.length === 0) {
                    //No rokus found on the network. Tell the caller to turn one on.
                    speachQueue.push(constants.selectRokuIntent.noRokusFoundSpeach);
                    alexa.emit(':tell', speachQueue.join(' '));
                }
                else {
                    var reprompt;

                    if (rokus.length === 1) {
                        //Only one roku in the list. We'll use it by default.
                        alexa.attributes[constants.attributes.selectedRoku] = rokus[0];
                        speachQueue.push(constants.selectRokuIntent.singleRokuFoundSpeach(rokus[0]));
                        speachQueue.push(constants.defaultRepromptSpeech);
                        reprompt = constants.defaultRepromptSpeech;
                    }
                    else {
                        //"choose one of the following Rokus..."
                        speachQueue.push(constants.selectRokuIntent.selectARokuSpeach);
                        speachQueue.push(helpers.listRokusToSpeach(rokus));

                        //instructions on how to choose a Roku.
                        reprompt = constants.selectRokuIntent.instructionSpeech(rokus);
                    }
                    alexa.emit(':ask', speachQueue.join(' '), reprompt);
                }
            })
            .catch(function (err) {
                logger.error(err);
                speachQueue.push(constants.selectRokuIntent.unableToListRokus);
                alexa.emit(':tell', speachQueue.join(' '));
            });

    };

    //This intent selects the roku the user has selected.
    //Examples:
    //  "select Roku # 2"
    //  "use my bedroom roku"
    this.selectedRokuIntent = function (alexa) {

        getRokus()
            .then(function (rokus) {

                if (rokus.length === 0) {
                    //No rokus found on the network. Tell the caller to turn one on.
                    speachQueue.push(constants.selectRokuIntent.noRokusFoundSpeach);
                    alexa.emit(':tell', speachQueue.join(' '));
                }
                else {
                    var reprompt;
                    var choice = alexa.event.request.intent.slots.choice.value
                    if (choice && isNaN(choice)) {
                        //Try to find a roku with the same name.
                        choice = choice.toLowerCase();
                        for (var i = 0; i < rokus.length; i++) {
                            if (rokus[i].name && rokus[i].name.toLowerCase() == choice) {
                                choice = i + 1; //Change to the index in the array.
                                break;
                            }
                        }
                    }
                    if (!choice || isNaN(choice) || choice < 1 || choice > rokus.length) {
                        //index is out of bounds
                        speachQueue.push(constants.selectedRokuIntent.badSelectionSpeach);
                        alexa.emitWithState(constants.intents.SelectRokuIntent);
                    }
                    else {
                        //Select the Roku
                        var roku = rokus[choice - 1];
                        alexa.attributes[constants.attributes.selectedRoku] = roku;
                        speachQueue.push(constants.selectedRokuIntent.rokuSelectedSpeach(roku));
                        reprompt = constants.defaultRepromptSpeech;
                    }
                    alexa.emit(':ask', speachQueue.join(' '), reprompt);
                }
            })
            .catch(function (err) {
                logger.error(err);
                speachQueue.push(constants.selectRokuIntent.unableToListRokus);
                alexa.emit(':tell', speachQueue.join(' '));
            });
    };

    //Sends a navigation or playback command to the Roku.
    //Examples:
    //  "Move right 2 times"
    //  "up once"
    //  "go home"
    //  "left"
    this.sendCommandIntent = function (alexa) {

        var selectedRoku = alexa.attributes[constants.attributes.selectedRoku];
        if (!selectedRoku) {
            alexa.emitWithState(constants.intents.SelectRokuIntent);
        }
        else {
            var commandSpeach = alexa.event.request.intent.slots.rokucommand.value;
            var count;
            if (alexa.event.request.intent.slots.count) {
                count = parseInt(alexa.event.request.intent.slots.count.value);
            }

            //Handle words "once" or "twice"
            if (isNaN(count)) {
                if ('once' === alexa.event.request.intent.slots.count.value) {
                    count = 1;
                } else if ('twice' === alexa.event.request.intent.slots.count.value) {
                    count = 2;
                } else {
                    count = 1; // any misunderstood word defaults to 1
                }
            }

            if (count < 1 || count > 10) {
                //"index out of bounds..."
                alexa.emit(':ask', constants.sendCommandIntent.badCountSpeach, constants.defaultRepromptSpeech);
            }
            else if (!commandSpeach) {
                //"no command..."
                alexa.emit(':ask', constants.sendCommandIntent.noCommandSentSpeach, constants.defaultRepromptSpeech);
            }
            else if (!RokuCommands[commandSpeach.toLowerCase()]) {
                //"unknown command..."
                alexa.emit(':ask', constants.sendCommandIntent.invalidCommandSpeach(commandSpeach), constants.defaultRepromptSpeech);
            }
            else {
                var cmd = RokuCommands[commandSpeach.toLowerCase()];

                //options for the service call.
                var options = {
                    rokuId: selectedRoku.id,
                    spokenCommand: commandSpeach,
                    executionCommand: cmd,
                    executionCount: count
                };

                rokuService.sendCommand(options)
                    .then(function (success) {
                        var speech;
                        if (!success) {
                            //Service returned false??
                            speech = constants.sendCommandIntent.unableToSendCommandSpeach;
                        } else {
                            //Affirm the command was sent.
                            speech = constants.sendCommandIntent.commandSentSpeach;
                        }
                        alexa.emit(':ask', speech, constants.defaultRepromptSpeech);
                    })
                    .catch(function (err) {
                        logger.error(err);
                        alexa.emit(':ask', constants.sendCommandIntent.unableToSendCommandSpeach, constants.defaultRepromptSpeech);
                    });
            }
        }
    };

    //Types the literal speech the user speaks.
    //This will have no effect on the roku if the user isn't in a screen with a text box.
    //Examples:
    //  "type 'Star Wars'"
    //  "search for 'desolation of smaug'
    this.typeTextIntent = function (alexa) {

        var selectedRoku = alexa.attributes[constants.attributes.selectedRoku];
        if (!selectedRoku) {
            alexa.emitWithState(constants.intents.SelectRokuIntent);
        }
        else {
            //Build up the text from the individual words.
            var text = helpers.concatSlots(alexa.event.request.intent.slots, 'text');

            var options = {
                rokuId: selectedRoku.id,
                text: text
            };

            rokuService.sendText(options)
                .then(function (success) {
                    if (!success) {
                        //This should never happen but...
                        alexa.emit(':ask', constants.typeTextIntent.unableToTypeSpeach(text), constants.defaultRepromptSpeech);
                    }
                    else {
                        //Affirm the typed text.
                        alexa.emit(':ask', constants.typeTextIntent.typeTextSpeach(text), constants.defaultRepromptSpeech);
                    }
                })
                .catch(function (err) {
                    logger.error(err);
                    alexa.emit(':ask', constants.typeTextIntent.unableToTypeSpeach(text), constants.defaultRepromptSpeech);
                });
        }
    };

    //Launches a Roku App.
    //Examples:
    //  Launch Netflix
    //  Start Amazon Prime
    this.launchAppIntent = function (alexa) {

        var selectedRoku = alexa.attributes[constants.attributes.selectedRoku];
        if (!selectedRoku) {
            alexa.emitWithState(constants.intents.SelectRokuIntent);
        }
        else {
            //Assemble the app filter from the individual words.
            var filter = helpers.concatSlots(alexa.event.request.intent.slots, 'filter');

            var options = {
                rokuId: selectedRoku.id,
                filter: filter
            }

            rokuService.launchApp(options)
                .then(function (response) {
                    //"launching ..."
                    alexa.emit(':ask', constants.launchAppIntent.LaunchingSpeach(response.appName), constants.defaultRepromptSpeech);
                })
                .catch(function (err) {
                    var speech;
                    if (err.code) {
                        //a code means there is something wrong with the request that can be fixed.
                        switch (err.code) {
                            case 'NoMatch':
                                //"I souldn't find..."
                                speech = constants.launchAppIntent.noMatchSpeach(filter);
                                break;

                            case 'AmbiguousMatch':
                                //"Multiple matxhes. Please choose..."
                                speech = constants.launchAppIntent.multipleMatchesSpeach(err.apps);
                                break;

                            default:
                                console.error(err);
                                //General "oops" 
                                speech = constants.launchAppIntent.unableToLaunchSpeach(filter);
                                break;
                        }
                    }
                    else {
                        logger.error(err);
                        speech = constants.launchAppIntent.unableToLaunchSpeach(filter);
                    }
                    alexa.emit(':ask', speech, constants.defaultRepromptSpeech);

                });
        }
    };

    //Lists the Rokus currently active on the user's local network.
    //Examples:
    //  "List Rokus"
    //  "tell me my rokus"
    this.listRokusIntent = function (alexa) {

        getRokus()
            .then(function (rokus) {
                if (!rokus || !rokus.length) {
                    //Tell the caller to turn on a Roku and try again.
                    alexa.emit(':tell', constants.selectRokuIntent.noRokusFoundSpeach);
                }
                else {
                    if (rokus.length > 1) {
                        //List the Rokus found.
                        speachQueue.push(constants.listRokusIntent.multipleRokusFoundSpeach)
                        speachQueue.push(helpers.listRokusToSpeach(rokus));
                    }
                    else {
                        //Special text for when there is only one Roku on the network.
                        speachQueue.push(constants.listRokusIntent.singleRokuFoundSpeach);
                        speachQueue.push(helpers.sayRokuName(rokus[0]));
                    }
                    alexa.emit(':ask', speachQueue.join(' '), constants.defaultRepromptSpeech);
                }
            })
            .catch(function (err) {
                logger.error(err);
                alexa.emit(':ask', constants.selectRokuIntent.unableToListRokus, constants.defaultRepromptSpeech);
            });

    };

    //Cancels the Roku Remote app.
    this.cancelIntent = function (alexa) {
        alexa.emit(':tell', constants.cancelIntent.speachText);
    };

    //Lists help speach for the caller.
    this.helpIntent = function (alexa) {
        alexa.emit(':ask', constants.helpIntent.generalHelpSpeach, constants.defaultRepromptSpeech);
    };
};


module.exports = intents;