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

function getAnswer(handlerInput){
  let answer = 'Unknown';

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

      const primaryText = new Alexa.RichTextContentHelper()
          .withPrimaryText('Welcome')
          .getTextContent();

          responseBuilder.addRenderTemplateDirective({
              type : 'BodyTemplate7',
              token : 'string',
              backButton : 'VISIBLE',
              backgroundImage: welcomeImage,
              textContent: primaryText,
            });
          /*"type":"BodyTemplate1",
            "token": "string",
            "backButton": "VISIBLE"(default) | "HIDDEN",
            "backgroundImage": Image,
            "title": "string",
            "textContent": TextContent*/

      // responseBuilder.addRenderTemplateDirective({
      //     type : 'BodyTemplate1',
      //     token : 'string',
      //     backButton : 'VISIBLE',
      //     image: welcomeImage,
      //     title: 'The title',
      //     textContent: 'This is a looooooong text',
      //   });
    }

    return responseBuilder
      .speak(speechOutput)
      .reprompt(ACTIONS_MESSAGE)
      //.withShouldEndSession(true)
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
    // To DO: This sesction will show some images and it will teach colors
    return handlerInput.responseBuilder
      .speak('Let us learn colors')
      //.withSimpleCard(SKILL_NAME, randomFact)
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

    let gameIsPlaying = false;

    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if (sessionAttributes['gameIsPlaying'] != undefined){
      gameIsPlaying = sessionAttributes['gameIsPlaying']
    }

    //let gameIsPlaying = isGamePlaying(handlerInput);

    let message = '';
    const request = handlerInput.requestEnvelope.request;
    let answer = request.intent.slots.color.value;
    let expectedAnswer = getAnswer.call(this, handlerInput);

    if (gameIsPlaying) {
      let imageURL = constants.getErrorImg().url;
      let message = 'Ah, No. '; //Randomize
      if (answer == expectedAnswer) {
        imageURL = constants.getCorrectImg().url;
        message = 'Well done.'; //Randomize
      } else {
        message += ' ' + 'The correct answer is ' + expectedAnswer + '.';
      }

      message += ' Say next to continue the quiz or stop to quit the quiz.'

      const responseBuilder = handlerInput.responseBuilder;

      if (helpers.supportsDisplay(handlerInput)) {

        const image = new Alexa.ImageHelper()
            .addImageInstance(imageURL)
            .getImage();

        const primaryText = new Alexa.RichTextContentHelper()
            .withPrimaryText('')
            .getTextContent();

        responseBuilder.addRenderTemplateDirective({
            type : 'BodyTemplate7',
            token : 'string',
            backButton : 'VISIBLE',
            image: image,
            textContent: primaryText,
          });
      }

      return responseBuilder
        .speak(message)
        .reprompt('')
        //.withSimpleCard(skillTitle, speechOutput)
        .getResponse();
    } else {
      console.log('4');
      return responseBuilder
        .speak('I do not understand')
        .reprompt('')
        .withSimpleCard(skillTitle, 'I do not understand')
        .getResponse();
    }
  },
};

const StartColorsQuizHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (request.intent.name === 'StartColorsQuizIntent'
            || request.intent.name === 'continueGameIntent'));
  },
  handle(handlerInput) {
    // Keep the state that game is playing
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes['gameIsPlaying'] = true;
    //setGameIsPlaying.call(this, handlerInput, true);

    let skillTitle = constants.getSkillTitle();
    const responseBuilder = handlerInput.responseBuilder;
    let object = getRandomObject();
    let QA = getRandomQuestionAnswer(object);

    //persistAnswer.call(this, QA.answer)
    sessionAttributes['answer'] = QA.answer;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

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

    return responseBuilder
      .speak(QA.question + 'Take your time to answer.')
      .reprompt(QA.question)
      //.withShouldEndSession(true)
      //.withSimpleCard(skillTitle, speechOutput)
      .getResponse();
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

const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchHandler,
    LearnColorsHandler,
    StartColorsQuizHandler,
    answerHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
