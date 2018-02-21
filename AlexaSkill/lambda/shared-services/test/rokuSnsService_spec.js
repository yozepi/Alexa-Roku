'use strict';


var expect = require('chai').expect;
var commands = require('../Roku/RokuCommands');

var subject = require('../Roku/RokuSnsService');

//I use this to test connection and functionality of the "real" 
//Roku SNS Service. It's not meant to be part of the actual unit tests.
describe("rokuSnsService", function () {
    describe('sendCommand', function () {

        var options;

        beforeEach(function () {
            options = { rokuId: '2LD55R049841' };
        });

        it('should send the command', function () {
            options.executionCommand = commands.down;
            return subject.sendCommand(options)
                .then((result) => {
                    expect(result).to.equal(true);
                });
        });
    });
});