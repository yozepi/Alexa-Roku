'use strict';

var should = require('chai').should();
var sinon = require('sinon');

var constants = require('../helpers').constants;
var helpers = require('../helpers');
var requests = require('./data/alexaRequests');
var rokuLists = require('./data/rokuLists');
var rokuServiceStub = require('./mocks/RokuServiceStub');
var commands = require('shared-services').roku.commands;
var intents = require('../Roku/rokuIntents');

describe.only('Roku intents', function () {

    var subject;

    var alexaResponse; //holds the response from Alexa's emit method.
    var nextState; //Holds the next intent to be called after Alexa's call to emitWithState method.
    var stubOptions; //Options for the Roku service mock.
    var stubCallbackValues; //holds the values actually sent to the Roku service by the subject method under test.
    var voiceDirectiveResponse; //Holds the text enqueued to Alexa while waiting for the service to finish.

    //A simple mockup of the alexa-sdk's alexaRequestHandler.
    var alexaStub = {
        //Record the values of emit.
        emit: function (cmd, speach, reprompt) {
            alexaResponse = {
                command: cmd,
                speach: speach,
                reprompt: reprompt
            }
        },

        //record the values of emitWithState.
        emitWithState: function (newState) {
            nextState = newState;
        },

        event: {},
        attributes: {}
    };

    //A simple stub of a DirectiveServiceFactory instance.
    var directiveServiceStub = {
        enqueue: function (event, message) {
            voiceDirectiveResponse = message;
        }
    };

    //Real simple logger stub.
    var loggerStub = {
        error: function () {
        }
    };

    beforeEach(function () {
        alexaResponse = null;
        nextState = null;
        voiceDirectiveResponse = null;
        stubOptions = {
            callback: (options) => stubCallbackValues = options
        };
    });

    afterEach(function () {
        alexaStub.attributes = {};
        stubCallbackValues = null;
        stubOptions = {};
    });


    describe('newSessionIntent', function () {

        var rokus;
        var error;

        var act = function (done) {
            stubOptions.returnVal = rokus;
            stubOptions.error = error;
            subject = new intents({ rokuService: new rokuServiceStub(stubOptions) })
            subject.newSessionIntent(alexaStub);

            waitForPromise(done);
        };

        describe('when using MyRoku Remote for the first time', function () {
            beforeEach(function (done) {
                rokus = rokuLists.multipleRokus;
                act(done);
            });

            it('should ask to select a Roku device', function () {
                nextState.should.equal(constants.intents.SelectRokuIntent);
            });
        });

        describe('when a roku device has been previously selected', function () {
            beforeEach(function () {
                alexaStub.attributes[constants.attributes.selectedRoku] = 'any old thing';
            });

            describe('when launching without any specific intent', function () {
                beforeEach(function (done) {
                    alexaStub.event = requests.launch();
                    act(done);
                });
                it('Alexa should welcome the user back and wait for a command', function () {
                    alexaResponse.command.should.equal(':ask');
                    alexaResponse.speach.should.equal(constants.newSessionIntent.launchSpeech);
                    alexaResponse.reprompt.should.equal(constants.newSessionIntent.repromptSpeech);
                });
            });

            describe('when launching with an intent', function () {
                beforeEach(function (done) {
                    alexaStub.event = requests.launchApp('my app');
                    act(done);
                });

                it('should route to the intent', function () {
                    nextState.should.equal(alexaStub.event.request.intent.name);
                });
            });

        });
    });

    describe('selectRokuIntent', function () {
        var selectedValue;
        var selectedRoku;
        var rokus;
        var error;

        var act = function (done) {
            stubOptions.returnVal = rokus;
            stubOptions.error = error;

            subject = new intents({ rokuService: new rokuServiceStub(stubOptions), logger: loggerStub, directiveServiceFactory: directiveServiceStub })
            subject.selectRokuIntent(alexaStub);

            waitForPromise(done);
        }

        beforeEach((done) => {
            alexaStub.event = requests.selectedRoku(selectedValue);
            act(done);
        });

        describe('when no Roku was provided', function () {

            it('Alexa should tell the caller to wait while Alexa looks for Rokus', function () {
                voiceDirectiveResponse.should.equal(constants.selectRokuIntent.lookingForRokusSpeach);
            });


            describe('when there are multiple Rokus to choose from', function () {

                before(() => {
                    rokus = rokuLists.multipleRokus;
                });
                it('Alexa should prompt the user with a selection of Rokus to choose from', function () {
                    alexaResponse.command.should.equal(':ask');
                    alexaResponse.speach.should.contain(constants.selectRokuIntent.selectARokuSpeach);
                    alexaResponse.speach.should.contain(helpers.listRokusToSpeach(rokus));
                    alexaResponse.reprompt.should.equal(constants.selectRokuIntent.instructionSpeech(rokus));
                });
            });

            describe('when there only one roku to choose from', function () {

                before(() => {
                    rokus = rokuLists.oneRoku;
                });
    
                it('should select the Roku', function () {
                    alexaStub.attributes[constants.attributes.selectedRoku].should.equal(rokus[0]);
                });
                it('Alexa should inform the user of the choice and wait for a command', function () {
                    alexaResponse.command.should.equal(':ask');
                    alexaResponse.speach.should.contain(constants.selectRokuIntent.singleRokuFoundSpeach(rokus[0]));
                    alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
                });
            });
    
            describe('when there are no Rokus to choose from', function () {
    
                before(() => {
                    rokus = rokuLists.noRokus;
                });
    
                it('Alexa should tell the user to turn on one or more Roku\'s and try again', function () {
                    alexaResponse.command.should.equal(':tell');
                    alexaResponse.speach.should.equal(constants.selectRokuIntent.noRokusFoundSpeach);
                });
            });
                
        });

        describe('when a Roku to select is provided', function () {

            before(function () {
                rokus = rokuLists.multipleRokus;
                selectedValue = "1";
                selectedRoku = rokus[selectedValue - 1];
            });

            it('should select the intended Roku', function () {
                alexaStub.attributes[constants.attributes.selectedRoku].should.equal(selectedRoku);
            });

            it('Alexa should tell the caller of the selected Roku, and wait for a command', function () {
                alexaResponse.command.should.equal(':ask');
                alexaResponse.speach.should.equal(constants.selectRokuIntent.rokuSelectedSpeach(selectedRoku));
                alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
            });

            describe('when the selection isn\'t a number', function () {
                describe('when the selection is one of the roku names', function () {
                    var namedRoku;
                    before(() => {
                        selectedValue = 'family room';
                        namedRoku = rokus[1];
                    });

                    it('should select the intended Roku', function () {
                        alexaStub.attributes[constants.attributes.selectedRoku].should.equal(namedRoku);
                    });
                    it('Alexa should tell the caller of the selected Roku, and wait for a command', function () {
                        alexaResponse.command.should.equal(':ask');
                        alexaResponse.speach.should.equal(constants.selectRokuIntent.rokuSelectedSpeach(namedRoku));
                        alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
                    });
                })
                describe('when the selection is unknown', function () {
                    before(() => selectedValue = 'alpha');
                    it('Alexa should tell the caller the the choice was invalid', function() {
                        alexaResponse.command.should.equal(':ask');
                        alexaResponse.speach.should.contain(constants.selectRokuIntent.badSelectionSpeach);
                        alexaResponse.reprompt.should.equal(constants.selectRokuIntent.instructionSpeech(rokus));
                    });
                    it('Alexa should reprompt the caller with a selection of Rokus', function () {
                        alexaResponse.speach.should.contain(helpers.listRokusToSpeach(rokus));
                    });
                });
            });

            describe('when the selection is out of bounds', function () {
                it('Alexa should tell the caller the the choice was invalid', function() {
                    before(() => selectedValue = '-1');
                    alexaResponse.command.should.equal(':ask');
                    alexaResponse.speach.should.contain(constants.selectRokuIntent.badSelectionSpeach);
                    alexaResponse.reprompt.should.equal(constants.selectRokuIntent.instructionSpeech(rokus));
                });
                it('Alexa should reprompt the caller with a selection of Rokus', function () {
                    alexaResponse.speach.should.contain(helpers.listRokusToSpeach(rokus));
                });
        });

            describe('when there are no rokus available', function () {
                before(() => rokus = rokuLists.noRokus);
                it('Alexa should prompt the caller to turn on a Roku', function () {
                    alexaResponse.command.should.equal(':tell');
                    alexaResponse.speach.should.equal(constants.selectRokuIntent.noRokusFoundSpeach);
                });
            });
        });

        describe('when the backend service throws an error.', function () {

            beforeEach((done) => {
                error = 'FAIL Big Time!'
                rokus = undefined;
                sinon.spy(loggerStub, 'error');
                act(done);
            });
            afterEach(function () {
                loggerStub.error.restore();
            });

            it('should log the error', function () {
                loggerStub.error.calledOnce.should.equal(true);
            });

            it('Alexa should tell the user to check on the server\'s status', function () {
                alexaResponse.command.should.equal(':tell');
                alexaResponse.speach.should.equal(constants.selectRokuIntent.unableToListRokus);
            });
        });
    });

    describe('sendCommandIntent', function () {

        var error;
        var success;
        var selectedRoku = { id: 'ABC12345' };

        var act = function (done) {

            stubOptions.returnVal = success;
            stubOptions.error = error;

            alexaStub.attributes[constants.attributes.selectedRoku] = selectedRoku;
            subject = new intents({ rokuService: new rokuServiceStub(stubOptions), logger: loggerStub })
            subject.sendCommandIntent(alexaStub);
            waitForPromise(done);

        };

        afterEach(function () {
            error = undefined;
            success = undefined;
        });

        describe('when requesting a command...', function () {

            before(() => alexaStub.event = requests.sendCommand(commands.down))
            beforeEach(function (done) {
                success = true;
                act(done);
            });

            it('should pass in the roku ID saved in Alexa\'s session', function () {
                stubCallbackValues.rokuId.should.equal(selectedRoku.id);
            });
            it('should execute the command only one time', function () {
                stubCallbackValues.executionCount.should.equal(1);
            });
            it('Alexa should notify the user the command was sent and wait for a new command', function () {
                alexaResponse.command.should.equal(':ask');
                alexaResponse.speach.should.equal(constants.sendCommandIntent.commandSentSpeach);
                alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
            });
        });

        describe('when the command is not recognised', function () {

            before(() => alexaStub.event = requests.sendCommand("blah"))
            beforeEach(function (done) {
                act(done);
            });
            describe('Alexa\'s response', function () {
                it('should be an "ask" telling the caller the command can\'t be recognised', function () {
                    alexaResponse.command.should.equal(':ask');
                    alexaResponse.speach.should.equal(constants.sendCommandIntent.invalidCommandSpeach('blah'));
                    alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
                });
            });
        });

        describe('when requesting a command multiple times...', function () {

            before(() => alexaStub.event = requests.sendCommand(commands.left, 7))
            beforeEach(function (done) {
                success = true;
                act(done);
            });
            it('should execute the command the number of times requested', function () {
                stubCallbackValues.executionCommand.should.equal(commands.left);
                stubCallbackValues.executionCount.should.equal(7);
            });

            describe('when the count is less than 1', function () {
                before(function () {
                    alexaStub.event = requests.sendCommand("down", 0);
                });
                it('Alexa should explain to the caller that only 1 thru 10 is valid, then wait for a command', function () {
                    alexaResponse.command.should.equal(':ask');
                    alexaResponse.speach.should.equal(constants.sendCommandIntent.badCountSpeach);
                    alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
                });
            });

            describe('when the count is greater than 10', function () {
                before(function () {
                    alexaStub.event = requests.sendCommand("down", 11);
                });
                it('Alexa should explain to the caller that only 1 thru 10 is valid, then wait for a command', function () {
                    alexaResponse.command.should.equal(':ask');
                    alexaResponse.speach.should.equal(constants.sendCommandIntent.badCountSpeach);
                    alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
                });
            });

            describe('handling the words "once" and "twice"', function () {

                describe('"once"', function () {
                    before(function () {
                        alexaStub.event = requests.sendCommand("down", 'once');
                    });

                    it('should execute the command only one time', function () {
                        stubCallbackValues.executionCount.should.equal(1);
                    });
                });
            });

            describe('"twice"', function () {
                before(function () {
                    alexaStub.event = requests.sendCommand("down", 'twice');
                });

                it('should execute the command two times', function () {
                    stubCallbackValues.executionCount.should.equal(2);
                });
            });
        });

        describe('when the roku service indicates a failure', function () {
            beforeEach(function (done) {
                success = false;
                act(done);
            });

            it('Alexa should tell the user the command could not be executed, then wait for a command.', function () {
                alexaResponse.command.should.equal(':ask');
                alexaResponse.speach.should.equal(constants.sendCommandIntent.unableToSendCommandSpeach);
                alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
            });
        });

        describe('when the backend service throws an error.', function () {
            beforeEach((done) => {
                sinon.spy(loggerStub, 'error');
                error = "Send command fail!";
                act(done);
            });
            afterEach(function () {
                loggerStub.error.restore();
            });

            it('should log the error', function () {
                loggerStub.error.calledOnce.should.equal(true);
            });

            it('Alexa should tell the user the command could not be executed, then wait for a command.', function () {
                alexaResponse.command.should.equal(':ask');
                alexaResponse.speach.should.equal(constants.sendCommandIntent.unableToSendCommandSpeach);
                alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
            });
        });

        describe('when no roku remote has been selected yet', function () {

            beforeEach(function (done) {
                selectedRoku = undefined;
                act(done);
            });
            it('Alexa should prompt the caller to select a Roku', function () {
                nextState.should.equal(constants.intents.SelectRokuIntent);
            });
        });

    });

    describe('typeTextIntent', function () {

        var error;
        var success;
        var selectedRoku = { id: 'ABC12345' };

        var act = function (done) {

            stubOptions.returnVal = success;
            stubOptions.error = error;

            alexaStub.attributes[constants.attributes.selectedRoku] = selectedRoku;
            subject = new intents({ rokuService: new rokuServiceStub(stubOptions), logger: loggerStub, directiveServiceFactory: directiveServiceStub })
            subject.typeTextIntent(alexaStub);
            waitForPromise(done);

        };

        afterEach(function () {
            error = undefined;
            success = undefined;
        });


        describe('when sending text...', function () {

            before(function () {
                alexaStub.event = requests.typeText('hello world');
            });

            beforeEach(function (done) {
                success = true;
                act(done);
            });

            it('should pass in the roku ID saved in Alexa\'s session', function () {
                stubCallbackValues.rokuId.should.equal(selectedRoku.id);
            });

            it('Alexa should tell the user the text is being typed', function () {
                voiceDirectiveResponse.should.equal(constants.typeTextIntent.typeTextSpeach('hello world'));
            });

            it('should send the text to the service', function () {
                stubCallbackValues.text.should.equal('hello world', 'topic [callback:text]');
            });


            it('Alexa should tell the user the text has been sent and wait for a command', function () {
                alexaResponse.command.should.equal(':ask');
                alexaResponse.speach.should.equal(constants.typeTextIntent.typingCompleteSpeach);
                alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
            });


            describe('when the roku service indicates a failure', function () {
                beforeEach(function (done) {
                    success = false;
                    act(done);
                });

                it('Alexa should warn the caller the text was not sent, then wait for a command', function () {
                    alexaResponse.command.should.equal(':ask');
                    alexaResponse.speach.should.equal(constants.typeTextIntent.unableToTypeSpeach('hello world'));
                    alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
                });
            });


            describe('when the backend service throws an error.', function () {

                beforeEach(function (done) {
                    sinon.spy(loggerStub, 'error');
                    error = "Send text fail!";
                    act(done);
                });
                afterEach(function () {
                    loggerStub.error.restore();
                });

                it('should log the error', function () {
                    loggerStub.error.calledOnce.should.equal(true);
                });

                it('Alexa should warn the caller the text was not sent, then wait for a command', function () {
                    alexaResponse.command.should.equal(':ask');
                    alexaResponse.speach.should.equal(constants.typeTextIntent.unableToTypeSpeach('hello world'));
                    alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
                });
            });

            describe('when no roku remote has been selected yet', function () {

                beforeEach(function (done) {
                    selectedRoku = undefined;
                    act(done);
                });
                it('Alexa should prompt the caller to select a Roku', function () {
                    nextState.should.equal(constants.intents.SelectRokuIntent);
                });
            });
        });
    });

    describe('launchAppIntent', function () {
        var appName = 'Amazon Video';

        var error;
        var result;
        var selectedRoku = { id: 'ABC12345' };

        var act = function (done) {

            stubOptions.returnVal = result;
            stubOptions.error = error;

            alexaStub.attributes[constants.attributes.selectedRoku] = selectedRoku;
            alexaStub.event = requests.launchApp(appName);
            subject = new intents({ rokuService: new rokuServiceStub(stubOptions), logger: loggerStub, directiveServiceFactory: directiveServiceStub })
            subject.launchAppIntent(alexaStub);
            waitForPromise(done);

        };

        afterEach(function () {
            error = undefined;
            result = undefined;
        });


        describe('when launching an app...', function () {

            beforeEach(function (done) {
                result = {
                    "message": "app launched.",
                    "code": "AppLaunched",
                    "appName": appName
                }
                act(done);
            });

            it('should pass in the roku ID saved in Alexa\'s session', function () {
                stubCallbackValues.rokuId.should.equal(selectedRoku.id);
            });

            it('Alexa should tell the user the app is being launched', function () {
                voiceDirectiveResponse.should.equal(constants.launchAppIntent.launchingSpeach(appName));
            });

            it('should send the app filter to the service', function () {
                stubCallbackValues.filter.should.equal(appName, 'topic [callback:filter]');
            });

            it('Alexa should tell the caller the app was launched, then wait for a command', function () {
                alexaResponse.command.should.equal(':ask');
                alexaResponse.speach.should.equal(constants.launchAppIntent.appLaunchedSpeach(appName));
                alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
            });
        });

        describe('when the app can\'t be found', function () {

            beforeEach(function (done) {
                error = {
                    "message": "no matching apps found",
                    "code": "NoMatch"
                };
                act(done);
            });

            it('Alexa should tell the user the app couldn\'t be found, then wait for a command', function () {
                alexaResponse.command.should.equal(':ask');
                alexaResponse.speach.should.equal(constants.launchAppIntent.noMatchSpeach(appName));
                alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
            });
        });

        describe('when there are multiple possible matches', function () {

            beforeEach(function (done) {
                error = {
                    "message": "More than one app matches.",
                    "code": "AmbiguousMatch",
                    "apps": [
                        {
                            "id": 14362,
                            "appType": "appl",
                            "version": "1.1.0",
                            "text": "Amazon Music"
                        },
                        {
                            "id": 13,
                            "appType": "appl",
                            "version": "7.1.2017082110",
                            "text": "Amazon Video"
                        }
                    ]
                };
                act(done);

            });

            it('Alexa should tell the caller there are multiple matches and list the possible choices, then wait for a command', function () {
                alexaResponse.command.should.equal(':ask');
                alexaResponse.speach.should.equal(constants.launchAppIntent.multipleMatchesSpeach(stubOptions.error.apps));
                alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
            });
        });

        describe('when the backend service throws an error.', function () {

            beforeEach(function (done) {
                sinon.spy(loggerStub, 'error');
                error = 'launch app fail!'
                act(done);
            });
            afterEach(function () {
                loggerStub.error.restore();
            });

            it('should log the error', function () {
                loggerStub.error.calledOnce.should.equal(true);
            });

            it('Alexa should warn the user the app couldn\'t be launched, then wait for a command', function () {
                alexaResponse.command.should.equal(':ask');
                alexaResponse.speach.should.equal(constants.launchAppIntent.unableToLaunchSpeach(appName));
                alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
            });
        });

        describe('when no roku remote has been selected yet', function () {

            beforeEach(function (done) {
                selectedRoku = undefined;
                act(done);
            });
            it('Alexa should prompt the caller to select a Roku', function () {
                nextState.should.equal(constants.intents.SelectRokuIntent);
            });
        });
    });

    describe('listRokusIntent', function () {
        describe('when listing Rokus...', function () {

            var error;
            var rokus;

            var act = function (done) {

                stubOptions.returnVal = rokus;
                stubOptions.error = error;

                subject = new intents({ rokuService: new rokuServiceStub(stubOptions), logger: loggerStub, directiveServiceFactory: directiveServiceStub })
                subject.listRokusIntent(alexaStub);
                waitForPromise(done);

            };

            afterEach(function () {
                error = undefined;
                rokus = undefined;
            });

            beforeEach(function (done) {
                rokus = rokuLists.multipleRokus;
                act(done);
            });

            it('Alexa should tell the caller to wait while Alexa looks for Rokus', function (done) {
                act(done);
                voiceDirectiveResponse.should.equal(constants.selectRokuIntent.lookingForRokusSpeach);
            });

            it("Alexa should list the rokus that she found, then wait for a command.", function () {
                alexaResponse.command.should.equal(':ask');
                alexaResponse.speach.should.contain(constants.listRokusIntent.multipleRokusFoundSpeach);
                alexaResponse.speach.should.contain(helpers.listRokusToSpeach(rokus));
                alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
            });

            describe('when only one Roku is found on the network', function () {

                beforeEach(function (done) {

                    rokus = rokuLists.oneRoku;
                    act(done);
                });

                it('Alexa should be smart about describing only the one Roku', function () {
                    alexaResponse.command.should.equal(':ask');
                    alexaResponse.speach.should.contain(constants.listRokusIntent.singleRokuFoundSpeach);
                    alexaResponse.speach.should.contain(helpers.sayRokuName(rokus[0]));
                    alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
                });
            });

            describe('when no rokus are found on the network', function () {
                beforeEach(function (done) {
                    rokus = rokuLists.noRokus;
                    act(done);
                });

                it('Alexa should tell the user to turn on one or more Roku\'s and try again', function () {
                    alexaResponse.command.should.equal(':tell');
                    alexaResponse.speach.should.equal(constants.selectRokuIntent.noRokusFoundSpeach);
                });
            });

            describe('when the backend service throws an error.', function () {

                beforeEach(function (done) {
                    sinon.spy(loggerStub, 'error');
                    error = 'launch app fail!'
                    act(done);
                });
                afterEach(function () {
                    loggerStub.error.restore();
                });

                it('should log the error', function () {
                    loggerStub.error.calledOnce.should.equal(true);
                });

                it('Alexa should warn the user the app couldn\'t be launched, then wait for a command', function () {
                    alexaResponse.command.should.equal(':ask');
                    alexaResponse.speach.should.equal(constants.selectRokuIntent.unableToListRokus);
                    alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
                });
            });

        });
    });

    describe('cancelIntent', function () {
        it('Alexa should tell the user Roku Remote is cancelling', function () {
            subject = new intents({});
            subject.cancelIntent(alexaStub);
            alexaResponse.command.should.equal(':tell');
            alexaResponse.speach.should.equal(constants.cancelIntent.speachText);
        });
    });

    describe('helpIntent', function () {
        it('Alexa should describe the app features', function () {
            subject = new intents({});
            subject.helpIntent(alexaStub);
            alexaResponse.command.should.equal(':ask');
            alexaResponse.speach.should.equal(constants.helpIntent.generalHelpSpeach);
            alexaResponse.reprompt.should.equal(constants.defaultRepromptSpeech);
        });
    });

    describe('sessionEndedIntent', function () {
        it("Alexa should indicate the session has ended", function () {
            subject = new intents({});
            subject.sessionEndedIntent(alexaStub);
            alexaResponse.command.should.equal(':tell');
            alexaResponse.speach.should.equal(constants.sessionEndedIntent.sessionEndedSpeach);
        });
    });
});

//Lame hack so I can wait on internal promises.
function waitForPromise(done) {
    setTimeout(() => {
        done();
    }, 1);
};
