'use strict';

var commands = require('./Roku/RokuCommands');

//Turns an array of texts into a speach listing them by number.
//This is usefull for listing app names or Rokus.
var listToSpeech = function (list, connector, prependedText) {
    var speech = '';
    for (var i = 0; i < list.length; i++) {
        if (speech.length != 0) {
            speech += ', ';
        }
        if (i + 1 === list.length && (connector)) {
            speech += connector + ' ';
        }
        if (prependedText) {
            speech += prependedText;
        }

        speech += list[i];
    }

    return speech
};

//Extends the listToSpeech method for exclusive use by roku remotes. 
var listRokusToSpeach = function (rokus) {
    var rokuList = [];

    for (var i = 0; i < rokus.length; i++) {
        rokuList.push(i + 1 + ', ' + sayRokuName(rokus[i]) + '.');
    }
    return listToSpeech(rokuList, ' or ');
};

//Induces a (more or less) recognizable name for the provided Roku.
var sayRokuName = function (roku) {
    if (roku.name) {
        return roku.name;
    }
    return 'Roku with <say-as interpret-as="spell-out">ID</say-as> number <say-as interpret-as="spell-out">' + roku.id + '</say-as>';
};


//Joins slots with thsame starting name into one "sentence".
//Example:
//  text_a.value: "how"
//  text_b.value: "now"
//  text_c.value: "brown"
//  text_d.value: "cow"
//Returns "how now brown cow"
var concatSlots = function (slots, slotName) {
    var values = [];
    var slotKeys = Object.keys(slots).sort();
    for (let i = 0; i < slotKeys.length; i++) {
        var key = slotKeys[i];
        if (key.startsWith(slotName)) {
            if (slots[key].value) {
                values.push(slots[key].value);
            }
        }
    }
    var value = values.join( ' ').trim();
    return value;
}

var constants = {
    //Shared / global constants.
    //The Alexa skill Id.
    appId: 'amzn1.ask.skill.19019d99-bdb9-4226-9a7b-ba0e380b60d3',
    defaultRepromptSpeech: 'Ready for a command.',

    //Intent names.
    intents: {
        'SelectRokuIntent': 'SelectRokuIntent',
        'SelectedRokuIntent': 'SelectedRokuIntent',
        'SendCommandIntent': 'SendCommandIntent',
        'TypeTextIntent': 'TypeTextIntent',
        'LaunchAppIntent': 'LaunchAppIntent',
        'ListRokusIntent': 'ListRokusIntent',
        'AMAZON.HelpIntent': 'AMAZON.HelpIntent',
        'AMAZON.StopIntent': 'AMAZON.StopIntent',
        'AMAZON.CancelIntent': 'AMAZON.CancelIntent'
    },

    //Alexa attribute names.
    attributes: {
        selectedRoku: 'selectedRoku'
    },

    //Intent specific constants.
    newSessionIntent: {
        startupSpeech: 'Welcome to My Roku Remote.',
        introductorySpeech: 'I can control your Roku with series of voice commands.',
        selectRokuSpeech: 'Before we begin, you must first select a roku.',
        repromptSpeech: 'Tell me what you want the remote to do. Ask for help to learn more.',

    },

    selectRokuIntent: {
        selectARokuSpeach: 'Please choose one of the folowing Rokus.',
        singleRokuFoundSpeach: function (roku) {
            return sayRokuName(roku) + ' was the only Roku I found on your network. So I will choose this Roku to control.';
        },
        noRokusFoundSpeach: 'I couldn\'t find any Rokus on your local network. Make sure your Roku is turned on an has finished initializing. Then try again.',
        unableToListRokus: 'I\'m Sorry, I was unable to connect to your Roku Remote Server. Make sure you have your server running and any firewall forwarding in place.',
        repromptSpeech: 'Please Select a Roku.',
        instructionSpeech: function (rokus) {
            var speach = [];
            speach.push('Choose a number between 1 and ' + rokus.length + '. For example, say select roku number 2.');
            var namedRoku;
            for (var i = 0; i < rokus.length; i++) {
                if (rokus[i].name) {
                    namedRoku = rokus[i];
                    break;
                }
            }
            if (namedRoku) {
                speach.push('If your roku has a name, you can ask for it by name.');
                speach.push('Say Select roku ' + namedRoku.name + ' Or select my ' + namedRoku.name + ' roku.');
            }

            return speach.join(' ');
        }
    },

    selectedRokuIntent: {
        rokuSelectedSpeach: function (roku) {
            return 'Ok. I\'ve selected ' + sayRokuName(roku) + ' for you.'
        },

        badSelectionSpeach: 'I\'m sorry, that isn\'t a valid choice. Please choose one of the folowing Rokus.',

    },

    launchIntent: {
        speachText: 'ROKU remote, ready.',
    },

    listRokusIntent: {
        multipleRokusFoundSpeach: 'Here is a list of Rokus I found on you network.',
        singleRokuFoundSpeach: 'I found one Roku on your network.'
    },

    sendCommandIntent: {
        commandSentSpeach: '<audio src="https://s3-us-west-2.amazonaws.com/yozepi-alexa-files/roku/tick_alexa.mp3" />',
        noCommandSentSpeach: 'No command sent.',
        unableToSendCommandSpeach: 'Unable to send command. Please try again.',
        badCountSpeach: 'you can only execute a command between 1 and 10 times.',
        invalidCommandSpeach: function (commandSpeach) {
            return 'I don\'t understand command ' + commandSpeach + '.';
        }
    },

    typeTextIntent: {
        unableToTypeSpeach: function (text) {
            return 'Sorry, I was unable to type ' + text;
        },
        typeTextSpeach: function (text) {
            return 'Typing ' + text;
        }
    },

    launchAppIntent: {
        noMatchSpeach: function (filter) {
            return 'Sorry, there are no apps that match ' + filter + '.';
        },
        multipleMatchesSpeach: function (apps) {
            var applist = [];
            for (var i = 0; i < apps.length; i++) {
                applist.push(apps[i].text);
            }
            return "I found " + apps.length + " matches. Try saying "
                + listToSpeech(applist, "or", 'Launch ');

        },
        unableToLaunchSpeach: function (appText) {
            return 'Sorry, I could not launch ' + appText;
        },
        LaunchingSpeach: function (appText) {
            return 'Launching ' + appText;
        }
    },

    cancelIntent: {
        speachText: 'Ok.'
    },

    helpIntent: {
        generalHelpSpeach:
            '<p>My ROKU remote supports the following commands and functions.</p>'
            + ' <p>Navigation commands.'
            + ' say home, to go to the home screen.'
            + ' left, to move left.'
            + ' right, to move right.'
            + ' down, to move down.'
            + ' up, to move up.'
            + ' You can also move multiple times in any direction. For example, say right, 3 to move to the right 3 times.'
            + ' Or say down twice to move down 2 times.'
            + ' You can say back to move back one screen.'
            + ' say select, to select the current item.'
            + ' You can launch a roku application by saying launch followed by the application name.'
            + ' for example, launch netflix. or launch the roku channel.</p>'
            + ' <p>playback control commands.'
            + ' say play to play a selected program.'
            + ' say pause to pause the program.'
            + ' say forward, or fast forward to fast forward the currently playing program.'
            + ' say rewind, reverse, or backward to rewind.'
            + ' you can speed up fast forward and rewind by following with a number between 1 and 3.'
            + ' for example, say fast forward, 3, to fast forward at the fastest possible speed.'
            + ' you can say instant replay to back up the currently playing program a few seconds.'
            + ' say information or info to display information about the currently selected program.</p>'
            + ' <p>text related commands. These commands are useful when performing searches or other text entry.'
            + ' Say type followed by the words you want to type. For example, say type the lord of the rings. or type ironman.'
            + ' Say backspace to delete a character that was just typed.'
            + ' You can backspace multiple times by saying a number followed by the backspace command.'
            + ' For example, saying backspace 5, will backspace 5 characters.</p>'
    },

}


module.exports = {
    constants: constants,
    listRokusToSpeach: listRokusToSpeach,
    sayRokuName: sayRokuName,
    concatSlots: concatSlots
};