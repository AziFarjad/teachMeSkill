/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const helpers = require('./helpers.js');
const constants = require('./constants.js');
const colorData = require('./colors.json');
const interceptors = require('./interceptors.js');

const AWS = constants.AWS;
const DYNAMODB_TABLE = constants.DYNAMODB_TABLE;

function setGameIsPlaying(handlerInput, gameIsPlaying){
  let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes['gameIsPlaying'] = gameIsPlaying;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

function isGamePlaying(handlerInput){
  let gameIsPlaying = false;

  let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  if (sessionAttributes['gameIsPlaying'] != undefined){
    gameIsPlaying = sessionAttributes['gameIsPlaying']
  }

  return gameIsPlaying;
}

function persistAnswer(handlerInput, answer){
  let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes['answer'] = answer;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

function updateQACounter(handlerInput, value){
  let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes['QACounter'] += value;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

function UpdateScore(handlerInput, value){
  let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes['Score'] = value;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

function getAnswer(handlerInput){
  let answer = undefined;

  let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  if (sessionAttributes['answer'] != undefined){
    answer = sessionAttributes['answer']
  }

  return answer;
}

const LaunchHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'LaunchRequest') ||
            (handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    let skillTitle = constants.getSkillTitle();
    const responseBuilder = handlerInput.responseBuilder;
    let speechOutput = ACTIONS_MESSAGE;
    if (handlerInput.requestEnvelope.session.new) {
       speechOutput = WELCOME_MESSAGE + ' ' + speechOutput;
    } else {
       speechOutput = 'Alright.' + ' ' + speechOutput;
    }
    if (helpers.supportsDisplay(handlerInput)) {
      const welcomeImage = new Alexa.ImageHelper()
          .addImageInstance(constants.getLargeWelcomeImg().url)
          .getImage();

      responseBuilder.addRenderTemplateDirective({
          type : 'BodyTemplate7',
          token : 'string',
          backButton : 'VISIBLE',
          backgroundImage: welcomeImage,
        });


    }

    return responseBuilder
      .speak(speechOutput)
      .reprompt(ACTIONS_MESSAGE)
      .withSimpleCard(helpers.capitalize(constants.invocationName), speechOutput)
      .getResponse();
  },
};

const LearnColorsHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.intent.name === 'LearnColorsIntent');
  },
  handle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      sessionAttributes['game'] = 'Learn Colors';

      const responseBuilder = handlerInput.responseBuilder;
      let speechOutput = 'Great.  I will show you ' + constants.QuestionCount + ' web colors, ';
      if (helpers.supportsDisplay(handlerInput)) {
          speechOutput += 'On the screen of your Echo device. ';
      } else {
          speechOutput += 'On the Alexa app on your phone. ';
      }


      speechOutput += 'Just repeat the name of the color I show you. Ready to begin? ';

      if (helpers.supportsDisplay(handlerInput)) {

          // const welcomeImage = new Alexa.ImageHelper()
          //     .addImageInstance(constants.getLargeWelcomeImg().url)
          //     .getImage();

          responseBuilder.addRenderTemplateDirective({
              type : 'ListTemplate1',
              token : 'string',
              backButton : 'VISIBLE',
              backgroundImage: '',
              title : 'Some colors..',
              listItems: [
                  {'token':'string 1',  'textContent':'color 1 name here'},
                  {'token':'string 2',  'textContent':'color 2 name here'},
                  {'token':'string 3',  'textContent':'color 3 name here'},
              ]
          });

      }
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak(speechOutput)
        .reprompt('Are you ready to start the quiz?')
        .getResponse();
  },
};

const LearnYesHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        return (
            request.type === 'IntentRequest'
            &&
            request.intent.name === 'AMAZON.YesIntent'
            &&
            sessionAttributes.game === 'Learn Colors'
        );
    },
    handle(handlerInput) {
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes['correctCount'] = 0;
        sessionAttributes['wrongCount'] = 0;
        sessionAttributes['currentQuestionIndex'] = 0;
        sessionAttributes['wrongList'] = [];
        sessionAttributes['game'] = 'Learn Colors';

        const questionList = helpers.shuffleArray(colorData.colors).slice(0,constants.QuestionCount);
        sessionAttributes['questionList'] = questionList;

        const nextQuestion = questionList[sessionAttributes['currentQuestionIndex'] ].fileName;

        const imgUrl = `https://s3.amazonaws.com/skill-images-789/colors/${nextQuestion}.png`;


        let speechOutput = 'Okay here we go. First question, what color is this? ' + nextQuestion;
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt('Are you ready to start the quiz?')
            // .withSimpleCard(helpers.capitalize(constants.invocationName), nextQuestion)
            .withStandardCard(helpers.capitalize(constants.invocationName), nextQuestion, imgUrl, imgUrl)
            .getResponse();
    }
};

const LearnAnswerHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        return (
            request.type === 'IntentRequest'
            &&
            request.intent.name === 'GetColorIntent'
            &&
            sessionAttributes.game === 'Learn Colors'
        );
    },
    handle(handlerInput) {

        const request = handlerInput.requestEnvelope.request;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const questionList = sessionAttributes['questionList'];

        let color = '';

        let speechOutput = '';

        let slotStatus = '';

        let slotValues = helpers.getSlotValues(request.intent.slots);

        if (slotValues.color.heardAs) {
            slotStatus += ' I heard you say, ' + slotValues.color.heardAs + '. ';
            color = slotValues.color.heardAs;

        } else {
            slotStatus += 'I didn\'t catch your color.  Can you repeat? ';
        }

        if (slotValues.color.ERstatus === 'ER_SUCCESS_MATCH') {

            slotStatus += 'a valid ';
            if(slotValues.color.resolved === slotValues.color.heardAs) {
                slotStatus += 'match. '
            } else {

                if(slotValues.color.resolutions && slotValues.color.resolutions.length > 1) {
                    slotStatus += ' match for '
                        + slotValues.color.resolutions.length + ' values, '
                        + helpers.sayArray(slotValues.color.resolutions, 'or') + '. Try again with one of these? ';

                } else {
                    slotStatus += 'synonym for ' + slotValues.color.resolved + '. ';
                }
            }

            color = slotValues.color.resolved;

        }
        if (slotValues.color.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            // slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.color.heardAs + '" to the custom slot type used by slot color! ');
        }

        // if( (slotValues.color.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.color.heardAs) ) {
        //     slotStatus += 'A few valid values from your custom slot are, '
        //         + helpers.sayArray(helpers.getExampleSlotValues('GetColorIntent','color'), 'or');
        // }

        if(color !== '') {

            let correctAnswer = questionList[sessionAttributes['currentQuestionIndex']].title;
            if(correctAnswer.toLowerCase() === color.toLowerCase() ) {

              sessionAttributes['correctCount'] += 1;
              slotStatus += ' correct! ';

            } else {  // wrong answer
              slotStatus += ' which is not right.  ' +
                  helpers.randomArrayElement(['I was looking for, ', 'The right answer is, ', 'this color is called, ']) +
                  correctAnswer + '. ';

                sessionAttributes['wrongCount'] += 1;
            }
            sessionAttributes['currentQuestionIndex'] += 1;



            if(sessionAttributes['currentQuestionIndex'] < constants.QuestionCount){

                slotStatus += ' your score is, ' +
                    sessionAttributes['correctCount']
                    + ' out of '
                    + sessionAttributes['currentQuestionIndex']
                    + '. ';

                const nextQuestion = questionList[sessionAttributes['currentQuestionIndex'] ].fileName;
                if (sessionAttributes['currentQuestionIndex'] < constants.QuestionCount - 1) {

                  slotStatus += ' next question, ';

                } else {
                  slotStatus += ' final question, ';

                }
                slotStatus += '  what color is this? ' + nextQuestion;
            } else {
                slotStatus += ' you are all done! ';
                slotStatus += ' your final score is, ' + sessionAttributes['correctCount'] + ' out of ' + sessionAttributes['currentQuestionIndex'] + '. ';

            }

        }

        speechOutput += slotStatus;



        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        // speechOutput += 'You said, ' + answer + '. What color is this?';

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(speechOutput)
            .withSimpleCard(helpers.capitalize(constants.invocationName), speechOutput)
            .getResponse();
    }
};

// --------------------------------------------------------------------------------------

const StartColorsQuizHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (request.intent.name === 'StartColorsQuizIntent'));
  },
  handle(handlerInput) {
    UpdateScore.call(this, handlerInput, 0);
    let skillTitle = constants.getSkillTitle();
    const responseBuilder = handlerInput.responseBuilder;

    if (helpers.supportsDisplay(handlerInput)) {
      const image = new Alexa.ImageHelper()
          .addImageInstance(constants.getLargeWelcomeImg().url)
          .getImage();

      responseBuilder.addRenderTemplateDirective({
          type : 'BodyTemplate7',
          token : 'string',
          backButton : 'VISIBLE',
          backgroundImage: image,
        });
    }

    let speechOutput = 'Starting Color Quiz.  Each round, I will give you 5 Images, and you will need to answer me about a color in the image. Ready?';
    return responseBuilder
      .speak(speechOutput)
      .reprompt('Are you ready to start the quiz?')
      .withSimpleCard(skillTitle, speechOutput)
      .getResponse();
  },
};

const AskQuestionHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (request.intent.name === 'AMAZON.YesIntent'
            || request.intent.name === 'continueGameIntent'));
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    let skillTitle = constants.getSkillTitle();

    setGameIsPlaying.call(this, handlerInput, true);

    updateQACounter.call(this, handlerInput, 1);

    const responseBuilder = handlerInput.responseBuilder;

    let object = getRandomObject();
    let QA = getRandomQuestionAnswer(object);

    persistAnswer.call(this, handlerInput, QA.answer)

    if (helpers.supportsDisplay(handlerInput)) {
      const image = new Alexa.ImageHelper()
          .addImageInstance(object.url)
          .getImage();

      const primaryText = new Alexa.RichTextContentHelper()
          .withPrimaryText(QA.question)
          .getTextContent();

      responseBuilder.addRenderTemplateDirective({
          type : 'BodyTemplate7',
          token : 'string',
          backButton : 'VISIBLE',
          backgroundImage: image,
          textContent: primaryText,
        });
    }

    let speechOutput = QA.question;
    if (request.intent.name === 'AMAZON.YesIntent'){
        speechOutput = 'All right. ' + speechOutput;
    }

    return responseBuilder
      .speak(speechOutput)
      .reprompt(QA.question)
      .withSimpleCard(skillTitle, speechOutput)
      .getResponse();
  },
};

const answerHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return ((handlerInput.requestEnvelope.request.type === 'IntentRequest')
            && (request.intent.name === 'GetColorIntent'));
  },
  handle(handlerInput) {
    let skillTitle = constants.getSkillTitle();
    let gameIsPlaying = isGamePlaying.call(this, handlerInput);

    let speechOutput = '';
    const request = handlerInput.requestEnvelope.request;
    let answer = request.intent.slots.color.value;
    let expectedAnswer = getAnswer.call(this, handlerInput);
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    let score = sessionAttributes['Score'];

    if (gameIsPlaying) {
      let imageURL = constants.getErrorImg().url;
      let speechOutput = '';
      // TODO: : Check answer against undefined
      if (answer == expectedAnswer) {
        imageURL = constants.getCorrectImg().url;
        speechOutput = 'Correct. <say-as interpret-as="interjection">well done</say-as>. '; //Randomize
        score += 1;
        UpdateScore.call(this, handlerInput, 1);
      } else {
        speechOutput = 'Ah, No. '; // TODO: Randomize
        speechOutput += ' ' + 'The correct answer is ' + expectedAnswer + '. ';
      }

      let screenText = '';
      let QACounter = sessionAttributes['QACounter'];

      let shouldContinueGame = QACounter < constants.getNumberOfQuestionsToAsk() - 1;
      if (shouldContinueGame) {
        speechOutput += ' Say next to continue the quiz or stop to quit the quiz.'
      } else {
        imageURL = constants.getTrophyImg().url;
        //// TODO: Update speechOutput to tell a sound using SSML like tadaaaaaa
        speechOutput += '<prosody volume="loud"> And your score is: <audio src="https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_comedy_02.mp3"/>' +
          score + ' out of ' + constants.getNumberOfQuestionsToAsk() + '. </prosody>';
        // TODO: Update Primary text to show number of score 4/5
        speechOutput += 'To start a new quiz say start a quiz, say stop to quit.';
        screenText = score + '/' + constants.getNumberOfQuestionsToAsk();
      }

      const responseBuilder = handlerInput.responseBuilder;

      if (helpers.supportsDisplay(handlerInput)) {

        const image = new Alexa.ImageHelper()
            .addImageInstance(imageURL)
            .getImage();

        const primaryText = new Alexa.RichTextContentHelper()
            .withPrimaryText(screenText)
            .getTextContent('');

        if (shouldContinueGame) {
          responseBuilder.addRenderTemplateDirective({
              type : 'BodyTemplate7',
              token : 'string',
              backButton : 'HIDDEN',
              image: image,
              textContent: primaryText,
            });
        } else {
          handlerInput.responseBuilder.addRenderTemplateDirective({
            type: 'BodyTemplate7',
            token: 'string',
            backButton: 'HIDDEN',
            image: image,
            title: screenText,
          });
        }
      }

      return responseBuilder
        .speak(speechOutput)
        .reprompt('')
        .withSimpleCard(skillTitle, speechOutput)
        .getResponse();
    } else {
      //// TODO: Better error handling when user mentions a color outside the quiz
      return responseBuilder
        .speak('I do not understand')
        .reprompt('')
        .withSimpleCard(skillTitle, 'I do not understand')
        .getResponse();
    }
  },
};

function getRandomObject(){
  const objects = constants.getObjects();
  const index = Math.floor(Math.random() * objects.length);
  console.log(objects[index]);
  return objects[index];
};

function getRandomQuestionAnswer(object){
  const quiz = object.quiz;
  const index = Math.floor(Math.random() * quiz.length);
  return quiz[index];
}

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const stack = error.stack.split('\n');
    console.log(stack[0]);
    console.log(stack[1]);

    let errorLoc = stack[1].substring(stack[1].lastIndexOf('/') + 1, 100);
    errorLoc = errorLoc.slice(0, -1);

    const file = errorLoc.substring(0, errorLoc.indexOf(':'));
    let line = errorLoc.substring(errorLoc.indexOf(':') + 1, 100);
    line = line.substring(0, line.indexOf(':'));

    // console.log(error.stack.indexOf('\n'));
    // console.log(`Error handled: ${error.message}\n${error.message}`);
    let speechOutput = 'Sorry, an error occurred. ';
    if(constants.debug) {
        speechOutput +=  error.message + ' in ' + file + ', line ' + line;
    }

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'Teach Me';
const WELCOME_MESSAGE = 'Welcome to Teach Me.';
const ACTIONS_MESSAGE = 'What do you want to do? To learn about colors or to take a color quiz?';
// // TODO: Update Help message based on when they ask for help
const HELP_MESSAGE = 'You can do a quiz by saying start a color quiz, or, you can say exit... What can I help you with?'
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchHandler,

    LearnColorsHandler,
    LearnYesHandler,
    LearnAnswerHandler,

    StartColorsQuizHandler,
    AskQuestionHandler,
    answerHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(interceptors.RequestPersistenceInterceptor)
  .addRequestInterceptors(interceptors.RequestHistoryInterceptor)
  // .addRequestInterceptors(interceptors.RequestJoinRankInterceptor)

  .addResponseInterceptors(interceptors.ResponsePersistenceInterceptor)
  .addResponseInterceptors(interceptors.SpeechOutputInterceptor)

  .addErrorHandlers(ErrorHandler)

  .withTableName(DYNAMODB_TABLE)
  .withAutoCreateTable(true)

  .lambda();
