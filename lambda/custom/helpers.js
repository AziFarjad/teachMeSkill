/**
 * Created by mccaul on 5/11/18.
 */
const constants = require('./constants.js');
const AWS = constants.AWS;
const DYNAMODB_TABLE = constants.DYNAMODB_TABLE;
const model = require('./en-US.json'); // a static copy of your model, used to suggest custom slot values


module.exports = {
    'capitalize': function(inputString) {
        return inputString.replace(/(?:^|\s)\S/g, function(input) {
            return input.toUpperCase();
          }) ;
    },

    'randomArrayElement': function(myArray) {
        return(myArray[Math.floor(Math.random() * myArray.length)]);

    },

    // 'capitalize': function(myString) {
    //     return myString.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    //
    // },

    'supportsDisplay': function(handlerInput) // returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.)
    {                                      //  Enable your skill for display as shown here: https://alexa.design/enabledisplay
        const hasDisplay =
            handlerInput.requestEnvelope.context &&
            handlerInput.requestEnvelope.context.System &&
            handlerInput.requestEnvelope.context.System.device &&
            handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
            handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;

        return hasDisplay;
    },

    'timeDelta': function(t1, t2) {

        const dt1 = new Date(t1);
        const dt2 = new Date(t2);
        const timeSpanMS = dt2.getTime() - dt1.getTime();
        const span = {
            "timeSpanMIN": Math.floor(timeSpanMS / (1000 * 60 )),
            "timeSpanHR": Math.floor(timeSpanMS / (1000 * 60 * 60)),
            "timeSpanDAY": Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)),
            "timeSpanDesc" : ""
        };

        if (span.timeSpanHR < 2) {
            span.timeSpanDesc = span.timeSpanMIN + " minutes";
        } else if (span.timeSpanDAY < 2) {
            span.timeSpanDesc = span.timeSpanHR + " hours";
        } else {
            span.timeSpanDesc = span.timeSpanDAY + " days";
        }

        return span;

    },
    'sendTxtMessage': function(params, locale, callback) {

        const AWS = require('aws-sdk');
        //AWS.config.update({region: AWSregion});

        let mobileNumber = params.PhoneNumber.toString();


        if (locale === 'en-US') {
            if (mobileNumber.length < 10 ){
                const errMsg = 'mobileNumber provided is too short: ' + mobileNumber + '. ';
                callback(errMsg);
            }
            if (mobileNumber.substring(0,1) !== '1' ) {
                mobileNumber = '1' + mobileNumber;
            }
        }

        if (mobileNumber.substring(0,1) !== '+') {
            mobileNumber = '+' + mobileNumber;
        }

        let snsParams = params;
        snsParams.PhoneNumber = mobileNumber;

        const SNS = new AWS.SNS();

        SNS.publish(snsParams, function(err, data){

            console.log('sending message to ' + mobileNumber );

            if (err) console.log(err, err.stack);

            callback('I sent you a text message. ');

        });
    },

    'getSlotValues': function(filledSlots) {
        const slotValues = {};

        Object.keys(filledSlots).forEach((item) => {
            const name  = filledSlots[item].name;

            if (filledSlots[item] &&
                filledSlots[item].resolutions &&
                filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
                filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
                filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
                switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
                    case 'ER_SUCCESS_MATCH':

                        let resolutions = [];
                        let vals = filledSlots[item].resolutions.resolutionsPerAuthority[0].values;
                        for (let i = 0; i < vals.length; i++) {
                            resolutions.push(vals[i].value.name);
                        }
                        slotValues[name] = {
                            heardAs: filledSlots[item].value,

                            resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                            resolutions: resolutions,

                            ERstatus: 'ER_SUCCESS_MATCH'
                        };
                        break;
                    case 'ER_SUCCESS_NO_MATCH':
                        slotValues[name] = {
                            heardAs: filledSlots[item].value,
                            resolved: '',
                            ERstatus: 'ER_SUCCESS_NO_MATCH'
                        };
                        break;
                    default:
                        break;
                }
            } else {
                slotValues[name] = {
                    heardAs: filledSlots[item].value,
                    resolved: '',
                    ERstatus: ''
                };
            }
        }, this);

        return slotValues;
    },
    'randomArrayElement': function(myArray) {
        return(myArray[Math.floor(Math.random() * myArray.length)]);

    },
    'shuffleArray': function(array) {  // Fisher Yates shuffle!

        let currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    },
    'sayArray': function(myData, penultimateWord = 'and') {
        // the first argument is an array [] of items
        // the second argument is the list penultimate word; and/or/nor etc.  Default to 'and'
        let result = '';

        myData.forEach(function(element, index, arr) {

            if (index === 0) {
                result = element;
            } else if (index === myData.length - 1) {
                result += ` ${penultimateWord} ${element}`;
            } else {
                result += `, ${element}`;
            }
        });
        return result;
    },
    'getExampleSlotValues': function(intentName, slotName) {
        // console.log('****** in getExampleSlotValues');
        // console.log(intentName, slotName);

        let examples = [];
        let slotType = '';
        let slotValuesFull = [];

        let intents = model.interactionModel.languageModel.intents;
        for (let i = 0; i < intents.length; i++) {
            // console.log(intentName + ' compared to ' + intents[i].name);
            if (intents[i].name === intentName) {

                let slots = intents[i].slots;
                for (let j = 0; j < slots.length; j++) {
                    if (slots[j].name === slotName) {
                        slotType = slots[j].type;

                    }
                }
            }

        }
        let types = model.interactionModel.languageModel.types;
        for (let i = 0; i < types.length; i++) {
            if (types[i].name === slotType) {
                slotValuesFull = types[i].values;
            }
        }

        slotValuesFull =  module.exports.shuffleArray(slotValuesFull);

        examples.push(slotValuesFull[0].name.value);
        examples.push(slotValuesFull[1].name.value);
        if (slotValuesFull.length > 2) {
            examples.push(slotValuesFull[2].name.value);
        }


        return examples;
    },
    'resolveCanonical': function(slot){
        let canonical = '';
        if (slot.hasOwnProperty('resolutions')) {
            canonical = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        } else {
            canonical = slot.value;
        }

        return canonical;
    },

    'generatePassPhrase': function() {
        // 'correct', 'horse', 'battery', 'staple'
        const word1 = ['nice', 'good', 'clear', 'kind', 'red', 'green', 'orange', 'yellow', 'brown', 'careful',
            'powerful', 'vast', 'happy', 'deep', 'warm', 'cold', 'heavy', 'dry', 'quiet', 'sweet',
            'short', 'long', 'late', 'early', 'quick', 'fast', 'slow', 'other','public','clean','proud',
            'flat','round', 'loud', 'funny', 'free', 'tall', 'short', 'big', 'small'];

        const word2 = ['person', 'day', 'car', 'tree', 'fish', 'wheel', 'chair', 'sun', 'moon', 'star',
            'story', 'voice', 'job', 'fact', 'record', 'computer', 'ocean', 'building', 'cat', 'dog', 'rabbit',
            'carrot', 'orange', 'bread', 'soup', 'spoon', 'fork', 'straw', 'napkin', 'fold', 'pillow', 'radio',
            'towel', 'pencil', 'table', 'mark', 'teacher', 'student', 'developer', 'raisin', 'pizza', 'movie',
            'book', 'cup', 'plate', 'wall', 'door', 'window', 'shoes', 'hat', 'shirt', 'bag', 'page', 'clock',
            'glass', 'button', 'bump', 'paint', 'song', 'story', 'memory', 'school', 'corner', 'wire', 'cable'
        ];
        const numLimit = 999;

        const phraseObject = {
            'word1': randomArrayElement(word1),
            'word2': randomArrayElement(word2),
            'number': Math.floor(Math.random() * numLimit)
        };
        return phraseObject;
    }

};
