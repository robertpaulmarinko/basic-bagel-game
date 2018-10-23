/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */

const Alexa = require('ask-sdk');
const numberUtil = require("./src/number-util");

const SKILL_NAME = 'Basic Bagels Game';
const FALLBACK_MESSAGE_DURING_GAME = `The ${SKILL_NAME} skill can't help you with that.  Try guessing a three digit number. `;
const FALLBACK_REPROMPT_DURING_GAME = 'Please guess athree digit number.';
const FALLBACK_MESSAGE_OUTSIDE_GAME = `The ${SKILL_NAME} skill can't help you with that.  It will come up with a three digit number and you try to guess it by saying a number in that range. Would you like to play?`;
const FALLBACK_REPROMPT_OUTSIDE_GAME = 'Say yes to start the game or no to quit.';

const LaunchRequest = {
  canHandle(handlerInput) {
    // launch requests as well as any new session, as games are not saved in progress, which makes
    // no one shots a reasonable idea except for help, and the welcome message provides some help.
    return handlerInput.requestEnvelope.session.new || handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;

    const attributes = await attributesManager.getPersistentAttributes() || {};
    if (Object.keys(attributes).length === 0) {
      attributes.endedSessionCount = 0;
      attributes.gamesPlayed = 0;
      attributes.gameState = 'ENDED';
    }

    attributesManager.setSessionAttributes(attributes);

    const speechOutput = `Welcome to the Bagels guessing game. You have played ${attributes.gamesPlayed.toString()} times. would you like to play?`;
    const cardOutput = "Welcome to Bagels.  Would you like to play?"
    const reprompt = 'Say yes to start the game or no to quit.';
    return speakWithResponse(speechOutput, cardOutput, reprompt, responseBuilder);
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
    const speechOutput = 'Thanks for playing!';
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME, speechOutput)
      .getResponse();
  },
};

const SessionEndedRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const HelpIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechOutput = 'I am thinking of a three digit number, try to guess it and I will say' +
            ' Pico if one digit is correct, but in the wrong place,' +
            ' Fermi if one digit is in the correct place, or' +
            ' bagels if no digit is correct.';
    const cardOutput = "Guess a three digit number";
    const reprompt = 'Try saying a number.';


    return speakWithResponse(speechOutput, cardOutput, reprompt, handlerInput.responseBuilder);
  },
};

const YesIntent = {
  canHandle(handlerInput) {
    // only start a new game if yes is said when not playing a game.
    let isCurrentlyPlaying = false;
    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.gameState &&
        sessionAttributes.gameState === 'STARTED') {
      isCurrentlyPlaying = true;
    }

    return !isCurrentlyPlaying && request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = attributesManager.getSessionAttributes();

    sessionAttributes.gameState = 'STARTED';
    sessionAttributes.guessNumber =  numberUtil.getRandomNumber();

    return speakWithResponse('Great! Try saying a three digit number to start the game.', 'Say a three digit number to start the game.', 'Try saying a number.', responseBuilder);
  },
};

const NoIntent = {
  canHandle(handlerInput) {
    // only treat no as an exit when outside a game
    let isCurrentlyPlaying = false;
    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.gameState &&
        sessionAttributes.gameState === 'STARTED') {
      isCurrentlyPlaying = true;
    }

    return !isCurrentlyPlaying && request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
  },
  async handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const responseBuilder = handlerInput.responseBuilder;
    const sessionAttributes = attributesManager.getSessionAttributes();

    sessionAttributes.endedSessionCount += 1;
    sessionAttributes.gameState = 'ENDED';
    attributesManager.setPersistentAttributes(sessionAttributes);

    await attributesManager.savePersistentAttributes();

    const speechOutput = 'Ok, see you next time!';
    return responseBuilder
          .speak(speechOutput)
          .withSimpleCard(SKILL_NAME, speechOutput)
          .getResponse();
  },
};

const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    const outputSpeech = 'Say yes to continue, or no to end the game.';
    return speakWithResponse(outputSpeech, outputSpeech, outputSpeech, handlerInput.responseBuilder);
  },
};

const NumberGuessIntent = {
  canHandle(handlerInput) {
    // handle numbers only during a game
    let isCurrentlyPlaying = false;
    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.gameState &&
        sessionAttributes.gameState === 'STARTED') {
      isCurrentlyPlaying = true;
    }

    return isCurrentlyPlaying && request.type === 'IntentRequest' && request.intent.name === 'NumberGuessIntent';
  },
  async handle(handlerInput) {
    const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;

    const sessionAttributes = attributesManager.getSessionAttributes();
    const targetNum = sessionAttributes.guessNumber;

    const guessString = requestEnvelope.request.intent.slots.number.value;
    if (guessString.length < 3) {
        guessString = "0" + guessString;
    }

    if (guessString.length !== 3) {
      return speakWithResponse(`Try guessing a three digit number.`, `Try guessing a three digit number.`, 'Try saying a three digit number.', responseBuilder);
    } else if (guessString === targetNum) {
        sessionAttributes.gamesPlayed += 1;
        sessionAttributes.gameState = 'ENDED';
        attributesManager.setPersistentAttributes(sessionAttributes);
        await attributesManager.savePersistentAttributes();
        return speakWithResponse(`${guessString} is correct! Would you like to play a new game?`, 'Correct, play again?',  'Say yes to start a new game, or no to end the game.', responseBuilder);
    } else {
        sessionAttributes.lastGuess = guessString;
        await attributesManager.savePersistentAttributes();
        if (numberUtil.guessHasDuplicateDigits(guessString)) {
          return speakWithResponse(`Oh, I forgot to tell your that the number I have in mind has no two digits the same.`, 'No two digits can be the same',  'Try a different number.', responseBuilder);
        } else {
            var response = numberUtil.getResponse(guessString, targetNum);
            return speakWithResponse(response, response, 'Try guessing a different number.', responseBuilder);
        }
    }

    return speakWithResponse('Sorry, I didn\'t get that. Try saying a number.', 'Sorry, I didn\'t get that. Try saying a number.', 'Try guessing a different number.', handlerInput.responseBuilder);
  },
};

const WhatWasLastGuessIntent = {
  canHandle(handlerInput) {
    // handle numbers only during a game
    let isCurrentlyPlaying = false;
    const request = handlerInput.requestEnvelope.request;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.gameState &&
        sessionAttributes.gameState === 'STARTED') {
      isCurrentlyPlaying = true;
    }

    return isCurrentlyPlaying && request.type === 'IntentRequest' && request.intent.name === 'WhatWasLastGuessIntent';
  },
  async handle(handlerInput) {
    const { attributesManager, responseBuilder } = handlerInput;

    const sessionAttributes = attributesManager.getSessionAttributes();
    const lastGuess = sessionAttributes.lastGuess;

    if (lastGuess) {
      const speachOutput = "Your last guess was " + lastGuess;
      return speakWithResponse(speachOutput, lastGuess, 'Try guessing again.', responseBuilder);
    } else {
      return speakWithResponse("You have not made a guess.", "No guess", 'Try guessing again.', responseBuilder);
    }
  },

}

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    const speechOutput = 'Sorry, I can\'t understand the command. Please say again.';
    return speakWithResponse(speechOutput, speechOutput, speechOutput, handlerInput.responseBuilder);
  },
};

const FallbackHandler = {
  // 2018-May-01: AMAZON.FallackIntent is only currently available in en-US locale.
  //              This handler will not be triggered except in that locale, so it can be
  //              safely deployed for any locale.
  canHandle(handlerInput) {
    // handle fallback intent, yes and no when playing a game
    // for yes and no, will only get here if and not caught by the normal intent handler
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.FallbackIntent' ||
       request.intent.name === 'AMAZON.YesIntent' ||
       request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    if (sessionAttributes.gameState &&
        sessionAttributes.gameState === 'STARTED') {
      // currently playing
      return speakWithResponse(FALLBACK_MESSAGE_DURING_GAME, FALLBACK_REPROMPT_DURING_GAME, FALLBACK_REPROMPT_DURING_GAME, handlerInput.responseBuilder);
    }

    // not playing
    return speakWithResponse(FALLBACK_MESSAGE_OUTSIDE_GAME, FALLBACK_REPROMPT_OUTSIDE_GAME, FALLBACK_REPROMPT_OUTSIDE_GAME, handlerInput.responseBuilder);
  },
};

function speakWithResponse(outputText, cardText, reprompt, responseBuilder) {
  return responseBuilder
    .speak(outputText)
    .withSimpleCard(SKILL_NAME, cardText)
    .reprompt(reprompt)
    .getResponse();
}

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    ExitHandler,
    SessionEndedRequest,
    HelpIntent,
    YesIntent,
    NoIntent,
    NumberGuessIntent,
    WhatWasLastGuessIntent,
    FallbackHandler,
    UnhandledIntent,
  )
  .addErrorHandlers(ErrorHandler)
  .withTableName('bagels-Game')
  .withAutoCreateTable(true)
  .lambda();
