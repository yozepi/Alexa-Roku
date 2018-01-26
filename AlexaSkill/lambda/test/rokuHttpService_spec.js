'use strict';


var expect = require('chai').expect;
var constants = require('../helpers').constants;
var commands = require('../Roku/RokuCommands');

var subject = require('../services/rokuHttpService');

//I use this to test connection and functionality of the "real" 
//Roku Service. It's not meant to be part of the actual unit tests.
describe("rokuHttpService", function () {

    describe('listRokus', function(){

        var subjectResult;
        var subjectError;
 
        beforeEach(function () {
            subjectResult = null;
            subjectError = null;
        });
 
        var act = function (done) {
            subject.listRokus()
                .then((result) => {
                    subjectResult = result;
                })
                .catch((err) => subjectError = err)
                .finally(done());

        };

        describe("Requesting a list of Rokus...", function () {
            it("should execute without any errors", function (done) {
                act(done);
                expect(subjectError).to.equal(null);
                expect(subjectResult.length).to.be.above(0);
                console.log(subjectResult);
            });
        });

    });

    describe('sendCommand', function () {
        var subjectSuccess;
        var subjectError;

        var commandOptions;


        beforeEach(function () {
            commandOptions = { rokuId: '2LD55R049841' };
            subjectSuccess = null;
            subjectError = null;
        });

        var act = function (done) {
            subject.sendCommand(commandOptions)
                .then((result) => {
                    subjectSuccess = result;
                })
                .catch((err) => subjectError = err)
                .finally(done());

        };

        describe("sending a known command", function () {
            it("should execute without any errors", function (done) {
                commandOptions.executionCommand = commands.home;
                act(done);
                expect(subjectSuccess).to.equal(true);
                expect(subjectError).to.equal(null);
            });
        });

        describe("sending a command multiple times", function () {
            it("should execute without any errors", function (done) {
                commandOptions.executionCommand = commands.right;
                commandOptions.executionCount = 3;
                act(done);
                expect(subjectSuccess).to.equal(true);
                expect(subjectError).to.equal(null);
            });
        });

        describe("sending a command with an invalid repeat count", function () {
            it("should receive an error", function (done) {
                commandOptions.executionCommand = commands.right;
                commandOptions.executionCount = -1;
                act(done);
                expect(subjectError).to.exist;
            });
        });
    });

    describe("sendText", function () {

        var subjectSuccess;
        var subjectError;

        var commandOptions;

        beforeEach(function () {
            this.timeout(5000);
            subjectSuccess = null;
            subjectError = null;
            commandOptions = { rokuId: '2LD55R049841' };
        });

        afterEach(function () {
            this.timeout(2000);
        });

        var act = function (done) {
            subject.sendText(commandOptions)
                .then((result) => {
                    subjectSuccess = result;
                })
                .catch((err) => subjectError = err)
                .finally(done());

        };

        describe("sending text", function () {
            it("should execute without any errors", function (done) {
                commandOptions.text = "hello world";
                act(done);
                expect(subjectSuccess).to.equal(true);
                expect(subjectError).to.equal(null, 'topic [err]');
            });
        });

        describe("sending without text", function () {
            it("should receive an error", function (done) {
                commandOptions.text = undefined;
                act(done);
                expect(subjectError, 'topic [err]').to.exist;
            });
        });
    });

    describe("launchApp", function () {

        var subjectResponse;
        var subjectError;

        var commandOptions;

        beforeEach(function () {
            this.timeout(5000);
            subjectResponse = null;
            subjectError = null;
            commandOptions = { rokuId: '2LD55R049841' };
        });

        afterEach(function () {
            this.timeout(2000);
        });

        var act = function (done) {
            subject.launchApp(commandOptions)
                .then((result) => {
                    subjectResponse = result;
                })
                .catch((err) => subjectError = err)
                .finally(done());
        };

        describe("launching an app...", function () {
            it("should return the name of the launched app.", function (done) {
                commandOptions.filter = "Amazon Video";
                act(done);
                expect(subjectResponse).to.exist.and.haveOwnProperty('appName');
                expect(subjectError).to.equal(null, 'topic [err]');
            });
        });

        describe("sending without an application name...", function () {
            it("should receive an error indicating the filter is missing", function (done) {
                commandOptions.filter = undefined;
                act(done);
                expect(subjectError, 'topic [err]').to.exist;
                expect(subjectError.code, 'topic [err.code]').to.equal('NoFilter');
            });
        });

        describe("sending an ambiguous name...", function () {
            it("should receive an error indicating the ambiguous match and listing the possible choices", function (done) {
                commandOptions.filter = 'amazon';
                act(done);
                expect(subjectError, 'topic [err]').to.exist;
                expect(subjectError.code, 'topic [err.code]').to.equal('AmbiguousMatch');
                expect(subjectError.apps.length, 'topic [err.apps]').to.be.greaterThan(0);
            });
        });

        describe("sending an unknown app name...", function () {
            it("should receive an error indicating the app does not exist", function (done) {
                commandOptions.filter = 'chez louie';
                act(done);
                expect(subjectError, 'topic [err]').to.exist;
                expect(subjectError.code, 'topic [err.code]').to.equal('NoMatch');
            });
        });
    });

});


