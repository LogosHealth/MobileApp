/**
 * LogosHealth Application Utils. 
 * All global re-usable/utility functions listed here. Class could be expanded to cover my utils
 * JSON parsing is main 
 * Copyright Logos Health, Inc
 * 
 */

var aws = require('aws-sdk');
var request = require('request');
var dbUtil = require('./DBUtils');

/**
 * Create a new build response.
 * @param {object} [values]Session Attributes to use in add in response object
 * @param {object} Speech output
 * 
 * @public
 */
exports.buildResponse = function buildResponse(sessionAttributes, speechletResponse) {
	console.log(' LogosHelper.buildResponse >>>>>>');
	return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
    
};

/**
 * Returns APP ID for Logos Health.
 * @param {object} none
 * @return {string} Context APP ID
 * 
 * @public
 */
exports.getAppLinkName = function getAppLinkName(event) {
	console.log(' LogosHelper.buildResponse >>>>>>');
	var appId = 'amzn1.ask.skill.43a6c098-7243-4e50-9017-d080c86eee32';
    appId = getAccountLinkName(event);
	return appId;
    
};

/**
 * Returns APP ID for Logos Health.
 * @param {object} none
 * @return {string} Context APP ID
 * 
 * @public
 */
exports.processNameIntent = function processNameIntent(userName, profileId, hasProfile, profileComplete, session, callback) {
	console.log(' LogosHelper.processNameIntent >>>>>>');
    processNameIntentResponse(userName, profileId, hasProfile, profileComplete, session, callback);
};

/**
 * Returns APP ID for Logos Health.
 * @param {object} none
 * @return {string} Context APP ID
 * 
 * @public
 */
exports.processSessionEnd = function processSessionEnd(callback) {
	console.log(' LogosHelper.processSessionEnd >>>>>>');
    handleSessionEndRequest(callback);
};

/*  MM - 2/26/2018   Branch Definitions - for currentProcessor.  These represent the context from which the application expects the next answer to come from (i.e. which menu) 
	 currentProcessor = 1 - Create a new primary profile, confirm Name at intro
	 currentProcessor = 2 - Yes-No 
	 currentProcessor = 3 - Answer - within a current interview
	 currentProcessor = 4 - Create a new profile
	 currentProcessor = 5 - Main menu
	 currentProcessor = 6 - Name handling (up front - when Alexa hears a new name not currently in the family)
	 currentProcessor = 7 - Overwrite food preferences
	 currentProcessor = 8 - Overwrite diet preferences
	 currentProcessor = 9 - Order a Meal
	 currentProcessor = 10 - Confirm Sleep Time Entry (AM/PM)

*/


/**
 * Provides a speech response to Alexa using JSON format.
 * @param {object|string} Title of the Speech card
 * @param {object|string} Speech output text 
 * @param {object|string} To prompt speech out text
 * @param {object|string} Whether session to be end or not
 * @return {object} A JSON object constructed with speech out text
 * @public
 */
exports.buildSpeechletResponse = function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
  	console.log(' LogosHelper.buildSpeechletResponse >>>>>>');
  	return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `${title}`,
            content: `${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
};

/**
 * Method to create an App Link to from a new request.
 * @param {object|string} Event
 * @param {object|string} Context object 
 * @param {object|string} Request
 * @param {object|string} App ID
 * @return {object} Applink ID once successfully created or ERROR
 * @public
 */
exports.createApplink = function createApplink(event, context, request, appId) {
  	console.log(' LogosHelper.createApplink >>>>>>');
  	//TODO: implement code to create an App link from caller
};

/**
 * Debugs class instantiation.
 * @param {none} 
 * @return {boolean} Function could be called
 * @public
 */
exports.checkClassAccess = function checkClassAccess() {
  	console.log(' LogosHelper.checkClassAccess >>>>>>');
  	return true;
};

/**
 * Debugs class instantiation.
 * @param {none} 
 * @return {boolean} Function could be called
 * @public
 */
exports.displayWelcomeMsg = function displayWelcomeMsg(accountid, accountEmail, session, callback) {
  	//console.log(' LogosHelper.checkClassAccess >>>>>>'+accountid);
  	processWelcomeResponse(accountid, accountEmail, session, callback);
};

exports.callRestart = function callRestart(accountid, speechOutput, session, callback) {
  	console.log(' LogosHelper.checkClassAccess >>>>>>'+accountid);
  	processRestart(accountid, speechOutput, session, callback);
};

exports.displayUnknownIntent = function displayUnknownIntent(accountid, session, callback) {
  	//console.log(' LogosHelper.displayUnknownIntent >>>>>>'+accountid);
  	displayUnknownContext(accountid, session, callback);
};

exports.createProfile = function createProfile(event, context, intent, session, callback) {
  	//console.log(' LogosHelper.createProfile >>>>>>');
  	handleCreateLogosHealthProfile(event, context, intent, session, callback);
};

exports.openProfile = function openProfile(event, context, intent, session, callback) {
  	//console.log(' LogosHelper.openProfile >>>>>>');
  	handleOpenLogosHealthProfile(event, context, intent, session, callback);
};

exports.processUserReponse = function processUserReponse(event, context, intent, session, callback) {
  	//console.log(' LogosHelper.processUserReponse >>>>>>');
  	processIntent(event, context, intent, session, callback);
};

exports.processQnAResponse = function processQnAResponse(qnaObj, session, callback, retUser) {
  	//console.log(' LogosHelper.processQnAResponse >>>>>>'+retUser);
  	processResponse(qnaObj, session, callback, retUser);
};

exports.processQnAEvent = function processQnAEvent(qnaObj, session, callback, retUser) {
  	//console.log(' LogosHelper.processQnAResponse >>>>>>'+retUser);
  	processEventResponse(qnaObj, session, callback, retUser);
};

exports.processErrResponse= function processErrResponse(errorText, processor, session, callback) {
  	//console.log(' LogosHelper.processErrResponse >>>>>>');
  	processErrorResponse(errorText, processor, session, callback);
};

exports.helpResponse= function helpResponse(helpText, processor, session, callback) {
  	//console.log(' LogosHelper.processErrResponse >>>>>>');
  	processHelpResponse(helpText, processor, session, callback);
};

exports.confirmResponse= function confirmResponse(confirmText, processor, session, callback) {
  	//console.log(' LogosHelper.processErrResponse >>>>>>');
  	processConfirmResponse(confirmText, processor, session, callback);
};

exports.gotoMainMenu= function gotoMainMenu(speechOutput, session, callback) {
  	//console.log(' LogosHelper.processErrResponse >>>>>>');
  	 processMenuResponse(speechOutput, session, callback);
};

exports.constructOrderMealResponse= function constructOrderMealResponse(action, session, callback) {
  	//console.log(' LogosHelper.processErrResponse >>>>>>');
  	 constructOrderMealResp(action, session, callback);
};

function getLinkedAccountEmail(event, request, session, accountId, callback) {
    console.log(" Getting Account Linked Email ");
	
	var amznProfileURL = 'https://api.amazon.com/user/profile?access_token=';
    amznProfileURL += event.session.user.accessToken;
    
    request(amznProfileURL, function(error, response, body) {
 	    var respBody = "";
 	    if (!error && response.statusCode == 200) {
    	    respBody = JSON.parse(body);
    	    console.log('Email from Amazon: ' + respBody.email);
	    } else {
	    	console.log('Email read Error: ' + error);
	    }
	    dbUtil.getAccountIdFromEmail(respBody.email, session, callback);
	});
}

function displayUnknownContext(accountid, session, callback ) {
    console.log(' LogosHelper.displayUnknownContext >>>>>>'+accountid);
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = session.attributes;
    
    var cardTitle = 'LogosHealth App';

    var speechOutput = 'Not sure I understand your intent, please say help to hear options!';

    var repromptText = 'What can I help you with?';
    var shouldEndSession = false;
    
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function buildSpeechResponse(title, output, repromptText, shouldEndSession) {
  	console.log(' LogosHelper.buildSpeechResponse >>>>>>' + title + ": " + shouldEndSession);
  	return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `${title}`,
            content: `${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function processIntent(event, context, intentRequest, session, callback) {
 
    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;
    
    var sessionAttributes = session.attributes; 
    var accountId = sessionAttributes.accountid;
    var userName = sessionAttributes.logosname;
    var retUser = sessionAttributes.retUser;
	var expected = false;
	var isDateValue = false;
	var slotValue = "";
	var blnIgnoreIntent = false;
	
    console.log('ProcessIntent Start: Intent  called >>>>>>  '+intentName+ ' CurrentProcessor: '+ session.attributes.currentProcessor);
	console.log('ProcessIntent: Intent slots >>>>>>  ', intent.slots);
	
    console.log('ProcessIntent: SessionAttributes >>>>>>  ', sessionAttributes);
    console.log('ProcessIntent: SessionAttributes QnA>>>>>>  ', sessionAttributes.qnaObj);
    console.log('ProcessIntent: SessionAttributes QnA Event>>>>>>  ', sessionAttributes.qnaObj.eventQNArr);


	//5-9-2018 MM Reset variable everytime
	sessionAttributes['answerID'] = '';	

	//5-9-2018 MM Added to check for Dictionary ID from Alexa front end answer
	if (intent.slots !== undefined) {
		if (intent.slots.Answer !== undefined) {
			console.log('Has Answer: ' + intent.slots.Answer.value);
		
			if (intent.slots.Answer.resolutions.resolutionsPerAuthority[0].values !== undefined) {
				console.log('Has Dictionary ID from intent: ' + intent.slots.Answer.resolutions.resolutionsPerAuthority[0].values[0].value.id);
				//5-9-2018 MM Ensures the ID from Alexa is a number - meaning we set it and it will align with a Dictionary ID; default Alexa IDs which are not manually updated
				//are hashmaps
				//(/^\d+(\.\d+)?/.exec(intent.slots.Answer.resolutions.resolutionsPerAuthority[0].values[0].value.id))
				//x!=x (intent.slots.Answer.resolutions.resolutionsPerAuthority[0].values[0].value.id !=intent.slots.Answer.resolutions.resolutionsPerAuthority[0].values[0].value.id) 
				if (intent.slots.Answer.resolutions.resolutionsPerAuthority[0].values[0].value.id.length < 17) {
					sessionAttributes['answerID'] = intent.slots.Answer.resolutions.resolutionsPerAuthority[0].values[0].value.id;
					console.log('isNaN is true - answerID set'); 
				} else {
					console.log('isNaN is false - answerID  not set'); 				
				}
			} else {
				console.log('No Dictionary ID for Answer');
			}
		}
	}

	//6-14-2017 Workaround to call proper menu options as Alexa is not recognizing menu options
	if (session.attributes.currentProcessor == 5 && intentName == 'AnswerIntent'){
		if(intent.slots.Answer.value.toLowerCase() =='menu'){
			intentName = 'MainMenuIntent';
		} else if(intent.slots.Answer.value.toLowerCase() =='feedback'|| intent.slots.Answer.value.toLowerCase() =='provide feedback'){
			intentName = 'ProvideFeedback';			
		}
	}
		
	//MM 6-24-17 If coming from or going to main menu, reset conditional session variable to default values	
	if (session.attributes.currentProcessor == 5 || intentName == 'MainMenuIntent'){
		session.attributes.scriptComplete = false;
		sessionAttributes.onBehalfOf = false;
		sessionAttributes.subjectLogosName = '';
		sessionAttributes.subjectProfileId = 0;
		sessionAttributes.minScriptId = 0;
		sessionAttributes.maxScriptId = 0;
		sessionAttributes.tableId = 0;
		sessionAttributes.currentTable = '';		
		sessionAttributes.stgScriptId = 0;
		sessionAttributes.medicaleventid = 0;
	}
	
	//MM 6-10-2017 Redirects to AnswerIntent if currentProcessor is set to Q&A branch(3)
	//MM 7-26-2017 Added new handlers for better handing things like male/female, spelling
	if (session.attributes.currentProcessor == 3){
    	//console.log('Reset to AnswerIntent');
		if (intentName == 'AMAZON.YesIntent'){
			slotValue = 'Y';
			expected = true;
			if (session.attributes.retUser) {
				session.attributes.retUser = false;
			}
		} else if (intentName == 'AMAZON.NoIntent') {
			slotValue = 'N';	
			expected = true;
		} 		
		if (intentName == 'NameIntent') {
			slotValue = intent.slots.Name.value;
			expected = true;
	    	console.log('FirstNameIntent loop Q&A: '+slotValue);
		}
		if (intentName == 'SpellingIntent') {
	    	console.log('SpellingIntent loop Q&A: ', intent.slots);
			slotValue = spellWord(intent);
			expected = true;
			//var errorText = 'Still working on capturing spelling.  For now, please say the word.';
			//processErrorResponse(errorText, 3, session, callback);
		}		
		if (intentName == 'AnswerIntent') {
			expected = true;			
		}

		//MM 9-4-2018 Added Skip functionality
		if (intentName == 'Skip') {
			expected = true;
			blnIgnoreIntent = true;			
			dbUtil.skipAnswer(intent, session, callback);
		}
		//MM 9-4-2018 Added Repeat functionality
		if (intentName == 'Repeat') {
			expected = true;
			blnIgnoreIntent = true;			
			//var helpText = session.attributes.qnaObj.question;
			processResponse(session.attributes.qnaObj, session, callback, false);
			//processHelpResponse(helpText, 3, session, callback);
		}

		//MM 5-8-18 - Added EnterDate 
		//MM 5-9-18 - Added Filter Criteria for when expecting a date value within an interview 
		if ((sessionAttributes.qnaObj.answerType == 'date' && isEmpty(sessionAttributes.qnaObj.eventQNArr)) 
			|| (!isEmpty(sessionAttributes.qnaObj.eventQNArr) && sessionAttributes.qnaObj.eventQNArr.answerType == 'date')) {
				console.log('Date FilterQuery Working!!!');
				if (intentName == 'EnterDate') {
					slotValue = intent.slots.Date.value;
					isDateValue = true;
					if (slotValue == undefined) {
						slotValue = '--';
					}
					if (slotValue.length == 7) {
						slotValue = slotValue + '-00';
					}
					expected = true;			
				} else {
					console.log('Add for trying to handle free text date fields');					
					slotValue = '--';
					isDateValue = true;
					expected = true;			
				}		
		}
		
		intentName = 'AnswerIntent';
		//console.log('AnswerIntent - expected = ' + expected);
	}

	if (session.attributes.currentProcessor == 2){
		if (intentName == 'AMAZON.YesIntent'){
			slotValue = 'Y';	
		} else if (intentName == 'AMAZON.NoIntent') {
			slotValue = 'N';	
		} 		
	}	

	//MM 7-19-2018 Added new handlers for confirm Sleep Timing
	if (session.attributes.currentProcessor == 10){	
		console.log("From confirm Sleep timing - intent name = " + intentName);
		if  (intentName == 'AMAZON.YesIntent') {
			session.attributes.confirmTime.confirmed = true;
			blnIgnoreIntent = true;
			dbUtil.instantSleepSummaryDirect(session.attributes.confirmTime.profileid, session.attributes.confirmTime.strFor, true, intent, session, callback);
		} else if (intentName == 'AMAZON.NoIntent') {
			var confirmText = 'Please repeat and state explicitly the sleep times using AM and PM.  For example, I slept from 11PM to 5AM.';
			blnIgnoreIntent = true;
			processConfirmResponse(confirmText, 10, session, callback); 
		} else if (intentName == 'InstantSleepSummary') {
			if (intent.slots !==undefined) {
				if (intent.slots.SleepStart !== undefined) {
					if (intent.slots.SleepStart.value !== undefined) {
						var sleepStart = intent.slots.SleepStart.value;
						console.log('SleepStart has value: ' + sleepStart);
						var sleepSplit = sleepStart.split(":");
						var sleepHour = Number(sleepSplit[0]);
						var sleepMinute = sleepSplit[1];
						if (sleepHour == 0) {
							var sleepTimeFinalCheck = "12:" + sleepMinute + " AM"; 
						} else if (sleepHour < 12) {
							var sleepTimeFinalCheck = sleepHour + ":" + sleepMinute + " AM"; 
						} else if (sleepHour == 12) {
							var sleepTimeFinalCheck = "12:" + sleepMinute + " PM"; 
						} else {
							var sleepTimeFinalCheck = (Number(sleepHour) - 12) + ":" + sleepMinute + " PM"; 
						}
					}
				} else {
					console.log('Sleep is undefined');
				}
				if (intent.slots.WakeTime !== undefined) {
					if (intent.slots.WakeTime.value !== undefined) {
						var wakeTime = intent.slots.WakeTime.value;
						console.log('WakeTime has value: ' + wakeTime);
						var wakeSplit = wakeTime.split(":");
						var wakeHour = Number(wakeSplit[0]);
						var wakeMinute = wakeSplit[1];
						if (wakeHour == 0) {
							var wakeTimeFinalCheck = "12:" + wakeMinute + " AM"; 
						} else if (wakeHour < 12) {
							var wakeTimeFinalCheck = wakeHour + ":" + wakeMinute + " AM"; 
						} else if (wakeHour == 12) {
							var wakeTimeFinalCheck = "12:" + wakeMinute + " PM"; 
						} else {
							var wakeTimeFinalCheck = (Number(wakeHour) - 12) + ":" + wakeMinute + " PM"; 
						}
					}
				} 	
				if (sleepStart !== undefined || (wakeTime !== undefined && sleepStart !== undefined)) {
					var confirmTime = {
						"sleepTimeFinal": sleepStart,
						"sleepTimeFinalCheck":sleepTimeFinalCheck,
						"wakeTimeFinal": wakeTime,
						"wakeTimeFinalCheck": wakeTimeFinalCheck,
						"profileid": session.attributes.confirmTime.profileid,
						"strFor": session.attributes.confirmTime.strFor,
						"confirmed": true
					}
					session.attributes.confirmTime = confirmTime;
					blnIgnoreIntent = true;
					dbUtil.instantSleepSummaryDirect(session.attributes.confirmTime.profileid, session.attributes.confirmTime.strFor, true, intent, session, callback);				
				} else {
					var strMenu = 'This is not a valid sleep entry.  Main menu.  For a list of menu options, simply say, Menu.';
					session.attributes.currentProcessor = 5;
					blnIgnoreIntent = true;
					processMenuResponse(strMenu, session, callback);	
				}
			} else {
				var strMenu = 'This is not a valid sleep entry.  Main menu.  For a list of menu options, simply say, Menu.';
				session.attributes.currentProcessor = 5;
				blnIgnoreIntent = true;
				processMenuResponse(strMenu, session, callback);
			}
		} else {
			var strMenu = 'This is not a valid response for confirming sleep time.  Main menu.  For a list of menu options, simply say, Menu.';
			session.attributes.currentProcessor = 5;
			blnIgnoreIntent = true;
    		processMenuResponse(strMenu, session, callback);
		}
	}
	//MM 2-28-2018 Added new handlers for Order a Meal
	if (session.attributes.currentProcessor == 9){	
	  if (intentName == 'FindMeal') {
		constructOrderMealResp('order', session, callback);				
	  } else if (intent.slots !== undefined) {
		if (intent.slots.Answer !== undefined) {
			slotValue = intent.slots.Answer.value;
			console.log("Slot value from Order Meal Branch: " + slotValue);
			if (slotValue == 'next' && session.attributes.currentMenuIndex == 9) {
				console.log("Need to get next batch of 10");
				//need to update to requery and get next batch - placeholder below
				session.attributes.miNotSelected.push(session.attributes.menuItems[session.attributes.currentMenuIndex].menuitemid);
				dbUtil.getNextMeals(session, callback);
			} else if (slotValue == 'next' ) {
				//need to add code to add currentmenuitem into the "not in array"
				session.attributes.miNotSelected.push(session.attributes.menuItems[session.attributes.currentMenuIndex].menuitemid);
				constructOrderMealResp(slotValue, session, callback);				
			} else {
				constructOrderMealResp(slotValue, session, callback);								
			}
		} else {
			constructOrderMealResp('Bad Response', session, callback);
		}
	  }	else if (intentName == 'MainMenuIntent') {
		constructOrderMealResp('main menu', session, callback);  
	  } else {
		constructOrderMealResp('Bad Response', session, callback);	  	
	  }
	}
	
	//MM 7-22-2017 Added new handlers for better handing first names using AMAZON.first_name
	if (session.attributes.currentProcessor == 1){	
		if (intentName == 'NameIntent') {
			slotValue = intent.slots.Name.value;
	    	console.log('NameIntent loop getName: '+slotValue);
			intentName = 'AnswerIntent';	
		} else if (intentName == 'SpellingIntent') {
	    	console.log('SpellingIntent loop Q&A: ', intent.slots);
			slotValue = spellWord(intent);
			intentName = 'AnswerIntent';	
		} else {
			console.log("Error - Expecting Name but Recieved intentName: " + intentName);
		} 
	}	

	//MM 7-26-2017 Added new workflow for handling initial logosname
	if (session.attributes.currentProcessor == 6){	
		if (intentName == 'AMAZON.YesIntent') {
    		console.log(' processIntent: Intent for NameConfirmation called >>>>>>  '+intentName+ ' logosname = ' +session.attributes.logosname);
        	dbUtil.verifyUserProfile(session.attributes.logosname, accountId, session, callback);
		}	else if (intentName == 'AMAZON.NoIntent') {
    		console.log(' processIntent: Intent for NameConfirmation called >>>>>>  '+intentName);
			strHelp = 'Please spell your first name.  Please start with, "the word is spelled".';
    		processHelpResponse(strHelp, 6, session, callback);
		}	else if (intentName == 'SpellingIntent') {
			slotValue = spellWord(intent);
    		console.log(' processIntent: Intent for NameConfirmation Spelling called >>>>>>  '+intentName+' Name is '+slotValue);
        	dbUtil.verifyUserProfile(slotValue, accountId, session, callback);
		}	else if (intentName == 'AnswerIntent') {
			slotValue = intent.slots.Answer.value;
    		console.log(' processIntent: Intent for NameConfirmation Answer called >>>>>>  '+intentName+' Name is '+slotValue);
        	dbUtil.verifyUserProfile(slotValue, accountId, session, callback);
		}	else if (intentName == 'NameIntent') {
			slotValue = intent.slots.Name.value;
    		console.log(' processIntent: Intent for NameConfirmation Name called >>>>>>  '+intentName+' Name is '+slotValue);
        	dbUtil.verifyUserProfile(slotValue, accountId, session, callback);
		}
	}	
	
	//MM 1-7-2017 Added new workflow for overwrite of food preference profile
	if (session.attributes.currentProcessor == 7){	
		if (intentName == 'AMAZON.YesIntent') {
    			console.log('User overwrite of existing food profile');
        		session.attributes.scriptName = "Set Food Preferences"
			dbUtil.foodPreferenceRedo (intent, session, callback);
		} 	else if (intentName == 'AMAZON.NoIntent') {
    			console.log(' No overwrite of existing food profile.  Go to Main Menu');
			var strMenu = 'Main menu.  For a list of menu options, simply say, Menu.';
			session.attributes.currentProcessor = 5;
    			processMenuResponse(strMenu, session, callback);
		}  else {
    			console.log(' Answer not understood.  Requery');
			strHelp = 'I did not understand your response.  Please say Yes or No.';
    			processHelpResponse(strHelp, 7, session, callback);			
		}
	}	
	
	//MM 1-7-2017 Added new workflow for overwrite of diet preference profile
	if (session.attributes.currentProcessor == 8){	
		if (intentName == 'AMAZON.YesIntent') {
    			console.log('User overwrite of existing dietary profile');
        		session.attributes.scriptName = "Set Dietary Preferences"
			dbUtil.dietPreferenceRedo (intent, session, callback);
		} 	else if (intentName == 'AMAZON.NoIntent') {
    			console.log(' No overwrite of existing dietary profile.  Go to Main Menu');
			var strMenu = 'Main menu.  For a list of menu options, simply say, Menu.';
			session.attributes.currentProcessor = 5;
    			processMenuResponse(strMenu, session, callback);
		}  else {
    			console.log(' Answer not understood.  Requery');
			strHelp = 'I did not understand your response.  Please say Yes or No.';
    			processHelpResponse(strHelp, 8, session, callback);			
		}
	}	


	if (!blnIgnoreIntent) {
		if (intentName == 'LaunchIntent') {
			//Process Generic values if selected from existing
				slotValue = intent.slots.Answer.value;
			console.log('***Intent Name is LaunchIntent...***');
				console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
				processUserGenericInteraction(event, intent, session, callback);
		}
		else if (intentName == 'DietMenu') {
			strHelp = 'Simply say I ate chicken for dinner.  You can also specify a family member like, Bonnie had bacon and eggs for breakfast, or say, we, to apply to the whole family.';
			//console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
			processHelpResponse(strHelp, 5, session, callback);
		} 	
		else if (intentName == 'NameIntent') {
			slotValue = intent.slots.Name.value;
			console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
			dbUtil.verifyUserProfile(slotValue, accountId, session, callback);
		} 
		else if (intentName == 'OpenLogosHealthProfile') {
			handleOpenLogosHealthProfile(event, context,intent, session, callback);
		}    
		else if (intentName == 'CreateLogosHealthProfile') {   
			var userName = sessionAttributes.userFirstName;
			handleCreateLogosHealthProfile(event, context, userName, session, callback);    
		} 
		else if (intentName == 'AddFamilyMember') {   
		  //MM 6-20-17 Add family member
			var scriptName = '';
			
			if(sessionAttributes.isPrimaryProfile){
				scriptName = "Add a Family Member Profile - User is Primary";	
			} else {
				scriptName = "Add a Family Member Profile - User is Not Primary";	
			}
			
			  //MM 6-22-17 Sets the flag to capture that the user is adding data for a family member - not for himself/herself
			sessionAttributes.onBehalfOf = true;
			
			//MM 6-24-17 Add to check if user exists
			
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);
		} 
		else if (intentName == 'CreateAllergyHistory') {   
		  //MM 6-6-17 Enter an allergy
		  //MM 6-24-17 Added functionality to process the menu for entering on behalf of a family member	
			//console.log(' processIntent: CreateAllergyHistory called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
			var scriptName = "Enter an allergy";
	
			if (intent.slots.Name.value !== undefined && (intent.slots.Name.value !=='me' || intent.slots.Name.value !=='myself')){
				console.log(' processIntent: CreateAllergyHistory  called >>>>>> for name: '+intent.slots.Name.value);		
				slotValue = intent.slots.Name.value;
				sessionAttributes.onBehalfOf = true;
				dbUtil.setOnBehalfOf(0, scriptName, slotValue, session, callback);					
			} else {
				dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
			}
		} 
		else if (intentName == 'SetExerciseGoal') {   
			//MM 6-26-18 Set Exercise Goal
			var scriptName = "Set Exercise Goal";
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
		} 
		else if (intentName == 'SetRepeatingTaskGoal') {   
			//MM 6-26-18 Set Exercise Goal
			var scriptName = "Set Repeating Task Goal";
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
		} 
		else if (intentName == 'AddLab') {   
			//MM 7-26-18 Set Exercise Goal
			var scriptName = "Add Lab";
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
		} 
		else if (intentName == 'EnterVaccine') {   
			  //MM 6-13-17 Enter an vaccine
			  //MM 6-24-17 Added functionality to process the menu for entering on behalf of a family member	
			//console.log(' processIntent: EnterVaccine  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
			var scriptName = "Enter a Vaccine History Record";
			
			if (intent.slots.Name.value !== undefined && (intent.slots.Name.value !=='me' || intent.slots.Name.value !=='myself')){
				console.log(' processIntent: EnterVaccine  called >>>>>> for name: '+intent.slots.Name.value);		
				slotValue = intent.slots.Name.value;
				sessionAttributes.onBehalfOf = true;
				dbUtil.setOnBehalfOf(0, scriptName, slotValue, session, callback);					
			} else {
				dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
			}		
		} 
		else if (intentName == 'AddMedicalEvent') {   
		  //MM 6-24-17 Added functionality to process the menu for entering on behalf of a family member	
			//console.log(' processIntent: AddMedicalEvent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
			var scriptName = "Add Medical Event";
			
			if (intent.slots.Name.value !== undefined && (intent.slots.Name.value !=='me' || intent.slots.Name.value !=='myself')){
				console.log(' processIntent: AddMedicalEvent  called >>>>>> for name: '+intent.slots.Name.value);		
				slotValue = intent.slots.Name.value;
				sessionAttributes.onBehalfOf = true;
				dbUtil.setOnBehalfOf(0, scriptName, slotValue, session, callback);					
			} else {
				dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
			}		
		} 	
		else if (intentName == 'AddMedicine') {   
		  //MM 6-26-17 Added functionality to add medicine	
			//console.log(' processIntent: AddMedicine  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
			var scriptName = "Add Medication";
			
			if (intent.slots.Name.value !== undefined && (intent.slots.Name.value !=='me' || intent.slots.Name.value !=='myself')){
				console.log(' processIntent: AddMedicine  called >>>>>> for name: '+intent.slots.Name.value);		
				slotValue = intent.slots.Name.value;
				sessionAttributes.onBehalfOf = true;
				dbUtil.setOnBehalfOf(0, scriptName, slotValue, session, callback);					
			} else {
				dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
			}		
		} 	
		else if (intentName == 'AddVitamin') {   
		  //MM 6-26-17 Added functionality to add vitamin	
			//console.log(' processIntent: AddVitamin  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
			var scriptName = "Add Vitamin";
			
			if (intent.slots.Name.value !== undefined && (intent.slots.Name.value !=='me' || intent.slots.Name.value !=='myself')){
				console.log(' processIntent: AddVitamin  called >>>>>> for name: '+intent.slots.Name.value);		
				slotValue = intent.slots.Name.value;
				sessionAttributes.onBehalfOf = true;
				dbUtil.setOnBehalfOf(0, scriptName, slotValue, session, callback);					
			} else {
				dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
			}		
		} 	
		else if (intentName == 'AddExercise') {   
		  //MM 6-26-17 Added functionality to add vitamin	
			//console.log(' processIntent: AddVitamin  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
			var scriptName = "Add Exercise";
			
			if (intent.slots.Name.value !== undefined && (intent.slots.Name.value !=='me' || intent.slots.Name.value !=='myself')){
				console.log(' processIntent: AddExercise  called >>>>>> for name: '+intent.slots.Name.value);		
				slotValue = intent.slots.Name.value;
				sessionAttributes.onBehalfOf = true;
				dbUtil.setOnBehalfOf(0, scriptName, slotValue, session, callback);					
			} else {
				dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
			}		
		} 	
		else if (intentName == 'ProvideFeedback') {   
		  //MM 6-13-17 Provide Feedback
			//console.log(' processIntent: ProvideFeedback  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
			var scriptName = "Provide Feedback";
			dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);
		} 
		else if (intentName == 'SetFoodPreferences') {   
		  //MM 11-21-17 Set Food Preferences
			console.log(' processIntent: SetFoodPreferences  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
			var scriptName = "Set Food Preferences";
			session.attributes.scriptName = scriptName;
			dbUtil.findExistingFoodPreferences(intent, session, callback);
			//dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);
		} 
		else if (intentName == 'SetDietaryPreferences') {   
		  //MM 12-29-17 Set Dietary Preferences
			console.log(' processIntent: SetDietaryPreferences  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);		
			var scriptName = "Set Dietary Preferences";
			session.attributes.scriptName = scriptName;
			dbUtil.findExistingDietPreferences(intent, session, callback);
		} 
		else if (intentName == 'FindMeal') {   
		  //MM 11-21-17 Set Food Preferences
			   console.log(' processIntent: FindMeal  called >>>>>>  ');		
			var scriptName = "Find a Meal";
			session.attributes.scriptName = scriptName;
			if (intent.slots !== undefined) {
				if(intent.slots.restaurant !== undefined && intent.slots.restaurant.value !== undefined) {
					console.log('Find a Meal - Restaurant: ', intent.slots.restaurant);
					session.attributes.orderRestaurant = intent.slots.restaurant.value;
					console.log('Find a Meal - Restaurant Value: ' + session.attributes.orderRestaurant);
					if (session.attributes.orderRestaurant.indexOf("\'") != -1) {
						session.attributes.orderRestaurant = session.attributes.orderRestaurant.split("\'").join("");
							console.log('LogosHelper:FindMeal has apostrophe '+session.attributes.orderRestaurant);	
					}		
					console.log('FindMeal Restaurant: ' + session.attributes.orderRestaurant);
				} else {
					session.attributes.orderRestaurant = "";	
					session.attributes.addtionalRestFilter = "";				
				} 	
				if (intent.slots.foodCatFav !== undefined && intent.slots.foodCatFav.value !== undefined) {
					var foodCatFavId = intent.slots.foodCatFav.resolutions.resolutionsPerAuthority[0].values;
					if (foodCatFavId  !== undefined) {
						foodCatFavId = intent.slots.foodCatFav.resolutions.resolutionsPerAuthority[0].values[0].value.id;
						console.log('Find a Meal - foodCatFav Identification: ' +  foodCatFavId);				
						session.attributes.orderFoodCatFavId = foodCatFavId;				
					} else {
						session.attributes.orderFoodCatFavId = "";									
					}
					console.log('Find a Meal - foodCatFav: ', intent.slots.foodCatFav);				
					session.attributes.orderFoodCatFav = intent.slots.foodCatFav.value;
				}else {
					session.attributes.orderFoodCatFav = "";
					session.attributes.orderFoodCatFavId = "";
				}	
				if (intent.slots.exactDish !== undefined && intent.slots.exactDish.value !== undefined) {
					console.log('Find a Meal - exactDish: ', intent.slots.exactDish);				
					session.attributes.orderFoodCatFav = intent.slots.exactDish.value;
				}else {
					session.attributes.orderFoodCatFav = "";
				}				
			} else {
				session.attributes.orderRestaurant = "";	
				session.attributes.addtionalRestFilter = "";				
				session.attributes.orderFoodCatFav = "";
				session.attributes.orderFoodCatFavId = "";
			}
			dbUtil.findExistingFoodPreferencesMeal(intent, session, callback);
			//dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);
		} 
		else if (intentName == 'AMAZON.HelpIntent') {        
			//helpRequest(intent, session, callback);    
		}    
		else if (intentName == 'AMAZON.CancelIntent')  {        
			//quitRequest(intent, session, callback);  
		}
		else if (intentName == 'AMAZON.YesIntent')  {   
			//console.log(' AMAZON.YesIntent: Intent  parameter check >>>>>>  '+retUser);
			if (session.attributes.currentProcessor !== 6 && session.attributes.currentProcessor !== 7 && session.attributes.currentProcessor !== 8) {
					slotValue = "Y";
					processAnswerIntent(event, slotValue, accountId, session, callback);
			}
		}
		else if (intentName == 'AMAZON.NoIntent' && session.attributes.currentProcessor == 2)  {   
				console.log(' AMAZON.NoIntent: Intent  called for profile creation - exiting app');
				console.log(' AMAZON.MainMenuIntent: retUser: '+retUser);		
		}
				
			//helpRequest(intent, session, callback);    
		//}    
		//MM 6-11-2017 Added bypass in case yes or no intent was answered which leaves Answer undefined 
		else if (intentName == 'AnswerIntent')  {        
			if (expected == false && session.attributes.currentProcessor == 3) {
				console.log(' processIntent: Unexpected Intent called during Q&A');
				var errorText = "I did not understand your answer.  Please repeat, but start with I said";
				processErrorResponse(errorText, 3, session, callback);
			} else if (isDateValue == true && isValidDate(slotValue) == false) {
				var errorText = "Please try again.  Dates must include at least month and year and should be spoken in the following manner: July 4th, 1776.  Please start with the Date is.";
				processErrorResponse(errorText, 3, session, callback);
			} else if (session.attributes.currentProcessor == 9) {
				console.log("AnswerIntent - Found the bug for retrieving next batch of meals");
			} else {		
				if (slotValue == ""){
					slotValue = intent.slots.Answer.value;
					console.log('Answer: ' + slotValue);
				}	
				console.log(' processAnswerIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
				processAnswerIntent(event, slotValue, accountId, session, callback);
			}
				
		}
		//MM 6-26-2017 Added date intent to try and better handle date inputs 
		else if (intentName == 'AnswerDate')  {        
			if (slotValue == ""){
				slotValue = intent.slots.Date.value;		
			}
			console.log(' processIntent: Intent  called >>>>>>  '+intentName+' the slot value is >>>>> '+slotValue);
			processAnswerIntent(event, slotValue, accountId, session, callback); 
		}
		//MM 6-26-2017 Added AddDiet intent handler 
		else if (intentName == 'AddDiet')  {        
			console.log(' processIntent: AddDiet, Name = '+intent.slots.Name.value+' food = '+intent.slots.Food.value+' meal = '+intent.slots.Meal.value);
			dbUtil.addDietRecord(intent, session, callback);
		}
		//MM 7-1-2018 Added InstantTaskExercise intent handler 
		else if (intentName == 'InstantTaskExercise')  {        
			console.log(' processIntent: InstantTaskExercise, Name = '+intent.slots.Name.value+' Num = '+intent.slots.Num.value+' Tasks = '+intent.slots.Tasks.value+' Duration = '+
			  intent.slots.Duration.value);
			dbUtil.instantTaskExercise(intent, session, callback);
		}

		//MM 7-24-2018 Added InstantMood intent handler 
		else if (intentName == 'InstantMood')  {        
			console.log(' processIntent: InstantMood, Mood = '+intent.slots.Mood.value);
			dbUtil.instantMood(intent, session, callback);
		}

		//MM 7-26-2018 Added Instant Blood Glucose intent handler 
		else if (intentName == 'InstantBloodGlucose')  {        
			console.log(' processIntent: InstantBloodGlucose, Name = '+intent.slots.Name.value + ', Result = ' + intent.slots.Result.value);
			dbUtil.instantBloodGlucose(intent, session, callback);
		}
	
		//MM 7-17-2018 Added InstantSleepSummary intent handler 
		else if (intentName == 'InstantSleepSummary')  {        
			var sleepValueId = intent.slots.SleepTime;
			if (sleepValueId  !== undefined) {
				sleepValueId = intent.slots.SleepTime.resolutions;
			}
			if (sleepValueId  !== undefined) {
				sleepValueId = intent.slots.SleepTime.resolutions.resolutionsPerAuthority[0].values;
			}
			if (sleepValueId  !== undefined) {
				sleepValueId = intent.slots.SleepTime.resolutions.resolutionsPerAuthority[0].values[0].value.id;
				console.log('InstantSleepSummary - sleepValueId) Identification: ' +  sleepValueId);				
				session.attributes.sleepValueId = sleepValueId;				
			} else {
				session.attributes.sleepValueId = "";									
			}
			console.log(' processIntent: InstantSleepSummary, Name = '+intent.slots.Name.value);
			dbUtil.instantSleepSummary(intent, session, callback);
		}
		//MM 7-17-2018 Added InstantSleepSleep intent handler 
		else if (intentName == 'InstantSleepSleep')  {        
			console.log(' processIntent: InstantSleepSleep, Name = '+intent.slots.Name.value);
			dbUtil.instantSleepSleep(intent, session, callback);
		}
		//MM 7-17-2018 Added InstantSleepWake intent handler 
		else if (intentName == 'InstantSleepWake')  {        
			console.log(' processIntent: InstantSleepWake, Name = '+intent.slots.Name.value);
			dbUtil.instantSleepWake(intent, session, callback);
		}
	
		//MM 01-01-2018 Added AddFood intent handler 
		else if (intentName == 'UpdateFoodPreferences')  {        
			console.log(' processIntent: UpdateFoodPreferences, Action= '+intent.slots.Action.value+' Category = '+intent.slots.Category.value);
			console.log(' processIntent: UpdateFoodPreferences, FoodField= '+intent.slots.FoodField.value+' FoodValue = '+intent.slots.FoodValue.value);
		//console.log(' processIntent: UpdateFoodPreferences, FoodValueID: ', intent.slots.FoodValue.resolutions.resolutionsPerAuthority[0].values);
			//console.log(' processIntent: UpdateFoodPreferences, FoodValueID: ', intent.slots.FoodValue.resolutions.resolutionsPerAuthority[0].values[0].value.id);
			dbUtil.updateFoodPreferences(intent, session, callback);
		}
		//MM 01-13-2018 Added AddDiet intent handler 
		else if (intentName == 'UpdateDietaryPreferences')  {        
			console.log(' processIntent: UpdateDietaryPreferences, Action= '+intent.slots.Action.value+' DietCategory = '+intent.slots.DietCategory.value);
			dbUtil.updateDietaryPreferences(intent, session, callback);
		}
		//MM 01-06-2018 Added AddWeight intent handler 
		else if (intentName == 'AddWeight')  {        
			console.log(' processIntent: AddWeight, Action= '+intent.slots.Weight.value+' Name = '+intent.slots.Name.value);
			dbUtil.addWeightRecord(intent, session, callback);
		}
		//MM 6-27-2017 Added CompleteInterview intent handler 
		else if (intentName == 'CompleteInterview')  {        
			console.log(' processIntent: CompleteInterview. ');
			dbUtil.getInProgressInStaging(sessionAttributes.profileid, session, callback);
			//processAnswerIntent(event, slotValue, accountId, session, callback); 
		} 
		
		//MM 1-8-2017 Added MainMenu Intent Handler 
		else if (intentName == 'MainMenuIntent')  {        
			console.log(' processIntent: MainMenuIntent. ');
			processNameIntentResponseFull(session.attributes.logosname, session.attributes.profileid, true, true, session, callback);
			//processAnswerIntent(event, slotValue, accountId, session, callback); 
		} 
		
		else if (session.attributes.currentProcessor == 6) {
			console.log(' processIntent: Handler for Name confirmation called.  Action taken in code above');
		}
		else {
			var errorText = "This is not a valid menu option.  Please try again.";
			processErrorResponse(errorText, 5, session, callback);
			//could be user saying something out of a custom intent, process based on Current processor
			//processUserGenericInteraction(event, intent, session, callback);
		}
	} else {
		console.log('Menu content ignored from up front branch code');
	}
}

function processWelcomeResponse(accountid, accountEmail, session, callback ) {
    console.log(' LogosHelper.processWelcomeResponse >>>>>>'+accountid);
    console.log(' LogosHelper.processWelcomeResponse >>>>>>'+accountEmail);
	
    // If we wanted to initialize the session to have some attributes we could add those here.

	//MM 6-10-17 added additional variables to align with processNameIntentResponse variables for use to control various downstream processes
	var maxScriptID = 0;
	var minScriptID = 0;
	var onBehalfOf = false;
	var scriptComplete = false;
	var tableId = 0;
	var curTable = '';
	var subjectLogosName = '';
	var stgScriptId = 0;
	var scriptName = '';
	var foodCategoryId = 0;
	var dateofmeasure = new Date();
	
	
	var qnObj = {};
    var sessionAttributes = {
    		'currentProcessor':1,
    		'accountid':accountid,
			'accountEmail': accountEmail,
    		'profileid':0,
    		'logosname':'',
			'subjectLogosName':subjectLogosName,
			'subjectProfileId':0,
			'onBehalfOf':onBehalfOf,
			'medicaleventid':0,
    		'isPrimaryProfile':false,
    		'primaryAccHolder':'',
    		'primaryProfileId':0,
    		'userHasProfile':false,
    		'profileComplete': false,
			'minScriptId' :minScriptID,
			'maxScriptId' :maxScriptID,
			'scriptComplete':scriptComplete,
			'tableId' :tableId,
			'currentTable' :curTable,			
			'stgScriptId' :stgScriptId,
			'scriptName' :scriptName,
			'stagingContinueText': '', 
			'continueInProgress': false,
			'dateofmeasure' :dateofmeasure,
			'foodcategoryid' :foodCategoryId,
			'OOChecked': false,
    		'qnaObj':qnObj
    };
    
	session.attributes = sessionAttributes;
    console.log('LogosHelper.processWelcomeResponse Check after>>>>>>'+session.attributes.accountEmail);
    
    var cardTitle = 'LogosHealth App';

    var speechOutput = 'Welcome to Logos Health personal healthcare companion.  Who am I serving today?  Please start with My Name is.';

    var repromptText = 'Please provide your first name';
    var shouldEndSession = false;
    
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function processRestart(accountid, speechOutput, session, callback) {
    console.log(' LogosHelper.processRestart >>>>>>'+accountid);
    // If we wanted to initialize the session to have some attributes we could add those here.

	//MM 6-10-17 added additional variables to align with processNameIntentResponse variables for use to control various downstream processes
	var maxScriptID = 0;
	var minScriptID = 0;
	var onBehalfOf = false;
	var scriptComplete = false;
	var tableId = 0;
	var curTable = '';
	var subjectLogosName = '';
	var stgScriptId = 0;
	var scriptName = '';
	var foodCategoryId = 0;
	var dateofmeasure = new Date();
	
	
	var qnObj = {};
    var sessionAttributes = {
    		'currentProcessor':1,
    		'accountid':accountid,
			'accountEmail': session.attributes.accountEmail,
    		'profileid':0,
    		'logosname':'',
			'subjectLogosName':subjectLogosName,
			'subjectProfileId':0,
			'onBehalfOf':onBehalfOf,
			'medicaleventid':0,
    		'isPrimaryProfile':false,
    		'primaryAccHolder':'',
    		'primaryProfileId':0,
    		'userHasProfile':false,
    		'profileComplete': false,
			'minScriptId' :minScriptID,
			'maxScriptId' :maxScriptID,
			'scriptComplete':scriptComplete,
			'tableId' :tableId,
			'currentTable' :curTable,			
			'stgScriptId' :stgScriptId,
			'scriptName' :scriptName,
			'stagingContinueText': '', 
			'continueInProgress': false,
			'dateofmeasure' :dateofmeasure,
			'foodcategoryid' :foodCategoryId,
			'OOChecked': false,
    		'qnaObj':qnObj
    };
    
	session.attributes = sessionAttributes;
    
    var cardTitle = 'LogosHealth App';

    var repromptText = 'Please provide your first name';
    var shouldEndSession = false;
    
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function processNameIntentResponse(userName, profileId, hasProfile, profileComplete, session, callback) {
    // User Name has been processed
    console.log(' LogosHelper:processUserNameInput > UserName = ' + userName + ' Processor = ' + session.attributes.currentProcessor);
    
	//MM 6-10-17 added the following persistence variable: maxScriptID, scriptComplete, tableId, stgScriptId, scriptName
    var qnObj = {};
    var processor = 0;
    var cardTitle = 'User Profile';
    var speechOutput = "";
	var maxScriptID = 0;
	var minScriptID = 0;
	var subjectLogosName = '';
	var onBehalfOf = false;
	var scriptComplete = false;
	var tableId = 0;
	var curTable = '';
	var stgScriptId = 0;
	var foodCategoryId = 0;
	var scriptName = '';
	var dateofmeasure = new Date();
	var timezone = session.attributes.userTimezone;
    var accountId = session.attributes.accountid;
	var accountEmail = session.attributes.accountEmail;
    var isPrimary = session.attributes.isPrimaryProfile == null?false:session.attributes.isPrimaryProfile;
    var primAccName = session.attributes.primaryAccHolder == null?false:session.attributes.primaryAccHolder;
    var primAccId = session.attributes.primaryProfileId == null?false:session.attributes.primaryProfileId;
    
    if (profileComplete) {
    	var speechOutput = 'Hello '+userName+ '. "," Welcome to the Logos Health Prototype main menu. What would you like to do today? For a list of options, simply say, menu';

    		processor = 5;
    } else if (session.attributes.currentProcessor == 1) {
		var spellName = '';
		for (var i = 0; i < userName.length; i++) {
			if (i !== userName.length-1) {
				spellName = spellName + userName.substring(i, i+1) + '-';
			} else {
				spellName = spellName + userName.substring(i, i+1);
			}
		} 
		//MM 7-26-17 Altered the flow to make sure Alexa is hearing the user's name properly
		speechOutput = 'I understood your name as '+userName+ ', ' + spellName +'.  Is that correct?';
		processor = 6;
		//speechOutput = 'Hello '+userName+ ' , No profile found with your name on your Account. "," Would you like to create one?';
    	//processor = 2;
    } else {
		speechOutput = 'Hello '+userName+ ' , No profile found with your name on your Account. "," Would you like to create one?';
    	processor = 2;
	}
    
    //set session attributes
    var sessionAttributes = {
    		'currentProcessor':processor,
    		'accountid':accountId,
			'accountEmail' :accountEmail,
    		'profileid':profileId,
    		'logosname':userName,
			'subjectLogosName':subjectLogosName,
			'subjectProfileId':0,
			'userTimezone':timezone, 
			'onBehalfOf':onBehalfOf,
			'medicaleventid':0,
    		'isPrimaryProfile':isPrimary,
    		'primaryAccHolder':primAccName,
    		'primaryProfileId':primAccId,
    		'userHasProfile':hasProfile,
    		'profileComplete': profileComplete,
			'minScriptId' :minScriptID,
			'maxScriptId' :maxScriptID,
			'scriptComplete':scriptComplete,
			'tableId' :tableId,
			'currentTable' :curTable,
			'stgScriptId' :stgScriptId,
			'stagingContinueText': '', 
			'continueInProgress': false,
			'scriptName' :scriptName,
			'dateofmeasure' :dateofmeasure,
			'foodcategoryid' :foodCategoryId,
			'OOChecked': false,
    		'qnaObj':qnObj
    };
    
    session.attributes = sessionAttributes;
    
    processSelectionResponse(speechOutput, session, callback);

}

function processNameIntentResponseFull(userName, profileId, hasProfile, profileComplete, session, callback) {
    // User Name has been processed
    console.log(' LogosHelper:processUserNameInput > UserName = ' + userName + ' Processor = ' + session.attributes.currentProcessor);
    
	//MM 6-10-17 added the following persistence variable: maxScriptID, scriptComplete, tableId, stgScriptId, scriptName
    var qnObj = {};
    var processor = 0;
    var cardTitle = 'User Profile';
    var speechOutput = "";
	var maxScriptID = 0;
	var minScriptID = 0;
	var subjectLogosName = '';
	var onBehalfOf = false;
	var scriptComplete = false;
	var tableId = 0;
	var curTable = '';
	var stgScriptId = 0;
	var scriptName = '';
	var foodCategoryId = 0;
	var dateofmeasure = new Date();
    var accountId = session.attributes.accountid;
	var accountEmail = session.attributes.accountEmail;
    var isPrimary = session.attributes.isPrimaryProfile == null?false:session.attributes.isPrimaryProfile;
    var primAccName = session.attributes.primaryAccHolder == null?false:session.attributes.primaryAccHolder;
    var primAccId = session.attributes.primaryProfileId == null?false:session.attributes.primaryProfileId;
    
    if (profileComplete) {
    	var speechOutput = 'Please choose one of the following options. ';
    	speechOutput = speechOutput+ ' Diet. '+
					' Exercise. '+
					' Medicine. '+
					' Vitamins and Supplements. '+
					' Medical Event. '+
					' Allergy. '+
					' Vaccine. '+
					' Add Family Member.  '+
					' Complete In-Progress Interview.  '+
					' Provide Feedback.  ';
    		processor = 5;
    } else if (session.attributes.currentProcessor == 1) {
		//MM 7-26-17 Altered the flow to make sure Alexa is hearing the user's name properly
		speechOutput = 'I understood your name as '+userName+ '.  Is that correct?';
		processor = 6;
		//speechOutput = 'Hello '+userName+ ' , No profile found with your name on your Account. "," Would you like to create one?';
    	//processor = 2;
    } else {
		speechOutput = 'Hello '+userName+ ' , No profile found with your name on your Account. "," Would you like to create one?';
    	processor = 2;
	}
    
    //set session attributes
    var sessionAttributes = {
    		'currentProcessor':processor,
    		'accountid':accountId,
			'accountEmail' :accountEmail,
    		'profileid':profileId,
    		'logosname':userName,
			'subjectLogosName':subjectLogosName,
			'subjectProfileId':0,
			'onBehalfOf':onBehalfOf,
			'medicaleventid':0,
    		'isPrimaryProfile':isPrimary,
    		'primaryAccHolder':primAccName,
    		'primaryProfileId':primAccId,
    		'userHasProfile':hasProfile,
    		'profileComplete': profileComplete,
			'minScriptId' :minScriptID,
			'maxScriptId' :maxScriptID,
			'scriptComplete':scriptComplete,
			'tableId' :tableId,
			'currentTable' :curTable,
			'stgScriptId' :stgScriptId,
			'stagingContinueText': '', 
			'continueInProgress': false,
			'scriptName' :scriptName,
			'dateofmeasure' :dateofmeasure,
			'foodcategoryid' :foodCategoryId,
			'OOChecked': false,
    		'qnaObj':qnObj
    };
    
    session.attributes = sessionAttributes;
    
    processSelectionResponse(speechOutput, session, callback);

}
function processAnswerIntent(event, slotValue, accountId, session, callback) {
    // User Name has been processed
   // console.log(' LogosHelper:processAnswerIntent >>>>>> Processor = ' + session.attributes.currentProcessor);
    var qnaObj = {};
    //set session attributes
    var sessionAttributes = session.attributes;
    var currentProcessor = sessionAttributes.currentProcessor;
    var isPrimary = sessionAttributes.isPrimaryProfile;
    
    //console.log(' LogosHelper:processAnswerIntent >>>>>>'+currentProcessor+' and is primary profile ?  '+isPrimary);
    console.log(' LogosHelper:processAnswerIntent >>>>>>'+currentProcessor+' and slotValue ?  '+slotValue);
    
    switch(currentProcessor) {
    case 1:
	    //console.log(' LogosHelper:Get Name thread - SlotValue >>>>>> ' + slotValue);
		session.attributes.logosname = slotValue;	
        dbUtil.verifyUserProfile(slotValue, accountId, session, callback);
        break;
    case 2:
       //Create Profile QnA
        var scriptName = "Create a New Primary Profile";
        if(!isPrimary) {
        	scriptName = "Create a New Profile - Not primary - User adding own record";
        }
		if (slotValue == 'Y' || slotValue == 'yes') {
	        dbUtil.readQuestsionsForBranch(0, scriptName, slotValue, session, callback);		
		} else {
			var errorText = "You must complete your profile to leverage Logos Health.  When you are ready, please reenter and complete profile creation.  Good bye.";
			processExitResponse(errorText, 2, session, callback);				
		}	
        break;
    case 3:
       //Continue profile QnA until completes
	   //MM 7-31-2017 Added handler to exit if user says no to continue profile creation.  May consider refactoring in future - i.e. push this away from Q&A branch	
	   //MM 7-31-2017 Added handler for apostrophe 		
        qnaObj = sessionAttributes.qnaObj;
		if (slotValue == 'N' && sessionAttributes.retUser) {
			var errorText = "You must complete your profile to leverage Logos Health.  When you are ready, please reenter and complete profile creation.  Good bye.";
			processExitResponse(errorText, 2, session, callback);							
		} else {
			if (slotValue.indexOf("'") != -1) {
				slotValue = slotValue.split("'").join("''");
			    console.log('LogosHelper:processAnswerIntent has apostrophe '+slotValue);	
			}
	        saveResponseQNA(slotValue, qnaObj, session, callback);		
		}	
        break;
    case 4:
		console.log("Called from Case 4 - Process Answer Intent");	
       	processUserGenericInteraction (session, callback);
        break;
    case 5:
		var errorText = "This is not a valid menu option.  Please try again.";
		processErrorResponse(errorText, 5, session, callback);	
        break;
    default:
		console.log("Called from Default - Process Answer Intent");	
        processUserGenericInteraction (session, callback);
	}

}

function handleSessionEndRequest(callback) {
    var cardTitle = 'Session Ended';
    var speechOutput = 'Have a nice day!';
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function processMainMenuOptions(session, callback) {
	//TODO: Implement main menu options here
	
	
}

function processUserGenericInteraction (session, callback) {
    //TODO: Implementation
    console.log(' LogosHelper.processUserInteraction >>>>>>');
    //set session attributes
    var sessionAttributes = session.attributes;
    sessionAttributes.currentProcessor = '6';
    
    var cardTitle = 'Open Profile';

    var speechOutput = 'Sorry, Couldnt get your response. Please say help to hear menu options';

    var repromptText = 'Unknown context';
    var shouldEndSession = false;
    session.attributes = sessionAttributes;
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function saveResponseQNA(slotValue, qnaObj, session, callback) {
    console.log(' LogosHelper.saveResponseQNA >>>>>> Slot value is '+slotValue);
    
    var speechOutput = 'Thank you for your response. Saving.';
    //set session attributes
    var accountId = session.attributes.accountid;
    var userName = session.attributes.logosname;
    var profileId = session.attributes.profileid;
    var hasProfile = session.attributes.userHasProfile;
    var hasProfileComplete = session.attributes.profileComplete
    var sessionAttributes = session.attributes;
	var processor = 3;
    var isComplete = true;
    var retUser = session.attributes.retUser;
    var isScriptComplete; 
    
	//MM 06-07-17 Removed the not hasProfileComplete check - need to replace with isScriptComplete
	//Changed the name to saveResponseQNA to be more accurate in description

    console.log(' LogosHelper.saveResponseQNA : eventQNArr >>>>>> '+ qnaObj.eventQNArr==null);
	
	//MM 6-22-17 Adding the check to update session variables 
	if (qnaObj.answerField !==null) {
		if (sessionAttributes.onBehalfOf && qnaObj.answerField.indexOf("logosname") != -1) {
			sessionAttributes.subjectLogosName = slotValue;
		}
	}
	
	if (qnaObj.processed && isEmpty(qnaObj.eventQNArr)) {
    	session.attributes.qnaObj.answerFieldValue = slotValue;
    	session.attributes.qnaObj.answer = slotValue;
    	
    	if (qnaObj.isDictionary !== null && qnaObj.isDictionary.toLowerCase() == 'y') {
		//MM 5-9-2018 Added handler for setting dictionary id from Alexa intent schema
			console.log(' LogosHelper.saveResponseQNA : Field is Dictionary type, get ID >>>>>> '+qnaObj.isDictionary);
			if (sessionAttributes.answerID !== '') {
				console.log('Loop 1: ' +  sessionAttributes.answerID + ' is the answerid');
				//qnaObj.answer = sessionAttributes.answerID;
				//qnaObj.dictanswer = slotValue;

				dbUtil.readDictionaryTerm(qnaObj, session, false, callback);				
			} else {
				console.log('Loop 2: Goto read Dictionary');
				dbUtil.readDictoinaryId(qnaObj, slotValue, processor, false, session, callback);
			}
    	} else if (qnaObj.formatId && qnaObj.formatId !== null) {
			console.log(' LogosHelper.saveResponseQNA : Field has format ID to format user input >>>>>> '+qnaObj.formatId);
			//validate user input against RegEx formatter, if error throw response otherwise continue
			dbUtil.validateData(qnaObj, slotValue, processor, session, callback);
		} else {
			if (qnaObj.formatId == 3) {
				console.log(" LogosHelper.saveResponseQNA >>>>: Received Date input as "+slotValue);
				var dtStr = slotValue.split(' ').join('-');
				console.log(" LogosHelper.saveResponseQNA >>>>: date reconstructed as  "+dtStr);
				qnaObj.answer = dtStr;
				dbUtil.saveResponse(qnaObj, session, callback);
			} else {
				qnaObj.answer = slotValue;
				dbUtil.saveResponse(qnaObj, session, callback);
			}
			
		}
    } else if (!isEmpty(qnaObj.eventQNArr)){
		var eventQNArr = qnaObj.eventQNArr;
		var quest = "";
    	//console.log(' LogosHelper.saveResponseQNA >>>>>> Event script processing qnaObj.eventQNArr: ', qnaObj.eventQNArr);
    	console.log(' LogosHelper.saveResponseQNA >>>>>> Event script processing eventQNAArr: ', eventQNArr);

		eventQNArr.answer = slotValue;
		
		if (eventQNArr.isDictionary !== null  && eventQNArr.isDictionary.toLowerCase() == 'y') {
			//MM 5-9-2018 Added handler for setting dictionary id from Alexa intent schema
			console.log(' LogosHelper.processEventSpecificResponse : Field is Dictionary type, get ID >>>>>> '+eventQNArr.isDictionary);
			if (sessionAttributes.answerID !== '') {
				dbUtil.readDictionaryTerm(qnaObj, session, true, callback);				
			} else {
				dbUtil.readDictoinaryId(qnaObj, eventQNArr.answer, processor, true, session, callback);
			}

		} else if (eventQNArr.formatId !== null && eventQNArr.formatId != "") {
			console.log(' LogosHelper.processEventSpecificResponse : Field is Dictionary type, get ID >>>>>> '+eventQNArr.formatId);
			dbUtil.validateData(qnaObj, eventQNArr.answer, processor, session, callback);
		} else {
			console.log(' LogosHelper.processEventSpecificResponse : Call Update Event Details >>>>>> '+eventQNArr.answer);
			dbUtil.updateEventDetails(qnaObj, eventQNArr, eventQNArr.answer, session, callback);
		}
    } else {
    	processResponse(qnaObj, session, callback, retUser);
    }
}

function processResponse(qnObj, session, callback, retUser) {
	console.log('LogosHelper.processResponse : CALLED>>> ');
	console.log('LogosHelper.processResponse: currentProcess>>> ' + session.attributes.currentProcessor);
	
    var sessionAttributes = session.attributes;
    var userName = sessionAttributes.logosname;
    var primaryName = sessionAttributes.primaryAccHolder;
    var quest = '';
    var isProcessed = qnObj.processed;
    var isComplete = true;
    var slotValue = "";	
	
  if (sessionAttributes.stagingContinueText !== '' && sessionAttributes.stagingContinueText !== undefined) {
  	quest = sessionAttributes.stagingContinueText;
	sessionAttributes.stagingContinueText = '';
  }
 	
  if (qnObj.question !== undefined) {
    quest = quest + qnObj.question;	  
  } else {
  	quest = qnObj.question;	
  }
	  
  if (quest !== undefined) {
	//MM 6-22-17 Changes the tag based on whether the user is entering data for himself/herself or on behalf of a family member
	//replace [name] tag based on User profile exists or not
	if (quest.indexOf("[name]") != -1 && sessionAttributes.onBehalfOf) {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [name] tag, replacing with logos name '+sessionAttributes.subjectLogosName);
		quest = quest.replace("[name]", sessionAttributes.subjectLogosName);
	} else {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [name] tag, replacing with logos name YOUR ');
		quest = quest.replace("[name]", "you");
	}

	//replace [names] tag based on User profile exists or not
	if (quest.indexOf("[names]") != -1 && sessionAttributes.onBehalfOf) {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [name] tag, replacing with logos name '+sessionAttributes.subjectLogosName+'s');
		quest = quest.replace("[names]", sessionAttributes.subjectLogosName+"'s");
	} else {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [name] tag, replacing with logos name YOURS ');
		quest = quest.replace("[names]", "your");
	}
	
	if (quest.indexOf("[primary]") != -1 && !sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [primary] tag, replacing with logos name '+primaryName);
		quest = quest.replace("[primary]", primaryName);
	} else if (quest.indexOf("[primary]") != -1 && sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [primary] tag, replacing with YOU');
		quest = quest.replace("[primary]", "you");		
	}

	if (quest.indexOf("[primarys]") != -1 && !sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [primarys] tag, replacing with logos name '+primaryName);
		quest = quest.replace("[primarys]", primaryName + "'s");
	} else if (quest.indexOf("[primarys]") != -1 && sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processResponse >>>>>>: Question has [primarys] tag, replacing with YOUR');
		quest = quest.replace("[primarys]", "your");				
	}
  } else {
  	quest = "There is an error retrieving the question.  If this persists, please contact customer service.  Restarting Logoshealth.  Main menu.  For a list of options, simply say, menu"
	  processMenuResponse(quest, session, callback);  
  }
	
	var speechOutput = "";

	if (session.attributes.retUser) {
		speechOutput = 'Hello '+userName+'. Welcome back to Logos Health!. Your profile is incomplete!. Say Yes to continue, No to exit Logos Health.';
		qnObj.processed = false;
		//session.attributes.retUser = false;
	} else {
		speechOutput = quest;
		qnObj.processed = true;
	}

	var cardTitle = 'Profile QnA';

	var repromptText = quest;
	var shouldEndSession = false;
	
	if (!session.attributes.scriptComplete){
		console.log("Current Processor being changed from " + session.attributes.currentProcessor + " to 3.");
		session.attributes.currentProcessor = 3;		
	}

	
	session.attributes.qnaObj = qnObj;
	console.log(' LogosHelper.processResponse >>>>>>: output text is '+speechOutput);
	callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function processEventResponse(qnObj, session, callback, retUser) {
	console.log('LogosHelper.processEventResponse : CALLED>>> ');
	
    var sessionAttributes = session.attributes;
    var userName = sessionAttributes.logosname;
    var primaryName = sessionAttributes.primaryAccHolder;
    var quest = '';
	var isProcessed = qnObj.processed;
    var isComplete = true;
    var slotValue = "";
 
	if (sessionAttributes.stagingContinueText !== '' && sessionAttributes.stagingContinueText !== undefined) {
		quest = sessionAttributes.stagingContinueText;
		sessionAttributes.stagingContinueText = '';
	}

	if (qnObj.eventQNArr.eventQuestion !== undefined) {
    quest = quest + qnObj.eventQNArr.eventQuestion;	  
  } else {
  	quest = qnObj.eventQNArr.eventQuestion;	
  }

	//MM 6-24-17 Copied logic from processResponse - changed tags to clarify
	if (quest.indexOf("[name]") != -1 && sessionAttributes.onBehalfOf) {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [name] tag, replacing with logos name '+sessionAttributes.subjectLogosName);
		quest = quest.replace("[name]", sessionAttributes.subjectLogosName);
	} else {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [name] tag, replacing with logos name YOUR ');
		quest = quest.replace("[name]", "you");
	}

	//replace [names] tag based on User profile exists or not
	if (quest.indexOf("[names]") != -1 && sessionAttributes.onBehalfOf) {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [name] tag, replacing with logos name '+sessionAttributes.subjectLogosName+'s');
		quest = quest.replace("[names]", sessionAttributes.subjectLogosName+"'s");
	} else {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [name] tag, replacing with logos name YOURS ');
		quest = quest.replace("[names]", "your");
	}
	
	if (quest.indexOf("[primary]") != -1 && !sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [primary] tag, replacing with logos name '+primaryName);
		quest = quest.replace("[primary]", primaryName);
	} else if (quest.indexOf("[primary]") != -1 && sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [primary] tag, replacing with YOU');
		quest = quest.replace("[primary]", "you");		
	}

	if (quest.indexOf("[primarys]") != -1 && !sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [primarys] tag, replacing with logos name '+primaryName);
		quest = quest.replace("[primarys]", primaryName + "'s");
	} else if (quest.indexOf("[primarys]") != -1 && sessionAttributes.isPrimaryProfile) {
		//console.log(' LogosHelper.processEventResponse >>>>>>: Question has [primarys] tag, replacing with YOUR');
		quest = quest.replace("[primarys]", "your");				
	}

	var speechOutput = "";

	if (session.attributes.retUser) {
		speechOutput = 'Hello '+userName+'. Welcome back to Logos Health!. Your profile is incomplete!. Say Yes to continue, No to exit Logos Health';
		qnObj.processed = false;
		//session.attributes.retUser = false;
	} else {
		speechOutput = quest;
		qnObj.processed = true;
	}

	var cardTitle = 'Profile QnA';

	var repromptText = quest;
	var shouldEndSession = false;

	if (!session.attributes.scriptComplete){
		session.attributes.currentProcessor = 3;		
	}

	
	console.log(' LogosHelper.processEventResponse >>>>>>: output text is '+speechOutput);
	//session.attributes.qnaObj.eventQNArr.eventQuestion = quest;
	callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function processEventSpecificResponse(qnObj, session, callback) {
	console.log(' LogosHelper.processEventSpecificResponse >>>>>>: output text is '+quest);
	var speechOutput = quest;

	var cardTitle = 'Event Questions';

	var repromptText = 'Say Save Event Data';
	var shouldEndSession = false;
	session.attributes.currentProcessor = 3;
	session.attributes.qnaObj = qnObj;
	callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	
}

function processErrorResponse(errorText, processor, session, callback) {
	//console.log('LogosHelper.processErrorResponse : CALLED>>> ');
    
    var cardTitle = 'User Input Error';

    var repromptText = errorText;
    var shouldEndSession = false;
    session.attributes.currentProcessor = processor;
    speechOutput = errorText;
	
	console.log('LogosHelper.processErrorResponse>: output text is '+speechOutput);
  
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

//MM 7-18-17 Added a session ending response - initially for users who do not want to create an account
function processExitResponse(errorText, processor, session, callback) {
	//console.log('LogosHelper.processErrorResponse : CALLED>>> ');
    
    var cardTitle = 'Exiting Logos Health';

    var repromptText = '';
    var shouldEndSession = true;
    session.attributes.currentProcessor = processor;
    speechOutput = errorText;
	
	console.log('LogosHelper.processExitResponse>: output text is '+speechOutput);
  
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function processHelpResponse(helpText, processor, session, callback) {
	//console.log('LogosHelper.processErrorResponse : CALLED>>> ');
    
    var cardTitle = 'Help Text';

    var repromptText = helpText;
    var shouldEndSession = false;
    session.attributes.currentProcessor = processor;
    speechOutput = helpText;
	
	console.log('LogosHelper.processHelpResponse>: output text is '+speechOutput);
  
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function processToMainMenuResponse(helpText, processor, session, callback) {
	//console.log('LogosHelper.processErrorResponse : CALLED>>> ');
    
    var cardTitle = 'Main Menu';

    var repromptText = helpText;
    var shouldEndSession = false;
    session.attributes.currentProcessor = processor;
    speechOutput = helpText;
	
	console.log('LogosHelperprocessToMainMenuResponse>: output text is '+speechOutput);
  
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

//MM 02-28-18  Constructs the OrderMeal Response
function constructOrderMealResp(action, session, callback) {
	var strResponse;
	var sessionAttributes = session.attributes;
	
	if (action == 'meal') {
		strResponse = "Here are meals which fit your preferences. To order the current meal, say 'order'.  Say 'details', to hear more information about this meal. " +
			"Say 'nutrition', to get nutrition info.  Say 'next', for the next meal option or 'main menu', to exit to the main menu.  First Option, "
			+ sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].name +
			" from " + sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].restaurantname + " which costs " +
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].cost + " dollars.";
		//processor 9 = Order a Meal branch
		processOrderMealResponse(strResponse, 9, session, callback);		
	} else if (action == 'order') {
		strResponse = "Call " + sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].restaurantname + " at " + 
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].phone + 
			".  In the future, I will make this call for you through the Echo device.  Main Menu.  For a list of options, simply say, menu.";
		//processor 5 = Back to Main Menu.
		processToMainMenuResponse(strResponse, 5, session, callback);						
	} else if (action == 'next') {
		//iterates to next option
		sessionAttributes.currentMenuIndex = sessionAttributes.currentMenuIndex + 1;
		if(sessionAttributes.currentMenuIndex < sessionAttributes.miBatchCount) {
			strResponse = sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].name +" from " + 
				sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].restaurantname + " which costs " + 
				sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].cost + " dollars.";
			//processor 9 = Order a Meal branch
			processOrderMealResponse(strResponse, 9, session, callback);				
		} else {
			strResponse = "There are no further options available at this time.  Main menu.  For a list of options, simply say, menu.";
			processToMainMenuResponse(strResponse, 5, session, callback);						
		}
	} else if (action == 'next batch') {
			strResponse = sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].name +" from " + 
				sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].restaurantname + " which costs " + 
				sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].cost + " dollars.";
		//processor 9 = Order a Meal branch
		console.log("Next batch built");
		processOrderMealResponse(strResponse, 9, session, callback);						
	} else if (action == 'details') {
		strResponse = sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].name +" is described as " + 
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].description;
		//processor 9 = Order a Meal branch
		processOrderMealResponse(strResponse, 9, session, callback);						
	} else if (action == 'nutrition') {
		strResponse = sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].name +" has " + 
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].calories + " calories, " + 
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].totalfat + " grams of total fat, " + 
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].carbs + " grams of carbs, and " + 
			sessionAttributes.menuItems[sessionAttributes.currentMenuIndex].protein + " grams of protein";		
		processOrderMealResponse(strResponse, 9, session, callback);						
	} else if (action == 'main menu') {
		strResponse = "Exiting Order a Meal.  Main Menu.  For a list of options, simply say, menu.";
		//processor 5 = Back to Main Menu.		
		processToMainMenuResponse(strResponse, 5, session, callback);						
	} else {
		strResponse = "This is not a valid response.  Please choose respond with one of the following options: order, details, nutrition, next, or main menu.";
		//processor 9 = Order a Meal branch
		processOrderMealResponse(strResponse, 9, session, callback);
	}
}

//MM 02-28-18  Delivers Order Meal Response to Alexa
function processOrderMealResponse(helpText, processor, session, callback) {
	//console.log('LogosHelper.processErrorResponse : CALLED>>> ');
    
    var cardTitle = 'Order a Meal';

    var repromptText = 'Are you there?  Please respond with one of the following options: order, details, nutrition, next, or main menu';
    var shouldEndSession = false;
    session.attributes.currentProcessor = processor;
    speechOutput = helpText;
	
	console.log('LogosHelper.processOrderMealResponse>: output text is '+speechOutput);
  	console.log('LogosHelper.processOrderMealResponse>: CurrentProcessor is '+ session.attributes.currentProcessor);
  
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function processConfirmResponse(confirmText, processor, session, callback) {
	//console.log('LogosHelper.processErrorResponse : CALLED>>> ');
    
    var cardTitle = 'Confirm Action Text';

    var repromptText = confirmText;
    var shouldEndSession = false;
    session.attributes.currentProcessor = processor;
    speechOutput = confirmText;
	
	console.log('LogosHelper.processConfirmResponse>: output text is '+speechOutput);
  
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}
function processSelectionResponse(speechOutput, session, callback) {
	console.log('LogosHelper.processSelectionResponse : CALLED>>> ');
	
    var cardTitle = 'Enter Your Profile';

    var repromptText = speechOutput;
	//Set branch to main menu
    //session.attributes.currentProcessor = 5;
  
    var shouldEndSession = false;
  
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function processMenuResponse(speechOutput, session, callback) {
	console.log('LogosHelper.processMenuResponse : CALLED>>> ');
	
    var cardTitle = 'Main Menu';

    var repromptText = speechOutput;
	//Set branch to main menu
    session.attributes.currentProcessor = 5;
  
    var shouldEndSession = false;
  
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleCreateLogosHealthProfile (event, context, userName, session, callback) {
    //TODO: Implementation
    console.log(' LogosHelper.handleCreateLogosHealthProfile >>>>>>');
    //set session attributes
    var sessionAttributes = session.attributes;
    sessionAttributes.currentProcessor = '4';
    
    var cardTitle = 'Create Profile';

    var speechOutput = userName+' , your create profile request has been initiated", "Please answer following questions';

    var repromptText = 'Creating a profile';
    var shouldEndSession = false;
    
    session.attributes = sessionAttributes;
    
    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleOpenLogosHealthProfile (event, context, intent, session, callback) {
    console.log(' LogosHelper.handleOpenLogosHealthProfile >>>>>>');
    
    var sessionAttributes = session.attributes;
    sessionAttributes.currentProcessor = '3';
    
    console.log(" The session attribute to handleOpenLogosHealthProfile >>>>> "+sessionAttributes);
    var cardTitle = 'Open Profile';

    var speechOutput = 'Hello Marty, How are you today?", "Welcome to Logos Health App';

    var repromptText = 'Opening a profile';
    var shouldEndSession = false;
    
    var accounts = ""; //dbUtil.getAllUserAccounts();
    
    console.log(" The Accounts retrieved from Database >>>>"+accounts);
    session.attributes = sessionAttributes;

    callback(session.attributes, buildSpeechResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

//MM 5-8-2018 Added function to ensure validity of date values	
function isValidDate(slotValue) {
	var equalSplit = slotValue.split("-");
	if (equalSplit[0] > 1000 && equalSplit[0] < 3000 && equalSplit[1] > 0 && equalSplit[1] < 13 && equalSplit[2] >= 0 && equalSplit[2] < 32) {
		return true;
	} else {
		console.log('IsValidDate is false: year: ' + equalSplit[0] + ' month: ' + equalSplit[1] + ' day: ' + equalSplit[2]);
		return false;
	}
}

function spellWord(intent) {
//MM 7-26-17 Added function to enable word spelling feature 
	var spelledWord = '';
	
	if (intent.slots.Letter.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letter.value.charAt(0).toUpperCase();
	}
	if (intent.slots.Letterb.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterb.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterc.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterc.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterd.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterd.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Lettere.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Lettere.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterf.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterf.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterg.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterg.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterh.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterh.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letteri.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letteri.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterj.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterj.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterk.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterk.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterl.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterl.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Letterm.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Letterm.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Lettern.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Lettern.value.charAt(0).toLowerCase();
	}
	if (intent.slots.Lettero.value  !== undefined) {
		spelledWord = spelledWord + intent.slots.Lettero.value.charAt(0).toLowerCase();
	}

    return spelledWord;
}