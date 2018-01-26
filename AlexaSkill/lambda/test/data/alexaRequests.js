'use strict';

var constants = require('../../helpers').constants;

var fillSlots = function (slots, text, slotPrefix, maxLength) {

    var startCode = 'a'.charCodeAt(0);
    var textArr = text.split(' ');
    for (var i = 0; i < (textArr.length > maxLength ? maxLength : textArr.length); i++) {
        var slotName = slotPrefix + String.fromCharCode(startCode + i);
        slots[slotName].value = textArr[i];
    }
};

module.exports = {

    launch: function () {
        
        var response = {
            "session": {
                "new": false,
                "sessionId": "SessionId.7f423223-3bbe-4bd0-9ecb-d294fc431480",
                "application": {
                    "applicationId": constants.appId
                },
                "attributes": {},
                "user": {
                    "userId": "amzn1.ask.account.AET2TQRBK2LYGVWVAHB5BEQQ6F26CHP2EHNHLQO2WC4UKSQDID723WJPAWH26C7ONJX66ZAQYR6SN66TTR4BXYLGHP7YQ7Y7ESPGAZ4QMKY4RIPGFM4JMHRUWECOKRNDOYZYCIWBQRSX3S7X3ZN52X6NIXIFDREK3REK57HAJDVHSGIH6N2VOSQS5LT4VUQBDFYYN2RG36LI4RY"
                }
            },
            "request": {
                "type": "IntentRequest",
                "requestId": "EdwRequestId.09e99249-761a-44b9-8770-02c91d2c0244",
                "intent": {
                    "name": "Launch"
                },
                "locale": "en-US",
                "timestamp": "2018-01-13T08:25:34Z"
            },
            "context": {
                "AudioPlayer": {
                    "playerActivity": "IDLE"
                },
                "System": {
                    "application": {
                        "applicationId": constants.appId
                    },
                    "user": {
                        "userId": "amzn1.ask.account.AET2TQRBK2LYGVWVAHB5BEQQ6F26CHP2EHNHLQO2WC4UKSQDID723WJPAWH26C7ONJX66ZAQYR6SN66TTR4BXYLGHP7YQ7Y7ESPGAZ4QMKY4RIPGFM4JMHRUWECOKRNDOYZYCIWBQRSX3S7X3ZN52X6NIXIFDREK3REK57HAJDVHSGIH6N2VOSQS5LT4VUQBDFYYN2RG36LI4RY"
                    },
                    "device": {
                        "supportedInterfaces": {}
                    }
                }
            },
            "version": "1.0"
        };
        return response;
    },

    launchApp: function (text) {
        var response = {
            "session": {
                "new": false,
                "sessionId": "SessionId.7f423223-3bbe-4bd0-9ecb-d294fc431480",
                "application": {
                    "applicationId": constants.appId
                },
                "attributes": {},
                "user": {
                    "userId": "amzn1.ask.account.AET2TQRBK2LYGVWVAHB5BEQQ6F26CHP2EHNHLQO2WC4UKSQDID723WJPAWH26C7ONJX66ZAQYR6SN66TTR4BXYLGHP7YQ7Y7ESPGAZ4QMKY4RIPGFM4JMHRUWECOKRNDOYZYCIWBQRSX3S7X3ZN52X6NIXIFDREK3REK57HAJDVHSGIH6N2VOSQS5LT4VUQBDFYYN2RG36LI4RY"
                }
            },
            "request": {
                "type": "IntentRequest",
                "requestId": "EdwRequestId.09e99249-761a-44b9-8770-02c91d2c0244",
                "intent": {
                    "name": "LaunchAppIntent",
                    "slots": {
                        "filter_a": {
                            "name": "filter_a",
                        },
                        "filter_b": {
                            "name": "filter_b"
                        },
                        "filter_c": {
                            "name": "filter_c"
                        }
                    }
                },
                "locale": "en-US",
                "timestamp": "2018-01-13T08:25:34Z"
            },
            "context": {
                "AudioPlayer": {
                    "playerActivity": "IDLE"
                },
                "System": {
                    "application": {
                        "applicationId": constants.appId
                    },
                    "user": {
                        "userId": "amzn1.ask.account.AET2TQRBK2LYGVWVAHB5BEQQ6F26CHP2EHNHLQO2WC4UKSQDID723WJPAWH26C7ONJX66ZAQYR6SN66TTR4BXYLGHP7YQ7Y7ESPGAZ4QMKY4RIPGFM4JMHRUWECOKRNDOYZYCIWBQRSX3S7X3ZN52X6NIXIFDREK3REK57HAJDVHSGIH6N2VOSQS5LT4VUQBDFYYN2RG36LI4RY"
                    },
                    "device": {
                        "supportedInterfaces": {}
                    }
                }
            },
            "version": "1.0"
        };

        fillSlots(response.request.intent.slots, text, 'filter_', 3)

        return response;
    },

    sendCommand: function (cmd, count) {

        var response = {
            "session": {
                "new": false,
                "sessionId": "SessionId.7f423223-3bbe-4bd0-9ecb-d294fc431480",
                "application": {
                    "applicationId": constants.appId
                },
                "attributes": {},
                "user": {
                    "userId": "amzn1.ask.account.AET2TQRBK2LYGVWVAHB5BEQQ6F26CHP2EHNHLQO2WC4UKSQDID723WJPAWH26C7ONJX66ZAQYR6SN66TTR4BXYLGHP7YQ7Y7ESPGAZ4QMKY4RIPGFM4JMHRUWECOKRNDOYZYCIWBQRSX3S7X3ZN52X6NIXIFDREK3REK57HAJDVHSGIH6N2VOSQS5LT4VUQBDFYYN2RG36LI4RY"
                }
            },
            "request": {
                "type": "IntentRequest",
                "requestId": "EdwRequestId.09e99249-761a-44b9-8770-02c91d2c0244",
                "intent": {
                    "name": "SendCommandIntent",
                    "slots": {
                        "count": {
                            "name": "count"
                        },
                        "rokucommand": {
                            "name": "rokucommand",
                        }
                    }
                },
                "locale": "en-US",
                "timestamp": "2018-01-13T08:25:34Z"
            },
            "context": {
                "AudioPlayer": {
                    "playerActivity": "IDLE"
                },
                "System": {
                    "application": {
                        "applicationId": constants.appId
                    },
                    "user": {
                        "userId": "amzn1.ask.account.AET2TQRBK2LYGVWVAHB5BEQQ6F26CHP2EHNHLQO2WC4UKSQDID723WJPAWH26C7ONJX66ZAQYR6SN66TTR4BXYLGHP7YQ7Y7ESPGAZ4QMKY4RIPGFM4JMHRUWECOKRNDOYZYCIWBQRSX3S7X3ZN52X6NIXIFDREK3REK57HAJDVHSGIH6N2VOSQS5LT4VUQBDFYYN2RG36LI4RY"
                    },
                    "device": {
                        "supportedInterfaces": {}
                    }
                }
            },
            "version": "1.0"
        };

        response.request.intent.slots.rokucommand.value = cmd;
        if (count !== undefined) {
            response.request.intent.slots.count.value = count;
        }
        return response;
    },

    selectedRoku: function (choice) {

        var response = {
            "session": {
                "new": false,
                "sessionId": "SessionId.7f423223-3bbe-4bd0-9ecb-d294fc431480",
                "application": {
                    "applicationId": constants.appId
                },
                "attributes": {},
                "user": {
                    "userId": "amzn1.ask.account.AET2TQRBK2LYGVWVAHB5BEQQ6F26CHP2EHNHLQO2WC4UKSQDID723WJPAWH26C7ONJX66ZAQYR6SN66TTR4BXYLGHP7YQ7Y7ESPGAZ4QMKY4RIPGFM4JMHRUWECOKRNDOYZYCIWBQRSX3S7X3ZN52X6NIXIFDREK3REK57HAJDVHSGIH6N2VOSQS5LT4VUQBDFYYN2RG36LI4RY"
                }
            },
            "request": {
                "type": "IntentRequest",
                "requestId": "EdwRequestId.09e99249-761a-44b9-8770-02c91d2c0244",
                "intent": {
                    "name": "SelectedRokuIntent",
                    "slots": {
                        "choice": {
                            "name": "choice"
                        }
                    }
                },
                "locale": "en-US",
                "timestamp": "2018-01-13T08:25:34Z"
            },
            "context": {
                "AudioPlayer": {
                    "playerActivity": "IDLE"
                },
                "System": {
                    "application": {
                        "applicationId": constants.appId
                    },
                    "user": {
                        "userId": "amzn1.ask.account.AET2TQRBK2LYGVWVAHB5BEQQ6F26CHP2EHNHLQO2WC4UKSQDID723WJPAWH26C7ONJX66ZAQYR6SN66TTR4BXYLGHP7YQ7Y7ESPGAZ4QMKY4RIPGFM4JMHRUWECOKRNDOYZYCIWBQRSX3S7X3ZN52X6NIXIFDREK3REK57HAJDVHSGIH6N2VOSQS5LT4VUQBDFYYN2RG36LI4RY"
                    },
                    "device": {
                        "supportedInterfaces": {}
                    }
                }
            },
            "version": "1.0"
        };

        response.request.intent.slots.choice.value = choice;
        return response;
    },

    typeText: function (text) {

        var response = {
            "session": {
                "new": false,
                "sessionId": "SessionId.7f423223-3bbe-4bd0-9ecb-d294fc431480",
                "application": {
                    "applicationId": constants.appId
                },
                "attributes": {},
                "user": {
                    "userId": "amzn1.ask.account.AET2TQRBK2LYGVWVAHB5BEQQ6F26CHP2EHNHLQO2WC4UKSQDID723WJPAWH26C7ONJX66ZAQYR6SN66TTR4BXYLGHP7YQ7Y7ESPGAZ4QMKY4RIPGFM4JMHRUWECOKRNDOYZYCIWBQRSX3S7X3ZN52X6NIXIFDREK3REK57HAJDVHSGIH6N2VOSQS5LT4VUQBDFYYN2RG36LI4RY"
                }
            },
            "request": {
                "type": "IntentRequest",
                "requestId": "EdwRequestId.09e99249-761a-44b9-8770-02c91d2c0244",
                "intent": {
                    "name": "TypeTextIntent",
                    "slots": {
                        "text_a": {
                            "name": "text_a"
                        },
                        "text_b": {
                            "name": "text_b"
                        },
                        "text_c": {
                            "name": "text_c"
                        },
                        "text_d": {
                            "name": "text_d"
                        },
                        "text_e": {
                            "name": "text_e"
                        },
                        "text_f": {
                            "name": "text_f"
                        },
                        "text_g": {
                            "name": "text_g"
                        },
                        "text_h": {
                            "name": "text_h"
                        },
                        "text_i": {
                            "name": "text_i"
                        },
                        "text_j": {
                            "name": "text_j"
                        },
                    }
                },
                "locale": "en-US",
                "timestamp": "2018-01-13T08:25:34Z"
            },
            "context": {
                "AudioPlayer": {
                    "playerActivity": "IDLE"
                },
                "System": {
                    "application": {
                        "applicationId": constants.appId
                    },
                    "user": {
                        "userId": "amzn1.ask.account.AET2TQRBK2LYGVWVAHB5BEQQ6F26CHP2EHNHLQO2WC4UKSQDID723WJPAWH26C7ONJX66ZAQYR6SN66TTR4BXYLGHP7YQ7Y7ESPGAZ4QMKY4RIPGFM4JMHRUWECOKRNDOYZYCIWBQRSX3S7X3ZN52X6NIXIFDREK3REK57HAJDVHSGIH6N2VOSQS5LT4VUQBDFYYN2RG36LI4RY"
                    },
                    "device": {
                        "supportedInterfaces": {}
                    }
                }
            },
            "version": "1.0"
        };

        fillSlots(response.request.intent.slots, text, 'text_', 10);

        return response;
    },

    helpIntent: function () {

        var response = {
            "session": {
                "new": false,
                "sessionId": "SessionId.7f423223-3bbe-4bd0-9ecb-d294fc431480",
                "application": {
                    "applicationId": constants.appId
                },
                "attributes": {},
                "user": {
                    "userId": "amzn1.ask.account.AET2TQRBK2LYGVWVAHB5BEQQ6F26CHP2EHNHLQO2WC4UKSQDID723WJPAWH26C7ONJX66ZAQYR6SN66TTR4BXYLGHP7YQ7Y7ESPGAZ4QMKY4RIPGFM4JMHRUWECOKRNDOYZYCIWBQRSX3S7X3ZN52X6NIXIFDREK3REK57HAJDVHSGIH6N2VOSQS5LT4VUQBDFYYN2RG36LI4RY"
                }
            },
            "request": {
                "type": "IntentRequest",
                "requestId": "EdwRequestId.09e99249-761a-44b9-8770-02c91d2c0244",
                "intent": {
                    "name": "AMAZON.HelpIntent"
                },
                "locale": "en-US",
                "timestamp": "2018-01-13T08:25:34Z"
            },
            "context": {
                "AudioPlayer": {
                    "playerActivity": "IDLE"
                },
                "System": {
                    "application": {
                        "applicationId": constants.appId
                    },
                    "user": {
                        "userId": "amzn1.ask.account.AET2TQRBK2LYGVWVAHB5BEQQ6F26CHP2EHNHLQO2WC4UKSQDID723WJPAWH26C7ONJX66ZAQYR6SN66TTR4BXYLGHP7YQ7Y7ESPGAZ4QMKY4RIPGFM4JMHRUWECOKRNDOYZYCIWBQRSX3S7X3ZN52X6NIXIFDREK3REK57HAJDVHSGIH6N2VOSQS5LT4VUQBDFYYN2RG36LI4RY"
                    },
                    "device": {
                        "supportedInterfaces": {}
                    }
                }
            },
            "version": "1.0"
        };

        return response;
    }
}