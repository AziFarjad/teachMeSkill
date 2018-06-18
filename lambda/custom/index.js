/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const helpers = require('./helpers.js');
const constants = require('./constants.js');

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
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    let skillTitle = constants.getSkillTitle();
    const responseBuilder = handlerInput.responseBuilder;
    const speechOutput = WELCOME_MESSAGE + ' ' + ACTIONS_MESSAGE;

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
      .withSimpleCard(skillTitle, speechOutput)
      .getResponse();
  },
};

const LearnColorsHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.intent.name === 'LearnColorsIntent');
  },
  handle(handlerInput) {
    // To DO: This sesction will teach colors by showing images and talking about colors in the picture
    return handlerInput.responseBuilder
      .speak('Let us learn colors')
      .getResponse();
  },
};

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
      let speechOutput = 'Ah, No. '; // TODO: Randomize
      // TODO: : Check answer against undefined
      if (answer == expectedAnswer) {
        imageURL = constants.getCorrectImg().url;
        speechOutput = 'Well done.'; //Randomize
        score += 1;
        UpdateScore.call(this, handlerInput, 1);
      } else {
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
        speechOutput += 'Here is your score. ' + score + ' out of ' +
          constants.getNumberOfQuestionsToAsk() + '.';
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
            .withPrimaryText('')
            .getTextContent(screenText);

        //// TODO: Show score on the screen
        //if (shouldContinueGame) {
          responseBuilder.addRenderTemplateDirective({
              type : 'BodyTemplate7',
              token : 'string',
              backButton : 'HIDDEN',
              image: image,
              textContent: primaryText,
            });
        // } else {
        //   responseBuilder.addRenderTemplateDirective({
        //       type : 'BodyTemplate3',
        //       token : 'string',
        //       backButton : 'HIDDEN',
        //       image: image,
        //       backgroundImage: image,
        //       textContent: primaryText,
        //     });
        // }
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
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'Color Guru';
const WELCOME_MESSAGE = 'Welcome to color guru.';
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
    StartColorsQuizHandler,
    AskQuestionHandler,
    answerHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
