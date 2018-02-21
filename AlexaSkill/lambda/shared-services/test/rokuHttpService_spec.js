'use strict';


var expect = require('chai').expect;
var commands = require('../Roku/RokuCommands');

var subject = require('../Roku/rokuHttpService');

//I use this to test connection and functionality of the "real" 
//Roku Service. It's not meant to be part of the actual unit tests.
describe("rokuHttpService", function () {

    describe('listRokus', function () {

        describe("Requesting a list of Rokus...", function () {
            it("should execute without any errors", function () {
                return subject.listRokus()
                    .then((result) => {
                        expect(result.length).to.be.above(0);
                    });
            });
        });

    });

    describe('sendCommand', function () {

        var options;

        beforeEach(function () {
            options = { rokuId: '2LD55R049841' };
        });

        describe("sending a known command", function () {
            it("should execute without any errors", function () {
                options.executionCommand = commands.home;
                return subject.sendCommand(options)
                    .then((result) => {
                        expect(result).to.equal(true);
                    });
            });
        });

        describe("sending a command multiple times", function () {
            it("should execute without any errors", function () {
                options.executionCommand = commands.right;
                options.executionCount = 3;
                return subject.sendCommand(options)
                    .then((result) => expect(result).to.equal(true));

            });
        });

        describe("sending a command with an invalid repeat count", function () {
            it("should receive an error", function () {
                options.executionCommand = commands.right;
                options.executionCount = -1;
                return subject.sendCommand(options)
                    .then((result) => {
                        throw 'Should have thown an error.';
                    })
                    .catch((err) => {
                        expect(err).to.exist;
                    });
            });
        });
    });

    describe("sendText", function () {

        var options;

        beforeEach(function () {
            this.timeout(5000);
            options = { rokuId: '2LD55R049841' };
        });

        afterEach(function () {
            this.timeout(2000);
        });

        describe("sending text", function () {
            it("should execute without any errors", function () {
                options.text = "hello world";
                return subject.sendText(options)
                    .then((result) => expect(result).to.equal(true));
            });
        });

        describe("sending without text", function () {
            it("should receive an error", function () {
                options.text = undefined;
                return subject.sendText(options)
                    .catch((err) => expect(err, 'topic [err]').to.exist);
            });
        });
    });

    describe("launchApp", function () {

        var options;

        beforeEach(function () {
            this.timeout(5000);
            options = { rokuId: '2LD55R049841' };
        });

        afterEach(function () {
            this.timeout(2000);
        });

        describe("launching an app...", function () {
            it("should return the name of the launched app.", function () {
                options.filter = "Amazon Video";
                return subject.launchApp(options)
                    .then((result) => expect(result).to.exist.and.haveOwnProperty('appName'))
            });
        });

        describe("sending without an application name...", function () {
            it("should receive an error indicating the filter is missing", function () {
                options.filter = undefined;
                return subject.launchApp(options)
                    .then((result) => { throw 'There should have been an error!'; })
                    .catch((err) => {
                        expect(err, 'topic [err]').to.exist;
                        expect(err.code, 'topic [err.code]').to.equal('NoFilter');
                    });
            });
        });

        describe("sending an ambiguous name...", function () {
            it("should receive an error indicating the ambiguous match and listing the possible choices", function () {
                options.filter = 'amazon';
                return subject.launchApp(options)
                    .catch((err) => {
                        expect(err, 'topic [err]').to.exist;
                        expect(err.code, 'topic [err.code]').to.equal('AmbiguousMatch');
                        expect(err.apps.length, 'topic [err.apps]').to.be.greaterThan(0);
                    });
            });
        });

        describe("sending an unknown app name...", function () {
            it("should receive an error indicating the app does not exist", function () {
                options.filter = 'chez louie';
                return subject.launchApp(options)
                    .catch((err) => {
                        expect(err, 'topic [err]').to.exist;
                        expect(err.code, 'topic [err.code]').to.equal('NoMatch');
                    });
            });
        });
    });

});


