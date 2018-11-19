/**
 * LogosHealth App Database Utility.
 * This Util has all support functions for DB operations, uses SQL driver supported classes & utilities for persistence
 * Copyright Logos Health, Inc
 *
 */

//global variables
var mysql = require('mysql');
var helper = require('./LogosHelper');
var deepstream = require('./DeepstreamUtils');
var moment = require('moment-timezone');
var threadCount1 = 0;
var threadCount2 = 0;
var threadCount3 = 0;
var threadCount4 = 0;
var threadCount5 = 0;

var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBIX3hQyWMfJHRk8zRlkzUtCIXXlcntELc'
});


/**
 * Create a new Connection instance.
 * @param {object|string} config Configuration or connection string for new MySQL connection
 * @return {Connection} A new MySQL connection
 * @public
 */
exports.getDBConnection = function getDBConnection() {
  	//console.log(' DBUtils.getDBConnection >>>>>>');
    return getLogosConnection();
};

/**
 * Closes an existing connection.
 * @param {object|string} an active connection object
 * @return {boolean} Whether connection is closed or not
 * @public
 */
exports.closeDBConnection = function closeDBConnection(connection) {
  //console.log(' DBUtils.closeDBConnection >>>>>>');
  closeConnection();
  return true;
};

/**
 * Closes an existing connection.
 * @param {object|string} an active connection object
 * @return {boolean} Whether connection is closed or not
 * @public
 */
exports.getAccountIdFromEmail = function getAccountIdFromEmail(email, session, callback) {
  //console.log(' DBUtils.getAccountIdFromEmail >>>>>>');
  loadAccountIDFromEmail(email, session, callback);
};

/**
 * Debugs class instantiation.
 * @param {none}
 * @return {boolean} Function could be called
 * @public
 */
exports.getAllUserAccounts = function getAllUserAccounts() {
  //console.log(' DBUtils.getAllUserAccounts >>>>>>');
  return loadUserAccounts();
};

/**
 * Debugs class instantiation.
 * @param {none}
 * @return {boolean} Function could be called
 * @public
 */
exports.checkClassAccess = function checkClassAccess() {
  //console.log(' DBUtils.checkClassAccess new >>>>>>');
  return true;
};

/**
 * Debugs class instantiation.
 * @param {none}
 * @return {boolean} Function could be called
 * @public
 */
exports.verifyUserProfile = function verifyUserProfile(usrName, accountId, session, callback) {
  //console.log(' DBUtils.verifyUserProfile >>>>>>');
  return getUserProfileByName(usrName, accountId, session, callback);
};

/**
 * Debugs class instantiation.
 * @param {none}
 * @return {boolean} Function could be called
 * @public
 */
exports.readDictoinaryId = function readDictoinaryId(qnaObj, value, processor, fromEvent, session, callback) {
  //console.log(' DBUtils.readDictoinaryId >>>>>>');
  return getDictionaryId(qnaObj, value, processor, fromEvent, session, callback);
};

exports.readDictionaryTerm = function readDictionaryTerm(qnaObj, session, fromEvent, callback) {
	//console.log(' DBUtils.readDictoinaryId >>>>>>');
	return getTermFromDictId(qnaObj, session, fromEvent, callback);
  };


exports.validateData = function validateData(qnaObj, value, processor, session, callback) {
  //console.log(' DBUtils.validateData >>>>>>');
  return validateUserInput(qnaObj, value, processor, session, callback);
};

/**
 * @public name is getScriptDetails
 * @VG 2/26 | Pass the script as the param to get all possible questions
 */
exports.readQuestsionsForBranch = function readQuestsionsForBranch(questionId, scriptName, slotValue, session, callback) {
  	//console.log(' DBUtils.readQuestsionsForBranch >>>>>>' +scriptName);
  	getScriptDetails(questionId, scriptName, slotValue, session, callback, false);
};

/**
 * @MM 6/24 | Will set the OnBehalfOf value and continue processing if that family member is found
 */
exports.setOnBehalfOf = function setOnBehalfOf(questionId, scriptName, slotValue, session, callback) {
  	//console.log(' DBUtils.setOnBehalfOf >>>>>>' +scriptName);
  	processOnBehalfOf(questionId, scriptName, slotValue, session, callback, false);
};

/**
 * @public
 * @VG 2/28 | Expects session information as a user response passed here to create a profile
 */
//MM 6-10-17 Changed external name to saveResponse to be more accurate in description - changed internal name to saveAnswer to be more accurate in description
exports.saveResponse = function saveResponse(qnaObj, session, callback){
  	//console.log(' DBUtils.saveAnswer >>>>>>'+qnaObj.answer);
  	saveAnswer(qnaObj, session, callback);
};

/**
 * @public
 * @VG 2/28 | Expects session information as a user response passed here to create a profile
 */
exports.updateEventDetails = function updateEventDetails(qnaObj, eventQnA, answer, session, callback){
  	//console.log(' DBUtils.updateSubProfileDetails >>>>>>'+qnaObj.answer);
  	setEventDetails(qnaObj, eventQnA, answer, session, callback);
};

//MM 6-27-17 Added public export for getInProgressInStaging
exports.getInProgressInStaging = function getInProgressInStaging(profileId, session, callback){
  	//console.log(' DBUtils.updateSubProfileDetails >>>>>>'+qnaObj.answer);
	checkForInProgressInStaging(profileId, session, callback);
};

/**
 * @public
 * @VG 3/13 | Manages Profile based script context in STAGING Table
 */
exports.setScriptContext = function setScriptContext(profileID, scriptID, scriptStep) {
  	//console.log(' DBUtils.setScriptContext >>>>>>');
  	setScriptContext(profileID, scriptID, scriptStep);
 };

exports.addDietRecord = function addDietRecord(intent, session, callback) {
  	//console.log(' DBUtils.setScriptContext >>>>>>');
  	processAddDiet(intent, session, callback);
};

exports.instantTaskExercise = function instantTaskExercise(intent, session, callback) {
	//console.log(' DBUtils.setScriptContext >>>>>>');
	processTaskExercise(intent, session, callback);
};

exports.instantMood = function instantMood(intent, session, callback) {
	//console.log(' DBUtils.setScriptContext >>>>>>');
	processMood(intent, session, callback);
};

exports.instantBloodGlucose = function instantBloodGlucose(intent, session, callback) {
	//console.log(' DBUtils.setScriptContext >>>>>>');
	processBloodGlucose(intent, session, callback);
};

exports.instantSleepSummary = function instantSleepSummary(intent, session, callback) {
	//console.log(' DBUtils.setScriptContext >>>>>>');
	processSleepSummary(intent, session, callback);
};

exports.instantSleepSummaryDirect = function instantSleepSummaryDirect(varProfileId, strFor, exitAfter, intent, session, callback) {
	//console.log(' DBUtils.setScriptContext >>>>>>');
	saveSleepSummary(varProfileId, strFor, exitAfter, intent, session, callback);
};

exports.instantSleepConfirm = function instantSleepConfirm(intent, session, callback) {
	//console.log(' DBUtils.setScriptContext >>>>>>');
	processSleepConfirm(intent, session, callback);
};

exports.instantSleepSleep = function instantSleepSleep(intent, session, callback) {
	//console.log(' DBUtils.setScriptContext >>>>>>');
	processSleepSleep(intent, session, callback);
};

exports.instantSleepWake = function instantSleepWake(intent, session, callback) {
	//console.log(' DBUtils.setScriptContext >>>>>>');
	processSleepWake(intent, session, callback);
};

exports.skipAnswer = function skipAnswer(intent, session, callback) {
	//console.log(' DBUtils.setScriptContext >>>>>>');
	processSkipAnswer(intent, session, callback);
};

exports.addWeightRecord = function addWeightRecord(intent, session, callback) {
  	//console.log(' DBUtils.setScriptContext >>>>>>');
  	processAddWeight(intent, session, callback);
};

exports.updateFoodPreferences = function updateFoodPreferences(intent, session, callback) {
  	//console.log(' DBUtils.setScriptContext >>>>>>');
  	processUpdateFoodPreferences(intent, session, callback);
};

exports.updateDietaryPreferences = function updateDietaryPreferences(intent, session, callback) {
  	//console.log(' DBUtils.setScriptContext >>>>>>');
  	processUpdateDietaryPreferences(intent, session, callback);
};

exports.findExistingFoodPreferences = function findExistingFoodPreferences(intent, session, callback) {
  	//console.log(' DBUtils.setScriptContext >>>>>>');
	checkExistingFoodPreferences (intent, session, callback);
};

exports.findExistingFoodPreferencesMeal = function findExistingFoodPreferencesMeal(intent, session, callback) {
  	//console.log(' DBUtils.setScriptContext >>>>>>');
	checkExistingFoodPreferencesMeal (intent, session, callback);
};

exports.getNextMeals = function getNextMeals(session, callback) {
  	//console.log(' DBUtils.setScriptContext >>>>>>');
	retrieveMealNext (session, callback);
};

exports.foodPreferenceRedo = function foodPreferenceRedo(intent, session, callback) {
  	//console.log(' DBUtils.setScriptContext >>>>>>');
	prepareForFoodPreferenceRedo (intent, session, callback);
};

exports.findExistingDietPreferences = function findExistingDietPreferences(intent, session, callback) {
  	//console.log(' DBUtils.setScriptContext >>>>>>');
	checkExistingDietPreferences (intent, session, callback);
};

exports.dietPreferenceRedo = function dietPreferenceRedo(intent, session, callback) {
  	//console.log(' DBUtils.setScriptContext >>>>>>');
	inactivateCurrentDietPreference (intent, session, callback);
};


 exports.setTranscriptParentDetails = function setTranscriptParentDetails(newRec, qnaObj, session, callback) {
  	//console.log(' DBUtils.setTranscriptParentDetails >>>>>>');
  	setTranscriptDetailsParent(newRec, qnaObj, session, callback);
 };

 //SECTION - MAIN Q&A ENGINE RETRIEVE INTERVIEW
 //FOR ENGINE SECTIONS, THERE ARE GENERALLY PARALLEL FUNCTIONS FOR MAIN INTERVIEWS AND EVENT DRIVEN INTERVIEWS

 //VG 2/26|Purpose: To pull script based questions for Alexa Madam
//MM 6-10-17 Adding the capture of two addtional persistence variables: scriptname which will be used to enter into the staging script table and max step id which will be used to identfiy
//when a script has been completed

//MM 11-21-17 Adding addtional functionality for enabling the capture of food category preferences.  Because this table is many-to-many, the app needs the primary key from the category table to
//assign the value properly.  Therefore, we will capture the step description from the script table which label aligns to the category.  In a subsequent function, this will be used to pull
//the proper category id

//MM 12-22-17 Added isPickList variable to QnAObj to signify picklist functionality
function getScriptDetails(questionId, scriptName, slotValue, session, callback, retUser) {
	var connection = getLogosConnection();
    var vSQL;

	//MM 6-10-17 setting session attribute scriptname
	session.attributes.scriptName = scriptName;

	if (questionId == 0){
        vSQL="SELECT q.*,s.* FROM logoshealth.script s, logoshealth.question q where s.questionid=q.questionid and scriptname='"+scriptName+"' order by uniquestepid asc limit 1";
    }
    else {
        vSQL="SELECT q.*,s.* FROM logoshealth.script s, logoshealth.question q where s.questionid=q.questionid and scriptname='"+scriptName+"' and uniquestepid="+questionId;
    }
    console.log("DBUtil.getScriptDetails Query is  >>>>> " +vSQL);

	connection.query(vSQL, function (error, results, fields) {
    	var qnaObj = {};
    	var eventQNArr = {};
		if (error) {
            console.log('DBUtils.getScriptDetails Error. the Error is: ', error);
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getScriptDetails.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
    	} else {
			//console.log('DBUtils.getScriptDetails results gound. results length is : '+results.length);
			if (results !== null && results.length > 0) {
				qnaObj = {
					"questionId": results[0].questionid,
					"question": results[0].question,
					"answer": "",
					"dictanswer": "",
					"processed": false,
					"uniqueStepId":results[0].uniquestepid,
					"scriptname":scriptName,
					"answerKey":results[0].answerkeyfield,
					"answerField":results[0].answerfield,
					"answerTable":results[0].answertable,
					"answerType":results[0].answertype,
					"answerFieldValue":0,
					"insertNewRow":results[0].insertnewrow,
					"isRequired":results[0].isrequired,
					"isDictionary":results[0].isdictionary,
					"formatId":results[0].formatid,
					"eventSpecific":results[0].iseventspecific,
					"isPickList"	:results[0].ispicklist,
					"isOnlyOnce" :results[0].onlyonce,
        			"goalPossible":results[0].goalPossible,
					"OOCondition" :results[0].OOCondition,
					"termEnhance" :results[0].termenhance,
					"OOScript" :results[0].OOScript,
					"eventQNArr":eventQNArr,
					"stepDescription":results[0].stepdescription,
					"errResponse":results[0].errorresponse
				};
				console.log('DBUtils.getScriptDetails The QnA Objects is : ', qnaObj);
				closeConnection(connection); //all is done so releasing the resources
				//console.log("DBUtil.getScriptDetails : Message send for return user? >>> "+retUser);
				session.attributes.retUser = retUser;

				//MM 11-21-2017 Added conditional to go to foodcategoryId when setting food category preferences
				if (qnaObj.answerTable == 'foodcategorypreference') {
					getFoodCategoryId (questionId, scriptName, slotValue, session, callback, retUser, qnaObj, false);
				} else {
					//MM 06-27-18 Adding goal check - the goal possible flag is only set on the last step of an interview for one which may have a goal set for it
					if (qnaObj.goalPossible == 'Y') {
						checkGoal (session, qnaObj, callback);
					} else {
						getMinScriptId (questionId, scriptName, slotValue, session, callback, retUser, qnaObj);
					}

				}
			} else {
				closeConnection(connection); //all is done so releasing the resources
				//console.log("DBUtil.getScriptDetails : Message send for return user? >>> "+retUser);
				if (retUser && scriptName.indexOf("Profile") != -1) {
    				var errResponse = "Your profile has been started by another and needs to be completed before you can continue.  Please have that person complete your profile.  Restarting LogosHealth.  Please say your first name.";
					helper.callRestart(session.attributes.accountid, errResponse, session, callback);
				} else {
    				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in GetScriptDetails.  Restarting LogosHealth.  Please say your first name.";
					helper.callRestart(session.attributes.accountid, errResponse, session, callback);
				}
			}
		}
	});
}

//MM 6-27-18 Checks to see if there is an active goal for which current interview could apply.  When active goals, capture meta-data in object and goto compareToActiveGoal
function checkGoal(session, qnaObj, callback) {
	var connection = getLogosConnection();
	var vSQL;
	var profileId = 0;
	var sessionAttributes = session.attributes;
	var goalType;
	var goalObj = {};
	var goals = [];

	//threadCount4 = threadCount4 + 1;
	//console.log('ThreadCount4: ' + threadCount4);


	if(sessionAttributes.onBehalfOf){
		profileId = sessionAttributes.subjectProfileId;
	} else {
		profileId = sessionAttributes.profileid;
	}

	goalType = qnaObj.answerTable;

	vSQL="SELECT goalid, version, goalname, goalnumber, goalunitvalue, daysperweekvalue, reward, rewardtimingvalue FROM logoshealth.goal where activeflag = 'Y' and goaltype = '" +
	  goalType + "' and profileid = " + profileId;

	console.log('checkGoal SQL:' + vSQL);
	connection.query(vSQL, function (error, results, fields) {
		if (error) {
            console.log('DBUtils.checkGoal connection Error. the Error is: ', error);
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in checkGoal.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
    	} else {
			//console.log('DBUtils.checkGoal connection results gound. results length is : '+results.length);
			if (results !== null && results.length > 0) {
				for (var i = 0; i < results.length; i++) {
					goalObj = {
						"goalid": results[i].goalid,
						"version": results[i].version,
						"goalname": results[i].goalname,
						"goalnumber": results[i].goalnumber,
						"goalunitvalue": results[i].goalunitvalue,
						"daysperweekvalue": results[i].daysperweekvalue,
						"reward": results[i].reward,
						"rewardtimingvalue": results[i].rewardtimingvalue
					};
					goals.push(goalObj);
				}
				console.log('Goals obj', goals);
				closeConnection(connection);
				compareToActiveGoal(session, qnaObj, goals, callback);
			} else {
				closeConnection(connection);
				//No active goals for interview - just continue
				helper.processQnAResponse(qnaObj, session, callback, false);
			}
		}
	});
}

//MM 6-27-18 Checks to see if there is an active goal for which current interview could apply.  When active goals, capture meta-data in object and goto compareToActiveGoal
function compareToActiveGoal(session, qnaObj, goals, callback) {
	var connection = getLogosConnection();
	var vSQL;
	var sqlFields;
	var profileId = 0;
	var sessionAttributes = session.attributes;
	var objType;
	var resultsObj = {};
	var goalMatch = false;
	var hasGoalName = false;
	var emptyFakeGoal = false;
	var hasProgressData = false;
	var unitValue;
	var units;
	var goalIndex;
	var unHappyPath;

	if(sessionAttributes.onBehalfOf){
		profileId = sessionAttributes.subjectProfileId;
	} else {
		profileId = sessionAttributes.profileid;
	}

	objType = qnaObj.answerTable;
	if (objType == 'exercise') {
		sqlFields = "exercisetype, exercisetime, caloriesburned, distance, reps, goalid, goalname";
	} else if (objType == 'task') {
		sqlFields = "taskname,tasktime,reps,goalid,goalname";
	}

	vSQL="SELECT " + sqlFields + " FROM logoshealth." + objType + " where " + objType + "id = " + sessionAttributes.tableId;

	console.log('DBUtils.compareToActiveGoal SQL: ' + vSQL);
	connection.query(vSQL, function (error, results, fields) {
		if (error) {
            console.log('DBUtils.compareToActiveGoal connection Error. the Error is: ', error);
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in compareToActiveGoal.  Restarting LogosHealth.  Main menu.  For a list of options, simply say, menu";
			helper.gotoMainMenu(errResponse, session, callback);
    	} else {
			if (results !== null && results.length > 0) {
				if (objType == 'exercise') {
					resultsObj = {
						"exercisetype": results[0].exercisetype,
						"exercisetime": results[0].exercisetime,
						"caloriesburned": results[0].caloriesburned,
						"distance": results[0].distance,
						"reps": results[0].reps,
						"goalid": results[0].goalid,
						"goalname": results[0].goalname
					};
					closeConnection(connection);

					for (var i = 0; i < goals.length; i++) {
						if (resultsObj.goalid !==null && resultsObj.goalid > 0) {
							if (resultsObj.goalid == goals[i].goalid) {
								goalMatch = true;
								console.log('Goal Match loop1: goalMatch: ' + goalMatch);
								goalIndex = i;
							}
						} else if (resultsObj.goalname !==null && (resultsObj.goalname =="N" || resultsObj.goalname.toLowerCase() =="none")) {
							emptyFakeGoal = true;
						}else if (resultsObj.goalname !==null && resultsObj.goalname !=="" && !goalMatch) {
							hasGoalName = true;
							if (resultsObj.goalname.substring(0, 3).toLowerCase() == goals[i].goalname.substring(0, 3).toLowerCase()) {
								goalMatch = true;
								console.log('Goal Match loop2: goalMatch: ' + goalMatch);
								goalIndex = i;
							}
						}
					}
					console.log('Goal Match after for loop in exercise: goalMatch: ' + goalMatch);
					if (!goalMatch && hasGoalName) {
						qnaObj.question = 'You have completed the exercise entry.  Please note the goal stated does not match any active goal.  Main menu.  What would you like to do? For a list of options, simply say Menu.'
						console.log('No Goal Name');
						sessionAttributes.currentProcessor = 5; //main menu
						sessionAttributes.scriptComplete = true;
						helper.processQnAResponse(qnaObj, session, callback, false);
					} else if (emptyFakeGoal) {
						var connection2 = getLogosConnection();
						var sql2 = "Update logoshealth.exercise set goalname = null where exerciseid = " + sessionAttributes.tableId;
						console.log('DBUtils.compareToActiveGoal - clear fake goal - SQL: ' + sql2);
						connection2.query(sql2, function (error, results, fields) {
							if (error) {
								console.log('Error in DBUtils.compareToActiveGoal - clear fake goal: ' + error);
								closeConnection(connection2);
								qnaObj.question = 'You have completed the exercise entry.  Main menu.  What would you like to do? For a list of options, simply say Menu.'
								sessionAttributes.currentProcessor = 5; //main menu
								sessionAttributes.scriptComplete = true;
								helper.processQnAResponse(qnaObj, session, callback, false);
							} else {
								closeConnection(connection2);
								qnaObj.question = 'You have completed the exercise entry.  Main menu.  What would you like to do? For a list of options, simply say Menu.'
								console.log('Clear fake goal successful!!!');
								sessionAttributes.currentProcessor = 5; //main menu
								sessionAttributes.scriptComplete = true;
								helper.processQnAResponse(qnaObj, session, callback, false);
							}
						});
					} else if (!goalMatch) {
						qnaObj.question = 'You have completed the exercise entry.  Main menu.  What would you like to do? For a list of options, simply say Menu.'
						console.log('No Goal Match');
						sessionAttributes.currentProcessor = 5; //main menu
						sessionAttributes.scriptComplete = true;
						helper.processQnAResponse(qnaObj, session, callback, false);
					} else {
						console.log('Begin Switch');
						switch (goals[goalIndex].goalunitvalue)
						{
							case 'Minutes':
						   		var timeSplit = resultsObj.exercisetime.split(" ");
						   		unitValue = Number(timeSplit[0].trim());
								if (timeSplit[1] !== undefined) {
									units = timeSplit[1].trim();
								} else {
									units = "";
								}
								console.log('compareToActiveGoal Minutes - unitValue: ' + unitValue + ', units: ' + units);
								if (unitValue !==NaN && unitValue > 0) {
									hasProgressData = true;
									if (units.substring(0, 4).toLowerCase() == 'hour') {
										unitValue = unitValue * 60;
									}
								} else {
									unHappyPath =  "You have completed the exercise entry.  You can review and confirm this entry in the LogosHealth visual app. " +
									"Please note no time from this entry could be applied to your daily progress for goal, " +
									goals[goalIndex].goalname + ".  Main menu.  What would you like to do? For a list of options, simply say Menu.";
								}
						   	break;

						   	case 'Calories':
						   		var calBurned = resultsObj.caloriesburned.split(" ");
						   		unitValue = Number(calBurned[0].trim());
								if (calBurned[1] !== undefined) {
									units = calBurned[1].trim();
								} else {
									units = "";
								}
								console.log('compareToActiveGoal Calories - unitValue: ' + unitValue + ', units: ' + units);
								if (unitValue !==NaN && unitValue > 0) {
									hasProgressData = true;
								} else {
									unHappyPath =  "You have completed the exercise entry.  You can review and confirm this entry in the LogosHealth visual app. " +
									"Please note no calories from this entry could be applied to your daily progress for goal, " +
									goals[goalIndex].goalname + ".  Main menu.  What would you like to do? For a list of options, simply say Menu.";
								}
					   		break;

						   	case 'Number':
							   unitValue = Number(resultsObj.reps);
							   console.log('compareToActiveGoal - reps: ' + unitValue);
							   if (unitValue !==NaN && unitValue > 0) {
								hasProgressData = true;
							} else {
								unHappyPath =  "You have completed the exercise entry.  You can review and confirm this entry in the LogosHealth visual app. " +
								"Please note no count from this entry could be applied to your daily progress for goal, " +
								goals[goalIndex].goalname + ".  Main menu.  What would you like to do? For a list of options, simply say Menu.";
							}
						   	break;

						   	case 'Miles':
							   	var distance = resultsObj.distance.split(" ");
							   	unitValue = Number(distance[0].trim());
								if (distance[1] !== undefined) {
									units = distance[1].trim();
								} else {
									units = "";
								}
								console.log('compareToActiveGoal Miles - unitValue: ' + unitValue + ', units: ' + units);
								if (unitValue !==NaN && unitValue > 0 && units.substring(0, 4).toLowerCase() == 'mile') {
									hasProgressData = true;
								} else {
									unHappyPath =  "You have completed the exercise entry.  You can review and confirm this entry in the LogosHealth visual app. " +
									"Please note no distance in miles from this entry could be applied to your daily progress for goal, " +
									goals[goalIndex].goalname + ".  Main menu.  What would you like to do? For a list of options, simply say Menu.";
								}
						   	break;

						   	case 'Kilometers':
							   var distance = resultsObj.distance.split(" ");
							   unitValue = Number(distance[0].trim());
							   if (distance[1] !== undefined) {
									units = distance[1].trim();
								} else {
									units = "";
								}
								console.log('compareToActiveGoal Kilometers - unitValue: ' + unitValue + ', units: ' + units);
								if (unitValue !==NaN && unitValue > 0 && units.substring(0, 4).toLowerCase() == 'kilo') {
									hasProgressData = true;
								} else {
									unHappyPath =  "You have completed the exercise entry.  You can review and confirm this entry in the LogosHealth visual app. " +
									"Please note no distance in kilometers from this entry could be applied to your daily progress for goal, " +
									goals[goalIndex].goalname + ".  Main menu.  What would you like to do? For a list of options, simply say Menu.";
								}
						   break;

						   	case 'Steps':
							   	var distance = resultsObj.distance.split(" ");
							   	unitValue = Number(distance[0].trim());
								if (distance[1] !== undefined) {
									units = distance[1].trim();
								} else {
									units = "";
								}
								console.log('compareToActiveGoal Steps - unitValue: ' + unitValue + ', units: ' + units);
								if (unitValue !==NaN && unitValue > 0 && units.substring(0, 4).toLowerCase() == 'step') {
									hasProgressData = true;
								} else {
									unHappyPath =  "You have completed the exercise entry.  You can review and confirm this entry in the LogosHealth visual app. " +
									"Please note no distance in steps from this entry could be applied to your daily progress for goal, " +
									goals[goalIndex].goalname + ".  Main menu.  What would you like to do? For a list of options, simply say Menu.";
								}
						   	break;

						   	case 'Laps':
								var distance = resultsObj.distance.split(" ");
								unitValue = Number(distance[0].trim());
								if (distance[1] !== undefined) {
									units = distance[1].trim();
								} else {
									units = "";
								}
								console.log('compareToActiveGoal Laps - unitValue: ' + unitValue + ', units: ' + units);
								if (unitValue !==NaN && unitValue > 0 && units.substring(0, 4).toLowerCase() == 'laps') {
									hasProgressData = true;
								} else {
									unHappyPath =  "You have completed the exercise entry.  You can review and confirm this entry in the LogosHealth visual app. " +
									"Please note no distance in laps from this entry could be applied to your daily progress for goal, " +
									goals[goalIndex].goalname + ".  Main menu.  What would you like to do? For a list of options, simply say Menu.";
								}
						   	break;

							default:
						    	console.log("compareToActiveGoal - No term in switch found for " + goals[goalIndex].goalunitvalue + " default called");
						   		hasProgressData = false;
						}

						if (hasProgressData) {
							//threadCount2 = threadCount2 + 1;
							//console.log('ThreadCount2: ' + threadCount2);
							GetGoalTrackingWeek(session, goals[goalIndex], function(err, response) {
								if (err) {
									console.log('Error from GetGoalTrackingWeek: ' + err);
									helper.processQnAResponse(qnaObj, session, callback, false);
								} else {
									var gtResponse = response;
									console.log('Track SetGoalTrackingDay line 589');
									//threadCount3 = threadCount3 + 1;
									//console.log('ThreadCount3: ' + threadCount3);
									SetGoalTrackingDay(session, gtResponse, goals[goalIndex], unitValue, function(err, response) {
										if (err) {
											console.log('SetGoalTrackingDay: ' + err);
											sessionAttributes.currentProcessor = 5;
											sessionAttributes.scriptComplete = true;
											helper.processQnAResponse(qnaObj, session, callback, false);
										} else {
											var gtdResponse = response;
											if (!sessionAttributes.onBehalfOf) {
												GetGoalEntryResponse(session, gtdResponse, goals[goalIndex], function(err, response) {
													if (err) {
														console.log('GetGoalEntryResponse error: ' + err);
														sessionAttributes.currentProcessor = 5;
														sessionAttributes.scriptComplete = true;
														helper.processQnAResponse(qnaObj, session, callback, false);
													} else {
														console.log('GetGoalEntryResponse: ' + response);
														qnaObj.question = response + "  Main Menu.  For a list of options, simply say, menu";
														sessionAttributes.currentProcessor = 5;
														sessionAttributes.scriptComplete = true;
														helper.processQnAResponse(qnaObj, session, callback, false);
													}
												});
											} else {
												console.log('Saved goal but exited onBehalfOf - ', gtdResponse);
												sessionAttributes.currentProcessor = 5;
												sessionAttributes.scriptComplete = true;
												helper.processQnAResponse(qnaObj, session, callback, false);
											}
										}
									});
								}
							});
						} else {
							qnaObj.question = unHappyPath;
							sessionAttributes.currentProcessor = 5;
							sessionAttributes.scriptComplete = true;
							helper.processQnAResponse(qnaObj, session, callback, false);
						}
					}
				} else if (objType == 'task') {
					//*********** ADD TYPE PROCESSING CODE HERE*/
					resultsObj = {
						"taskname": results[0].taskname,
						"tasktime": results[0].tasktime,
						"reps": results[0].reps,
						"goalid": results[0].goalid,
						"goalname": results[0].goalname
					};
					closeConnection(connection);
					for (var i = 0; i < goals.length; i++) {
						if (resultsObj.goalid !==null && resultsObj.goalid > 0) {
							if (resultsObj.goalid == goals[i].goalid) {
								goalMatch = true;
								console.log('Goal Match loop1: goalMatch: ' + goalMatch);
								goalIndex = i;
							}
						} else if (resultsObj.goalname !==null && resultsObj.goalname !=="" && !goalMatch) {
							hasGoalName = true;
							if (resultsObj.goalname.substring(0, 3).toLowerCase() == goals[i].goalname.substring(0, 3).toLowerCase()) {
								goalMatch = true;
								console.log('Goal Match loop2: goalMatch: ' + goalMatch);
								goalIndex = i;
							}
						}
					}
					console.log('Goal Match after for loop in exercise: goalMatch: ' + goalMatch);
					if (!goalMatch && hasGoalName) {
						qnaObj.question = 'You have completed the exercise entry.  You can review and confirm this entry in the LogosHealth visual app.  Please note the goal stated does not match any active goal.  Main menu.  What would you like to do? For a list of options, simply say Menu.'
						console.log('No Goal Name');
						sessionAttributes.currentProcessor = 5;
						sessionAttributes.scriptComplete = true;
						helper.processQnAResponse(qnaObj, session, callback, false);
					} else if (!goalMatch) {
						console.log('No Goal Match');
						sessionAttributes.currentProcessor = 5;
						sessionAttributes.scriptComplete = true;
						helper.processQnAResponse(qnaObj, session, callback, false);
					} else {
						console.log('Begin Switch');
						switch (goals[goalIndex].goalunitvalue)
						{
							case 'Minutes':
						   		var timeSplit = resultsObj.tasktime.split(" ");
						   		unitValue = Number(timeSplit[0].trim());
								if (timeSplit[1] !== undefined) {
									units = timeSplit[1].trim();
								} else {
									units = "";
								}
								console.log('compareToActiveGoal task Minutes - unitValue: ' + unitValue + ', units: ' + units);
								if (unitValue !==NaN && unitValue > 0) {
									hasProgressData = true;
									if (units.substring(0, 4).toLowerCase() == 'hour') {
										unitValue = unitValue * 60;
									}
								} else {
									unHappyPath =  "You have completed the task entry.  You can review and confirm this entry in the LogosHealth visual app. " +
									"Please note no time from this entry could be applied to your daily progress for goal, " +
									goals[goalIndex].goalname + ".  Main menu.  What would you like to do? For a list of options, simply say Menu.";
								}
						   	break;

							case 'Number':
								unitValue = Number(resultsObj.reps);
								console.log('compareToActiveGoal task - reps: ' + unitValue);
								if (unitValue !==NaN && unitValue > 0) {
							 		hasProgressData = true;
						 		} else {
							 		unHappyPath =  "You have completed the task entry.  You can review and confirm this entry in the LogosHealth visual app. " +
							 		"Please note no count from this entry could be applied to your daily progress for goal, " +
							 		goals[goalIndex].goalname + ".  Main menu.  What would you like to do? For a list of options, simply say Menu.";
						 		}
							break;

							default:
						    	console.log("compareToActiveGoal - No term in switch found with task for " + goals[goalIndex].goalunitvalue + " default called");
						   		hasProgressData = false;

						}
						if (hasProgressData) {
							GetGoalTrackingWeek(session, goals[goalIndex], function(err, response) {
								if (err) {
									console.log('Error from GetGoalTrackingWeek: ' + err);
									sessionAttributes.currentProcessor = 5;
									sessionAttributes.scriptComplete = true;
									helper.processQnAResponse(qnaObj, session, callback, false);
								} else {
									var gtResponse = response;
									console.log('Track SetGoalTrackingDay line 703');
									SetGoalTrackingDay(session, gtResponse, goals[goalIndex], unitValue, function(err, response) {
										if (err) {
											console.log('SetGoalTrackingDay: ' + err);
											sessionAttributes.currentProcessor = 5;
											sessionAttributes.scriptComplete = true;
											helper.processQnAResponse(qnaObj, session, callback, false);
										} else {
											var gtdResponse = response;
											if (!sessionAttributes.onBehalfOf) {
												GetGoalEntryResponse(session, gtdResponse, goals[goalIndex], function(err, response) {
													if (err) {
														console.log('GetGoalEntryResponse error: ' + err);
														sessionAttributes.currentProcessor = 5;
														sessionAttributes.scriptComplete = true;
														helper.processQnAResponse(qnaObj, session, callback, false);
													} else {
														console.log('GetGoalEntryResponse: ' + response);
														qnaObj.question = response + "  Main Menu.  For a list of options, simply say, menu";
														sessionAttributes.currentProcessor = 5;
														sessionAttributes.scriptComplete = true;
														helper.processQnAResponse(qnaObj, session, callback, false);
													}
												});
											} else {
												console.log('Saved goal but exited onBehalfOf - ', gtdResponse);
												sessionAttributes.currentProcessor = 5;
												sessionAttributes.scriptComplete = true;
												helper.processQnAResponse(qnaObj, session, callback, false);
											}
										}
									});
								}
							});
						} else {
							qnaObj.question = unHappyPath;
							sessionAttributes.currentProcessor = 5;
							sessionAttributes.scriptComplete = true;
							helper.processQnAResponse(qnaObj, session, callback, false);
						}
					}
				}
			} else {
				closeConnection(connection);
				//No active goals for interview - just continue
				sessionAttributes.currentProcessor = 5;
				sessionAttributes.scriptComplete = true;
				helper.processQnAResponse(qnaObj, session, callback, false);
			}
		}
	});
}

//MM 6-27-18 Gets GoalTracking Week and returns the goal_trackingid
function GetGoalTrackingWeek(session, goal, callback) {
	var connection = getLogosConnection();
	var vSQL;
	var sessionAttributes = session.attributes;
	var dtNow =new Date();
	var momentNow = moment(dtNow);
	var todayStr;
	var goaltrackingid;
	var dayoftheweek;
	var offSet;
	var endofWeek;

	if (sessionAttributes.userTimezone !== undefined && sessionAttributes.userTimezone !== null && sessionAttributes.userTimezone !== "") {
		console.log("Moment Now: " + momentNow);
		console.log("Moment Now User Timezone: " + sessionAttributes.userTimezone);
		console.log("Moment Now TimeZone: " + momentNow.tz(sessionAttributes.userTimezone));
		todayStr = momentNow.tz(sessionAttributes.userTimezone).format('YYYY-MM-DD');
		dayoftheweek = momentNow.tz(sessionAttributes.userTimezone).format('dddd');
		endofWeek = moment(momentNow.tz(sessionAttributes.userTimezone)).add(offSet, 'days');
	} else {
		console.log("Moment Now No Timezone: " + momentNow);
		todayStr = momentNow.format('YYYY-MM-DD');
		dayoftheweek = momentNow.format('dddd');
		endofWeek = moment(momentNow).add(offSet, 'days');
	}

	if (dayoftheweek == 'Sunday') {
		offSet = 6
	} else if (dayoftheweek == 'Monday') {
		offSet = 5
	} else if (dayoftheweek == 'Tuesday') {
		offSet = 4
	} else if (dayoftheweek == 'Wednesday') {
		offSet = 3
	} else if (dayoftheweek == 'Thursday') {
		offSet = 2
	} else if (dayoftheweek == 'Friday') {
		offSet = 1
	} else if (dayoftheweek == 'Saturday') {
		offSet = 0
	}

	if (sessionAttributes.userTimezone !== undefined && sessionAttributes.userTimezone !== null && sessionAttributes.userTimezone !== "") {
		endofWeek = moment(momentNow.tz(sessionAttributes.userTimezone)).add(offSet, 'days');
	} else {
		endofWeek = moment(momentNow).add(offSet, 'days');
	}

	vSQL="SELECT goal_trackingid, days_met FROM logoshealth.goal_tracking where goalid = " + goal.goalid + " and '" + todayStr + "'  >= week_start and '" +
	todayStr + "' <= week_end";

	console.log('GetGoalTrackingWeek SQL: ' + vSQL);
	connection.query(vSQL, function (error, results, fields) {
		if (error) {
            //console.log('DBUtils.GetGoalTrackingWeek connection Error. the Error is: ', error);
			closeConnection(connection);
			callback(error, null);
    	} else {
			//console.log('DBUtils.checkGoal connection results gound. results length is : '+results.length);
			if (results !== null && results.length > 0) {
				var gtResults = {
					"goaltrackingid": results[0].goal_trackingid,
					"days_met":	results[0].days_met
				};
				closeConnection(connection);
				console.log('GetGoalTrackingWeek Results - ', gtResults);
				if (gtResults.goaltrackingid !==null && gtResults.goaltrackingid > 0) {
					callback(null, gtResults);
				} else {
					callback('ALERT! Goal tracking record not found for ' + todayStr, null);
				}
			} else {
				var weekInsertSQL = "insert into logoshealth.goal_tracking (goalid, goalversion, week_start, week_end, createdby, modifiedby) values (" +
				goal.goalid + ", " + goal.version + ", '" + todayStr + "', '" + endofWeek.format('YYYY-MM-DD') + "', 2, 2)";

				console.log('GetGoalTrackingWeek Insert SQL - ', weekInsertSQL);
				connection.query(weekInsertSQL, function (error, results, fields) {
					if (error) {
						console.log('DBUtils.GetGoalTrackingWeek connection Error. the Error is: ', error);
						closeConnection(connection);
						callback('ALERT! Goal tracking record not found for ' + todayStr + ' Insert failed.', null);
					} else {
						closeConnection(connection);
						var gtResults = {
							"goaltrackingid": results.insertId,
							"days_met":	0
						};

						if (gtResults.goaltrackingid !==null && gtResults.goaltrackingid > 0) {
							callback(null, gtResults);
						} else {
							callback('ALERT! Goal tracking record not found for ' + todayStr +  ' Insert failed2.', null);
						}
					}
				});
			}
		}
	});
}

//MM 6-28-18 Gets GoalTracking Week and returns the goal_trackingid
function SetGoalTrackingDay(session, goalTrackingObj, goal, unit, callback) {
	var connection = getLogosConnection();
	var vSQL;
	var sessionAttributes = session.attributes;
	var dtNow =new Date();
	var momentNow = moment(dtNow);
	var todayStr;
	var goaltrackingid;
	var GTDInsertSQL;
	var strDailyMet;
	var strDailyExceed = 'N';
	var increaseDailyMet = false;
	var gtdid;
	var gtdTotal;
	var gtdDailyMetBefore;
	var weeklyMetBefore = 'N';
	var weeklyMet = 'N';
	var weeklyExceed = 'N';
	var newTotal;
	var GTDUpdateSQL;
	var weeklyCount;

	console.log('Start SetGoalTrackingDay');

	if (sessionAttributes.userTimezone !== undefined && sessionAttributes.userTimezone !== null && sessionAttributes.userTimezone !== "") {
		todayStr = momentNow.tz(sessionAttributes.userTimezone).format('dddd');
	} else {
		todayStr = momentNow.format('dddd');
	}
	if (Number(goalTrackingObj.days_met) == Number(goal.daysperweekvalue)) {
		weeklyMetBefore = 'Y';
		weeklyMet = 'Y';
	} else if (Number(goalTrackingObj.days_met) > Number(goal.daysperweekvalue)) {
		weeklyMetBefore = 'Y';
		weeklyMet = 'Y';
		weeklyExceed = 'Y';
	}

	vSQL="SELECT goal_tracking_dayid, total, daily_goal_met FROM logoshealth.goal_tracking_day where goal_trackingid = " +
	goalTrackingObj.goaltrackingid + " and day = '" + todayStr + "'";

	console.log('SetGoalTrackingDay SQL: ' + vSQL);
	connection.query(vSQL, function (error, results, fields) {
		if (error) {
            //console.log('DBUtils.GetGoalTrackingWeek connection Error. the Error is: ', error);
			closeConnection(connection);
			callback(error, null);
    	} else {
			//console.log('DBUtils.checkGoal connection results gound. results length is : '+results.length);
			if (results !== null && results.length > 0) {
				gtdid = results[0].goal_tracking_dayid;
				gtdTotal = results[0].total;
				gtdDailyMetBefore = results[0].daily_goal_met;
				newTotal = Number(gtdTotal) + Number(unit);
				GTDUpdateSQL = "update logoshealth.goal_tracking_day set total = " + newTotal;
				if (Number(newTotal) >= Number(goal.goalnumber)) {
					strDailyMet = 'Y';
				} else {
					strDailyMet = 'N';
				}
				if (Number(newTotal)/Number(goal.goalnumber) >= 1.25) {
					strDailyExceed = 'Y';
				}
				if (gtdDailyMetBefore == 'N' && strDailyMet == 'Y') {
					GTDUpdateSQL = GTDUpdateSQL + ", daily_goal_met = 'Y'";
				}
				GTDUpdateSQL = GTDUpdateSQL + ", modifiedby = " + sessionAttributes.profileid + " where goal_tracking_dayid = " + gtdid;

				console.log('SetGoalTrackingDay Update SQL: ' + GTDUpdateSQL);
				connection.query(GTDUpdateSQL, function (error, results, fields) {
					if (error) {
						//console.log('DBUtils.GetGoalTrackingWeek connection Error. the Error is: ', error);
						closeConnection(connection);
						callback(error, null);
					} else {
						if (gtdDailyMetBefore == 'N' && strDailyMet == 'Y') {
						//Add to weekly progress counter
							if (goalTrackingObj.days_met !==null && goalTrackingObj.days_met > 0) {
								weeklyCount = Number(goalTrackingObj.days_met) + 1;
							} else {
								weeklyCount = 1;
							}
							var GTWeeklySQL = "update logoshealth.goal_tracking set days_met = " + weeklyCount + ", modifiedby = " + sessionAttributes.profileid +
							 " where goal_trackingid = " + goalTrackingObj.goaltrackingid;
							console.log('SetGoalTrackingDay UpdateGTSQL from update: ' + GTWeeklySQL);
							connection.query(GTWeeklySQL, function (error, results, fields) {
								if (error) {
									//console.log('DBUtils.GetGoalTrackingWeek connection Error. the Error is: ', error);
									closeConnection(connection);
									callback(error, null);
								} else {
									closeConnection(connection);
									if (weeklyCount == goal.daysperweekvalue) {
										weeklyMet = 'Y';
									} else if (weeklyCount > goal.daysperweekvalue) {
										weeklyExceed = 'Y';
									}
									var DTResponse = {
										"dailyMet": strDailyMet,
										"dailyExceed": strDailyExceed,
										"dailyMetBefore": 'N',
										"weeklyMet": weeklyMet,
										"weeklyExceed": weeklyExceed,
										"weeklyMetBefore": weeklyMetBefore,
										"newTotal": newTotal,
										"weeklyCount": weeklyCount
									};
									callback(null, DTResponse);
								}
							});
						} else {
							closeConnection(connection);
							if (goalTrackingObj.days_met !==null && goalTrackingObj.days_met > 0) {
								var noProgressCount = goalTrackingObj.days_met;
							} else {
								var noProgressCount = 0;
							}
							var DTResponse = {
								"dailyMet": strDailyMet,
								"dailyExceed": strDailyExceed,
								"dailyMetBefore": gtdDailyMetBefore,
								"weeklyMet": weeklyMet,
								"weeklyExceed": weeklyExceed,
								"weeklyMetBefore": weeklyMetBefore,
								"newTotal": newTotal,
								"weeklyCount": noProgressCount
							};
							callback(null, DTResponse);
						}
					}
				});
			} else {
				if (Number(unit) >= Number(goal.goalnumber)) {
					strDailyMet = 'Y';
					increaseDailyMet = true;
				} else {
					strDailyMet = 'N';
				}
				GTDInsertSQL = "insert into logoshealth.goal_tracking_day (goal_trackingid, day, total, daily_goal_met, createdby, modifiedby) values (" +
				  goalTrackingObj.goaltrackingid + ", '" + todayStr + "', " + unit + ", '" + strDailyMet + "', " + sessionAttributes.profileid +
				", " + sessionAttributes.profileid + ")";
				console.log('SetGoalTrackingDay InsertSQL: ' + GTDInsertSQL);
				connection.query(GTDInsertSQL, function (error, results, fields) {
					if (error) {
						//console.log('DBUtils.GetGoalTrackingWeek connection Error. the Error is: ', error);
						closeConnection(connection);
						callback(error, null);
					} else {
						if (strDailyMet == 'Y') {
							if (goalTrackingObj.days_met !==null && goalTrackingObj.days_met > 0) {
								weeklyCount = Number(goalTrackingObj.days_met) + 1;
							} else {
								weeklyCount = 1;
							}
							var GTWeeklySQL = "update logoshealth.goal_tracking set days_met = " + weeklyCount + ", modifiedby = " + sessionAttributes.profileid +
							 " where goal_trackingid = " + goalTrackingObj.goaltrackingid;
							console.log('SetGoalTrackingDay GTWeeklySQL: ' + GTWeeklySQL);
							connection.query(GTWeeklySQL, function (error, results, fields) {
								if (error) {
									//console.log('DBUtils.GetGoalTrackingWeek connection Error. the Error is: ', error);
									closeConnection(connection);
									callback(error, null);
								} else {
									closeConnection(connection);
									if (weeklyCount == goal.daysperweekvalue) {
										weeklyMet = 'Y';
									} else if (weeklyCount > goal.daysperweekvalue) {
										weeklyExceed = 'Y';
									}
									var DTResponse = {
										"dailyMet": strDailyMet,
										"dailyExceed": strDailyExceed,
										"dailyMetBefore": 'N',
										"weeklyMet": weeklyMet,
										"weeklyExceed": weeklyExceed,
										"weeklyMetBefore": weeklyMetBefore,
										"newTotal": unit,
										"weeklyCount": weeklyCount
									};
									callback(null, DTResponse);
								}
							});
						} else {
							closeConnection(connection);
							var DTResponse = {
								"dailyMet": strDailyMet,
								"dailyExceed": strDailyExceed,
								"dailyMetBefore": 'N',
								"weeklyMet": weeklyMet,
								"weeklyExceed": weeklyExceed,
								"weeklyMetBefore": weeklyMetBefore,
								"newTotal": unit,
								"weeklyCount": weeklyCount
							};
							callback(null, DTResponse);
						}
					}
				});
			}
		}
	});
}

//MM 6-28-18 Gets GoalTracking Week and returns the goal_trackingid
function GetGoalEntryResponse(session, gtdResponse, goal, callback) {
	var connection = getLogosConnection();
	var vSQL;
	var sessionAttributes = session.attributes;
	var dtNow =new Date();
	var momentNow = moment(dtNow);
	var todayDay;
	var curMonth;
	var curDayMonth;
	var endMonthOffSet;
	var nextMonthCheck;
	var goaltrackingid;
	var response_parameters;
	var validoptions = [];
	var weeksMonth;
	var varOption;
	var dailyDiff = -1;
	var dailyProgress;
	var dailyProgressLeft;
	var weekDiff = -1;
	var weekProgress;

	console.log('Start GetGoalEntryResponse - gtdResponse: ', gtdResponse);
	console.log('Start GetGoalEntryResponse - goal: ', goal);

	if (gtdResponse.dailyMet == 'N') {
		console.log('Daily progress, but not met!');
		response_parameters = {
			"response_category": 'daily',
			"response_type": 'progress',
			"reward_type": 'NA'
		}
		validoptions.push(response_parameters);
		dailyDiff = goal.goalnumber - gtdResponse.newTotal;
		dailyProgress = Math.round((gtdResponse.newTotal/goal.goalnumber)*100);
		dailyProgressLeft = Math.round((dailyDiff/goal.goalnumber)*100);
		//console.log('dailyDiff: ' + dailyDiff + ', goal.goalnumber: ' + goal.goalnumber + ', gtdResponse.newTotal: ' + gtdResponse.newTotal);
		//console.log('dailyProgress: ' + dailyProgress + ', gtdResponse.newTotal: ' + gtdResponse.newTotal + ', goal.goalnumber: ' + goal.goalnumber);
		console.log('dailyProgressLeft: ' + dailyProgressLeft + ', dailyDiff: ' + dailyDiff + ', goal.goalnumber: ' + goal.goalnumber);
	} else {
		if (gtdResponse.weeklyExceed == 'Y') {
			console.log('Daily exceeded');
			response_parameters = {
				"response_category": 'weekly',
				"response_type": 'exceed',
				"reward_type": 'NA'
			}
			validoptions.push(response_parameters);
		} else if (gtdResponse.weeklyMet == 'Y') {
			if (goal.rewardtimingvalue !== null && goal.rewardtimingvalue !== "") {
				if (goal.rewardtimingvalue == 'Monthly') {
					endMonthOffSet = (7 - todayDay) + 7;
					if (sessionAttributes.userTimezone !== undefined && sessionAttributes.userTimezone !== null && sessionAttributes.userTimezone !== "") {
						todayDay = momentNow.tz(sessionAttributes.userTimezone).format('E');
						curMonth = momentNow.tz(sessionAttributes.userTimezone).format('MM');
						curDayMonth = momentNow.tz(sessionAttributes.userTimezone).format('DD');
						nextMonthCheck= momentNow.tz(sessionAttributes.userTimezone).add(endMonthOffSet, 'days').format('MM');
					} else {
						todayDay = momentNow.format('E');
						curMonth = momentNow.format('MM');
						curDayMonth = momentNow.format('DD');
						nextMonthCheck= momentNow.add(endMonthOffSet, 'days').format('MM');
					}
					console.log('GetGoalEntryResponse - nextMonthCheck: ' + nextMonthCheck + ", curMonth: " + curMonth);
					if (nextMonthCheck !== curMonth) {
						if (Number(curDayMonth) > 28 ) {
							weeksMonth = 5;
						} else {
							weeksMonth = 4;
						}
						GetWeeksGoalMetThisMonth(function(err, response) {
							if (err) {
								console.log('Error in GetWeeksGoalMetThisMonth:', err );
								console.log('Weekly met from Error in GetWeeksGoalMetThisMonth');
								response_parameters = {
									"response_category": 'weekly',
									"response_type": 'met',
									"reward_type": 'NA'
								}
								validoptions.push(response_parameters);
							} else {
								console.log('Response from GetWeeksGoalMetThisMonth:', response);
								if (response.weeksAchieved == weeksMonth) {
									console.log('Monthly met from response in GetWeeksGoalMetThisMonth');
									response_parameters = {
										"response_category": 'monthly',
										"response_type": 'met',
										"reward_type": 'monthly'
									}
									validoptions.push(response_parameters);
								} else {
									console.log('Weekly met from response in GetWeeksGoalMetThisMonth');
									response_parameters = {
										"response_category": 'weekly',
										"response_type": 'met',
										"reward_type": 'NA'
									}
									validoptions.push(response_parameters);
								}
							}
						});
					} else {
						console.log('Weekly met month hasnt changed');
						response_parameters = {
							"response_category": 'weekly',
							"response_type": 'met',
							"reward_type": 'NA'
						}
						validoptions.push(response_parameters);
					}
				} else {
					console.log('Weekly met month hasnt changed');
					//Only two values so has to be "Weekly"
					response_parameters = {
						"response_category": 'weekly',
						"response_type": 'met',
						"reward_type": 'Weekly'
					}
					validoptions.push(response_parameters);
				}
			} else {
				console.log('Weekly met no monthly goal');
				response_parameters = {
					"response_category": 'weekly',
					"response_type": 'met',
					"reward_type": 'NA'
				}
				validoptions.push(response_parameters);
			}
		} else {
			console.log('Weekly progress, daily goal met');
			response_parameters = {
				"response_category": 'weekly',
				"response_type": 'progress',
				"reward_type": 'NA'
			}
			validoptions.push(response_parameters);
			weekDiff = goal.daysperweekvalue - gtdResponse.weeklyCount;
			console.log('weekDiff: ' + weekDiff + ', goal.daysperweekvalue: ' + goal.daysperweekvalue + ', gtdResponse.weeklyCount: ' + gtdResponse.weeklyCount);
			weekProgress = Math.round((gtdResponse.weeklyCount/goal.daysperweekvalue)*100);
		}
		if (gtdResponse.dailyExceed == 'Y') {
			console.log('Daily goal exceeded');
			response_parameters = {
				"response_category": 'daily',
				"response_type": 'exceed',
				"reward_type": 'NA'
			}
			validoptions.push(response_parameters);
		} else {
			console.log('Daily goal met');
			response_parameters = {
				"response_category": 'daily',
				"response_type": 'met',
				"reward_type": 'NA'
			}
		}
	}

	if (validoptions.length > 0) {
		if (validoptions.length > 1) {
			varOption = Math.floor((Math.random() * validoptions.length));
		} else {
			varOption = 0;
		}

		if (validoptions[varOption].reward_type !== 'NA') {
			vSQL="SELECT response FROM logoshealth.goal_response where response_category = '" + validoptions[varOption].response_category +
			  "' and response_type = '" + validoptions[varOption].response_type + "' and  reward_type = '" +
			  validoptions[varOption].reward_type + "' order by RAND () limit 1";
		} else {
			vSQL="SELECT response FROM logoshealth.goal_response where response_category = '" + validoptions[varOption].response_category +
			  "' and response_type = '" + validoptions[varOption].response_type + "' and reward_type is null order by RAND () limit 1";
		}

		console.log('GetGoalEntryResponse SQL: ' + vSQL);
		connection.query(vSQL, function (error, results, fields) {
			if (error) {
				//console.log('DBUtils.GetGoalTrackingWeek connection Error. the Error is: ', error);
				closeConnection(connection);
				callback(error, null);
			} else {
				//console.log('DBUtils.checkGoal connection results gound. results length is : '+results.length);
				if (results !== null && results.length > 0) {
					var resultResponse = results[0].response;
					closeConnection(connection);
					console.log('GetGoalEntryResponse Results - ', resultResponse);
					if (resultResponse.indexOf("[goalname]") != -1) {
						resultResponse = resultResponse.replace("[goalname]", goal.goalname);
					}
					if (resultResponse.indexOf("[reward]") != -1) {
						resultResponse = resultResponse.replace("[reward]", goal.reward);
					}
					if (dailyDiff > -1) {
						if (resultResponse.indexOf("[diff]") != -1) {
							resultResponse = resultResponse.replace("[diff]", dailyDiff);
						}
						if (resultResponse.indexOf("[units]") != -1) {
							resultResponse = resultResponse.replace("[units]", goal.goalunitvalue);
						}
						if (resultResponse.indexOf("[progress%]") != -1) {
							resultResponse = resultResponse.replace("[progress%]", dailyProgress + "%");
						}
						if (resultResponse.indexOf("[progress left%]") != -1) {
							resultResponse = resultResponse.replace("[progress left%]", dailyProgressLeft + "%");
						}
					}
					if (weekDiff > -1) {
						if (resultResponse.indexOf("[week diff]") != -1) {
							resultResponse = resultResponse.replace("[week diff]", weekDiff);
						}
						if (resultResponse.indexOf("[week progress%]") != -1) {
							resultResponse = resultResponse.replace("[week progress%]", weekProgress + "%");
						}
					}
					callback(null, resultResponse);
				} else {
					closeConnection(connection);
					callback('ALERT! No response found in  GetGoalEntryResponse', null);
				}
			}
		});

	}
}

 //VG 4/30|Purpose: To pull event based questions
function getEventDetails(qnaObj, session, callback) {
	//console.log("DBUtil.getEventDetails called with param >>>>> SQL Query is " +qnaObj.questionId);

	var questionId = qnaObj.questionId;
	var answerFieldValue = qnaObj.answerFieldValue==null?"":qnaObj.answerFieldValue;
	var sessionAttributes = session.attributes;
	var connection = getLogosConnection();
    var vSQL = '';
	var mainQuestionId;

   	//console.log('getEventDetails: eventScriptSeq >>>> ' + qnaObj.eventQNArr.eventScriptSeq);
	//MM 6-13-17 - Added functionality to iterate to the next sequence in the event script has already been triggered.  Otherwise, load first script if it is there
	//MM 12-22-17 - Add isPickList parameter to enable list based functionality (with Y/N answers)
    if(!isEmpty(qnaObj.eventQNArr)){
		//MM 6-13-17 Get the next event driven question by increasing the event sequence
		qnaObj.eventQNArr.eventScriptSeq = qnaObj.eventQNArr.eventScriptSeq + 1;
		vSQL="select * from logoshealth.eventquestion where questionid="+questionId+ " and lower(event)='"+qnaObj.eventQNArr.event+"' and eventscriptsequence = "+qnaObj.eventQNArr.eventScriptSeq;
	} else {
		vSQL="select * from logoshealth.eventquestion where questionid="+questionId+ " and lower(event)='"+answerFieldValue.toLowerCase()+"' order by eventscriptsequence asc limit 1";
	}

    console.log("DBUtil.getEventDetails called with param >>>>> SQL Query is " +vSQL);

    connection.query(vSQL, function (error, results, fields) {
        if (error) {
            console.log('DBUtils.getEventDetails Error. the Error is: ', error);
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getEventDetails.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
    	} else {
    		//console.log('DBUtils.getEventDetails results gound. results length is : '+results.length);
			if (results !== null && results.length > 0)  {
                closeConnection(connection); //all is done so releasing the resources

				//MM 6-13-17 - Added addional variables to manage the full event driven interview lifecycle
				//pull event questions into an array and set them back to QnAObject under session
                var eventQnaObj = {};
                //var eventObjArr = [];
				var maxEventSeq = 0;

                eventQnaObj = {
                	"questionId": results[0].eventquestionid==null?"":results[0].eventquestionid,
        			"questionVer": results[0].eventquestionversion==null?"":results[0].eventquestionversion,
        			"answer": "",
        			"processed": false,
        			"questionVersion":results[0].questionversion==null?"":results[0].questionversion,
        			"event":results[0].event==null?"":results[0].event,
        			"eventScriptSeq":results[0].eventscriptsequence==null?"":results[0].eventscriptsequence,
					"maxEventSeq":maxEventSeq,
        			"eventQuestion":results[0].question==null?"":results[0].question,
        			"eventFunction":results[0].eventfunction==null?"":results[0].eventfunction,
        			"eventFunVar":results[0].eventfuncionvariables==null?"":results[0].eventfuncionvariables,
        			"answerTable":results[0].answertable==null?"":results[0].answertable,
        			"answerKeyField":results[0].answerkeyfield==null?"":results[0].answerkeyfield,
					"answerField":results[0].answerfield==null?"":results[0].answerfield,
					"answerType":results[0].answertype==null?"":results[0].answertype,
					"isRequired":results[0].isrequired==null?"":results[0].isrequired,
        			"isDictionary":results[0].isdictionary==null?"":results[0].isdictionary,
        			"formatId":results[0].formatid==null?"":results[0].formatid,
        			"isMultiEntry":results[0].multientry==null?"":results[0].multientry,
        			"isOnlyOnce":results[0].onlyonce==null?"":results[0].onlyonce,
        			"isPickList":results[0].ispicklist==null?"":results[0].ispicklist,
					"isInsertNewRow":results[0].insertnewrow==null?"":results[0].insertnewrow,
					"useTemplate":results[0].usetemplate==null?"":results[0].usetemplate,
					"templateInfo":results[0].templateinfo==null?"":results[0].templateinfo,
					"eventTableId":0,
					"isEventInsert": false,
        			"errResponse":results[0].errorresponse==null?"":results[0].errorresponse
                };

            	qnaObj.eventQNArr = eventQnaObj;
				var scriptName = session.attributes.scriptName;

				//MM 5-08-2018 Added functionality for usetemplate to set variables for insert later
				if (qnaObj.eventQNArr.useTemplate == 'Y') {
					var equalSplit = qnaObj.eventQNArr.templateInfo.split("=");
					var fieldLabelSplit = equalSplit[0].trim();
					var fieldSplit = equalSplit[1].trim();
					sessionAttributes[fieldLabelSplit] = fieldSplit;
					console.log('From getEventDetails - useTemplate Split: ' + fieldLabelSplit + ': ' +
					  sessionAttributes[fieldLabelSplit]);
				}

				//MM 12-27-2017 Added conditional to go to foodcategoryId when setting food category preferences
				if (qnaObj.eventQNArr.answerTable == 'foodcategorypreference') {
					getFoodCategoryId (questionId, scriptName,  qnaObj.answer, session, callback, false, qnaObj, true);
				} else {
					getMaxEventScriptId (qnaObj, session, callback);
				}

			} else {
				//MM 6-12-17 If there are no event driven questions for this event, move to next main question
				console.log("DBUtil.getEventDetails :  No event function found for event - next Main Question.");
				closeConnection(connection); //all is done so releasing the resources
				//MM 5-15-18 Set the currentProcessor back to main menu[5] (set to Q&A[3] based on potential eventDriven questioning) when eventDriven questioning not present
				if (qnaObj.uniqueStepId == sessionAttributes.maxScriptId - 1 ||qnaObj.uniqueStepId == sessionAttributes.maxScriptId) {
					sessionAttributes.currentProcessor = 5;
					//sessionAttributes.scriptComplete = true;
					console.log('getEventDetails - State Mgmt - Final Step completed - Setting Processor to Main Menu after determined no event driven questions');
				}
				mainQuestionId = qnaObj.uniqueStepId + 1;
				getScriptDetails(mainQuestionId, sessionAttributes.scriptName, sessionAttributes.logosname, session, callback, false);
			}

		}
    });
}//Function getEventDetails() ends here

//MM 9-4-18 Process Skip - if the data is not required
function processSkipAnswer(intent, session, callback) {
	var sessionAttributes = session.attributes;
	var qnaObj = sessionAttributes.qnaObj;

	if (isEmpty(qnaObj.eventQNArr)) {
		if (qnaObj.isRequired == 'Y' || qnaObj.insertNewRow == 'Y' ) {
			qnaObj.question = "A valid answer is required, so this cannot be skipped.  Repeating the question: " + qnaObj.question;
			helper.processQnAResponse(qnaObj, session, callback, false);
		} else {
			qnaObj.answer = 'skip';
			setTranscriptDetailsParent(false, qnaObj, session, callback);
		}
	} else {
		if (qnaObj.eventQNArr.isRequired == 'Y' || qnaObj.eventQNArr.insertNewRow == 'Y') {
			qnaObj.eventQNArr.question = "A valid answer is required, so this cannot be skipped.  Repeating the question: " + qnaObj.eventQNArr.question;
			helper.processQnAResponse(qnaObj, session, callback, false);
		} else {
			qnaObj.eventQNArr.answer = 'skip';
			setTranscriptDetailsParent(false, qnaObj, session, callback);
		}
	}
}


//MM 6-10-17 Retrieves the min script id for current interview - main interview
function getMinScriptId(questionId, scriptName, slotValue, session, callback, retUser, qnaObj) {
	var connection = getLogosConnection();
    var vSQL3;

	//console.log('DBUtils.getMinScriptID: ' +session.attributes.minScriptId + ', maxScriptID: ' + session.attributes.maxScriptId);
	//MM 6-10-17 Add SQL and populate minUniqueStep ID for current interview on initial load
	if (session.attributes.minScriptId == 0) {
    	vSQL3="SELECT min(uniquestepid) as value FROM logoshealth.script s, logoshealth.question q where s.questionid=q.questionid and scriptname='"+scriptName+"'";

		connection.query(vSQL3, function (error, results, fields) {
			if (error) {
            	console.log('DBUtils.getMinScriptID connection Error. the Error is: ', error);
				closeConnection(connection);
    			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getMinScriptId.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
    		} else {
				//console.log('DBUtils.getMinScriptID connection results gound. results length is : '+results.length);
				if (results !== null && results.length > 0) {
					session.attributes.minScriptId = results[0].value;
					closeConnection(connection);
					getMaxScriptId (questionId, scriptName, slotValue, session, callback, retUser, qnaObj);
				} else {
					closeConnection(connection);
    				var errResponse = "There is an error in processing this request - no data found.  If it continues, please contact app support and say error in getMinScriptId.  Restarting LogosHealth.  Please say your first name.";
					helper.callRestart(session.attributes.accountid, errResponse, session, callback);
				}
			}
		});
	} else {
			getMaxScriptId (questionId, scriptName, slotValue, session, callback, retUser, qnaObj);
	}
}

//MM 6-10-17 Retrieves the max script id for current interview - main interview
function getMaxScriptId (questionId, scriptName, slotValue, session, callback, retUser, qnaObj) {
	var connection = getLogosConnection();
    var vSQL2;

	//MM 6-10-17 Add SQL and populate maxUniqueStep ID for current interview on initial load
	if (session.attributes.maxScriptId == 0) {
    	vSQL2="SELECT max(uniquestepid) as value FROM logoshealth.script s, logoshealth.question q where s.questionid=q.questionid and scriptname='"+scriptName+"'";
		connection.query(vSQL2, function (error, results, fields) {
			if (error) {
            	console.log('DBUtils.getScriptDetails connection Error. the Error is: ', error);
				closeConnection(connection);
    			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getMaxScriptId.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
    		} else {
				//console.log('DBUtils.getScriptDetails connection results gound. results length is : '+results.length);
				if (results !== null && results.length > 0) {
					session.attributes.maxScriptId = results[0].value;
					closeConnection(connection); //all is done so releasing the resources
					helper.processQnAResponse(qnaObj, session, callback, retUser);
				} else {
					closeConnection(connection);
    				var errResponse = "There is an error in processing this request - no data found.  If it continues, please contact app support and say error in getMaxScriptId.  Restarting LogosHealth.  Please say your first name.";
					helper.callRestart(session.attributes.accountid, errResponse, session, callback);
				}
			}
		});
	} else {
		//callback response with QnA object array
		helper.processQnAResponse(qnaObj, session, callback, retUser);
	}
}

//MM 6-13-17 Get the Max EventSequenceID for this event driven interview
function getMaxEventScriptId (qnaObj, session, callback) {
	var connection = getLogosConnection();
    var vSQL2;
	var questionId = qnaObj.questionId;

	//console.log('DBUtils.getMaxEventScriptId maxEventSeq: '+ qnaObj.eventQNArr.maxEventSeq);
	if (qnaObj.eventQNArr.maxEventSeq == 0) {

    	vSQL2="select max(eventscriptsequence) as value from logoshealth.eventquestion where questionid="+questionId+ " and lower(event)='"+qnaObj.eventQNArr.event.toLowerCase()+"'";
		console.log('DBUtils.getMaxEventScriptId SQL is : '+vSQL2);

		connection.query(vSQL2, function (error, results, fields) {

			if (error) {
            	console.log('DBUtils.getMaxEventScriptId connection Error. the Error is: ', error);
				closeConnection(connection);
    			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getMaxEventScriptId.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
    		} else {
				//console.log('DBUtils.getMaxEventScriptId connection results gound. result is : '+results[0].value);
				if (results !== null && results.length > 0) {
					qnaObj.eventQNArr.maxEventSeq = results[0].value;
					closeConnection(connection); //all is done so releasing the resources
				} else {
					closeConnection(connection);
    				var errResponse = "There is an error in processing this request - no data found.  If it continues, please contact app support and say error in getMaxEventScriptId.  Restarting LogosHealth.  Please say your first name.";
					helper.callRestart(session.attributes.accountid, errResponse, session, callback);
				}
			}

			if (qnaObj.eventQNArr.eventFunction !== ""){
					//console.log('DBUtils.getMaxEventScriptId Loop1');
					processEventFunction(qnaObj, qnaObj.eventQNArr, qnaObj.eventQNArr.answer, session, callback);
			} else {
					//console.log('DBUtils.getMaxEventScriptId Loop2');
				//callback response with QnA object array
				helper.processQnAEvent(qnaObj, session, callback, false);
			}
		});
	} else {
		console.log('DBUtils.getMaxEventScriptId The eventFunction is : '+ qnaObj.eventQNArr.eventFunction);
		if (qnaObj.eventQNArr.eventFunction !== ""){
				//console.log('DBUtils.getMaxEventScriptId Loop3');
				processEventFunction(qnaObj, qnaObj.eventQNArr, qnaObj.eventQNArr.answer, session, callback);
		} else {
			//callback response with QnA object array
			//console.log('DBUtils.getMaxEventScriptId Loop4');
			helper.processQnAEvent(qnaObj, session, callback, false);
		}
	}
}

//MM 11-22-17 Retrieves the foodcategory id from db for food preferences interview
function getFoodCategoryId(questionId, scriptName, slotValue, session, callback, retUser, qnaObj, fromEvent) {
	var connection = getLogosConnection();
    var vSQL3;
	var vFood;

	if (!fromEvent) {
		vFood = qnaObj.stepDescription;
	} else {
		vFood = qnaObj.eventQNArr.eventQuestion;
	}

	console.log('DBUtils.getFoodCategoryId: ' +session.attributes.foodcategoryid);
    vSQL3="SELECT foodcategoryid as value FROM logoshealth.foodcategory where name='"+vFood+"'";

	connection.query(vSQL3, function (error, results, fields) {
		if (error) {
            console.log('DBUtils.getFoodCategoryId connection Error. the Error is: ', error);
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getFoodCategoryId.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
    	} else {
			//console.log('DBUtils.getFoodCategoryId connection results gound. results length is : '+results.length);
			if (results !== null && results.length > 0) {
				session.attributes.foodcategoryid = results[0].value;
				console.log('DBUtils.getFoodCategoryId result is : '+session.attributes.foodcategoryid);
				console.log('DBUtils.getFoodCategoryId fromEvent is : '+fromEvent);
				closeConnection(connection);

				if (!fromEvent) {
					getMinScriptId (questionId, scriptName, slotValue, session, callback, retUser, qnaObj);
				} else {
					getMaxEventScriptId (qnaObj, session, callback);
				}
			} else {
				closeConnection(connection);
    			var errResponse = "There is an error in processing this request - no data found.  If it continues, please contact app support and say error in getFoodCategoryId.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
			}
		}
	});
}

//SECTION - MAIN Q&A ENGINE SAVE DATA AND MOVE TO NEXT QUESTIONS
//VG 2/28|Purpose: Read the answers and Insert/Update the Profile
//MM 6-10-17 Various updates to genericize function
//MM 12-22-17 Added additional comparison criteria to all all non-picklist records to move forward or only picklist whose answer is 'Y'.  Otherwise, fall through to move to staging
function saveAnswer(qnaObj, session, callback) {
	//console.log("DBUtil.saveAnswer for >>>>> "+qnaObj.answer);
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var profileId = sessionAttributes.profileid;
	var logosname = sessionAttributes.logosname;
	var isPrimary = session.attributes.isPrimaryProfile;

	//console.log("DBUtil.saveAnswer for >>>>> profileId : "+profileId);
	//console.log("DBUtil.saveAnswer for >>>>> uniquestepid : "+qnaObj.uniqueStepId);

	//retrieve the specific step in the script with mapping to data tables/fields
	var chkQuery = "SELECT s.*,q.* from logoshealth.script s, logoshealth.question q where s.questionid=q.questionid and uniquestepid="+qnaObj.uniqueStepId;
	console.log('DBUtil.saveAnswer Profile retrieve query is - ' + chkQuery);

	//Check 1: If the script step call for insert, insert a new record
	connection.query(chkQuery,function(error,results,fields) {
		if(error)  {
			console.log('The Error is: DBUtil.saveAnswer - ', error);
			closeConnection(connection); //all is done so releasing the resources
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in saveAnswer.  Restarting LogosHealth.  Main menu.  For a list of options say, menu.";
			helper.gotoMainMenu(errResponse, session, callback);
         } else {
        	closeConnection(connection);
		    //console.log('DBUtil.saveAnswer - results.length: '+ results.length);
            if (results !== null && results.length > 0) {
            	var rec;
                var insertRec;
                var tblName = results[0].answertable;
                var vFields = results[0].answerfield;
				var answerKey = results[0].answerkeyfield;
				var insertSQL = {};
				var equalSplit;

		        console.log('DBUtil.saveAnswer - vFields: '+ vFields+ " tblName: "+tblName+" answerKey: "+answerKey);
				//MM 12-22-17 Added additional comparison criteria to all all non-picklist records to move forward or only picklist whose answer is 'Y'.  Otherwise, fall through to move to staging
				// && (qnaObj.isPickList == 'N' || (qnaObj.isPickList == 'Y' && qnaObj.dictanswer == 'Y'))
				if(vFields !== null && vFields.length > 0){
					vFields=vFields.split(","); //This will split based on the comma
					//MM 6-10-17 Added functionality to handle hardcoded values within field mapping as well as known field mapping.
					//Stated behavior - ****For insert, the spoken answer will map to the last field always.
					//Besides this, there are two types of fields - one which maps to specific fields in the system attributes and two
					//hardcoded values with an = sign in them.
                    if(results[0].insertnewrow == 'Y') {

					 if (results[0].onlyonce == 'N' || sessionAttributes.OOChecked == true) {
					  sessionAttributes.OOChecked = false;
                      for (var i = 0; i < vFields.length; i++) {
                        	//console.log('The vField value in: DBUtil.saveAnswer - ' + tblName+' >> and field split '+vFields[i]);
							if (vFields[i].indexOf("=") != -1) {
								equalSplit = vFields[i].split("=");
								var fieldLabelSplit = equalSplit[0].trim();
								var fieldSplit = equalSplit[1].trim();
								insertSQL[fieldLabelSplit] = fieldSplit;
 	                            //console.log('DBUtil.saveAnswer - Build SQL From SPLIT ', insertSQL);
							} else {
								var fieldLabelMap = vFields[i].trim();
								//MM 6-24-17  Add condition to check the OnBehalfOf to enter the proper profile id
								if (fieldLabelMap == 'profileid' && sessionAttributes.onBehalfOf){
									insertSQL[fieldLabelMap] = sessionAttributes.subjectProfileId;
								} else {
									insertSQL[fieldLabelMap] = sessionAttributes[fieldLabelMap];
								}
 	                            //console.log('DBUtil.saveAnswer - Build SQL From MAP ', insertSQL);
							}
                      }
						  var fieldLabel1 = vFields[vFields.length - 1];
						  var fieldLabelTrim = fieldLabel1.trim();
					      console.log('DBUtil.saveAnswer - qnaObj.answer: ' + qnaObj.answer);
						  insertSQL[fieldLabelTrim] = qnaObj.answer;

						  //MM 6-11-17, 6-22-17 Added functionality to use accountid for profie table.
						  if(sessionAttributes.profileid == 0){
							insertSQL["createdby"] = sessionAttributes.accountid;
							insertSQL["modifiedby"] = sessionAttributes.accountid;
						  } else if (tblName == 'profile'){
							insertSQL["createdby"] = sessionAttributes.accountid;
							insertSQL["modifiedby"] = sessionAttributes.accountid;
						  } else {
							insertSQL["createdby"] = sessionAttributes.profileid;
							insertSQL["modifiedby"] = sessionAttributes.profileid;
						  }
						  console.log('DBUtil.saveAnswer - FINAL INSERT SQL: ', insertSQL);
						  //console.log('DBUtil.saveAnswer - tblName: ', tblName);
						  var insertStart = "Insert into logoshealth." + tblName + " Set ?";
						  //console.log('DBUtil.saveAnswer - insertStart : ' + insertStart);
						  connection = getLogosConnection();
                          connection.query(insertStart, insertSQL, function (error, results, fields) {
                          	if (error) {
                            	console.log('The Error is: DBUtil.saveAnswer INSERT- ', error);
								closeConnection(connection);
								if(sessionAttributes.scriptName.indexOf("Family Member Profile")!= -1 && qnaObj.uniqueStepId == sessionAttributes.minScriptId) {
    								var errResponse = "There is already a profile for "+qnaObj.answer+".  If it needs to be completed, please choose Complete In-Process Interview from the main menu.  Main menu.  For a list of options, say menu.";
									var processor = 5;
									helper.processErrResponse(errResponse, processor, session, callback);
								} else {
    								var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in saveAnswer - Insert.  Restarting LogosHealth.  Please say your first name.";
									helper.callRestart(session.attributes.accountid, errResponse, session, callback);
								}
                              } else {
                              	//console.log('The record INSERTED successfully into Profile Table!!');
								closeConnection(connection);
								sessionAttributes.tableId = results.insertId;
								sessionAttributes.currentTable = tblName;
								//MM 5-08-18 Set vaccineid when inserting a vaccine record
								//MM 6-24-17 Set medicaleventid when inserting a medicalevent record
								//MM 6-24-17 Set subject profile id when inserting a new profile record onBehalfOf
								//MM 6-11-17 Set profile id when creating a new profile record
								if (tblName == 'profile' && sessionAttributes.profileid == 0) {
									sessionAttributes.profileid = results.insertId;
								} else if  (tblName == 'profile' && sessionAttributes.onBehalfOf) {
									sessionAttributes.subjectProfileId = results.insertId;
								}  else if  (tblName == 'medicalevent') {
									sessionAttributes.medicaleventid = results.insertId;
								}  else if  (tblName == 'vaccine') {
									sessionAttributes['vaccineid'] = results.insertId;
								}
                                channelDataToDeepstream(qnaObj, true, session, callback);
								//setTranscriptDetailsParent(true, qnaObj, session, callback);  //insert records into Parent Transcript Array
                              }
							 });
							} else {
								//5-15-18 MM Added functionality to handle Only Once flag - allowing to configure values that should only be captured once (meaning no duplicates)
								if (qnaObj.OOCondition !== null) {
									checkOnlyOnceCondition(qnaObj, session, callback);
								} else {
									checkOnlyOnce(qnaObj, session, callback);
								}
							}
                       } else { //insertRow != Yes hence execute update
							//MM 6-25-17 Added check for ensuring the right table is being updated
							//MM 6-11-17 Updated variables to ensure key field is generic
							if (tblName == sessionAttributes.currentTable) {
                                var updateRec="Update "+tblName+" Set "+vFields+" ='"+qnaObj.answer+"' Where "+answerKey+"="+sessionAttributes.tableId; //resArr.answerFieldValue;
                                console.log("DBUtil.saveAnswer - Update STMT >> ",updateRec);
                               	connection = getLogosConnection();
                                connection.query(updateRec, function (error, results, fields) {
                                    if (error) {
                                        console.log('The Error is: DBUtil.saveAnswer UPDATE- ', error);
										closeConnection(connection); //all is done so releasing the resources
    									var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in saveAnswer - Update.  Restarting LogosHealth.  Please say your first name.";
										helper.callRestart(session.attributes.accountid, errResponse, session, callback);
                                    } else {
                                        console.log('The record UPDATED successfully SaveData');
                                        closeConnection(connection);
                                        //TODo: Call deeptstreadm update field
                                        //insert records into Parent Transcript Array - Staging scripts would redirect to Response process

                                        channelDataToDeepstream(qnaObj, false, session, callback);
                                        //setConversation(qnaObj,false, session,callback);
                                    }
                                });
							} else {
								getMainTableIdForUpdate(tblName, qnaObj, session, callback);
							}
                     	}
                    } else {
                        console.log("Fall Through where field is null - event function behavior");
						setTranscriptDetailsParent(false, qnaObj, session, callback);
					}
            	}	//if results are null - no handler yet
			}
        }); //First Select SQL ends here
        //VG 6/25|Purpose:Pass answers to DeepStream
        //console.log("!!!Calling setDeepStream!!!");
        //setDeepStream(qnaObj,session, callback);
} //Funcion ends here

//MM 6-24-17 Revamped to match SaveAnswer logic and functionality
//VG 5/5|Purpose: Read the answers and Insert/Update the eventDetails table
//MM 12-22-17 Added additional comparison criteria to all all non-picklist records to move forward or only picklist whose answer is 'Y'.  Otherwise, fall through to move to staging
function setEventDetails(qnaObj, eventQnA, answer, session, callback) {
        var connection = getLogosConnection();
        var sessionAttributes = session.attributes;

        var profileId = sessionAttributes.profileid;
        var primaryProfileId = sessionAttributes.primaryProfileId;

        var logosname = sessionAttributes.logosname;
        var insertRec;

        //console.log("DBUtil.setEventDetails for >>>>> Answer table "+eventQnA.answerTable+" field: "+eventQnA.answerField+" answer: "+answer);

        var tblName = eventQnA.answerTable;
        var vFields = eventQnA.answerField;

	//MM 12-22-17 Added additional comparison criteria to all all non-picklist records to move forward or only picklist whose answer is 'Y'.  Otherwise, fall through to move to next steps

   console.log("DBUtil.setEventDetails for >>>>> Answer table "+eventQnA.answerTable+" field: "+eventQnA.answerField+" answer: "+answer);
   console.log("DBUtil.setEventDetails for >>>>> isPicklist "+eventQnA.isPickList);
   console.log("DBUtil.setEventDetails for >>>>> dictanswer "+qnaObj.dictanswer);
   // && (eventQnA.isPickList == 'N' || (eventQnA.isPickList == 'Y' && qnaObj.dictanswer == 'Y'))
	if (tblName !== null && tblName !== "") {
		   if(eventQnA.isInsertNewRow == 'Y') {
				var insertSQL = {};
			    vFields=vFields.split(",");

           		for (var i = 0; i < vFields.length; i++) {
                	//console.log('The vField value in: DBUtil.setEventDetails - ' + tblName+' >> and field split '+vFields[i]);

					if (vFields[i].indexOf("=") != -1) {
						equalSplit = vFields[i].split("=");

						var fieldLabelSplit = equalSplit[0].trim();
						var fieldSplit = equalSplit[1].trim();
						insertSQL[fieldLabelSplit] = fieldSplit;
 	                    //console.log('DBUtil.setEventDetails - Build SQL From SPLIT ', insertSQL);

					} else {
						var fieldLabelMap = vFields[i].trim();
 	                    //console.log('DBUtil.setEventDetails - fieldLabelMap ', fieldLabelMap);

						//MM 6-24-17  Add condition to check the OnBehalfOf to enter the proper profile id
						if (fieldLabelMap == 'profileid' && sessionAttributes.onBehalfOf){
							insertSQL[fieldLabelMap] = sessionAttributes.subjectProfileId;
						} else if (fieldLabelMap == 'eventquestionid') {
							insertSQL[fieldLabelMap] = eventQnA.questionId;
						} else {
							insertSQL[fieldLabelMap] = sessionAttributes[fieldLabelMap];
						}

 	                    //console.log('DBUtil.setEventDetails - Build SQL From MAP ', insertSQL);
					}
                 }
				var fieldLabel1 = vFields[vFields.length - 1];
				var fieldLabelTrim = fieldLabel1.trim();
				insertSQL[fieldLabelTrim] = answer;

				//MM 6-11-17, 6-22-17 Added functionality to use accountid for profie table.
				if(sessionAttributes.profileid == 0){
					insertSQL["createdby"] = sessionAttributes.accountid;
					insertSQL["modifiedby"] = sessionAttributes.accountid;
				} else if (tblName == 'profile'){
					insertSQL["createdby"] = sessionAttributes.accountid;
					insertSQL["modifiedby"] = sessionAttributes.accountid;
				} else {
					insertSQL["createdby"] = sessionAttributes.profileid;
					insertSQL["modifiedby"] = sessionAttributes.profileid;
				}

				console.log('DBUtil.setEventDetails - FINAL INSERT SQL: ', insertSQL);
				//console.log('DBUtil.setEventDetails - tblName: ', tblName);
				var insertStart = 'Insert into logoshealth.' + tblName + ' Set ?';
				//console.log('DBUtil.setEventDetails - insertStart : ' + insertStart);
				connection = getLogosConnection();
				connection.query(insertStart, insertSQL, function (error, results, fields) {
					if (error) {
						console.log('The Error is: DBUtil.saveAnswer INSERT- ', error);
						closeConnection(connection);
    					var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in setEventDetails.  Restarting LogosHealth.  Please say your first name.";
						helper.callRestart(session.attributes.accountid, errResponse, session, callback);
					} else {
							//console.log('The record INSERTED successfully from event function!!');
							closeConnection(connection);
							eventQnA.isInsertNewRow = true;
							eventQnA.eventTableId = results.insertId;
							processEventFunction(qnaObj, eventQnA, answer, session, callback);
					}
				});
			} else  {   //This is for update
				//MM 6-24-17 Updated to use actual table id so that event actually updates the right record based on table primary key, not profileid
				getEventTableIdForUpdate(qnaObj, eventQnA, answer, session, callback);
			}
	   	} else {
			//MM 6-25-17 Added to handle if there is an event function only which has no specific tblname in data record
			processEventFunction(qnaObj, eventQnA, answer, session, callback);
		}
} //Function setEventDetails ends here

//MM 6-12-17 Gets dictionary id from term for dictionary fields
function getDictionaryId(qnaObj, value, processor, fromEvent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var dictId = "";
	var fields = "";
	var field = "";
	var query = "";

	if(!fromEvent) {
		fields = qnaObj.answerField === null?"":qnaObj.answerField.split(",");
	} else {
		fields = qnaObj.eventQNArr.answerField === null?"":qnaObj.eventQNArr.answerField.split(",");
	}
	console.log("DBUtil.getDictionaryId called to get Dictionary : Filed and Fileds are  >>>  "+field+" and "+fields[fields.length-1]);
	//MM 5-21-18 Added code to remove aribrary periods from answers
	value = value.replace(/\./g,'');
	if (fields != "") {
		field = fields[fields.length-1];
		query = "SELECT dictionaryid FROM logoshealth.dictionary WHERE fieldname = '"+field.trim()+"' and (lower(value) = '"+value.toLowerCase()+
		  "' OR lower(dictionarycode) = '"+value.toLowerCase()+"' )";
	} else {
		query = "SELECT * FROM logoshealth.dictionary WHERE questionid = "+qnaObj.questionId+" and (lower(value) = '"+value.toLowerCase()+
		  "' OR lower(dictionarycode) = '"+value.toLowerCase()+"' )";
	}
	console.log("DBUtil.getDictionaryId Select Query is >>> "+query);
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log("DBUtil.getDictionaryId - Database QUERY ERROR >>>> ");
			closeConnection(connection);
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getDictionaryId.  " +
			  "Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
		} else {
			console.log('DBUtil.getDictionaryId - Query results '+results.length);
			if (results !== null && results.length > 0) {
                dictId = results[0].dictionaryid;
       			console.log("DBUtil.getDictionaryId - Dictionary ID retrieved as >>>> "+dictId);
       			console.log("DBUtil.getDictionaryId - Answer is >>>> "+qnaObj.answer);
				if (!fromEvent) {
					qnaObj.dictanswer = qnaObj.answer;
				} else {
					qnaObj.dictanswer = qnaObj.eventQNArr.answer;
				}
				   qnaObj.answer = dictId;
				   //MM 5-18-18 Added for getTermFromDictId may need to evaluate sessionAttributes["answerID"] vs qnaObj.answer in future
				   sessionAttributes["answerID"] = dictId;
    			console.log(' DBUtil.getDictionaryId Found: Set Dictionary Id to temp and QnA Objects >>>>>> '+qnaObj.answer);
				closeConnection(connection);

				//MM 5-18-18 Translate back to "Standard Term" to facilitate event driven scripts
				getTermFromDictId(qnaObj, session, fromEvent, callback);

				//MM 6-12-17 Data needs to be saved, so move event specific check to child staging record change
    			//if (fromEvent) {
				//	setEventDetails(qnaObj, qnaObj.eventQNArr, dictId, session, callback);
				//} else {
				//	saveAnswer(qnaObj, session, callback);
				//}
            } else {
				closeConnection(connection);
				//MM 5-18-2018 Execute a retry functionality on standard terminology patterns

				if (qnaObj.termEnhance !== null) {
					if (sessionAttributes["termRetryCount"] == undefined) {
						sessionAttributes["termRetryCount"] = 0;
						console.log('Dictionary Term Retry - Set Retry to 0');
					}
				}

				if (qnaObj.termEnhance !== null && sessionAttributes["termRetryCount"] == 0) {
					var termEnhanceCond  = "";
					var termEnhanceValue  = "";
					termEnhanceCond = qnaObj.termEnhance.split(";");
					if (termEnhanceCond[0] == "add") {
						if (termEnhanceCond[1] == "end") {
							termEnhanceValue = value.toLowerCase() + termEnhanceCond[2];
						} else if (termEnhanceCond[1] == "start") {
							termEnhanceValue = termEnhanceCond[2] + value.toLowerCase();
						}
					}

					if (termEnhanceValue !== "") {
						console.log('Dictionary Term Retry termEnhanceValue = ' + termEnhanceValue);
						sessionAttributes["termRetryCount"] = 1;
						getDictionaryId(qnaObj, termEnhanceValue, processor, fromEvent, session, callback);
					} else {
						//termEnhance parsing did not work - alert in log and keep moving forward
						console.log('termEnhance Formula Error - move on');
						sessionAttributes["termRetryCount"] = 0;
						getDictionaryListOptions(qnaObj, value, processor, fromEvent, session, callback);
					}
				} else {
					//MM 6-27-17 Dictionary item not found - go retrieve list to present to user for proper entry
					sessionAttributes["termRetryCount"] = 0;
					getDictionaryListOptions(qnaObj, value, processor, fromEvent, session, callback);
				}
            }
		}
	});
}

//MM 5-8-18 Gets preferred dictionary term from dictionary to facilitate event driven scripting
function getTermFromDictId(qnaObj, session, fromEvent, callback) {
	var connection = getLogosConnection();
	var query = "";
	var sessionAttributes = session.attributes;
	var dictid;
	var value;

	query = "SELECT value FROM logoshealth.dictionary WHERE dictionaryid = "+ sessionAttributes.answerID;

	console.log("DBUtil.getTermFromDictId Select Query is >>> "+query);
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log("DBUtil.getTermFromDictId - Database QUERY ERROR >>>> ");
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getTermFromDictId.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
		} else {
			console.log('DBUtil.getTermFromDictId - Query results '+results.length);
			if (results !== null && results.length > 0) {
				qnaObj.dictanswer = results[0].value;
				value = qnaObj.answerFieldValue;
				qnaObj.answerFieldValue = results[0].value;
				dictId = sessionAttributes.answerID;
				if(!fromEvent) {
					qnaObj.answer = dictId;
				} else {
					qnaObj.eventQNArr.answer = dictId;
				}

    			//console.log(' DBUtil.getDictionaryId Found: Set Dictionary Id to temp and QnA Objects >>>>>> '+qnaObj.answer);
    			closeConnection(connection);
				//MM 6-12-17 Data needs to be saved, so move event specific check to child staging record change
    			if (fromEvent) {
					setEventDetails(qnaObj, qnaObj.eventQNArr, dictId, session, callback);
				} else {
					saveAnswer(qnaObj, session, callback);
				}
            } else {
    			closeConnection(connection);
				getDictionaryListOptions(qnaObj, value, sessionAttributes.currentProcessor, fromEvent, session, callback);
			}
		}
	});
}

//MM 5-14-18 Checks OnlyOnceCondition  --> if condition is met, goto checkOnlyOnce otherwise save the data.  The only OnlyOnce condition SQL is housed in OOCondition field
//and must retrieve a "Y" value when assessed for the answer of this field
function checkOnlyOnceCondition(qnaObj, session, callback) {
	var connection = getLogosConnection();
	var query = "";
	var sessionAttributes = session.attributes;

	query = qnaObj.OOCondition;
	query = query.replace("[value]", qnaObj.answer);


	console.log("DBUtil.checkOnlyOnceCondition Select Query is >>> "+query);
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log("DBUtil.checkOnlyOnceCondition - Database QUERY ERROR >>>> ");
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in checkOnlyOnceCondition.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
		} else {
			console.log('DBUtil.checkOnlyOnceCondition - Query results '+results.length);
			if (results !== null && results.length > 0) {
    			//console.log(' DBUtil.getDictionaryId Found: Set Dictionary Id to temp and QnA Objects >>>>>> '+qnaObj.answer);
    			closeConnection(connection);
				if(results[0].onlyonce == 'Y') {
					checkOnlyOnce(qnaObj, session, callback);
				} else {
					sessionAttributes.OOChecked = true;
					saveAnswer(qnaObj, session, callback);
				}
				//MM 6-12-17 Data needs to be saved, so move event specific check to child staging record change
            } else {
    			closeConnection(connection);
				console.log('WARNING - DBUtil.checkOnlyOnceCondition - OOCondition Query did not retrieve a valid response');
				sessionAttributes.OOChecked = true;
				saveAnswer(qnaObj, session, callback);
			}
		}
	});
}

//MM 5-14-18 Checks if OnlyOnce --> has a condition  --> if this value is a duplicate --> handle duplicate or continue save if not duplicate
function checkOnlyOnce(qnaObj, session, callback) {
	var connection = getLogosConnection();
	var query = "";
	var sessionAttributes = session.attributes;

	var vFields=qnaObj.answerField.split(",");
	var fieldLabel1 = vFields[vFields.length - 1];
	var fieldLabelTrim = fieldLabel1.trim();
	var intProfile = sessionAttributes.profileid;

	if (sessionAttributes.onBehalfOf) {
		intProfile = sessionAttributes.subjectProfileId;
	}

	query = "SELECT " + qnaObj.answerKey + " as value FROM logoshealth." + qnaObj.answerTable + " where " +  fieldLabelTrim + " = " + qnaObj.answer + " and profileid = " +
	  intProfile + " and activeflag = 'Y'";

	console.log("DBUtil.checkOnlyOnce Select Query is >>> "+query);
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log("DBUtil.checkOnlyOnce - Database QUERY ERROR >>>> ");
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in checkOnlyOnce.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
		} else {
			console.log('DBUtil.checkOnlyOnce - Query results '+results.length);
			if (results !== null && results.length > 0) {
				sessionAttributes[qnaObj.answerKey] = results[0].value;
				console.log("DBUtil.checkOnlyOnce - Vaccine Key: " + qnaObj.answerKey + " = " + sessionAttributes[qnaObj.answerKey]);
				closeConnection(connection);
				sessionAttributes["OWAnswer"] = qnaObj.answer;
				sessionAttributes["OWAnswerValue"] = qnaObj.answerFieldValue;
				sessionAttributes["OWStepID"] = qnaObj.uniqueStepId;
				sessionAttributes["OWTable"] = qnaObj.answerTable;
				sessionAttributes["OWQuestionId"] = qnaObj.questionId;
				sessionAttributes["OWField"] = fieldLabelTrim;
				sessionAttributes["OWMinID"] = sessionAttributes.minScriptId;
				sessionAttributes["OWMaxID"] = sessionAttributes.maxScriptId;
				sessionAttributes["OWScriptName"] = sessionAttributes.scriptName;

				sessionAttributes.minScriptId = 0;  //reset to start new staging capture
				sessionAttributes.maxScriptId = 0;  //reset to start new staging capture
				getScriptDetails(0, qnaObj.OOScript, "", session, callback, false);
            } else {
				closeConnection(connection);
				sessionAttributes.OOChecked = true;
				saveAnswer(qnaObj, session, callback);
			}
		}
	});
}


//MM 6-24-17 Sets the OnBehalf of profile ID for addtional script processing if family member is found
function processOnBehalfOf(questionId, scriptName, slotValue, session, callback, retUser) {
	var sessionAttributes = session.attributes;
	var connection = getLogosConnection();
    var vSQL;

	//MM 6-10-17 setting session attribute scriptname
	session.attributes.scriptName = scriptName;
    vSQL="SELECT profileid FROM logoshealth.profile where lower(logosname)='" + slotValue.toLowerCase() + "' and accountid='"+ sessionAttributes.accountid +"' ";
	//console.log("DBUtil.processOnBehalfOf Query is  >>>>> " +vSQL);
	connection.query(vSQL, function (error, results, fields) {
    	var qnaObj = {};
    	var eventQNArr = {};
		if (error) {
            console.log('DBUtils.processOnBehalfOf Error. the Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in processOnBehalfOf.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
    	} else {
			//MM 6-24-17 If the on behalf of profile id is successfully retrieved, continue processing.  Otherwise raise the error back to user
			//console.log('DBUtils.processOnBehalfOf results gound. results length is : '+results.length);
			if (results !== null && results.length > 0) {
				closeConnection(connection); //all is done so releasing the resources
				sessionAttributes.subjectProfileId = results[0].profileid;
				sessionAttributes.subjectLogosName = slotValue;
				getScriptDetails(questionId, scriptName, slotValue, session, callback, retUser);
			} else {
				closeConnection(connection); //all is done so releasing the resources
    			var errResponse = "I cannot find a family member named " + slotValue + ".  You will need to add this family member through the main menu to continue.  Main menu.  For a list of options, simply say Menu.";
				var processor = 5 //return to main menu
				helper.processErrResponse(errResponse, processor, session, callback);
			}
		}
	});
}

//MM 6-25-17 Retrieves Table ID from staging records table to ensure the proper record is always updated through event specific scripts!
function getMainTableIdForUpdate(mainTableForUpdate, qnaObj, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var mainTableId = 0;

	var getMainTableId="select recordid from logoshealth.stg_records where stg_scriptid = "+ sessionAttributes.stgScriptId + " and `table` = '"+mainTableForUpdate+ "' order by stg_recordsid desc";
	//console.log("DBUtil.getMainTableIdForUpdate - select STMT >> ",getMainTableId);
	connection.query(getMainTableId, function (error, results, fields) {
		if (error) {
			console.log('The Error is: DBUtil.getMainTableIdForUpdate - ', error);
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getMainTableIdForUpdate.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
		} else  {
			mainTableId = results[0].recordid;
			closeConnection(connection);
			//console.log('The record retrieved successfully from DBUtil.getMainTableIdForUpdate !! eventTableID = ' + mainTableId);
			updateDataFromMainScript(qnaObj, mainTableId, session, callback);
		}
	});
}

//MM 6-25-17 Retrieves Table ID from staging records table to ensure the proper record is always updated through event specific scripts!
function getEventTableIdForUpdate(qnaObj, eventQnA, answer, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
    var eventTable = eventQnA.answerTable;
	var eventTableId = 0;

	var getEventTableId="select recordid from logoshealth.stg_records where stg_scriptid = "+ sessionAttributes.stgScriptId + " and `table` = '"+eventTable+ "' order by stg_recordsid desc";

	console.log("DBUtil.getEventTableIdForUpdate - select STMT >> ",getEventTableId);
	connection = getLogosConnection();

	connection.query(getEventTableId, function (error, results, fields) {
		if (error) {
			console.log('The Error is: DBUtil..getEventTableIdForUpdate - ', error);
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getEventTableIdForUpdate.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
		} else  {
			closeConnection(connection);
			eventTableId = results[0].recordid;
			//console.log('The record retrieved successfully from DBUtil.getEventTableIdForUpdate !! eventTableID = ' + eventTableId);
			updateDataFromEventScript(qnaObj, eventQnA, answer, eventTableId, session, callback);
		}
	});
}

//MM 6-25-17 Now updates data for main script updates now that Table record ID is consistently retrieved when scripts shifts between tables
function updateDataFromMainScript(qnaObj, mainTableId, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
    var tblName = qnaObj.answerTable;
    var vFields = qnaObj.answerField;
	var answerKey = qnaObj.answerKey;

    var updateRec="Update "+tblName+" Set "+vFields+" ='"+qnaObj.answer+"' Where "+answerKey+"="+mainTableId; //resArr.answerFieldValue;
    //console.log("DBUtil.updateDataFromMainScript - Update STMT >> ",updateRec);
    connection.query(updateRec, function (error, results, fields) {
    	if (error) {
       		console.log('The Error is: DBUtil.updateDataFromMainScript UPDATE- ', error);
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in updateDataFromMainScript.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
        } else {
        	//console.log('The record UPDATED successfully SaveData');
        	closeConnection(connection);
            //insert records into Parent Transcript Array - Staging scripts would redirect to Response process
            setTranscriptDetailsParent(false, qnaObj, session, callback);
        }
     });
}

//MM 6-25-17 Now updates data for event driven script updates now that Table record ID is consistently retrieved
function updateDataFromEventScript(qnaObj, eventQnA, answer, eventTableId, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
    var tblName = eventQnA.answerTable;
    var vFields = eventQnA.answerField;

	var updateRec="Update logoshealth."+tblName+" Set "+vFields+" ='"+answer+"' Where "+eventQnA.answerKeyField+"="+eventTableId; //resArr.answerFieldValue;
	//console.log("DBUtil.updateDataFromEventScript - Update STMT >> ",updateRec);
	connection = getLogosConnection();
	connection.query(updateRec, function (error, results, fields) {
		if (error) {
			console.log('The Error is: DBUtil.updateDataFromEventScript UPDATE- ', error);
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in updateDataFromEventScript.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
		} else  {
			//console.log('The record UPDATED successfully from DBUtil.updateDataFromEventScript !!');
			closeConnection(connection);
			processEventFunction(qnaObj, eventQnA, answer, session, callback);
		}
	});
}

function processEventFunction(qnaObj, eventQnA, answer, session, callback) {
	console.log('processEventFunction: Even function called >>> ');
	var profileId;
    var primaryProfileId = session.attributes.primaryProfileId;
	//var questionId = 0;

	console.log('processEventFunction - subString: ' + eventQnA.eventFunction.substring(0, 6));
	if (eventQnA.eventFunction!==null && eventQnA.eventFunction !== ""){
	  if (eventQnA.eventFunction == 'Execute Overwrite') {
		executeOverwrite(qnaObj, session, callback);
	  } else if (eventQnA.eventFunction.substring(0, 6) == 'script') {
		var vScript=eventQnA.eventFunction.split("=");
		var script = vScript[1];
		getScriptDetails(0, script, answer, session, callback, false);
		//console.log('More to do!');
	  }	else {
		var vEvent = eventQnA.eventFunction.replace(/fromprofile/gi, "'"+primaryProfileId+"'");
		vEvent = vEvent.replace(/acccountreplace/gi, "'"+session.attributes.accountid+"'");
		vEvent = vEvent.replace(/answerreplace/gi, "'"+qnaObj.answer+"'");
		vEvent = vEvent.replace(/masterreplace/gi, "'"+qnaObj.stepDescription+"'");

		if (session.attributes.onBehalfOf) {
			profileId = session.attributes.subjectProfileId;
		} else {
			profileId = session.attributes.profileid;
		}
		vEvent = vEvent.replace(/toprofile/gi, "'"+profileId+"'");

		console.log('processEventFunction: The eventFunction post REPLACE is '+vEvent);

		connection = getLogosConnection();
		connection.query(vEvent,function(error,results,fields) {
			if(error)  {
				console.log('The Error is: DBUtil.processEventFunction executing - ', error);
				closeConnection(connection);
    			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in processEventFunction.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
			} else {
				console.log('processEventFunction: The EventFuction value executed successfully: DBUtil.processEventFunction');
				closeConnection(connection);
				setTranscriptDetailsParent(false, qnaObj, session, callback);
			}
		});
	  }
	}  else {
    	console.log('processEventFunction: INTO the else condition >>>> ');
    	setTranscriptDetailsParent(false, qnaObj, session, callback);
    }
}

//MM 5-15-18 This function is called from the EventFunction to execute an Overwrite when chosen from the OnlyOnce duplicate challenge
function executeOverwrite(qnaObj, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
    var tblName = sessionAttributes.OWTable;
	var strField = sessionAttributes.OWField;
	var intAnswer = sessionAttributes.OWAnswer;
	var intProfile = sessionAttributes.profileid;

	if (sessionAttributes.onBehalfOf) {
		intProfile = sessionAttributes.subjectProfileId;
	}

	var updateRec="Update logoshealth."+tblName+" Set activeflag = 'N' Where "+strField+"="+intAnswer+ " and profileid = " + intProfile + " and activeflag = 'Y'";
	console.log("DBUtil.executeOverwrite - Update STMT >> ",updateRec);
	connection = getLogosConnection();
	connection.query(updateRec, function (error, results, fields) {
		if (error) {
			console.log('The Error is: DBUtil.executeOverwrite- ', error);
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in executeOverwrite.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
		} else  {
			//console.log('The record UPDATED successfully from DBUtil.updateDataFromEventScript !!');
			closeConnection(connection);
			//MM 5-15-18 reestablish previous state and continue like new
			qnaObj.uniqueStepId = sessionAttributes.OWStepID;
			qnaObj.answer = sessionAttributes.OWAnswer;
			qnaObj.answerTable = sessionAttributes["OWTable"];
			qnaObj.answerFieldValue = sessionAttributes["OWAnswerValue"];
			qnaObj.questionId = sessionAttributes["OWQuestionId"];
			sessionAttributes.minScriptId = sessionAttributes["OWMinID"];
			sessionAttributes.maxScriptId = sessionAttributes["OWMaxID"];
			sessionAttributes.scriptName = sessionAttributes["OWScriptName"];
			sessionAttributes.OOChecked = true;
			qnaObj.eventQNArr = {};

			console.log('executeOverwrite qna: ', qnaObj);

			saveAnswer(qnaObj, session, callback);
		}
	});
}




//SM: 07/04
/**
 * Create a new Deepstream Access.
 * @param {object|string} JSON
 * @return True/False
 * @public
 */
 function channelDataToDeepstream(qnaObj, isInsert, session, callback) {
 	console.log('DBUtil.channelDataToDeepstream method called - >>>>>');
 	var recordNm = qnaObj.answerField+session.attributes.tableId;
	var emailSquish = "";

	emailSquish = session.attributes.accountEmail;
	emailSquish = emailSquish.replace(/\./g,'');
	emailSquish = emailSquish.replace(/\@/g,'');
	recordNm = recordNm + emailSquish;

 	var dataVal = "";

	if (qnaObj.isDictionary !== null && qnaObj.isDictionary.toLowerCase() == 'y') {
		dataVal = qnaObj.dictanswer;
	} else {
		if (qnaObj.answer.indexOf("''") != -1) {
				dataVal = qnaObj.answer.split("''").join("'");
		} else {
			dataVal = qnaObj.answer;
		}
	}

 	console.log('DBUtil.channelDataToDeepstream the record name is '+recordNm+' and the record value is '+dataVal);

 	var eventData = {
 		"recordname": recordNm,
    	"data": dataVal,
		"email": session.attributes.accountEmail
 	};

 	//send eventData, context, callback, qnaObj, & session
 	//deepstream once update expected to callback DBUtil staging method, so params are required
 	deepstream.getDeepStreamConnection(eventData, isInsert, qnaObj, session, callback);
 }

//VG 6/25|Purpose:Send response to DeepStream/UI
function setDeepStream(qnaObj,session, callback)
{
    var AWS = require('aws-sdk');
    //AWS.config.region = 'us-east-1';
    var lambda = new AWS.Lambda();
    //var vRecordname = qnaObj.answerField ||qnaObj.userProfileId;
    var vRecordname = qnaObj.answerField+"81";
    var vData = qnaObj.answer;
    console.log("!!!Inside setDeepStream Function!!!"+vRecordname+"++++"+vData);
    exports.handler = function(event, context) {
        var params = {
            FunctionName: 'DeepStream', // the lambda function we are going to invoke
            InvocationType: 'Event',
            LogType: 'Tail',
            Payload: '{ "recordname": "firstname81","data": "Gypsy" }'
        };

    lambda.invoke(params, function(err, data) {
        if (err) {
            console.log('The Error is: setDeepStream ', err);
            context.fail(err);
        } else {
            console.log('The Success is: setDeepStream ', data.Payload);
            context.succeed('DeepStream said '+ data.Payload);

        }
    })
};
}//function setDeepStream ends here

//VG 4/13|Purpose: Set the STG tables with processed information
//MM 6-10-17 Added scriptName variable to stgScript insert
function setTranscriptDetailsParent(newRec, qnaObj, session, callback){
    //console.log("DBUtil.setTranscriptDetailsParent called with param >>>>> "+newRec);
	//Check if Staging has any record or not
    //var newRec = getStagingParentId(resArr, qnaObjArr, slotVal, session, callback);
    var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
    var profileId = sessionAttributes.profileid;
	var subjectProfileId = sessionAttributes.subjectProfileId;
	var updateSQL = '';

	console.log('setTranscriptDetailsParent - State Mgmt Unique Step ID: ' + qnaObj.uniqueStepId + ', minScriptID: ' + sessionAttributes.minScriptId +
	 ', maxScriptID: ' + sessionAttributes.maxScriptId);

	//MM 6-10-17 Changed logic to only create a new parent staging record if you are on the first step of an interview
	//newRec will pass through to the Child Staging Table
	//Deprecated genStagingParentID because of stgScriptId attribute and results.insertId

    if (qnaObj.uniqueStepId == sessionAttributes.minScriptId && sessionAttributes.stgScriptId ==0) {
		if (subjectProfileId > 0) {
			var stgRec = {profileid:profileId, subjectprofileid:subjectProfileId, scriptname:session.attributes.scriptName,uniquestepid:qnaObj.uniqueStepId,createdby:profileId,modifiedby:profileId};
		} else {
			var stgRec = {profileid:profileId, scriptname:session.attributes.scriptName,uniquestepid:qnaObj.uniqueStepId,createdby:profileId,modifiedby:profileId};
		}
		console.log('STG REC: ', stgRec);
        // 1. Insert into STG_Script table
        connection.query('Insert into logoshealth.stg_script Set ?',stgRec, function (error, results, fields) {
	    	if (error) {
            	console.log('The Error in insert is: ', error);
    			closeConnection(connection);
    			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in setTranscriptDetailsParent - Insert.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
        	} else {
				closeConnection(connection); //all is done so releasing the resources
				sessionAttributes.stgScriptId = results.insertId;
				if (qnaObj.uniqueStepId == sessionAttributes.maxScriptId - 1 ||qnaObj.uniqueStepId == sessionAttributes.maxScriptId) {
					console.log('setTranscriptDetailsParent - State Mgmt - Final Step completed - Setting Processor to Main Menu for short interview');
					sessionAttributes.currentProcessor = 5;
					sessionAttributes.scriptComplete = true;
				}
				//console.log('STG_SCRIPT successfully record created!!  ID = '+sessionAttributes.stgScriptId);
				setConversation(newRec, qnaObj, session, callback);
				//setTranscriptDetailsChild(newRec, sessionAttributes.stgScriptId, qnaObj, session, callback);
			}

		});
	} else {
        //console.log("DBUtil.setTranscriptDetailsParent Into the else condition: Is New Record? >>>>> "+newRec);

		//MM 6-10-17 Check if script has completed - IF so, marking staging record as complete and goto main menu
		if (qnaObj.uniqueStepId == sessionAttributes.maxScriptId - 1 ||qnaObj.uniqueStepId == sessionAttributes.maxScriptId) {
			//MM 6-10-17 ***Automatically Confirm Profile for demo purposes***

			updateSQL = "Update logoshealth.stg_script Set uniquestepid=" + sessionAttributes.maxScriptId + ", complete = 'Y' where stg_scriptid="+sessionAttributes.stgScriptId;
            //console.log('STG Complete loop, ' + updateSQL);
        	connection.query(updateSQL,function(error, results,fields) {
        		if (error) {
            		console.log('The Error in update is: ', error);
    				closeConnection(connection);
    				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in setTranscriptDetailsParent - Update Complete.  Restarting LogosHealth.  Please say your first name.";
					helper.callRestart(session.attributes.accountid, errResponse, session, callback);
        		} else {
					closeConnection(connection); //all is done so releasing the resources
					//MM 6-11-17 Script is complete respond with confirmation and set currentProcessor to Main Menu
					console.log('setTranscriptDetailsParent - State Mgmt - Final Step completed - Setting Processor to Main Menu');
					sessionAttributes.currentProcessor = 5;
					sessionAttributes.scriptComplete = true;

					//MM 6-14-17 Adding "Prototype" functionality to confirm user once profile create is complete to allow user to continue to additional interviews
					if (sessionAttributes.scriptName == 'Create a New Primary Profile' || sessionAttributes.scriptName == 'Create a New Profile - Not primary - User adding own record' || sessionAttributes.scriptName == 'Add a Family Member Profile - User is Primary' || sessionAttributes.scriptName == 'Add a Family Member Profile - User is Not Primary'){
						setProfileConfirmed(newRec, sessionAttributes.stgScriptId, qnaObj, session, callback);
					} else{
						setConversation(newRec, qnaObj, session, callback);
						//setTranscriptDetailsChild(newRec, sessionAttributes.stgScriptId, qnaObj, session, callback);
					}

				  }
        		});

		} else {
			updateSQL = "Update logoshealth.stg_script Set uniquestepid="+qnaObj.uniqueStepId+" where stg_scriptid="+sessionAttributes.stgScriptId;
            //console.log('STG Update loop,  '+ sessionAttributes.stgScriptId);
	       	connection.query(updateSQL,function(error, results,fields) {
        		if (error) {
            		console.log('The Error in update is: ', error);
    				closeConnection(connection);
    				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in setTranscriptDetailsParent - Update.  Restarting LogosHealth.  Please say your first name.";
					helper.callRestart(session.attributes.accountid, errResponse, session, callback);
        		} else {
					//console.log('The record updated into STG_SCRIPT successfully and now calling STG_Record table function!!');
					closeConnection(connection); //all is done so releasing the resources
					setConversation(newRec, qnaObj, session, callback);
					//setTranscriptDetailsChild(newRec, sessionAttributes.stgScriptId, qnaObj, session, callback);
					}
        		});
			}

    	}
}//function ends here

//VG 4/13|Purpose: Set the STG tables with processed information
//keyID will be the key from parent table STG_Script table
//MM 6-10-17 Bypass loadcreate and go directly to getScriptDetails for the next question.  The parent call handles if the script has been completed so no need to handle here.
function setTranscriptDetailsChild(newRec, keyId, qnaObj, session, callback){
   console.log("DBUtil.setTranscriptDetailsChild called with param >>>>> "+keyId);
   console.log("DBUtil.setTranscriptDetailsChild called with newRec >>>>> "+newRec);
	var sessionAttributes = session.attributes;
	var questionId;

	/*if(qnaObj !==null){
		console.log('DBUtil.setTranscriptDetailsChild qnaObj', qnaObj);
	} else{
		console.log('DBUtil.setTranscriptDetailsChild qnaObj is null');
	}*/

    //Only insert when the table changes
    if (newRec) {

        var connection = getLogosConnection();
        var sessionAttributes = session.attributes;
        var profileId = sessionAttributes.profileid;
        var stgRec = {stg_scriptid:keyId, table:qnaObj.answerTable,recordid:sessionAttributes.tableId,createdby:profileId,modifiedby:profileId};
   		console.log("DBUtil.setTranscriptDetailsChild called for insert stgRec >>>>> ", stgRec);

        // 1. Insert into STG_Record table
            //console.log('STG Child Intert loop', stgRec);
			connection.query('Insert into logoshealth.stg_records Set ?',stgRec, function (error, results, fields) {
			if (error) {
				console.log('The Error is: ', error);
    			closeConnection(connection);
    			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in setTranscriptDetailsChild - Main.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
			} else {
				//console.log('The record inserted into STG_RECORDS successfully!!');
				closeConnection(connection); //all is done so releasing the resources
				console.log('Success setTranscriptDetailsChild and Result is >>'+results.insertId);

				if (qnaObj.eventSpecific !== null && qnaObj.eventSpecific.toLowerCase() == 'y') {
    				//console.log("DBUtil.setTranscriptDetailsChild GetEventDetails Loop1 ");
					sessionAttributes.currentProcessor = 3 //Continue Q&A - placed here in case it is in the last question in the main script, but has event driven questions still
					getEventDetails(qnaObj, session, callback);
				} else {
					questionId = qnaObj.uniqueStepId + 1;
					getScriptDetails(questionId, sessionAttributes.scriptName, sessionAttributes.logosname, session, callback, false);
					//loadProfileCreateContinueFromStaging(session.attributes.logosname, session.attributes.profileid, session.attributes.userHasProfile, session.attributes.profileComplete, session, callback);
				}
			}

			});
    } else if (!isEmpty(qnaObj.eventQNArr) && qnaObj.eventQNArr.isInsertNewRow == true) {
        var connection = getLogosConnection();
        var sessionAttributes = session.attributes;
        var profileId = sessionAttributes.profileid;
		var eventQNArr = qnaObj.eventQNArr;
        var stgRec = {stg_scriptid:keyId, table:eventQNArr.answerTable,recordid:eventQNArr.eventTableId,createdby:profileId,modifiedby:profileId};

		//console.log('STG Child Insert Event loop', stgRec);
		connection.query('Insert into logoshealth.stg_records Set ?',stgRec, function (error, results, fields) {
			if (error) {
				console.log('The Error is: ', error);
    			closeConnection(connection);
    			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in setTranscriptDetailsChild - Event.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
			} else {
				//console.log('The record inserted into STG_RECORDS - event loop successfully!!');
				closeConnection(connection); //all is done so releasing the resources
				if (qnaObj.eventSpecific !== null && qnaObj.eventSpecific.toLowerCase() == 'y') {
    				//console.log("DBUtil.setTranscriptDetailsChild GetEventDetails Loop1 ");
					sessionAttributes.currentProcessor = 3 //Continue Q&A - placed here in case it is in the last question in the main script, but has event driven questions still
					getEventDetails(qnaObj, session, callback);
				} else {
					questionId = qnaObj.uniqueStepId + 1;
					getScriptDetails(questionId, sessionAttributes.scriptName, sessionAttributes.logosname, session, callback, false);
					//loadProfileCreateContinueFromStaging(session.attributes.logosname, session.attributes.profileid, session.attributes.userHasProfile, session.attributes.profileComplete, session, callback);
				}
			}

		});
	} else {
		//********Check w/ Vikram concerning logic in this loop****************
    	//console.log('DBUtil.setTranscriptDetailsChild Is Event Specific:' + qnaObj.eventSpecific.toLowerCase());
    	//console.log('DBUtil.setTranscriptDetailsChild eventScriptSeq:' + qnaObj.eventQNArr.eventScriptSeq);
    	//console.log('DBUtil.setTranscriptDetailsChild maxEventSeq:' + qnaObj.eventQNArr.maxEventSeq);

		//MM 6-13-17 If this is the last event driven question in interview, move to next main question.  Otherwise, loop to next event driven question
		if (qnaObj.eventSpecific !== null && qnaObj.eventSpecific.toLowerCase() == 'y') {
			if(!isEmpty(qnaObj.eventQNArr) && qnaObj.eventQNArr.eventScriptSeq == qnaObj.eventQNArr.maxEventSeq && qnaObj.eventQNArr.eventScriptSeq > 0){
				//console.log('Loop 3-1');
				questionId = qnaObj.uniqueStepId + 1;
				getScriptDetails(questionId, sessionAttributes.scriptName, sessionAttributes.logosname, session, callback, false);
			} else {
				//console.log('Loop 3-2');
				sessionAttributes.currentProcessor = 3 //Continue Q&A - placed here in case it is in the last question in the main script, but has event driven questions still
				getEventDetails(qnaObj, session, callback);
			}

		} else {
    		//console.log("DBUtil.setTranscriptDetailsChild GetEventDetails Loop4 ");
			questionId = qnaObj.uniqueStepId + 1;
			getScriptDetails(questionId, sessionAttributes.scriptName, sessionAttributes.logosname, session, callback, false);
			//loadProfileCreateContinueFromStaging(session.attributes.logosname, session.attributes.profileid, session.attributes.userHasProfile, session.attributes.profileComplete, session, callback);
		}
	}
}//function ends here

//SECTION LOAD USER AND CORRESPONDING INFO

//VG 2/25|Purpose: Insert a new Account Information in DB
function createNewAccountIDFromEmail(vEmail, session, callback, connection)
{
    var connection = getLogosConnection();
	var accountRec = {email:vEmail, password:'vgtiger',createdby:'1',modifiedby:'1'};
	connection.query('Insert into logoshealth.Account Set ?',accountRec, function (error, results, fields) {
	if (error) {
            console.log('The Error is: ', error);
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in createNewAccountIDFromEmail.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
        } else {
			console.log('The record seems inserted successfully and now calling LoadAccountIDFromEmail again!!');
			closeConnection(connection);
			loadAccountIDFromEmail(vEmail, session, callback); //Semi-Recursive call. New buzzword from VG.
		}
	});
}

//Load Account ID based on Email registered with the Alexa
function loadAccountIDFromEmail(email, session, callback) {
	console.log("DBUtil.getAccountFromEmail called with param >>>>> "+email);
	console.log("Session Attributes >>>>> ", session.attributes);

	//session.attributes.accountEmail = email;
	var connection = getLogosConnection();
	var accountid = "";
	connection.query("SELECT accountid FROM logoshealth.Account where email = '"+ email + "'" , function (error, results, fields) {
        if (error) {
            console.log('The Error is: ', error);
    		closeConnection(connection);
    		var errResponse = "There is an error in processing this request - no data found.  If it continues, please contact app support and say error in loadAccountIDFromEmail.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
                for (var res in results) {
                    console.log('DBUtils - Email found from account table >>>> : ', results[res]);
                    accountid = results[res].accountid;
                    helper.displayWelcomeMsg(accountid, email, session, callback);
				    console.log('DBUtils - AccountID from email inside loop>>> : ', accountid);
                }
				connection.end();
            } else {
	            connection.end();
				createNewAccountIDFromEmail(email, session, callback, connection);
			}
        }
    });
    console.log('DBUtils - AccountID from email outside of loop near return>>> : ', accountid);
    return accountid;
}

//check if account has any profile associated to it, if not new one to be primary
function checkIfAccountHasAnyPrimaryProfile(userName, profileId, hasProfile, accountId, profileComplete, session, callback){
	var connection = getLogosConnection();
	//check if any profile exists for this account
	var sql = "select * from logoshealth.profile where accountid="+accountId+" and lower(primaryflag) = 'y' ";
	console.log("DBUtil.getUserProfileByName - Initiating SQL call "+sql);
	var isPrimary = true;
	var primaryFirstName = "";
	var primaryProfileId = 0;

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil.checkIfProfileHasPrimaryProfile : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in checkIfAccountHasAnyPrimaryProfile.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
				if (results[0].profileid == profileId) {
					console.log("DBUtil.getUserProfileByName : Profiled ID matches primary - primary account >>>>>"+results[0].logosname);
                	isPrimary = true;
                	primaryFirstName = results[0].firstname;
                	primaryProfileId = results[0].profileid;
				} else {
					console.log("DBUtil.getUserProfileByName : Profiled ID does not match primary - primary account >>>>>"+results[0].logosname);
                	isPrimary = false;
                	primaryFirstName = results[0].firstname;
                	primaryProfileId = results[0].profileid;
				}
			} else {
				console.log("DBUtil.getUserProfileByName : No primary profile found for account.  set current user to primary - primary account >>>>>"+userName);
                isPrimary = true;
			}
        }
        connection.end();
        session.attributes.isPrimaryProfile = isPrimary;
        session.attributes.primaryAccHolder = primaryFirstName;
        session.attributes.primaryProfileId = primaryProfileId;
        //process user response
        if (!hasProfile) {
        	helper.processNameIntent(userName, profileId, hasProfile, profileComplete, session, callback);
        } else {
        	loadProfileCreateContinueFromStaging(userName, profileId, hasProfile, profileComplete, session, callback);
        }
    });
}

function loadUserAccounts() {
	var connection = getLogosConnection();
	var accountsArr = [];
	connection.query('SELECT * FROM logoshealth.Account', function (error, results, fields) {
        if (error) {
            console.log('The Error is: ', error);
        } else {
            if (results !== null && results.length > 0) {
                for (var res in results) {
                    //console.log('DBUtils - Record row is >>>> : ', results[res]);
                    accountsArr.push(results[res]);
                }
            }
            connection.end();
        }
    });
    return accountsArr;
}

//MM 6-27-17 Checks for staging records which have not been completed for profile
function checkForInProgressInStaging(profileId, session, callback){
	var connection = getLogosConnection();
	//check if any profile exists for this account
	var sql = "select s.stg_scriptid, s.scriptname, s.uniquestepid, s.subjectprofileid, p.logosname, s.modifieddate from logoshealth.stg_script s LEFT JOIN logoshealth.profile p ON s.subjectprofileid = p.profileid where s.complete = 'N' and s.profileid = "+profileId+ " order by s.modifieddate desc";
	console.log("checkForInProgressInStaging >>>>> "+sql);
	var stageRec = 0;
	var sessionAttributes = session.attributes;

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('checkForInProgressInStaging : The Error is: ', error);
			connection.end();
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in checkForInProgressInStaging.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
				stageRec = results[0].stg_scriptid;
                //console.log("DBUtil.checkForInProgressInStaging : Staging Count >>>>>"+results.length);
				connection.end();
				if (results.length > 0) {
					var questionId = results[0].uniquestepid;
					questionId = questionId + 1;
					var scriptName = results[0].scriptname;
					sessionAttributes.scriptName = scriptName;
					var userName = sessionAttributes.logosname;
					sessionAttributes.stgScriptId = results[0].stg_scriptid;
					if (results[0].subjectprofileid !==null){
						sessionAttributes.subjectLogosName = results[0].logosname;
						sessionAttributes.subjectProfileId = results[0].subjectprofileid;
						sessionAttributes.onBehalfOf = true;
						sessionAttributes.stagingContinueText = 'Continuing '+scriptName+ ' for '+results[0].logosname+ '.  ';
						sessionAttributes.continueInProgress = true;
					} else {
						sessionAttributes.stagingContinueText = 'Continuing '+scriptName+ '.  ';
						sessionAttributes.continueInProgress = true;
					}
        			getStagingTable(questionId, scriptName, userName, session, callback, false);
				} else {
	    			var errResponse = "You have no in-progress interviews outstanding.  Main Menu.  For a list of options, simply say Menu.";
					var processor = 5 //return to main menu
					helper.processErrResponse(errResponse, processor, session, callback);
				}
            } else {
		        connection.end();
    			var errResponse = "You have no in-progress interviews outstanding.  Main Menu.  For a list of options, simply say Menu.";
				var processor = 5 //return to main menu
				helper.processErrResponse(errResponse, processor, session, callback);
			}
        }
    });
}

//MM 6-27-17 Get Table and Table ID from Staging records
function getStagingTable(questionId, scriptName, userName, session, callback, retUser){
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;

	var sql = "select `table`, recordid from logoshealth.stg_records where stg_scriptid = "+sessionAttributes.stgScriptId+ " order by modifieddate desc";
	//console.log("DBUtil.getStagingTable - Initiating SQL call "+sql);
	connection.query(sql, function (error, results, fields) {
        if (error) {
        	connection.end();
            console.log('DBUtil.getStagingTable : The Error is: ', error);
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getStagingTable.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
				sessionAttributes.tableId = results[0].recordid;
				sessionAttributes.currentTable = results[0].table;
				if (sessionAttributes.currentTable == 'medicalevent') {
					sessionAttributes.medicaleventid = results[0].recordid;
				}
				connection.end();
				if(scriptName.indexOf("Profile") != -1) {
		       		getScriptDetails(questionId, scriptName, userName, session, callback, false);
				} else {
					getFieldFromQuestion (questionId, scriptName, userName, session, callback);
				}
 			} else {
				connection.end();
				var errResponse = "There is an error in retrieving staging records.  If it continues, please contact app support and say error in getStagingTable.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
			}
        }
    });
}

//MM 6-27-17 Gets the field value from question table
function getFieldFromQuestion (questionId, scriptName, slotValue, session, callback) {
	var connection = getLogosConnection();
    var vSQL3;

	//MM 6-10-17 Gets the field name from the min uniquestepid for this script
    vSQL3="SELECT q.answerfield, q.answerkeyfield from logoshealth.script s, logoshealth.question q where s.questionid=q.questionid and s.uniquestepid = (SELECT min(uniquestepid) as value FROM logoshealth.script s, logoshealth.question q where s.questionid=q.questionid and scriptname='"+scriptName+"')";
	//console.log('getFieldFromQuestion SQL: ' +vSQL3);
	connection.query(vSQL3, function (error, results, fields) {
		if (error) {
            console.log('DBUtils.getFieldFromQuestion Error. the Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getFieldFromQuestion.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
    	} else {
			if (results !== null && results.length > 0) {
				var vFields = results[0].answerfield;
				vFields=vFields.split(",");
				var intIndex = vFields.length - 1;
				var strField = vFields[intIndex];
				strField = strField.trim();
				var strKeyField = results[0].answerkeyfield;
				console.log('DBUtils.getFieldFromQuestion strField: '+strField+' strKeyField: '+strKeyField);
				closeConnection(connection); //all is done so releasing the resources
				getFieldDataValue (questionId, scriptName, slotValue, session, callback, strField, strKeyField);
			} else {
				closeConnection(connection); //all is done so releasing the resources
				var errResponse = "There is an error in processing this request - no data found.  If it continues, please contact app support and say error in getFieldFromQuestion.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
			}
		}
	});
}

//MM 6-27-17 Gets the actual value from data table for additional context.  Adds to staging continue text and forwards to resume interview from last point in staging
function getFieldDataValue (questionId, scriptName, slotValue, session, callback, strField, strKeyField) {
	var connection = getLogosConnection();
    var vSQL3;
	var sessionAttributes = session.attributes;

	//MM 6-10-17 Gets the field name from the min uniquestepid for this script
    vSQL3="SELECT "+strField+ " as value from logoshealth."+sessionAttributes.currentTable+" where "+strKeyField+" = "+sessionAttributes.tableId;
	//console.log('getFieldDataValue SQL: ' +vSQL3);
	connection.query(vSQL3, function (error, results, fields) {
		if (error) {
            console.log('DBUtils.getFieldDataValue Error. the Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getFieldDataValue.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
    	} else {
			if (results !== null && results.length > 0) {
				var strValue = results[0].value;
				console.log('DBUtils.getFieldDataValue strValue: '+strValue);
				sessionAttributes.stagingContinueText = sessionAttributes.stagingContinueText + 'Name equals '+strValue+'.  ';
				closeConnection(connection); //all is done so releasing the resources
		       	getScriptDetails(questionId, scriptName, slotValue, session, callback, false);
			} else {
				closeConnection(connection); //all is done so releasing the resources
				var errResponse = "There is an error in processing this request - no data found.  If it continues, please contact app support and say error in getFieldDataValue.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
			}
		}
	});
}

//MM 6-10-17 ***This function is only for continuing a create profile interview script and will only be triggered if the profile has been started but not yet completed
//MM 6-15-17 Changed name to loadProfileCreateContinueFromStaging
function loadProfileCreateContinueFromStaging(userName, profileId, hasProfile, profileComplete, session, callback) {
   	var connection = getLogosConnection();
    var questionId = 0;
    var isPrimary = session.attributes.isPrimaryProfile;

    //console.log("DBUtil.loadProfileCreateContinueFromStaging called for the first time, is it? "+session.attributes.retUser);
    var retUser = false;
    // Get max available question id from staging using profile id
    //if no record found that mean user to start with First Question else max +1 question onwards
	console.log('DBUtil.loadProfileCreateContinueFromStaging - Profiled ID = '+profileId);

	var sqlQuery = "select s.uniquestepid as uniquestepid, s.stg_scriptid, s.complete from logoshealth.stg_script s, logoshealth.stg_records r where s.stg_scriptid = r.stg_scriptid and r.table = 'profile' and r.recordid = "+profileId;
    connection.query(sqlQuery, function (error, results, fields) {
	if (error) {
    	console.log('The Error is: ', error);
		closeConnection(connection); //all is done so releasing the resources
		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in loadProfileCreateContinueFromStaging.  Restarting LogosHealth.  Please say your first name.";
		helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
    } else {
		console.log('DBUtil.loadProfileCreateContinueFromStaging - The Staging Question ID found as '+results[0].uniquestepid);
		console.log('DBUtil.loadProfileCreateContinueFromStaging - The Staging Complete found as '+results[0].complete);
		if (results.length > 0) {
			if(results[0].complete == 'Y') {
				questionId = results[0].uniquestepid - 1;
			} else {
				questionId = results[0].uniquestepid + 1;
			}
			//MM 6-12-17 Added stgscriptid
			session.attributes.stgScriptId = results[0].stg_scriptid;
			session.attributes.profileid = profileId;
			if (session.attributes.retUser == undefined) {
    			retUser = true;
    		}
		}
        closeConnection(connection); //all is done so releasing the resources
	}
    var scriptName = "Create a New Primary Profile";
    if(!isPrimary) {
    	scriptName = "Create a New Profile - Not primary - User adding own record";
    }
    //console.log('DBUtil.loadProfileCreateContinueFromStaging - is User returing? '+retUser);
    getScriptDetails(questionId, scriptName, userName, session, callback, retUser);
	});
}

//SECTIONS TASK/EXERCISE - FOR SINGLE STATEMENT TASK/EXERCISE ENTRIES
//MM 7-2-18 Adding function to add diet - four cases - "I, me" - process current Profile ID, single family member, retrieve proper profile id, "we" process for whole family, has "and" in name, split and process
function processTaskExercise (intent, session, callback) {
	var sessionAttributes = session.attributes;
	var strName = intent.slots.Name.value;
	//var strFood = intent.slots.Food.value;
	//var strMeal = intent.slots.Meal.value;

	if (strName == undefined) {
		strName = 'i';
	}
	if (strName.toLowerCase() == 'i' || strName.toLowerCase() == 'me' || strName.toLowerCase() == 'myself') {
		saveTaskExercise(sessionAttributes.profileid, 'you', true, intent, session, callback);
	} else if (strName.toLowerCase() == 'we') {
		getProfileIdsByAccountForTaskExercise(sessionAttributes.accountid, intent, session, callback);
	} else if (strName.indexOf(" ") != -1) {
		var strNames = strName.split(" ");
		getProfileIdsByNameForTaskExercise(strNames, intent, session, callback);
	} else {
		getProfileIdsByNameForTaskExercise(strName, intent, session, callback);
	}
}

//MM 7-2-18 Save task/exercise record - exit and send response if exitAfter = true
function saveTaskExercise(varProfileId, strFor, exitAfter, intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;

	var strName = intent.slots.Name.value;
	var strTasks = intent.slots.Tasks.value;
	var strNum = null;
	var strDuration = null;

	if (intent.slots.Duration !== undefined) {
		if (intent.slots.Duration.value !== undefined) {
			strDuration = intent.slots.Duration.value;
			console.log('Duration has value');
		} else {
			console.log('Duration.value is undefined');
		}
	} else {
		console.log('Duration is undefined');
	}

	if (intent.slots.Num !== undefined) {
		console.log ('Num is defined');
		if (intent.slots.Num.value !== undefined) {
			strNum = intent.slots.Num.value;
			console.log('Num has value');
		} else {
			console.log('Num value is undefined');
			if (strDuration == null) {
				strNum = 1;
				console.log("strDuration undefined");
			} else {
				console.log("strDuration is defined");
			}
		}
	} else {
		if (strDuration == null) {
			strNum = 1;
			console.log("strDuration undefined");
		} else {
			console.log("strDuration is defined");
		}
	}

	console.log (" saveTaskExercise StrNum: " + strNum + ", strDuration: " + strDuration);
	var varRec = {};
    var vSQL3;

	var blnIsExercise = false;
	var blnHasGoal = false;

	var qnaObj = sessionAttributes.qnaObj;

	var checkSQL = "select goalid, version, goalname, goaltype from logoshealth.goal where activeflag = 'Y' and profileid = " + varProfileId +
	  " and lower(substring(goalname,1,3)) = '" + strTasks.substring(0, 3).toLowerCase() + "'";

	  console.log("saveTaskExercise - checkSQL: " + checkSQL);
	  connection.query(checkSQL, function (error, results, fields) {
		if (error) {
            console.log('DBUtils.saveTaskExercise checkGoal Error. the Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in saveTaskExercise - check for goal.  Restarting LogosHealth.  Main Menu.  For a list of options, simply say, Menu.";
			helper.gotoMainMenu(errResponse, session, callback);
    	} else {
			if (results[0] !== null && results[0] !== undefined) {
				if (results[0].goaltype !== null && results[0].goaltype !== undefined && results[0].goaltype !== "") {
					blnHasGoal = true;
					console.log("Found goal in saveTaskExercise: goalname = " + results[0].goalname + ", goaltype = " + results[0].goaltype);
					if (results[0].goaltype == 'exercise') {
						blnIsExercise = true;
						console.log('bln is exercise set to true loop:' + blnIsExercise);
					}
				}
			}
			if (!blnIsExercise) {
				console.log('Build task insert for saveTaskExercise');
				vSQL3 = 'Insert into logoshealth.task Set ?';
				qnaObj.answerTable = "task";
				varRec = {profileid:varProfileId,dateofmeasure:sessionAttributes.dateofmeasure,taskname:strTasks,goalname:strTasks,createdby:sessionAttributes.profileid,modifiedby:sessionAttributes.profileid};
				if(strNum !==undefined && strNum !==null){varRec.reps=strNum};
				if(strDuration !==undefined && strDuration !==null){varRec.tasktime=strDuration};
			} else {
				console.log('Build exercise insert for saveTaskExercise');
				vSQL3 = 'Insert into logoshealth.exercise Set ?';
				varRec = {profileid:varProfileId,dateofmeasure:sessionAttributes.dateofmeasure,exercisetype:strTasks,goalname:strTasks,createdby:sessionAttributes.profileid,modifiedby:sessionAttributes.profileid};
				if(strNum !==undefined && strNum !==null){varRec.reps=strNum};
				if(strDuration !==undefined && strDuration !==null){varRec.exercisetime=strDuration};
				qnaObj.answerTable = "exercise";
			}
			console.log('saveTaskExercise varRec: ', varRec);
			connection.query(vSQL3, varRec, function (error, results, fields) {
				if (error) {
					console.log('DBUtils.saveTaskExercise Error. the Error is: ', error);
					closeConnection(connection); //all is done so releasing the resources
					var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in saveTaskExercise.  Restarting LogosHealth.  Please say your first name.";
					helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
				} else {
					console.log('DBUtils.saveTaskExercise results.insertId: '+ results.insertId);
					sessionAttributes.tableId =  results.insertId;
					closeConnection(connection); //all is done so releasing the resources
					if(exitAfter){
						sessionAttributes.currentProcessor = 5;
						sessionAttributes.scriptComplete = true;
						if (blnHasGoal) {
							qnaObj.question = "Thanks!  The record has been saved for "+strFor+ ".  Main menu.  For a list of options, simply say menu.";
							checkGoal(session, qnaObj, callback);
						} else {
							var speechOutput = "Thanks!  The record has been saved for "+strFor+ ".  Main menu.  For a list of options, simply say menu.";
							helper.gotoMainMenu(speechOutput, session, callback);
						}
					}
				}
			});
		}
	});
}

//MM 7-2-18 Gets all profile IDs when adding task/exercise record for family (e.g. "We walked for 30 minutes.")
function getProfileIdsByAccountForTaskExercise(accountId, intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var strReturn = 'your family';

	//console.log('DBUtils.getProfileIdsByNameForDiet sqlNames: ', sqlNames);

    vSQL="SELECT profileid FROM logoshealth.profile where accountid="+ sessionAttributes.accountid + " and activeflag = 'Y'";
	//console.log("DBUtil.getProfileIdsByNameForDiet Query is  >>>>> " +vSQL);
	connection.query(vSQL, function (error, results, fields) {
		if (error) {
            console.log('DBUtils.getProfileIdsByAccountForTaskExercise Error. the Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getProfileIdsByAccountForTaskExercise.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
    	} else {
			//MM 6-24-17 If the on behalf of profile id is successfully retrieved, continue processing.  Otherwise raise the error back to user
			//console.log('DBUtils.processOnBehalfOf results gound. results length is : '+results.length);
			if (results !== null && results.length > 0) {
				console.log('DBUtils.getProfileIdsByAccountForTaskExercise Results: ', results);
				for (var j = 0; j < results.length; j++) {
					if(j == results.length -1){
						intProfileID = results[j].profileid;
						closeConnection(connection); //all is done so releasing the resources
						saveTaskExercise(intProfileID, strReturn, true, intent, session, callback);
					} else {
						intProfileID = results[j].profileid;
						saveTaskExercise(intProfileID, strReturn, false, intent, session, callback);
					}
				}
			} else {
				closeConnection(connection); //all is done so releasing the resources
    			var errResponse = "There is an error in processing this request - no data found.  If it continues, please contact app support and say error in getProfileIdsByAccountForDiet.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
			}
		}
	});
}

//MM 7-2-18 Gets all profile IDs when adding task/exercise for specific names (people)
function getProfileIdsByNameForTaskExercise(strNames, intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sqlNames = '';
	var strTemp = '';
	var countNames = 0;
	var intProfileID = 0;
	var strReturn = '';

	if (strNames.constructor === Array) {
		for (var i = 0; i < strNames.length; i++) {
			if (strNames[i].toLowerCase() == 'i' || strNames[i].toLowerCase() == 'me' || strNames[i].toLowerCase() == 'myself') {
				sqlNames = sqlNames + "'"+ sessionAttributes.logosname.toLowerCase()+"',";
				strReturn = strReturn + 'you' + ' and ';
			} else {
				strTemp = strNames[i].trim();
				sqlNames = sqlNames + "'"+ strTemp.toLowerCase() +"',";
				strReturn = strReturn + strTemp + ' and ';
			}
		}
		sqlNames = sqlNames.substring(0, sqlNames.length-1);
		strReturn = strReturn.substring(0, sqlNames.length-3);
		countNames = strNames.length;
	} else {
		sqlNames = "'"+ strNames.toLowerCase() +"'";
		strReturn = strNames;
		countNames = 1;
	}

	console.log('DBUtils.getProfileIdsByNameForTaskExercise sqlNames: ', sqlNames);

    vSQL="SELECT profileid FROM logoshealth.profile where lower(logosname) in (" + sqlNames + ") and accountid='"+ sessionAttributes.accountid +"' ";
	//console.log("DBUtil.getProfileIdsByNameForDiet Query is  >>>>> " +vSQL);
	connection.query(vSQL, function (error, results, fields) {
		if (error) {
            console.log('DBUtils.getProfileIdsByNameForTaskExercise Error. the Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getProfileIdsByNameForTaskExercise.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
    	} else {
			//MM 6-24-17 If the on behalf of profile id is successfully retrieved, continue processing.  Otherwise raise the error back to user
			//console.log('DBUtils.processOnBehalfOf results gound. results length is : '+results.length);
			if (results !== null && results.length > 0) {
				if (results.length !== countNames) {
					closeConnection(connection); //all is done so releasing the resources
    				var errResponse = "One or more family members within "+strNames+" could not be found.  You will need to add this family member through the main menu to continue.  Main menu.  For a list of options, simply say Menu.";
					var processor = 5 //return to main menu
					helper.processErrResponse(errResponse, processor, session, callback);
				} else {
					for (var j = 0; j < results.length; j++) {
						if(j == results.length -1){
							intProfileID = results[j].profileid;
							closeConnection(connection); //all is done so releasing the resources
							saveTaskExercise(intProfileID, strReturn, true, intent, session, callback);
						} else {
							intProfileID = results[j].profileid;
							saveTaskExercise(intProfileID, strReturn, false, intent, session, callback);
						}
					}
				}
			} else {
				closeConnection(connection); //all is done so releasing the resources
    			var errResponse = "One or more family members within "+strNames+" could not be found.  You will need to add this family member through the main menu to continue.  Main menu.  For a list of options, simply say Menu.";
				var processor = 5 //return to main menu
				helper.processErrResponse(errResponse, processor, session, callback);
			}
		}
	});
}

//SECTION MOOD - FOR ALL MOOD INSTANT RECORD
//MM 7-24-18 Adding function
function processMood (intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var strMood = intent.slots.Mood.value;
	var dtDateofMeasure = session.attributes.dateofmeasure;
	var sql;
	var sql1;
	var sql2;

	if (strMood == undefined) {
		var errResponse = "I did not understand the mood you were trying to capture.  Main Menu.  For a list of options, simply say, Menu.";
		helper.gotoMainMenu(errResponse, session, callback);
	} else {
		sql1 = "insert into logoshealth.mood (mood, ";
		sql2 = "values ('" + strMood + "', ";

		sql1 = sql1 + "dateofmeasure, profileid, createdby, modifiedby) ";
		sql2 = sql2 + "'" + dtDateofMeasure + "', " + sessionAttributes.profileid + ", " + sessionAttributes.profileid + ", " + sessionAttributes.profileid + ")" ;
		sql = sql1 + sql2;

		console.log('processMood final SQL: ' + sql);
		connection.query(sql, function (error, results, fields) {
			if (error) {
				closeConnection(connection);
				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in processMood.  Restarting LogosHealth.  Main menu.  For a list of options, simply say, menu.";
				helper.gotoMainMenu(errResponse, session, callback);
			} else {
				console.log('processMood record saved: ' + results.insertId);
				closeConnection(connection);
				speechOutput = "Thanks!  Your mood has been captured.  Main menu.  For a list of options, simply say menu.";
				helper.gotoMainMenu(speechOutput, session, callback);
			}
		});
	}
}

//SECTION BLOOD GLUCOSE - FOR ALL BLOOD GLUCOSE INSTANT RECORDS
//MM 7-17-18 Adding function for sleep summary - four cases - "I, me" - process current Profile ID, single family member, retrieve proper profile id, "we" process for whole family, has "and" in name, split and process
function processBloodGlucose (intent, session, callback) {
	var sessionAttributes = session.attributes;
	var strName = intent.slots.Name.value;

	if (strName == undefined) {
		strName = 'my';
	} else if (strName.indexOf("'") != -1) {
		var strSplit = strName.split();
		strName = strSplit[0];
	}
	if (strName.toLowerCase() == 'my' || strName.toLowerCase() == 'mine' || strName.toLowerCase() == 'i') {
		saveBloodGlucose(sessionAttributes.profileid, 'you', true, intent, session, callback);
	} else {
		getProfileIdsByNameForX('BloodGlucose', strName, intent, session, callback);
	}
}

//MM 7-26-18 Adding function
function saveBloodGlucose (varProfileId, strFor, exitAfter, intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var strResult = intent.slots.Result.value;
	var dtDateofMeasure = session.attributes.dateofmeasure;
	var sql;
	var sql1;
	var sql2;

	if (strResult == undefined) {
		var errResponse = "I did not understand the lab result you were trying to capture.  Main Menu.  For a list of options, simply say, Menu.";
		helper.gotoMainMenu(errResponse, session, callback);
	} else {
		sql1 = "insert into logoshealth.lab (labnametext, labresult, ";
		sql2 = "values ('Blood Glucose', '" + strResult + "', ";

		sql1 = sql1 + "dateofmeasure, profileid, createdby, modifiedby) ";
		sql2 = sql2 + "'" + dtDateofMeasure + "', " + sessionAttributes.profileid + ", " + sessionAttributes.profileid + ", " + sessionAttributes.profileid + ")" ;
		sql = sql1 + sql2;

		console.log('saveBloodGlucose final SQL: ' + sql);
		connection.query(sql, function (error, results, fields) {
			if (error) {
				closeConnection(connection);
				console.log('Error in saveBloodGlucose: ' + error);
				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in saveBloodGlucose.  Restarting LogosHealth.  Main menu.  For a list of options, simply say, menu.";
				helper.gotoMainMenu(errResponse, session, callback);
			} else {
				console.log('processMood record saved: ' + results.insertId);
				closeConnection(connection);
				speechOutput = "Your blood glucose record with a result of " + strResult +" has been captured.  You can review and confirm this record in the Logos Health visual app.  Main menu.  For a list of options, simply say menu.";
				helper.gotoMainMenu(speechOutput, session, callback);
			}
		});
	}
}



//SECTION SLEEP - FOR ALL INCLUDED SLEEP SUMMMARY INSTANT RECORD
//MM 7-17-18 Adding function for sleep summary - four cases - "I, me" - process current Profile ID, single family member, retrieve proper profile id, "we" process for whole family, has "and" in name, split and process
function processSleepSummary (intent, session, callback) {
	var sessionAttributes = session.attributes;
	var strName = intent.slots.Name.value;

	if (strName == undefined) {
		strName = 'i';
	}
	if (strName.toLowerCase() == 'i' || strName.toLowerCase() == 'me' || strName.toLowerCase() == 'myself') {
		saveSleepSummary(sessionAttributes.profileid, 'you', true, intent, session, callback);
	} else if (strName.toLowerCase() == 'we') {
		getProfileIdsByAccountForX('SleepSummary', intent, session, callback);
	} else if (strName.indexOf(" ") != -1) {
		var strNames = strName.split(" ");
		getProfileIdsByNameForX('SleepSummary', strNames, intent, session, callback);
	} else {
		getProfileIdsByNameForX('SleepSummary', strName, intent, session, callback);
	}
}

//MM 7-17-18 Save sleep summary record - exit and send response if exitAfter = true
function saveSleepSummary(varProfileId, strFor, exitAfter, intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var dtDateofMeasure = session.attributes.dateofmeasure;

	var strTime = null;
	var sleepStart = null;
	var wakeTime = null;
	var blnSave = true;
	var hasStartStop = true;
	var hasSleepStart = false;
	var hasSleepStop = false;


	if (intent.slots !==undefined) {
		if (intent.slots.SleepTime !== undefined) {
			if (intent.slots.SleepTime.value !== undefined) {
				strTime = intent.slots.SleepTime.value;
				console.log('SleepTime has value');
			} else {
				console.log('SleepTime is undefined');
			}
		} else {
			console.log('Sleep is undefined');
		}
		if (intent.slots.SleepStart !== undefined) {
			if (intent.slots.SleepStart.value !== undefined) {
				sleepStart = intent.slots.SleepStart.value;
				console.log('SleepStart has value: ' + sleepStart);
			} else {
				console.log('SleepStart is undefined');
			}
		} else {
			console.log('Sleep is undefined');
		}
		if (intent.slots.WakeTime !== undefined) {
			if (intent.slots.WakeTime.value !== undefined) {
				wakeTime = intent.slots.WakeTime.value;
				console.log('WakeTime has value: ' + wakeTime);
			} else {
				console.log('WakeTime is undefined');
			}
		} else {
			console.log('WakeTime is undefined');
		}
	} else {
		console.log("Slot undefined...intent.slots = ", intent.slots);
	}


	var sql1 = "insert into logoshealth.sleep (";
	var sql2 = "values (";

	if (strTime !== null && strTime !== "") {
		sql1 = sql1 + "hoursslepttext, hoursslept, ";
		sql2 = sql2 + "'" + strTime + "', " + sessionAttributes.sleepValueId + ", ";
	}

	if ((sleepStart !== null && sleepStart !== "") || (sessionAttributes.confirmTime !== undefined && sessionAttributes.confirmTime.sleepTimeFinal !== ""))  {
		sql1 = sql1 + "starttime, ";
		hasSleepStart = true;
		if (sleepStart !== null && sleepStart !== "") {
			var sleepSplit = sleepStart.split(":");
			var sleepHour = sleepSplit[0];
			var sleepMinute = sleepSplit[1];
			console.log('SleepHour: ' + sleepHour + ': ' + 'SleepMinute: ' + sleepMinute);
		}
	} else {
		hasStartStop = false;
	}
	if ((wakeTime !== null && wakeTime !== "") || (sessionAttributes.confirmTime !== undefined && sessionAttributes.confirmTime.wakeTimeFinal !== "")) {
		sql1 = sql1 + "waketime, ";
		hasSleepStop = true;
		if (wakeTime !== null && wakeTime !== "") {
			var wakeSplit = wakeTime.split(":");
			var wakeHour = wakeSplit[0];
			var wakeMinute = wakeSplit[1];
			console.log('WakeHour: ' + wakeHour + ': ' + 'WakeMinute: ' + wakeMinute);
		}
	} else {
		hasStartStop = false;
	}

	//MM 07-18-18 - Logic for verifying the times which have come through the AMAZON.TIME variable.  If user does not say "PM", then time values will always be under 12
	//
	if (hasStartStop) {
		var dtNow =new Date();
		var momentNow = moment(dtNow);
		var hourNow;
		var sleepHourPM = Number(sleepHour) + 12;
		var wakeHourPM = Number(wakeHour) + 12;
		var sleepTimeFinal;
		var wakeTimeFinal;
		var sleepTimeFinalCheck = "";
		var wakeTimeFinalCheck;
		var blnInvalid = false;
		var blnConfirm = false;
		var sleepIsPM = false;
		var wakeIsPM = false;
		var canAdjustWake = false;
		var sleepDuration;
		var blnSureSave = false;

		if (sessionAttributes.userTimezone !== undefined && sessionAttributes.userTimezone !== null && sessionAttributes.userTimezone !== "") {
			hourNow = momentNow.tz(sessionAttributes.userTimezone).format('HH');
		} else {
			hourNow = momentNow.format('HH');
		}

		console.log('Hour Now: ' + hourNow + " Wake Hour PM: " + wakeHourPM);

		if (sessionAttributes.confirmTime !== undefined) {
			if (sessionAttributes.confirmTime.confirmed) {
				blnSureSave = true;
			}
		}

		if (!blnSureSave) {
			//if both hours are in PM
			if (sleepHourPM > 23) {
				sleepIsPM = true;
				sleepTimeFinal = sleepHour + ":" + sleepMinute + ":00";
			}
			if (wakeHourPM > 23) {
				wakeIsPM = true;
				wakeTimeFinal = wakeHour + ":" + wakeMinute + ":00";
			}
			if (wakeHour > hourNow) {
				blnInvalid = true;
				blnSave = false;
				console.log("Wakehour: " + wakeHour + " hourNow: " + hourNow);
    			var invalidResponse = "I cannot record waking up in the future.  Main Menu.  For a list of options, simply say, Menu.";
			} else if (hourNow >= wakeHourPM) {
				canAdjustWake = true;
			}
		}

		if (canAdjustWake) {
			blnConfirm = true;
			blnSave = false;
			if (Number(wakeHour) >= Number(sleepHour)) {
				sleepDuration = Number(wakeHour) - Number(sleepHour);
			} else {
				sleepDuration = (24 - (Number(sleepHour) +12)) + Number(wakeHour);
			}
			console.log('Sleep Duration: ' + sleepDuration + ', wakeHour = ' + wakeHour + ', sleepHour = ' + sleepHour);
			if (sleepDuration >= 5) {
				if (Number(wakeHour)==0) {
					wakeTimeFinalCheck = "12:" + wakeMinute + " AM";
					wakeTimeFinal = wakeHour + ":" + wakeMinute + ":00";
				}else {
					wakeTimeFinalCheck = wakeHour + ":" + wakeMinute + " AM";
					wakeTimeFinal = wakeHour + ":" + wakeMinute + ":00";
				}

				if (wakeHour >= sleepHour) {
					if (Number(sleepHour)==0) {
						sleepTimeFinalCheck = "12:" + sleepMinute + " AM";
						sleepTimeFinal = sleepHour + ":" + sleepMinute + ":00";
					} else {
						sleepTimeFinalCheck = "12:" + sleepMinute + " AM";
						sleepTimeFinal = sleepHour + ":" + sleepMinute + ":00";
					}
				} else {
					if (Number(sleepHour)==0) {
						sleepTimeFinalCheck = "12:" + sleepMinute + " PM";
						sleepTimeFinal = sleepHourPM + ":" + sleepMinute + ":00";
					} else {
						sleepTimeFinalCheck = sleepHour + ":" + sleepMinute + " PM";
						sleepTimeFinal = sleepHourPM + ":" + sleepMinute + ":00";
					}
				}
				var confirmTime = {
					"sleepTimeFinal": sleepTimeFinal,
					"sleepTimeFinalCheck":sleepTimeFinalCheck,
					"wakeTimeFinal": wakeTimeFinal,
					"wakeTimeFinalCheck": wakeTimeFinalCheck,
					"profileid": varProfileId,
					"strFor": strFor,
					"confirmed": false
				}
				sessionAttributes.confirmTime = confirmTime;
				console.log('Confirm time Obj: ', sessionAttributes.confirmTime);
				confirmResponse = "That's " + sleepTimeFinalCheck + " to " + wakeTimeFinalCheck + ", right?";
			} else {
				if(Number(wakeHour) == 0) {
					wakeTimeFinalCheck = "12:" + wakeMinute + " PM";
					wakeTimeFinal = wakeHourPM + ":" + wakeMinute + ":00";
				} else {
					wakeTimeFinalCheck = wakeHour + ":" + wakeMinute + " PM";
					wakeTimeFinal = wakeHourPM + ":" + wakeMinute + ":00";
				}
				if (wakeHour >= sleepHour) {
					sleepTimeFinalCheck = sleepHour + ":" + sleepMinute + " PM";
					sleepTimeFinal = sleepHourPM + ":" + sleepMinute + ":00";
				} else {
					if (Number(sleepHour)==0) {
						sleepTimeFinalCheck = "12:" + sleepMinute + " PM";
						sleepTimeFinal = sleepHourPM + ":" + sleepMinute + ":00";
					} else {
						sleepTimeFinalCheck = sleepHour + ":" + sleepMinute + " AM";
						sleepTimeFinal = sleepHour + ":" + sleepMinute + ":00";
					}
				}
				var confirmTime = {
					"sleepTimeFinal": sleepTimeFinal,
					"sleepTimeFinalCheck":sleepTimeFinalCheck,
					"wakeTimeFinal": wakeTimeFinal,
					"wakeTimeFinalCheck": wakeTimeFinalCheck,
					"profileid": varProfileId,
					"strFor": strFor,
					"confirmed": false
				}
				sessionAttributes.confirmTime = confirmTime;
				console.log('Confirm time Obj: ', sessionAttributes.confirmTime);
				confirmResponse = "That's " + sleepTimeFinalCheck + " to " + wakeTimeFinalCheck + ", right?";
			}
		} else if (blnSureSave) {
				sleepTimeFinal = sessionAttributes.confirmTime.sleepTimeFinal;
				sleepTimeFinalCheck = sessionAttributes.confirmTime.sleepTimeFinalCheck;
				wakeTimeFinal = sessionAttributes.confirmTime.wakeTimeFinal;
				wakeTimeFinalCheck = sessionAttributes.confirmTime.wakeTimeFinalCheck;
		} else {
			if (wakeIsPM) {
				if (Number(wakeHour) ==12) {
					wakeTimeFinalCheck = (Number(wakeHour))  + ":" + wakeMinute + " PM";
					wakeTimeFinal = wakeHour + ":" + wakeMinute + ":00";
				} else {
					wakeTimeFinalCheck = (Number(wakeHour) - 12)  + ":" + wakeMinute + " PM";
					wakeTimeFinal = wakeHour + ":" + wakeMinute + ":00";
				}
				if (sleepIsPM) {
					if (Number(sleepHour) ==12) {
						sleepTimeFinalCheck = (Number(sleepHour))  + ":" + sleepMinute + " PM";
						sleepTimeFinal = sleepHour + ":" + sleepMinute + ":00";
					} else {
						sleepTimeFinalCheck = (Number(sleepHour) - 12)  + ":" + sleepMinute + " PM";
						sleepTimeFinal = sleepHour + ":" + sleepMinute + ":00";
					}
				} else if (Number(sleepHour) ==0) {
					sleepTimeFinalCheck = "12:" + sleepMinute + " AM";
					sleepTimeFinal = sleepHour + ":" + sleepMinute + ":00";
				} else {
					sleepTimeFinalCheck = (Number(sleepHour) - 12)  + ":" + sleepMinute + " AM";
					sleepTimeFinal = sleepHour + ":" + sleepMinute + ":00";
				}
			} else {
				if (Number(wakeHour) == 0) {
					wakeTimeFinalCheck = "12:" + wakeMinute + " AM";
					wakeTimeFinal = wakeHour + ":" + wakeMinute + ":00";
				} else {
					wakeTimeFinalCheck = wakeHour  + ":" + wakeMinute + " AM";
					wakeTimeFinal = wakeHour + ":" + wakeMinute + ":00";
				}
				if (sleepIsPM) {
					if (Number(sleepHour)==12) {
						sleepTimeFinalCheck = (Number(sleepHour))  + ":" + sleepMinute + " PM";
						sleepTimeFinal = sleepHour + ":" + sleepMinute + ":00";
					} else {
						sleepTimeFinalCheck = (Number(sleepHour) - 12)  + ":" + sleepMinute + " PM";
						sleepTimeFinal = sleepHour + ":" + sleepMinute + ":00";
					}
				} else {
					if (wakeHour >= sleepHour) {
						if (Number(sleepHour)==0) {
							sleepTimeFinalCheck = "12:" + sleepMinute + " AM";
							sleepTimeFinal = sleepHour + ":" + sleepMinute + ":00";
						} else {
							sleepTimeFinalCheck = sleepHour  + ":" + sleepMinute + " AM";
							sleepTimeFinal = sleepHour + ":" + sleepMinute + ":00";
						}
					} else {
						if (Number(sleepHour)==12) {
							sleepTimeFinalCheck = "12:" + sleepMinute + " PM";
							sleepTimeFinal = sleepHour + ":" + sleepMinute + ":00";
						} else {
							sleepTimeFinalCheck = sleepHour  + ":" + sleepMinute + " PM";
							sleepTimeFinal = (Number(sleepHour) + 12) + ":" + sleepMinute + ":00";
						}
					}
				}
			}
		}
	} else if (hasSleepStart || hasSleepStop) {
		blnInvalid = true;
		blnSave = false;
		var invalidResponse = "You must include a sleep start and wake time like I slept from 11PM to 7AM.  Main Menu.  For a list of options, simply say, Menu.";
	}

	if (!blnSave) {
		if(blnInvalid) {
			helper.gotoMainMenu(invalidResponse, session, callback);
		} else if (blnConfirm) {
			//Set current processor to 10
			helper.confirmResponse(confirmResponse, 10, session, callback);
		} else {
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in saveSleepSummary.  Restarting LogosHealth.  Main Menu.  For a list of options, simply say, Menu.";
			helper.gotoMainMenu(errResponse, session, callback);
		}
	} else {
		if (hasStartStop) {
			sql2 = sql2 + "'" + sleepTimeFinal + "', '" + wakeTimeFinal + "', ";
		}

		sql1 = sql1 + "dateofmeasure, profileid, createdby, modifiedby) ";
		sql2 = sql2 + "'" + dtDateofMeasure + "', " + varProfileId + ", " + sessionAttributes.profileid + ", " + sessionAttributes.profileid + ")" ;
		var sql = sql1 + sql2;

		console.log("saveSleepSummary - SQL: " + sql);
		connection.query(sql, function (error, results, fields) {
			if (error) {
				console.log('DBUtils.saveSleepSummary Error. the Error is: ', error);
				closeConnection(connection); //all is done so releasing the resources
				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in saveSleepSummary.  Restarting LogosHealth.  Main Menu.  For a list of options, simply say, Menu.";
				helper.gotoMainMenu(errResponse, session, callback);
			} else {
				console.log("Successful insert in saveSleepSummary - recordid = " + results.insertId);
				closeConnection(connection); //all is done so releasing the resources
				if(exitAfter){
					sessionAttributes.currentProcessor = 5;
					sessionAttributes.scriptComplete = true;
					var speechOutput;
					if (sleepTimeFinalCheck !== undefined && sleepTimeFinalCheck !== "") {
						console.log("sleepTimeFinalCheck: " + sleepTimeFinalCheck);
						speechOutput = "Thanks!  The sleep record from " + sleepTimeFinalCheck + " to " + wakeTimeFinalCheck +
						" has been saved for "+strFor+ ".  Main menu.  For a list of options, simply say menu.";
					} else {
						speechOutput = "Thanks!  The sleep record has been saved for "+strFor+ ".  Main menu.  For a list of options, simply say menu.";
					}
					console.log ('Speech Output: '+ speechOutput);
					helper.gotoMainMenu(speechOutput, session, callback);
				}
			}
		});
	}
}

//MM 7-17-18 Gets all profile IDs when adding x (generic) records for family (e.g. "We walked for 30 minutes.")
function getProfileIdsByAccountForX(callFunction, intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var strReturn = 'your family';

	//console.log('DBUtils.getProfileIdsByNameForDiet sqlNames: ', sqlNames);

    vSQL="SELECT profileid FROM logoshealth.profile where accountid="+ sessionAttributes.accountid + " and activeflag = 'Y'";
	//console.log("DBUtil.getProfileIdsByNameForDiet Query is  >>>>> " +vSQL);
	connection.query(vSQL, function (error, results, fields) {
		if (error) {
            console.log('DBUtils.getProfileIdsByAccountForX Error. the Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getProfileIdsByAccountForX.  Restarting LogosHealth.  Main Menu.  For a list of options, simply say, Menu.";
			helper.gotoMainMenu(errResponse, session, callback);
    	} else {
			//MM 6-24-17 If the on behalf of profile id is successfully retrieved, continue processing.  Otherwise raise the error back to user
			//console.log('DBUtils.processOnBehalfOf results gound. results length is : '+results.length);
			if (results !== null && results.length > 0) {
				console.log('DBUtils.getProfileIdsByAccountForX Results: ', results);
				for (var j = 0; j < results.length; j++) {
					if(j == results.length -1){
						intProfileID = results[j].profileid;
						closeConnection(connection); //all is done so releasing the resources
						if (callFunction == 'SleepSummary') {
							saveSleepSummary(intProfileID, strReturn, true, intent, session, callback);
						} else if (callFunction == 'SleepSleep') {
							saveSleepSleep(intProfileID, strReturn, true, intent, session, callback);
						} else if (callFunction == 'SleepWake') {
							saveSleepWake(intProfileID, strReturn, true, intent, session, callback);
						} else if (callFunction == 'BloodGlucose') {
							saveBloodGlucose(intProfileID, strReturn, true, intent, session, callback);
						}
					} else {
						intProfileID = results[j].profileid;
						if (callFunction == 'SleepSummary') {
							saveSleepSummary(intProfileID, strReturn, false, intent, session, callback);
						} else if (callFunction == 'SleepSleep') {
							saveSleepSleep(intProfileID, strReturn, false, intent, session, callback);
						} else if (callFunction == 'SleepWake') {
							saveSleepWake(intProfileID, strReturn, false, intent, session, callback);
						} else if (callFunction == 'BloodGlucose') {
							saveBloodGlucose(intProfileID, strReturn, true, intent, session, callback);
						}
					}
				}
			} else {
				closeConnection(connection); //all is done so releasing the resources
    			var errResponse = "There is an error in processing this request - no data found.  If it continues, please contact app support and say error in getProfileIdsByAccountForX.  Restarting LogosHealth.  Main Menu.  For a list of options, simply say, Menu.";
				helper.gotoMainMenu(errResponse, session, callback);
			}
		}
	});
}

//MM 7-2-18 Gets all profile IDs when adding task/exercise for specific names (people)
function getProfileIdsByNameForX(callFunction, strNames, intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sqlNames = '';
	var strTemp = '';
	var countNames = 0;
	var intProfileID = 0;
	var strReturn = '';

	if (strNames.constructor === Array) {
		for (var i = 0; i < strNames.length; i++) {
			if (strNames[i].toLowerCase() == 'i' || strNames[i].toLowerCase() == 'me' || strNames[i].toLowerCase() == 'myself') {
				sqlNames = sqlNames + "'"+ sessionAttributes.logosname.toLowerCase()+"',";
				strReturn = strReturn + 'you' + ' and ';
			} else {
				strTemp = strNames[i].trim();
				sqlNames = sqlNames + "'"+ strTemp.toLowerCase() +"',";
				strReturn = strReturn + strTemp + ' and ';
			}
		}
		sqlNames = sqlNames.substring(0, sqlNames.length-1);
		strReturn = strReturn.substring(0, sqlNames.length-3);
		countNames = strNames.length;
	} else {
		sqlNames = "'"+ strNames.toLowerCase() +"'";
		strReturn = strNames;
		countNames = 1;
	}

	console.log('DBUtils.getProfileIdsByNameForX sqlNames: ', sqlNames);

    vSQL="SELECT profileid FROM logoshealth.profile where lower(logosname) in (" + sqlNames + ") and accountid='"+ sessionAttributes.accountid +"' ";
	//console.log("DBUtil.getProfileIdsByNameForDiet Query is  >>>>> " +vSQL);
	connection.query(vSQL, function (error, results, fields) {
		if (error) {
            console.log('DBUtils.getProfileIdsByNameForX Error. the Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getProfileIdsByNameForTaskExercise.  Restarting LogosHealth.  Main Menu.  For a list of options, simply say, Menu.";
			helper.gotoMainMenu(errResponse, session, callback);
    	} else {
			//MM 6-24-17 If the on behalf of profile id is successfully retrieved, continue processing.  Otherwise raise the error back to user
			//console.log('DBUtils.processOnBehalfOf results gound. results length is : '+results.length);
			if (results !== null && results.length > 0) {
				if (results.length !== countNames) {
					closeConnection(connection); //all is done so releasing the resources
    				var errResponse = "One or more family members within "+strNames+" could not be found.  You will need to add this family member through the main menu to continue.  Main menu.  For a list of options, simply say Menu.";
					var processor = 5 //return to main menu
					helper.processErrResponse(errResponse, processor, session, callback);
				} else {
					for (var j = 0; j < results.length; j++) {
						if(j == results.length -1){
							intProfileID = results[j].profileid;
							closeConnection(connection); //all is done so releasing the resources
							if (callFunction == 'SleepSummary') {
								saveSleepSummary(intProfileID, strReturn, true, intent, session, callback);
							} else if (callFunction == 'SleepSleep') {
								saveSleepSleep(intProfileID, strReturn, true, intent, session, callback);
							} else if (callFunction == 'SleepWake') {
								saveSleepWake(intProfileID, strReturn, true, intent, session, callback);
							} else if (callFunction == 'BloodGlucose') {
								saveBloodGlucose(intProfileID, strReturn, true, intent, session, callback);
							}
							} else {
							intProfileID = results[j].profileid;
							if (callFunction == 'SleepSummary') {
								saveSleepSummary(intProfileID, strReturn, false, intent, session, callback);
							} else if (callFunction == 'SleepSleep') {
								saveSleepSleep(intProfileID, strReturn, false, intent, session, callback);
							} else if (callFunction == 'SleepWake') {
								saveSleepWake(intProfileID, strReturn, false, intent, session, callback);
							} else if (callFunction == 'BloodGlucose') {
								saveBloodGlucose(intProfileID, strReturn, true, intent, session, callback);
							}
						}
					}
				}
			} else {
				closeConnection(connection); //all is done so releasing the resources
    			var errResponse = "One or more family members within "+strNames+" could not be found.  You will need to add this family member through the main menu to continue.  Main menu.  For a list of options, simply say Menu.";
				var processor = 5 //return to main menu
				helper.processErrResponse(errResponse, processor, session, callback);
			}
		}
	});
}

//MM 7-17-18 Adding function for sleep summary - four cases - "I, me" - process current Profile ID, single family member, retrieve proper profile id, "we" process for whole family, has "and" in name, split and process
function processSleepSleep (intent, session, callback) {
	var sessionAttributes = session.attributes;
	var strName = intent.slots.Name.value;

	if (strName == undefined) {
		strName = 'i';
	}
	if (strName.toLowerCase() == 'i' || strName.toLowerCase() == 'me' || strName.toLowerCase() == 'myself') {
		var errResponse = "I cannot process sleep talking.  Main Menu.  For a list of options, simply say, Menu.";
		helper.gotoMainMenu(errResponse, session, callback);
	} else if (strName.toLowerCase() == 'we') {
		var errResponse = "I cannot process sleep talking.  Main Menu.  For a list of options, simply say, Menu.";
		helper.gotoMainMenu(errResponse, session, callback);
	} else if (strName.indexOf(" ") != -1) {
		var strNames = strName.split(" ");
		getProfileIdsByNameForX('SleepSleep', strNames, intent, session, callback);
	} else {
		getProfileIdsByNameForX('SleepSleep', strName, intent, session, callback);
	}
}

//MM 7-17-18 Save sleep summary record - exit and send response if exitAfter = true
function saveSleepSleep(varProfileId, strFor, exitAfter, intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var dtDateofMeasure = session.attributes.dateofmeasure;
	var strTime = null;
	var timeSplit;
	var hourSetTime;
	var minuteSetTime;
	var sleepTimeFinal;
	var sleepTimeFinalCheck;

	var blnUserSetTime = false;
	var dtNow =new Date();
	var momentNow = moment(dtNow);
	var hourNow;
	var timeNow;
	var minuteNow;
	var blnFuture = false;

	if (sessionAttributes.userTimezone !== undefined && sessionAttributes.userTimezone !== null && sessionAttributes.userTimezone !== "") {
		hourNow = momentNow.tz(sessionAttributes.userTimezone).format('HH');
		minuteNow = momentNow.tz(sessionAttributes.userTimezone).format('mm');
		timeNow = momentNow.tz(sessionAttributes.userTimezone).format('HH:mm');
	} else {
		hourNow = momentNow.format('HH');
		minuteNow = momentNow.format('mm');
		timeNow = momentNow.format('HH:mm');
	}

	if (intent.slots !== undefined) {
		if (intent.slots.Time !== undefined){
			if (intent.slots.Time.value !== undefined) {
				strTime = intent.slots.Time.value;
				console.log('UserSetTime: ' + strTime);
				timeSplit = strTime.split(":");
				hourSetTime = timeSplit[0];
				minuteSetTime = timeSplit[1];
				blnUserSetTime = true;
			}
		}
	}

	if (!blnUserSetTime) {
		sleepTimeFinal = timeNow;
		if (Number(hourNow) > 12) {
			sleepTimeFinalCheck = (Number(hourNow) - 12) + ":" + minuteNow + " PM";
		} else if (Number(hourNow) == 12) {
			sleepTimeFinalCheck = "12:" + minuteNow + " PM";
		} else {
			sleepTimeFinalCheck = timeNow + " AM";
		}
	} else {
		if (Number(hourSetTime) > Number(hourNow)) {
			blnFuture = true;
		} else if (Number(hourNow) > 11) {
			if (Number(hourSetTime) + 12 == Number(hourNow)) {
				if (Number(minuteNow) >= Number(minuteSetTime)) {
					sleepTimeFinal = (Number(hourSetTime) + 12) + ":" +  minuteSetTime;
					if (Number(hourSetTime) == 0) {
						sleepTimeFinalCheck = "12:" + minuteSetTime + " PM";
					} else {
						sleepTimeFinalCheck = strTime + " PM";
					}
				} else {
					if (Number(hourSetTime) == 0) {
						sleepTimeFinal = strTime;
						sleepTimeFinalCheck = "12:" + minuteSetTime + " AM";
					} else {
						sleepTimeFinal = strTime;
						sleepTimeFinalCheck = strTime + " AM";
					}
				}
			} else if (Number(hourSetTime) + 12 < Number(hourNow)) {
				sleepTimeFinal = (Number(hourSetTime) + 12) + ":" +  minuteSetTime;
				sleepTimeFinalCheck = strTime + " PM";
			} else {
				if (Number(hourSetTime) == 0) {
					sleepTimeFinal = strTime;
					sleepTimeFinalCheck = "12:" + minuteSetTime + " AM";
				} else {
					sleepTimeFinal = strTime;
					sleepTimeFinalCheck = strTime + " AM";
				}
			}
		} else {
			if (Number(hourSetTime) == 0) {
				sleepTimeFinal = strTime;
				sleepTimeFinalCheck = "12:" + minuteSetTime + " AM";
			} else {
				sleepTimeFinal = strTime;
				sleepTimeFinalCheck = strTime + " AM";
			}
		}
	}

	if (!blnFuture) {
		var sql1 = "insert into logoshealth.sleep (";
		var sql2 = "values (";

		if (sleepTimeFinal !== null && sleepTimeFinal !== "") {
			sql1 = sql1 + "starttime, ";
			sql2 = sql2 + "'" + sleepTimeFinal + "', ";
		}

		sql1 = sql1 + "dateofmeasure, profileid, createdby, modifiedby) ";
		sql2 = sql2 + "'" + dtDateofMeasure + "', " + varProfileId + ", " + sessionAttributes.profileid + ", " + sessionAttributes.profileid + ")" ;
		var sql = sql1 + sql2;

		console.log("saveSleepSleep - SQL: " + sql);
		connection.query(sql, function (error, results, fields) {
			if (error) {
				console.log('DBUtils.saveSleepSleep Error. the Error is: ', error);
				closeConnection(connection); //all is done so releasing the resources
				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in saveSleepSleep.  Restarting LogosHealth.  Main Menu.  For a list of options, simply say, Menu.";
				helper.gotoMainMenu(errResponse, session, callback);
			} else {
				console.log("Successful insert in saveSleepSleep - recordid = " + results.insertId);
				closeConnection(connection); //all is done so releasing the resources
				if(exitAfter){
					sessionAttributes.currentProcessor = 5;
					sessionAttributes.scriptComplete = true;
					var speechOutput = "Thanks!  The sleep record has started for "+strFor+ " at " + sleepTimeFinalCheck + ".  Remember to capture when " +strFor +
					  " wakes.  Main menu.  For a list of options, simply say menu.";
					helper.gotoMainMenu(speechOutput, session, callback);
				}
			}
		});
	} else {
		var errResponse = "I cannot record a sleep time in the future.  Main Menu.  For a list of options, simply say, Menu.";
		helper.gotoMainMenu(errResponse, session, callback);
	}
}

//MM 7-17-18 Adding function for sleep summary - four cases - "I, me" - process current Profile ID, single family member, retrieve proper profile id, "we" process for whole family, has "and" in name, split and process
function processSleepWake (intent, session, callback) {
	var sessionAttributes = session.attributes;
	var strName = intent.slots.Name.value;

	if (strName == undefined) {
		strName = 'i';
	}
	if (strName.toLowerCase() == 'i' || strName.toLowerCase() == 'me' || strName.toLowerCase() == 'myself') {
		saveSleepWake(sessionAttributes.profileid, 'you', true, intent, session, callback);
	} else if (strName.toLowerCase() == 'we') {
		getProfileIdsByAccountForX('SleepWake', intent, session, callback);
	} else if (strName.indexOf(" ") != -1) {
		var strNames = strName.split(" ");
		getProfileIdsByNameForX('SleepWake', strNames, intent, session, callback);
	} else {
		getProfileIdsByNameForX('SleepWake', strName, intent, session, callback);
	}
}

//MM 7-17-18 Save sleep summary record - exit and send response if exitAfter = true
function saveSleepWake(varProfileId, strFor, exitAfter, intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var strTime = null;
	var timeSplit;
	var hourSetTime;
	var minuteSetTime;
	var sleepTimeFinal;
	var sleepTimeFinalCheck;

	var blnUserSetTime = false;
	var dtNow =new Date();
	var momentNow = moment(dtNow);
	var hourNow;
	var timeNow;
	var minuteNow;
	var blnFuture = false;

	if (sessionAttributes.userTimezone !== undefined && sessionAttributes.userTimezone !== null && sessionAttributes.userTimezone !== "") {
		hourNow = momentNow.tz(sessionAttributes.userTimezone).format('HH');
		minuteNow = momentNow.tz(sessionAttributes.userTimezone).format('mm');
		timeNow = momentNow.tz(sessionAttributes.userTimezone).format('HH:mm');
	} else {
		hourNow = momentNow.format('HH');
		minuteNow = momentNow.format('mm');
		timeNow = momentNow.format('HH:mm');
	}

	if (intent.slots !== undefined) {
		if (intent.slots.Time !== undefined){
			if (intent.slots.Time.value !== undefined) {
				strTime = intent.slots.Time.value;
				console.log('UserSetTime: ' + strTime);
				timeSplit = strTime.split(":");
				hourSetTime = timeSplit[0];
				minuteSetTime = timeSplit[1];
				blnUserSetTime = true;
			}
		}
	}

	if (!blnUserSetTime) {
		sleepTimeFinal = timeNow;
		if (Number(hourNow) > 12) {
			sleepTimeFinalCheck = (Number(hourNow) - 12) + ":" + minuteNow + " PM";
		} else if (Number(hourNow) == 12) {
			sleepTimeFinalCheck = "12:" + minuteNow + " PM";
		} else {
			sleepTimeFinalCheck = timeNow + " AM";
		}
	} else {
		if (Number(hourSetTime) > Number(hourNow)) {
			blnFuture = true;
		} else if (Number(hourNow) > 11) {
			if (Number(hourSetTime) + 12 == Number(hourNow)) {
				if (Number(minuteNow) >= Number(minuteSetTime)) {
					sleepTimeFinal = (Number(hourSetTime) + 12) + ":" +  minuteSetTime;
					if (Number(hourSetTime) == 0) {
						sleepTimeFinalCheck = "12:" + minuteSetTime + " PM";
					} else {
						sleepTimeFinalCheck = strTime + " PM";
					}
				} else {
					if (Number(hourSetTime) == 0) {
						sleepTimeFinal = strTime;
						sleepTimeFinalCheck = "12:" + minuteSetTime + " AM";
					} else {
						sleepTimeFinal = strTime;
						sleepTimeFinalCheck = strTime + " AM";
					}
				}
			} else if (Number(hourSetTime) + 12 < Number(hourNow)) {
				sleepTimeFinal = (Number(hourSetTime) + 12) + ":" +  minuteSetTime;
				sleepTimeFinalCheck = strTime + " PM";
			} else {
				if (Number(hourSetTime) == 0) {
					sleepTimeFinal = strTime;
					sleepTimeFinalCheck = "12:" + minuteSetTime + " AM";
				} else {
					sleepTimeFinal = strTime;
					sleepTimeFinalCheck = strTime + " AM";
				}
			}
		} else {
			if (Number(hourSetTime) == 0) {
				sleepTimeFinal = strTime;
				sleepTimeFinalCheck = "12:" + minuteSetTime + " AM";
			} else {
				sleepTimeFinal = strTime;
				sleepTimeFinalCheck = strTime + " AM";
			}
		}
	}

	if (!blnFuture){
		var sql = "select * from logoshealth.sleep where profileid = " + varProfileId + " and activeflag = 'Y' and starttime is not null and waketime is null " +
		"order by createddate desc limit 1";

		console.log("saveSleepWake - SQL: " + sql);
		connection.query(sql, function (error, results, fields) {
			if (error) {
				console.log('DBUtils.saveSleepWake Error. the Error is: ', error);
				closeConnection(connection); //all is done so releasing the resources
				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in saveSleepWake.  Restarting LogosHealth.  Main Menu.  For a list of options, simply say, Menu.";
				helper.gotoMainMenu(errResponse, session, callback);
			} else {
				if (results.length > 0) {
					console.log("Successful retrieval in saveSleepWake - recordid = " + results[0].sleepid);
					//closeConnection(connection); //all is done so releasing the resources
					var sleepID = results[0].sleepid;
					var sql2 = "update logoshealth.sleep set waketime = '" + sleepTimeFinal + "' where sleepid = " + sleepID;
					connection.query(sql2, function (error, results, fields) {
						if (error) {
							console.log('DBUtils.saveSleepWake Error. the Error is: ', error);
							closeConnection(connection); //all is done so releasing the resources
							var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in saveSleepWake.  Restarting LogosHealth.  Main Menu.  For a list of options, simply say, Menu.";
							helper.gotoMainMenu(errResponse, session, callback);
						} else {
							closeConnection(connection); //all is done so releasing the resources
							if(exitAfter){
								sessionAttributes.currentProcessor = 5;
								sessionAttributes.scriptComplete = true;
								var speechOutput = "Thanks!  The sleep record has been completed for "+strFor+ " waking at "+ sleepTimeFinalCheck + ".  Main menu.  For a list of options, simply say menu.";
								helper.gotoMainMenu(speechOutput, session, callback);
							}
						}
					});
				} else {
					closeConnection(connection); //all is done so releasing the resources
					var errResponse = "There is not an open sleep record for " +strFor+ ".  Please enter a complete sleep record to capture this event.  Main Menu.  For a list of options, simply say, Menu.";
					helper.gotoMainMenu(errResponse, session, callback);
				}
			}
		});
	} else {
		var errResponse = "I cannot record a sleep time in the future.  Main Menu.  For a list of options, simply say, Menu.";
		helper.gotoMainMenu(errResponse, session, callback);
	}

}




//SECTION DIET - FOR SINGLE STATEMENT DIET RECORD ENTRIES
//MM 6-28-17 Adding function to add diet - four cases - "I, me" - process current Profile ID, single family member, retrieve proper profile id, "we" process for whole family, has "and" in name, split and process
function processAddDiet (intent, session, callback) {
	var sessionAttributes = session.attributes;
	var strName = intent.slots.Name.value;
	var strFood = intent.slots.Food.value;
	var strMeal = intent.slots.Meal.value;

	if (strName == undefined || strName == null || strName == "") {
		strName = 'i';
	}

	if (strName.toLowerCase() == 'i' || strName.toLowerCase() == 'me' || strName.toLowerCase() == 'myself') {
		saveAddDiet(sessionAttributes.profileid, 'you', true, intent, session, callback);
	} else if (strName.toLowerCase() == 'we') {
		getProfileIdsByAccountForDiet(sessionAttributes.accountid, intent, session, callback);
	} else if (strName.indexOf(" ") != -1) {
		var strNames = strName.split(" ");
		getProfileIdsByNameForDiet(strNames, intent, session, callback);
	} else {
		getProfileIdsByNameForDiet(strName, intent, session, callback);
	}
}

//MM 6-24-17 Gets all profile IDs when adding diet record for family
function getProfileIdsByAccountForDiet(accountId, intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var strReturn = 'your family';

	//console.log('DBUtils.getProfileIdsByNameForDiet sqlNames: ', sqlNames);

    vSQL="SELECT profileid FROM logoshealth.profile where accountid="+ sessionAttributes.accountid  + " and activeflag = 'Y'";
	//console.log("DBUtil.getProfileIdsByNameForDiet Query is  >>>>> " +vSQL);
	connection.query(vSQL, function (error, results, fields) {
		if (error) {
            console.log('DBUtils.getProfileIdsByNameForDiet Error. the Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getProfileIdsByAccountForDiet.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
    	} else {
			//MM 6-24-17 If the on behalf of profile id is successfully retrieved, continue processing.  Otherwise raise the error back to user
			//console.log('DBUtils.processOnBehalfOf results gound. results length is : '+results.length);
			if (results !== null && results.length > 0) {
				console.log('DBUtils.getProfileIdsByNameForDiet Results: ', results);
				for (var j = 0; j < results.length; j++) {
					if(j == results.length -1){
						intProfileID = results[j].profileid;
						closeConnection(connection); //all is done so releasing the resources
						saveAddDiet(intProfileID, strReturn, true, intent, session, callback);
					} else {
						intProfileID = results[j].profileid;
						saveAddDiet(intProfileID, strReturn, false, intent, session, callback);
					}
				}
			} else {
				closeConnection(connection); //all is done so releasing the resources
    			var errResponse = "There is an error in processing this request - no data found.  If it continues, please contact app support and say error in getProfileIdsByAccountForDiet.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
			}
		}
	});
}

//MM 6-24-17 Gets all profile IDs when adding diet record for specific names (people)
function getProfileIdsByNameForDiet(strNames, intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sqlNames = '';
	var strTemp = '';
	var countNames = 0;
	var intProfileID = 0;
	var strReturn = '';

	if (strNames.constructor === Array) {
		for (var i = 0; i < strNames.length; i++) {
			if (strNames[i].toLowerCase() == 'i' || strNames[i].toLowerCase() == 'me' || strNames[i].toLowerCase() == 'myself') {
				sqlNames = sqlNames + "'"+ sessionAttributes.logosname.toLowerCase()+"',";
				strReturn = strReturn + 'you' + ' and ';
			} else {
				strTemp = strNames[i].trim();
				sqlNames = sqlNames + "'"+ strTemp.toLowerCase() +"',";
				strReturn = strReturn + strTemp + ' and ';
			}
		}
		sqlNames = sqlNames.substring(0, sqlNames.length-1);
		strReturn = strReturn.substring(0, sqlNames.length-3);
		countNames = strNames.length;
	} else {
		sqlNames = "'"+ strNames.toLowerCase() +"'";
		strReturn = strNames;
		countNames = 1;
	}

	console.log('DBUtils.getProfileIdsByNameForDiet sqlNames: ', sqlNames);

    vSQL="SELECT profileid FROM logoshealth.profile where lower(logosname) in (" + sqlNames + ") and accountid='"+ sessionAttributes.accountid +"' ";
	//console.log("DBUtil.getProfileIdsByNameForDiet Query is  >>>>> " +vSQL);
	connection.query(vSQL, function (error, results, fields) {
		if (error) {
            console.log('DBUtils.getProfileIdsByNameForDiet Error. the Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in processOnBehalfOf.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
    	} else {
			//MM 6-24-17 If the on behalf of profile id is successfully retrieved, continue processing.  Otherwise raise the error back to user
			//console.log('DBUtils.processOnBehalfOf results gound. results length is : '+results.length);
			if (results !== null && results.length > 0) {
				if (results.length !== countNames) {
					closeConnection(connection); //all is done so releasing the resources
    				var errResponse = "One or more family members within "+strNames+" could not be found.  You will need to add this family member through the main menu to continue.  Main menu.  For a list of options, simply say Menu.";
					var processor = 5 //return to main menu
					helper.processErrResponse(errResponse, processor, session, callback);
				} else {
					for (var j = 0; j < results.length; j++) {
						if(j == results.length -1){
							intProfileID = results[j].profileid;
							closeConnection(connection); //all is done so releasing the resources
							saveAddDiet(intProfileID, strReturn, true, intent, session, callback);
						} else {
							intProfileID = results[j].profileid;
							saveAddDiet(intProfileID, strReturn, false, intent, session, callback);
						}
					}
				}
			} else {
				closeConnection(connection); //all is done so releasing the resources
    			var errResponse = "One or more family members within "+strNames+" could not be found.  You will need to add this family member through the main menu to continue.  Main menu.  For a list of options, simply say Menu.";
				var processor = 5 //return to main menu
				helper.processErrResponse(errResponse, processor, session, callback);
			}
		}
	});
}

//MM 6-28-17 Save diet record - exit and send response if exitAfter = true
function saveAddDiet(varProfileId, strFor, exitAfter, intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var strName = intent.slots.Name.value;
	var strFood = intent.slots.Food.value;
	var strMeal = intent.slots.Meal.value;
	var dtDateofMeasure = session.attributes.dateofmeasure;

	var varRec = {profileid:varProfileId,food:strFood,meal:strMeal,createdby:sessionAttributes.profileid,modifiedby:sessionAttributes.profileid,dateofmeasure:dtDateofMeasure};
    var vSQL3 = 'Insert into logoshealth.food Set ?';

	console.log('saveAddDiet varRec: ' +varRec);
	connection.query(vSQL3, varRec, function (error, results, fields) {
		if (error) {
            console.log('DBUtils.saveAddDiet Error. the Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in saveAddDiet.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
    	} else {
			console.log('DBUtils.saveAddDiet results.insertId: '+ results.insertId);
			closeConnection(connection); //all is done so releasing the resources
			if(exitAfter){
				sessionAttributes.currentProcessor = 5;
				sessionAttributes.scriptComplete = true;
				var speechOutput = "Thanks!  The diet record has been saved for "+strFor+ ".  Main menu.  For a list of options, simply say menu.";
				helper.gotoMainMenu(speechOutput, session, callback);
			}
		}
	});
}

//MM 01-01-17 Add functionality to update individual food preferences - this function checks for an active food preference record for this profile
//MM 01-14-18 Added branch to split between udpating food preference categories and food fields
function processUpdateFoodPreferences (intent, session, callback) {
	var connection = getLogosConnection();
	var sql = "select foodpreferenceid from logoshealth.foodpreference where profileid = "+session.attributes.profileid+" and activeflag = 'Y'";
	var sessionAttributes = session.attributes;
	var strCategory = intent.slots.Category.value;
	var strAction = intent.slots.Action.value;
	var strFoodField = intent.slots.FoodField.value;
	var strFoodValue = intent.slots.FoodValue.value;
	var foodPreferenceID;
	var strField = '';
	var FoodFieldId;
    var FoodValueCode;

	console.log('DBUtil.processUpdateFoodPreferences : Start - Profile ID =  '+ session.attributes.profileid);

	if (strAction !== undefined) {
		connection.query(sql, function (error, results, fields) {
        		if (error) {
            		console.log('DBUtil.processUpdateFoodPreferences : The Error is: ', error);
				closeConnection(connection); //all is done so releasing the resources
				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in processUpdateFoodPreferences.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        		} else {
            		if (results !== null && results.length > 0) {
					closeConnection(connection); //all is done so releasing the resources
                		console.log("DBUtil.processUpdateFoodPreferences: foodpreferenceid >>>>>"+results[0].foodpreferenceid);
                		foodPreferenceID = results[0].foodpreferenceid;
					if (foodPreferenceID > 0) {
						//Call the next step to check the action for update
						checkFoodPreferenceCategory (false, intent, session, callback);
					} else {
						//Call the function to check for a "family food preference" record
						checkForFamilyFoodPreferences (intent, session, callback);
					}
            		} else {
					closeConnection(connection); //all is done so releasing the resources
					//Call the function to check for a "family food preference" record
					checkForFamilyFoodPreferences (intent, session, callback);
				}
			}
    		});
	} else if (strFoodField  !== undefined) {
		FoodFieldId = intent.slots.FoodField.resolutions.resolutionsPerAuthority[0].values;
		if (FoodFieldId  !== undefined) {
			FoodFieldId = intent.slots.FoodField.resolutions.resolutionsPerAuthority[0].values[0].value.id;
			if (FoodFieldId == 1) {
				strField = 'maxcost';
				session.attributes.set('foodfield', strField);
			} else if (FoodFieldId == 2) {
				strField = 'deliveryoption';
				session.attributes.set('foodfield', strField);
			} else if (FoodFieldId == 3) {
				strField = 'deliveryrange';
				session.attributes.set('foodfield', strField);
			} else if (FoodFieldId == 4) {
				strField = 'forfamily';
				session.attributes.set('foodfield', strField);
			} else {
				var errResponse = "This is not a valid food preference option - loop 1.  Valid food preference options include maximum entree cost, delivery option, delivery range and for family.    Main menu.  For a list of options, simply say 'Menu'";
				helper.processErrResponse(errResponse, 5, session, callback);
			}
		if(strField !== '') {
				FoodValueCode = intent.slots.ValueField.resolutions.resolutionsPerAuthority[0].values;
			if (FoodFieldId  !== undefined) {
				var errResponse = "Making Progress.    Main menu.  For a list of options, simply say 'Menu'";
				helper.processErrResponse(errResponse, 5, session, callback);
			}
		}

		} else {
			var errResponse = "This is not a valid food preference option - loop 2.  Valid food preference options include maximum entree cost, delivery option, delivery range and for family.    Main menu.  For a list of options, simply say 'Menu'";
			helper.processErrResponse(errResponse, 5, session, callback);
		}
	} else {
		var errResponse = "This is not a valid food preference option  - loop 3.  Valid food preference options include maximum entree cost, delivery option, delivery range and for family.  Main menu.  For a list of options, simply say 'Menu'";
		helper.processErrResponse(errResponse, 5, session, callback);
	}
}

//MM 01-01-17 This function checks for an active family food preference record for this account
function checkForFamilyFoodPreferences (intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var strCategory = intent.slots.Category.value;
	var sql = "select foodpreferenceid from logoshealth.foodpreference where accountid = "+session.attributes.accountid+" and activeflag = 'Y' and forfamily = 'Y'";
	var strAction = intent.slots.Action.value;
	var foodPreferenceID;

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil. checkForFamilyFoodPreferences : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in  checkForFamilyFoodPreferences.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
				closeConnection(connection); //all is done so releasing the resources
                console.log("DBUtil. checkForFamilyFoodPreferences: foodpreferenceid >>>>>"+results[0].foodpreferenceid);
                foodPreferenceID = results[0].foodpreferenceid;
				if (foodPreferenceID > 0) {
					//Call the next step to check the action for update
					checkFoodPreferenceCategory (true, intent, session, callback);
				} else {
					//Returns an error call back to the user because no food preference record found
					var errResponse = "No active food preference record was found for you to update.  Please set up for food preferences through the Set Food Preference menu item.  Main menu.  For a list of options, simply say 'Menu'";
					helper.processErrResponse(errResponse, 5, session, callback);
				}
            } else {
				closeConnection(connection); //all is done so releasing the resources
				//Returns an error call back to the user because no food preference record found
				var errResponse = "No active food preference record was found for you to update.  Please set up for food preferences through the Set Food Preference menu item.  Main menu.  For a list of options, simply say 'Menu'";
				helper.processErrResponse(errResponse, 5, session, callback);
			}
		}
    });
}

//MM 01-01-17 This function checks for authenticity of food preferences
function checkFoodPreferenceCategory (isForFamily, intent, session, callback) {
	var connection = getLogosConnection();
	var sql;
	var sessionAttributes = session.attributes;
	var strCategory = intent.slots.Category.value;
	var strAction = intent.slots.Action.value;
	var foodCategoryPreferenceID;
	var isMaster;

	if (isForFamily) {
		sql = "select foodcategorypreferenceid, categoryname, ismaster from logoshealth.foodcategorypreference where accountid = "+session.attributes.accountid+" and lower(categoryname) = '"+intent.slots.Category.value.toLowerCase()+ "'";
	} else {
		sql = "select foodcategorypreferenceid, categoryname, ismaster from logoshealth.foodcategorypreference where profileid = "+session.attributes.profileid+" and lower(categoryname) = '"+intent.slots.Category.value.toLowerCase()+ "'";
	}

	console.log('DBUtil.checkFoodPreferenceCategory : SQL: '+ sql);
	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil.checkFoodPreferenceCategory : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in  checkFoodPreferenceCategory.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
				closeConnection(connection); //all is done so releasing the resources
                console.log("DBUtil.checkFoodPreferenceCategory: foodcategorypreferenceid >>>>>"+results[0].foodcategorypreferenceid);
                foodCategoryPreferenceID = results[0].foodcategorypreferenceid;
				isMaster = results[0].ismaster;
				if (foodCategoryPreferenceID  > 0) {
					//Call the next step to update the data
					updateFoodPreferenceCategoryData (isForFamily, foodCategoryPreferenceID, isMaster, intent, session, callback);
				} else {
					//Returns an error call back to the user because no food preference record found
					var errResponse = "This is not a valid Food Preference Category.  No update could be performed.  Main menu.  For a list of options, simply say 'Menu'";
					helper.processErrResponse(errResponse, 5, session, callback);
				}
            } else {
				closeConnection(connection); //all is done so releasing the resources
				//Returns an error call back to the user because no food preference record found
				var errResponse = "This is not a valid Food Preference Category.   No update could be performed.  Main menu.  For a list of options, simply say 'Menu'";
				helper.processErrResponse(errResponse, 5, session, callback);
			}
		}
    });
}

//MM 01-01-17 This function updates the foodPreferenceCatageory data
function updateFoodPreferenceCategoryData (forFamily, foodCategoryPreferenceID, isMaster, intent, session, callback) {
	var connection = getLogosConnection();
	var sql;
	var sessionAttributes = session.attributes;
	var strCategory = intent.slots.Category.value;
	var strAction = intent.slots.Action.value;
    var dictid;

	if (strAction.toLowerCase() == 'add') {
		dictid = 171;  //Dictionary ID = 'Y'
		if (isMaster == 'Y') {
			if  (forFamily) {
				sql = "update logoshealth.foodcategorypreference set answer = "+ dictid + " where accountid = "+ session.attributes.accountid + " and foodcategoryid in (Select foodcategoryid from logoshealth.foodcategory where lower(master_category) = '"+ strCategory.toLowerCase() + "')";
			} else {
				sql = "update logoshealth.foodcategorypreference set answer = "+ dictid + " where profileid = "+ session.attributes.profileid + " and foodcategoryid in (Select foodcategoryid from logoshealth.foodcategory where lower(master_category) = '"+ strCategory.toLowerCase() + "')";
			}
		} else {
			//set update statement to update record for specific foodCategoryPreferenceID retrieved using logic from previous funcions
			sql = "update logoshealth.foodcategorypreference set answer = "+ dictid + " where foodCategoryPreferenceID = " + foodCategoryPreferenceID;
		}
	} else if (strAction.toLowerCase() == 'remove') {
		dictid = 172;  //Dictionary ID = 'N'
		if (isMaster == 'Y') {
			if  (forFamily) {
				sql = "update logoshealth.foodcategorypreference set answer = "+ dictid + " where accountid = "+ session.attributes.accountid + " and foodcategoryid in (Select foodcategoryid from logoshealth.foodcategory where lower(master_category) = '"+ strCategory.toLowerCase() + "')";
			} else {
				sql = "update logoshealth.foodcategorypreference set answer = "+ dictid + " where profileid = "+ session.attributes.profileid + " and foodcategoryid in (Select foodcategoryid from logoshealth.foodcategory where lower(master_category) = '"+ strCategory.toLowerCase() + "')";
			}
		} else {
			//set update statement to update record for specific foodCategoryPreferenceID retrieved using logic from previous funcions
			sql = "update logoshealth.foodcategorypreference set answer = "+ dictid + " where foodCategoryPreferenceID = " + foodCategoryPreferenceID;
		}
	} else {
		//Returns an error call back to the user because no food preference record found
		var errResponse = "This is not a valid action of add or remove.   No update could be performed.  Main menu.  For a list of options, simply say 'Menu'";
		helper.processErrResponse(errResponse, 5, session, callback);
	}

	console.log('updateFoodPreferenceCategoryData : SQL: '+ sql);
	connection.query(sql, function (error, results, fields) {
		console.log(results.affectedRows + " record(s) updated");
        if (error) {
            console.log('DBUtil.updateFoodPreferenceCategoryData : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in updateFoodPreferenceCategoryData.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results.affectedRows > 0) {
				closeConnection(connection); //all is done so releasing the resources
                console.log("DBUtil.updateFoodPreferenceCategoryData: Update Complete >>>>>>"+results.affectedRows);

				sessionAttributes.currentProcessor = 5;
				sessionAttributes.scriptComplete = true;
				if (strAction.toLowerCase() == 'add'){
					var speechOutput = "Thanks!  The food preference category "+strCategory+ " has been "+strAction+"ed.  Main menu.  For a list of options, simply say menu.";
				} else {
					var speechOutput = "Thanks!  The food preference category "+strCategory+ " has been "+strAction+"d.  Main menu.  For a list of options, simply say menu.";
				}
				helper.gotoMainMenu(speechOutput, session, callback);
            } else {
				closeConnection(connection); //all is done so releasing the resources
				//Returns an error call back to the user because no food preference record found
				var errResponse = "There was a problem updating your Food Preference Category.   No update could be performed.  Main menu.  For a list of options, simply say 'Menu'";
				helper.processErrResponse(errResponse, 5, session, callback);
			}
		}
    });
}

//MM 01-13-17 Add functionality to update individual diet preferences - this function checks for an active diet preference record for this profile
function processUpdateDietaryPreferences (intent, session, callback) {
	var connection = getLogosConnection();
	var sql = "select dietpreferenceid from logoshealth.dietpreference where profileid = "+session.attributes.profileid+" and activeflag = 'Y'";
	var sessionAttributes = session.attributes;
	var strCategory = intent.slots.DietCategory.value;
	var strAction = intent.slots.Action.value;
	var dietPreferenceID;
	var functionName = "processUpdateDietaryPreferences";

	console.log('DBUtil.' + functionName + ': Start - Profile ID =  '+ session.attributes.profileid);

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil.' + functionName + ': The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in " + functionName + ".  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
				closeConnection(connection); //all is done so releasing the resources
                console.log("DBUtil." + functionName + ": dietpreferenceid >>>>>"+results[0].dietpreferenceid);
                dietPreferenceID = results[0].dietpreferenceid;
				if (dietPreferenceID > 0) {
					//Call the next step to check the action for update
					updateDietPreferenceData (dietPreferenceID, intent, session, callback);
				} else {
					//Call the function to check for a "family food preference" record
					checkForFamilyDietPreferences (intent, session, callback);
				}
            } else {
				closeConnection(connection); //all is done so releasing the resources
				//Call the function to check for a "family food preference" record
				checkForFamilyDietPreferences (intent, session, callback);
			}
		}
    });
}

//MM 01-13-17 This function checks for an active family diet preference record for this account
function checkForFamilyDietPreferences (intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var strCategory = intent.slots.DietCategory.value;
	var sql = "select dietpreferenceid from logoshealth.dietpreference where accountid = "+session.attributes.accountid+" and activeflag = 'Y' and forfamily = 'Y'";
	var strAction = intent.slots.Action.value;
	var dietPreferenceID;
	var functionName = "checkForFamilyDietPreferences";

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil.' + functionName + ': The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in  " + functionName + ".  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
				closeConnection(connection); //all is done so releasing the resources
                console.log("DBUtil." + functionName + ": foodpreferenceid >>>>>"+results[0].dietpreferenceid);
                dietPreferenceID = results[0].dietpreferenceid;
				if (dietPreferenceID > 0) {
					//Call the next step to check the action for update
					updateDietPreferenceData (dietPreferenceID, intent, session, callback);
				} else {
					//Returns an error call back to the user because no food preference record found
					var errResponse = "No active dietary preference record was found for you to update.  Please set up for dietary preferences through the Set Dietary Preference menu item.  Main menu.  For a list of options, simply say 'Menu'";
					helper.processErrResponse(errResponse, 5, session, callback);
				}
            } else {
				closeConnection(connection); //all is done so releasing the resources
				//Returns an error call back to the user because no food preference record found
				var errResponse = "No active dietary preference record was found for you to update.  Please set up for dietary preferences through the Set Dietary Preference menu item.  Main menu.  For a list of options, simply say 'Menu'";
				helper.processErrResponse(errResponse, 5, session, callback);
			}
		}
    });
}

//MM 01-13-17 This function updates the dietPreference data
function updateDietPreferenceData (dietPreferenceID, intent, session, callback) {
	var connection = getLogosConnection();
	var sql;
	var sessionAttributes = session.attributes;
	var strCategory = intent.slots.DietCategory.value;
	var strAction = intent.slots.Action.value;
	var functionName = "updateDietPreferenceData";
	var strValue;
	var strField = '';

	if (strAction.toLowerCase() == 'add') {
		strValue = 'Y';  //Dictionary ID = 'Y'
	} else if (strAction.toLowerCase() == 'remove') {
		strValue = 'N'; //Dictionary ID = 'N'
	} else {
		//Returns an error call back to the user because no food preference record found
		var errResponse = "This is not a valid action of add or remove.   No update could be performed.  Main menu.  For a list of options, simply say 'Menu'";
		helper.processErrResponse(errResponse, 5, session, callback);
	}

	if (strCategory.toLowerCase() == 'white meat only') {
		strField = 'iswhitemeat';
	} else if (strCategory.toLowerCase() == 'chicken only') {
		strField = 'ischicken';
	} else if (strCategory.toLowerCase() == 'vegetarian') {
		strField = 'isvegetarian';
	} else if (strCategory.toLowerCase() == 'vegetarian no egg') {
		strField = 'isvegetariannoegg';
	} else if (strCategory.toLowerCase() == 'vegan') {
		strField = 'isvegan';
	} else if (strCategory.toLowerCase() == 'pescetarian' ||strCategory.toLowerCase() == 'pescatarian') {
		strField = 'ispescatarian';
	} else if (strCategory.toLowerCase() == 'no dairy') {
		strField = 'isavoiddairy';
	} else if (strCategory.toLowerCase() == 'gluten free') {
		strField = 'isglutenfree';
	} else if (strCategory.toLowerCase() == 'low carb') {
		strField = 'islowcarb';
	} else if (strCategory.toLowerCase() == 'heart healthy') {
		strField = 'ishearthealthy';
	} else if (strCategory.toLowerCase() == 'low sodium') {
		strField = 'islowsodium';
	} else if (strCategory.toLowerCase() == 'low gi') {
		strField = 'islowglycemicindex';
	} else if (strCategory.toLowerCase() == 'halal') {
		strField = 'ishalal';
	} else if (strCategory.toLowerCase() == 'kosher') {
		strField = 'iskosher';
	} else {
		//Returns an error call back to the user because no food preference record found
		var errResponse = strCategory + " is not a valid dietary option.   No update could be performed.  Main menu.  For a list of options, simply say 'Menu'";
		helper.processErrResponse(errResponse, 5, session, callback);
	}

	if (strField !=='') {
		sql = "update logoshealth.dietpreference set " +strField+" = '"+ strValue + "' where dietpreferenceid = "+ dietPreferenceID;

		console.log('updateDietPreferenceData : SQL: '+ sql);
		connection.query(sql, function (error, results, fields) {
			console.log(results.affectedRows + " record(s) updated");
        		if (error) {
            		console.log('DBUtil.' + functionName + ': The Error is: ', error);
				closeConnection(connection); //all is done so releasing the resources
				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in " + functionName + ".  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        		} else {
            		if (results.affectedRows > 0) {
					closeConnection(connection); //all is done so releasing the resources
                		console.log("DBUtil." + functionName + ": Update Complete >>>>>>"+results.affectedRows);
					sessionAttributes.currentProcessor = 5;
					sessionAttributes.scriptComplete = true;
					if (strAction.toLowerCase() == 'add'){
						var speechOutput = "Thanks!  The diet preference option "+strCategory+ " has been "+strAction+"ed.  Main menu.  For a list of options, simply say menu.";
					} else {
						var speechOutput = "Thanks!  The diet preference option "+strCategory+ " has been "+strAction+"d.  Main menu.  For a list of options, simply say menu.";
					}
					helper.gotoMainMenu(speechOutput, session, callback);
            		} else {
					closeConnection(connection); //all is done so releasing the resources
					//Returns an error call back to the user because no food preference record found
					var errResponse = "There was a problem updating your Diet Preference.   No update could be performed.  Main menu.  For a list of options, simply say 'Menu'";
					helper.processErrResponse(errResponse, 5, session, callback);
				}
			}
    		});
	}
}





//MM 01-07-18 This function checks for an active food preference record for this profile
function checkExistingFoodPreferences (intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sql = "select count(*) as preferencecount from logoshealth.foodpreference where profileid = "+session.attributes.profileid+" and activeflag = 'Y'";
	var foodPreferenceCount;

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil. checkExistingFoodPreferences : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in  checkExistingFoodPreferences.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
				closeConnection(connection); //all is done so releasing the resources
                console.log("DBUtil. checkExistingFoodPreferences: foodPreferenceCount >>>>>"+results[0].preferencecount);
                foodPreferenceCount = results[0].preferencecount;
				if (foodPreferenceCount > 0) {
					var confirmResponse = "You have already completed your food category preferences.  You can add or remove choices simply by saying, Update food preferences, Add Mexican, as an example at the main menu.  If you still want to complete the entire food preference interview and overwrite your previous settings, Say Yes.  Otherwise, say No to return to the Main Menu.";
					helper.confirmResponse(confirmResponse, 7, session, callback);
				} else {
					//Moves on to check for an active configuration via family account
					checkExistingFoodPreferencesAccount (intent, session, callback);
				}
            } else {
				closeConnection(connection); //all is done so releasing the resources
				//Returns an error call back to the user because no food preference record found
				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in  checkExistingFoodPreferences.  Restarting LogosHealth.  Please say your first name.";
				helper.processErrResponse(errResponse, 5, session, callback);
			}
		}
    });
}

//MM 01-07-18 This function checks for an active food preference record for this profile
function checkExistingFoodPreferencesAccount (intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sql = "select p.logosname from logoshealth.foodpreference f, logoshealth.profile p where f.profileid = p.profileid and f.accountid = "+session.attributes.accountid+" and f.activeflag = 'Y'  and f.forfamily = 'Y'" ;
	var profileName;

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil. checkExistingFoodPreferencesAccount : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in checkExistingFoodPreferencesAccount.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
				closeConnection(connection); //all is done so releasing the resources
                console.log("DBUtil. checkExistingFoodPreferences: foodPreferenceCount >>>>>"+results[0].preferencecount);
                profileName = results[0].logosname;
				if (profileName !== null) {
					var confirmResponse = profileName + " has created a food preference profile for your family.  If you want to create your own, Say Yes.  Please note that if you choose to do this and set it for the family, it will overwrite the previous family profile.  Say No to return to the Main Menu.";
					helper.confirmResponse(confirmResponse, 7, session, callback);
				} else {
					//Moves on to interview
					getScriptDetails(0, sessionAttributes.scriptName, 'Y', session, callback);
				}
            } else {
				closeConnection(connection); //all is done so releasing the resources
				//Moves on to interview
				getScriptDetails(0, sessionAttributes.scriptName, 'Y', session, callback);
			}
		}
    });
}

//MM 01-08-18 This function deletes existing food category preferences in preparation for redo
function prepareForFoodPreferenceRedo (intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sql = "delete from logoshealth.foodcategorypreference  where profileid =  "+session.attributes.profileid;
	var profileName;

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil. prepareForFoodPreferenceRedo : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in prepareForFoodPreferenceRedo.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
			closeConnection(connection); //all is done so releasing the resources
			inactivateCurrentFoodPreference (intent, session, callback);
		}
    });
}

//MM 01-08-18 This function inactivates current food preference profiles
function inactivateCurrentFoodPreference (intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sql = "update logoshealth.foodpreference  set activeflag = 'N' where profileid =  "+session.attributes.profileid;
	var profileName;

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil.inactivateCurrentFoodPreference : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in inactivateCurrentFoodPreference.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
			closeConnection(connection); //all is done so releasing the resources
			getScriptDetails(0, sessionAttributes.scriptName, 'Y', session, callback);
		}
    });
}


//MM 01-11-18 This function checks for an active dietary preference record for this profile
function checkExistingDietPreferences (intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sql = "select count(*) as preferencecount from logoshealth.dietpreference where profileid = "+session.attributes.profileid+" and activeflag = 'Y'";
	var dietPreferenceCount;
	var functionName = "checkExistingDietaryPreferences";

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil. ' + functionName + ' : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in " + functionName + ".  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
				closeConnection(connection); //all is done so releasing the resources
                console.log("DBUtil. " + functionName + ": dietPreferenceCount >>>>>"+results[0].preferencecount);
                dietPreferenceCount = results[0].preferencecount;
				if (dietPreferenceCount > 0) {
					var confirmResponse = "You have already completed your dietary preferences.  You can add or remove choices simply by saying, Update dietary preferences, Add Heart Healthy, as an example at the main menu.  If you still want to complete the entire dietary preference interview and overwrite your previous settings, Say Yes.  Otherwise, say No to return to the Main Menu.";
					//Call response with currentProcessor = 8 (Overwrite Diet Preference Branch)
					helper.confirmResponse(confirmResponse, 8, session, callback);
				} else {
                		//console.log(functionName + " loop 2");
					//Moves on to check for an active configuration via family account
					checkExistingDietPreferencesAccount (intent, session, callback);
				}
            } else {
				closeConnection(connection); //all is done so releasing the resources
				//Returns an error call back to the user because no food preference record found
				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in " + functionName + ".  Restarting LogosHealth.  Please say your first name.";
				helper.processErrResponse(errResponse, 5, session, callback);
			}
		}
    });
}

//MM 01-11-18 This function checks for an active food preference record for this profile
function checkExistingDietPreferencesAccount (intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sql = "select p.logosname from logoshealth.dietpreference f, logoshealth.profile p where f.profileid = p.profileid and f.accountid = "+session.attributes.accountid+" and f.activeflag = 'Y'  and f.forfamily = 'Y'" ;
	var profileName;

   console.log("Start  checkExistingDietPreferencesAccount");

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil. checkExistingDietPreferencesAccount : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in checkExistingDietPreferencesAccount.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
				closeConnection(connection); //all is done so releasing the resources
                console.log("DBUtil. checkExistingDietPreferences: dietPreferenceCount >>>>>"+results[0].preferencecount);
                profileName = results[0].logosname;
				if (profileName !== null) {
					var confirmResponse = profileName + " has created a diet preference profile for your family.  If you want to create your own, Say Yes.  Please note that if you choose to do this and set it for the family, it will overwrite the previous family profile.  Say No to return to the Main Menu.";
					helper.confirmResponse(confirmResponse, 8, session, callback);
				} else {
					//Moves on to interview
					getScriptDetails(0, sessionAttributes.scriptName, 'Y', session, callback);
				}
            } else {
				closeConnection(connection); //all is done so releasing the resources
				//Moves on to interview
				getScriptDetails(0, sessionAttributes.scriptName, 'Y', session, callback);
			}
		}
    });
}

//MM 01-11-18 This function inactivates current food preference profiles
function inactivateCurrentDietPreference (intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sql = "update logoshealth.dietpreference  set activeflag = 'N' where profileid =  "+session.attributes.profileid;
	var profileName;

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil.inactivateCurrentDietPreference : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in inactivateCurrentFoodPreference.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
			closeConnection(connection); //all is done so releasing the resources
			getScriptDetails(0, sessionAttributes.scriptName, 'Y', session, callback);
		}
    });
}

//ORDER MEAL FEATURE***
//MM 02-22-18 This function checks for an active food preference record for this profile in order to drive the meal selection - Cloned from checkExistingFoodPreferences
//MM 02-27-18 Added functionality to do an upfront check to ensure the right data is populated to run a successful meal retrieval query
function checkExistingFoodPreferencesMeal (intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sql = "select foodpreferenceid, if(maxcost is NULL, 'N', 'Y') as hascost,  " +
		"if(deliveryoption is NULL, 'N', 'Y') as hasdelivery, if(deliveryrange is NULL, 'N', 'Y') as hasrange " +
		"from logoshealth.foodpreference where profileid = "+session.attributes.profileid+" and activeflag = 'Y'";
	var foodPreferenceCount;

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil. checkExistingFoodPreferencesMeal : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in  checkExistingFoodPreferencesMeal.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
                console.log("DBUtil.foodPreferenceCountMeal foodpreferenceid>>>>> "+ results[0].foodpreferenceid);
				if (results[0].hascost == 'N') {
					//Moves on to check for an active configuration via family account
					var errResponse = "The maximum cost option has not been set within your food preferences.  Please add this through the food preference menu in order to leverage this feature.  Main Menu.  For a list of options, simply say, menu";
					closeConnection(connection); //all is done so releasing the resources
					helper.processErrResponse(errResponse, 5, session, callback);
				} else if (results[0].hasdelivery == 'N') {
					//Moves on to check for an active configuration via family account
					var errResponse = "The delivery option has not been set within your food preferences.  Please add this through the food preference menu in order to leverage this feature.  Main Menu.  For a list of options, simply say, menu";
					closeConnection(connection); //all is done so releasing the resources
					helper.processErrResponse(errResponse, 5, session, callback);
				} else if (results[0].hasrange == 'N') {
					//Moves on to check for an active configuration via family account
					var errResponse = "The search range option has not been set within your food preferences.  Please add this through the food preference menu in order to leverage this feature.  Main Menu.  For a list of options, simply say, menu";
					closeConnection(connection); //all is done so releasing the resources
					helper.processErrResponse(errResponse, 5, session, callback);
				} else {
					sessionAttributes.foodProfileId = session.attributes.profileid;
					closeConnection(connection); //all is done so releasing the resources
					//May put an if clause based on data or menu to genericize function for all meal search menus
					checkExistingFoodCategoriesMeal(session, callback);
				}
            } else {
				closeConnection(connection); //all is done so releasing the resources
				//Returns a null so check for a family specific profile
				checkExistingFoodPreferencesAccountMeal (intent, session, callback);
			}
		}
    });
}

//MM 02-22-18 This function checks for an active food preference record for this family account - Cloned from checkExistingFoodPreferencesAccountMeal
function checkExistingFoodPreferencesAccountMeal (intent, session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sql = "select foodpreferenceid, profileid, if(maxcost is NULL, 'N', 'Y') as hascost, " +
		"if(deliveryoption is NULL, 'N', 'Y') as hasdelivery, if(deliveryrange is NULL, 'N', 'Y') as hasrange " +
		"from logoshealth.foodpreference where accountid = " + session.attributes.accountid + " and activeflag = 'Y'  and forfamily = 'Y'";

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil.checkExistingFoodPreferencesAccountMeal : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in checkExistingFoodPreferencesAccountMeal.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
                console.log("DBUtil.checkExistingFoodPreferencesAccountMeal foodpreferenceid>>>>> "+ results[0].foodpreferenceid);
				if (results[0].hascost == 'N') {
					//Moves on to check for an active configuration via family account
					var errResponse = "The maximum cost option has not been set within your food preferences.  Please add this through the food preference menu in order to leverage this feature.  Main Menu.  For a list of options, simply say, menu";
					closeConnection(connection); //all is done so releasing the resources
					helper.processErrResponse(errResponse, 5, session, callback);
				} else if (results[0].hasdelivery == 'N') {
					//Moves on to check for an active configuration via family account
					var errResponse = "The delivery option has not been set within your food preferences.  Please add this through the food preference menu in order to leverage this feature.  Main Menu.  For a list of options, simply say, menu";
					closeConnection(connection); //all is done so releasing the resources
					helper.processErrResponse(errResponse, 5, session, callback);
				} else if (results[0].hasrange == 'N') {
					//Moves on to check for an active configuration via family account
					var errResponse = "The search range option has not been set within your food preferences.  Please add this through the food preference menu in order to leverage this feature.  Main Menu.  For a list of options, simply say, menu";
					closeConnection(connection); //all is done so releasing the resources
					helper.processErrResponse(errResponse, 5, session, callback);
				} else {
					sessionAttributes.foodProfileId = results[0].profileid;
					closeConnection(connection); //all is done so releasing the resources
					//May put an if clause based on data or menu to genericize function for all meal search menus
					checkExistingFoodCategoriesMeal(session, callback);
				}
            } else {
				var errResponse = "You have not yet completed the food preference options.  Please complete this through the food preference menu in order to leverage this feature.  Main Menu.  For a list of options, simply say, menu";
				closeConnection(connection); //all is done so releasing the resources
				//Returns a null so check for a family specific profile
				helper.processErrResponse(errResponse, 5, session, callback);
			}
		}
    });
}

//MM 02-27-18 This function checks for an active food categories set to 'Y'
function checkExistingFoodCategoriesMeal (session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sql = "select count(*) as yescount from logoshealth.foodcategorypreference where profileid = " + sessionAttributes.foodProfileId + " and answervalue = 'Y'";

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil.checkExistingFoodCategoriesMeal : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in checkExistingFoodCategoriesMeal.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
                console.log("DBUtil.checkExistingFoodCategoriesMeal foodCategoryCount>>>>> "+ results[0].yescount);
				if (results[0].yescount == 0) {
					//Moves on to check for an active configuration via family account
					var errResponse = "You have not selected any food categories to facilitate your seach.  Please add this through the food preference menu in order to leverage this feature.  Main Menu.  For a list of options, simply say, menu";
					closeConnection(connection); //all is done so releasing the resources
					helper.processErrResponse(errResponse, 5, session, callback);
				} else {
					closeConnection(connection); //all is done so releasing the resources
					//May put an if clause based on data or menu to genericize function for all meal search menus
					checkExistingDietPreferencesMeal(session, callback);
				}
            } else {
				closeConnection(connection); //all is done so releasing the resources
				//Returns a null so check for a family specific profile
				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in checkExistingFoodCategoriesMeal.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
			}
		}
    });
}

//MM 02-27-18 This function checks for an active diet preference record
function checkExistingDietPreferencesMeal (session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sql = "select dietpreferenceid, profileid, if(targetcaloriesvalue is NULL, 'N', 'Y') as hascalories, " +
		"if(mealsperentreevalue is NULL, 'N', 'Y') as hasmeals " +
		"from logoshealth.dietpreference where profileid = " + sessionAttributes.foodProfileId + " and activeflag = 'Y'";

	console.log('DBUtil.checkExistingDietPreferencesMeal - SQL', sql);
	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil.checkExistingDietPreferencesMeal : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in checkExistingDietPreferencesMeal.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
                console.log("DBUtil.checkExistingDietPreferencesMeal dietpreferenceid>>>>> "+ results[0].dietpreferenceid);
				if (results[0].hascalories == 'N') {
					//Moves on to check for an active configuration via family account
					var errResponse = "The target calories option has not been set within your diet preferences.  Please add this through the diet preference menu in order to leverage this feature.  Main Menu.  For a list of options, simply say, menu";
					closeConnection(connection); //all is done so releasing the resources
					helper.processErrResponse(errResponse, 5, session, callback);
				} else if (results[0].hasmeals == 'N') {
					//Moves on to check for an active configuration via family account
					var errResponse = "The meals per entree option has not been set within your diet preferences.  Please add this through the diet preference menu in order to leverage this feature.  Main Menu.  For a list of options, simply say, menu";
					closeConnection(connection); //all is done so releasing the resources
					helper.processErrResponse(errResponse, 5, session, callback);
				} else {
					closeConnection(connection); //all is done so releasing the resources
					//May put an if clause based on data or menu to genericize function for all meal search menus
					if (sessionAttributes.orderRestaurant !==undefined && sessionAttributes.orderRestaurant !== "" ) {
						verifyRestaurant(session, callback);
					} else {
						retrieveMeal(session, callback);
					}
				}
            } else {
				closeConnection(connection); //all is done so releasing the resources
				//Returns a null so check for a family specific profile
				var errResponse = "Your diet preferences have not yet been set.  Please add these through the diet preference menu in order to leverage this feature.  Main Menu.  For a list of options, simply say, menu";
				helper.processErrResponse(errResponse, 5, session, callback);
			}
		}
    });
}

//MM 02-26-18 This function retrieves the meal items query
function retrieveMeal (session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sql = "";
	const functionName = 'retrieveMeal';
	var foodProfile;
	var objMenuItem;
	var arrMenuItems = [];
	var arrNotSelected = [];

	//If there is an ID from Alexa payload, then the search criteria is a food category
	if (sessionAttributes.orderFoodCatFavId !== undefined && sessionAttributes.orderFoodCatFavId !== "") {
		sessionAttributes.addtionalCatFilter = " and mifc.foodcategoryid = " + sessionAttributes.orderFoodCatFavId + " ";
	} else {
		sessionAttributes.addtionalCatFilter = "";
	}
	//If there isn't an ID from Alexa payload, then the result is not a food category but a particular dish
	if (sessionAttributes.orderFoodCatFav !== "" && sessionAttributes.orderFoodCatFavId == "") {
		sessionAttributes.addtionalMealFilter = "and (instr(mi.name, '" + sessionAttributes.orderFoodCatFav + "') > 0 or instr(mi.description, '" +
		sessionAttributes.orderFoodCatFav + "') > 0 or instr(mi.keywords, '" + sessionAttributes.orderFoodCatFav + "') > 0) ";
	} else {
		sessionAttributes.addtionalMealFilter = "";
	}

	foodProfile = sessionAttributes.foodProfileId;
	sql = "select r.restaurantid, r.restaurantname, r.address, r.city, r.phone, mi.menuitemid, mi.name, mi.description, mi.cost, mi.calories, mi.totalfat, mi.carbs, mi.protein " +
			"from logoshealth.menuitem mi, logoshealth.restaurant2menuitem r2m, logoshealth.menuitem_foodcategory mifc, logoshealth.restaurant r, " +
			"logoshealth.home2restaurant h2r, logoshealth.profile p, logoshealth.foodpreference fp,logoshealth.foodcategorypreference fcp, logoshealth.dietpreference dp, " +
			"logoshealth.dictionary d1, logoshealth.dictionary d2, logoshealth.dictionary d3 " +
			"where mi.menuitemid = r2m.menuitemid and r2m.restaurantid = r.restaurantid and r.restaurantid = h2r.restaurantid and h2r.profileid = p.profileid " +
			"and p.profileid = fp.profileid and p.profileid = fcp.profileid and p.profileid = dp.profileid and mi.menuitemid = mifc.menuitemid and fp.deliveryrange = d1.dictionaryid " +
			"and fp.maxcost = d2.dictionaryid and fp.deliveryoption = d3.dictionaryid " +
			/*restaurant - gets active restaurants that are open and witin the preferred search range*/
			"and r.active = 'Y' and r.opennow = 'Y' and h2r.searchrange = d1.dictionarycode " +
			/*diet preferences - active configuration, calories * mealsperentree > calories of the entree */
			"and dp.activeflag = 'Y'and mi.calories < (dp.targetcaloriesvalue* dp.mealsperentreevalue) " +
			/*diet preferences*/
			"and (dp.iswhitemeat = 'N' or (dp.iswhitemeat = 'Y' and mi.iswhitemeat = 'Y')) " +
			"and (dp.ischicken = 'N' or (dp.ischicken = 'Y' and mi.ischicken = 'Y')) " +
			"and (dp.isvegetarian = 'N' or (dp.isvegetarian = 'Y' and mi.isvegetarian = 'Y')) " +
			"and (dp.isvegetariannoegg = 'N' or (dp.isvegetariannoegg = 'Y' and mi.isvegetariannoegg = 'Y')) " +
			"and (dp.isvegan = 'N' or (dp.isvegan = 'Y' and mi.isvegan = 'Y')) " +
			"and (dp.isvegan = 'N' or (dp.isvegan = 'Y' and mi.isvegan = 'Y')) " +
			"and (dp.ispescatarian = 'N' or (dp.ispescatarian = 'Y' and mi.ispescatarian = 'Y')) " +
			"and (dp.isavoiddairy = 'N' or (dp.isavoiddairy = 'Y' and mi.isavoiddairy = 'Y')) " +
			"and (dp.isglutenfree = 'N' or (dp.isglutenfree = 'Y' and mi.isglutenfree = 'Y')) " +
			"and (dp.islowcarb = 'N' or (dp.islowcarb = 'Y' and mi.islowcarb = 'Y')) " +
			"and (dp.ishearthealthy = 'N' or (dp.ishearthealthy = 'Y' and mi.ishearthealthy = 'Y')) " +
			"and (dp.islowsodium = 'N' or (dp.islowsodium = 'Y' and mi.islowsodium = 'Y')) " +
			"and (dp.islowglycemicindex = 'N' or (dp.islowglycemicindex = 'Y' and mi.islowglycemicindex = 'Y')) " +
			"and (dp.ishalal = 'N' or (dp.ishalal = 'Y' and mi.ishalal = 'Y')) " +
			"and (dp.iskosher = 'N' or (dp.iskosher = 'Y' and mi.iskosher = 'Y')) " +
			"and (dp.haspeanutallergy = 'N' or (dp.haspeanutallergy = 'Y' and mi.nopeanut = 'Y')) " +
			"and (dp.hasnutallergy = 'N' or (dp.hasnutallergy = 'Y' and mi.nonut = 'Y')) " +
			"and (dp.hasfishallergy = 'N' or (dp.hasfishallergy = 'Y' and mi.nofish = 'Y')) " +
			"and (dp.hasshellfishallergy = 'N' or (dp.hasshellfishallergy = 'Y' and mi.noshellfish = 'Y')) " +
			/*food preferences - cost, delivery vs. carryout vs. both*/
			"and fp.activeflag = 'Y' and (d2.dictionarycode = 'No Limit' or (d2.dictionarycode >= mi.cost)) " +
			"and ((r.delivery_option = 'Yes' and (d3.dictionarycode = 'Delivery' or d3.dictionarycode = 'Both')) " +
			"or (r.delivery_option = 'No' and (d3.dictionarycode = 'Carry Out' or d3.dictionarycode = 'Both'))) " +
			/*menuitem - food type (entrees)*/
			"and mi.category in ('entree', 'soup', 'salad') " +
			/*foodcategorypreferences - food type (entrees)*/
			"and mifc.foodcategoryid in (select foodcategoryid from logoshealth.foodcategorypreference where answervalue = 'Y' and profileid = " + foodProfile + ") " +
			"and p.profileid = " + foodProfile + " ";

			if (sessionAttributes.addtionalRestFilter !== undefined && sessionAttributes.addtionalRestFilter !== "") {
				sql = sql + sessionAttributes.addtionalRestFilter;
			}
			if (sessionAttributes.addtionalCatFilter !== undefined && sessionAttributes.addtionalCatFilter !== "") {
				sql = sql + sessionAttributes.addtionalCatFilter;
			}
			if (sessionAttributes.addtionalMealFilter !== undefined && sessionAttributes.addtionalMealFilter !== "") {
				sql = sql + sessionAttributes.addtionalMealFilter;
			}

			sql = sql +  "group by r.restaurantid, r.restaurantname, r.address, r.city, r.phone, mi.menuitemid, mi.name, mi.description, mi.cost, mi.calories " +
			"order by RAND () limit 10";

	console.log("Retrieve Menu Query - ", sql);

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil.' + functionName + ': The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in " + functionName + ".  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
				//MONEY CODE HERE
				sessionAttributes.miBatchCount = results.length;
                for (var i = 0; i < results.length; i++) {
					objMenuItem = {
                			"restaurantid": results[i].restaurantid,
        					"restaurantname": results[i].restaurantname,
        					"address": results[i].address,
        					"city": results[i].city,
        					"phone": results[i].phone,
        					"menuitemid": results[i].menuitemid,
        					"name": results[i].name,
        					"description": results[i].description,
        					"cost": results[i].cost,
						"calories": results[i].calories,
						"totalfat": results[i].totalfat,
						"carbs": results[i].carbs,
						"protein": results[i].protein,
						"sortorder": i
               		 };
					arrMenuItems.push(objMenuItem);
					console.log("Menu Item -  " +arrMenuItems[i].name + " from " + arrMenuItems[i].restaurantname);
				}
				sessionAttributes.menuItems = arrMenuItems;
				sessionAttributes.miNotSelected = arrNotSelected;
				sessionAttributes.currentMenuIndex = 0;
				console.log("Retrieve Menu Query Executed Successfully");
				closeConnection(connection); //all is done so releasing the resources
				helper.constructOrderMealResponse('meal', session, callback);
            } else {
				closeConnection(connection); //all is done so releasing the resources
				var errResponse = "There are no meals available at this time which meet your criteria.  You can adjust your criteria through the food and diet preferences.  Also, I do only retrieve meals from restaurants that are currently open so keep that in mind.  Main Menu.  For a list of options, simply say, menu.";
				helper.gotoMainMenu(errResponse, session, callback);
			}
		}
    });
}

//MM 03-01-18 This function retrieves the next set of 10
function retrieveMealNext (session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	var sql = "";
	const functionName = 'retrieveMeal';
	var foodProfile;
	var objMenuItem;
	var arrMenuItems = [];
	var strNotIn = "and mi.menuitemid not in (";

	for (var j = 0; j < sessionAttributes.miNotSelected.length; j++) {
		if(j <  sessionAttributes.miNotSelected.length - 1) {
			strNotIn = strNotIn + sessionAttributes.miNotSelected[j] + ", ";
		} else {
			strNotIn = strNotIn + sessionAttributes.miNotSelected[j] + ") ";
		}
	}

	foodProfile = sessionAttributes.foodProfileId;
	sql = "select r.restaurantid, r.restaurantname, r.address, r.city, r.phone, mi.menuitemid, mi.name, mi.description, mi.cost, mi.calories, mi.totalfat, mi.carbs, mi.protein " +
			"from logoshealth.menuitem mi, logoshealth.restaurant2menuitem r2m, logoshealth.menuitem_foodcategory mifc, logoshealth.restaurant r, " +
			"logoshealth.home2restaurant h2r, logoshealth.profile p, logoshealth.foodpreference fp,logoshealth.foodcategorypreference fcp, logoshealth.dietpreference dp, " +
			"logoshealth.dictionary d1, logoshealth.dictionary d2, logoshealth.dictionary d3 " +
			"where mi.menuitemid = r2m.menuitemid and r2m.restaurantid = r.restaurantid and r.restaurantid = h2r.restaurantid and h2r.profileid = p.profileid " +
			"and p.profileid = fp.profileid and p.profileid = fcp.profileid and p.profileid = dp.profileid and mi.menuitemid = mifc.menuitemid and fp.deliveryrange = d1.dictionaryid " +
			"and fp.maxcost = d2.dictionaryid and fp.deliveryoption = d3.dictionaryid " +
			/*restaurant - gets active restaurants that are open and witin the preferred search range*/
			"and r.active = 'Y' and r.opennow = 'Y' and h2r.searchrange = d1.dictionarycode " +
			/*diet preferences - active configuration, calories * mealsperentree > calories of the entree */
			"and dp.activeflag = 'Y'and mi.calories < (dp.targetcaloriesvalue* dp.mealsperentreevalue) " +
			/*diet preferences*/
			"and (dp.iswhitemeat = 'N' or (dp.iswhitemeat = 'Y' and mi.iswhitemeat = 'Y')) " +
			"and (dp.ischicken = 'N' or (dp.ischicken = 'Y' and mi.ischicken = 'Y')) " +
			"and (dp.isvegetarian = 'N' or (dp.isvegetarian = 'Y' and mi.isvegetarian = 'Y')) " +
			"and (dp.isvegetariannoegg = 'N' or (dp.isvegetariannoegg = 'Y' and mi.isvegetariannoegg = 'Y')) " +
			"and (dp.isvegan = 'N' or (dp.isvegan = 'Y' and mi.isvegan = 'Y')) " +
			"and (dp.isvegan = 'N' or (dp.isvegan = 'Y' and mi.isvegan = 'Y')) " +
			"and (dp.ispescatarian = 'N' or (dp.ispescatarian = 'Y' and mi.ispescatarian = 'Y')) " +
			"and (dp.isavoiddairy = 'N' or (dp.isavoiddairy = 'Y' and mi.isavoiddairy = 'Y')) " +
			"and (dp.isglutenfree = 'N' or (dp.isglutenfree = 'Y' and mi.isglutenfree = 'Y')) " +
			"and (dp.islowcarb = 'N' or (dp.islowcarb = 'Y' and mi.islowcarb = 'Y')) " +
			"and (dp.ishearthealthy = 'N' or (dp.ishearthealthy = 'Y' and mi.ishearthealthy = 'Y')) " +
			"and (dp.islowsodium = 'N' or (dp.islowsodium = 'Y' and mi.islowsodium = 'Y')) " +
			"and (dp.islowglycemicindex = 'N' or (dp.islowglycemicindex = 'Y' and mi.islowglycemicindex = 'Y')) " +
			"and (dp.ishalal = 'N' or (dp.ishalal = 'Y' and mi.ishalal = 'Y')) " +
			"and (dp.iskosher = 'N' or (dp.iskosher = 'Y' and mi.iskosher = 'Y')) " +
			"and (dp.haspeanutallergy = 'N' or (dp.haspeanutallergy = 'Y' and mi.nopeanut = 'Y')) " +
			"and (dp.hasnutallergy = 'N' or (dp.hasnutallergy = 'Y' and mi.nonut = 'Y')) " +
			"and (dp.hasfishallergy = 'N' or (dp.hasfishallergy = 'Y' and mi.nofish = 'Y')) " +
			"and (dp.hasshellfishallergy = 'N' or (dp.hasshellfishallergy = 'Y' and mi.noshellfish = 'Y')) " +
			/*food preferences - cost, delivery vs. carryout vs. both*/
			"and fp.activeflag = 'Y' and (d2.dictionarycode = 'No Limit' or (d2.dictionarycode >= mi.cost)) " +
			"and ((r.delivery_option = 'Yes' and (d3.dictionarycode = 'Delivery' or d3.dictionarycode = 'Both')) " +
			"or (r.delivery_option = 'No' and (d3.dictionarycode = 'Carry Out' or d3.dictionarycode = 'Both'))) " +
			/*menuitem - food type (entrees)*/
			"and mi.category in ('entree', 'soup', 'salad') " +
			/*foodcategorypreferences - food type (entrees)*/
			"and mifc.foodcategoryid in (select foodcategoryid from logoshealth.foodcategorypreference where answervalue = 'Y' and profileid = " + foodProfile + ") " +
			"and p.profileid = " + foodProfile + " "+ strNotIn + " ";

			if (sessionAttributes.addtionalRestFilter !== "") {
				sql = sql + sessionAttributes.addtionalRestFilter;
			}
			if (sessionAttributes.addtionalCatFilter !== undefined && sessionAttributes.addtionalCatFilter !== "") {
				sql = sql + sessionAttributes.addtionalCatFilter;
			}
			if (sessionAttributes.addtionalMealFilter !== undefined && sessionAttributes.addtionalMealFilter !== "") {
				sql = sql + sessionAttributes.addtionalMealFilter;
			}

			sql = sql +  "group by r.restaurantid, r.restaurantname, r.address, r.city, r.phone, mi.menuitemid, mi.name, mi.description, mi.cost, mi.calories " +
			"order by RAND () limit 10";

	console.log("Retrieve Menu Next Query - ", sql);
	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil.' + functionName + ': The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in " + functionName + ".  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
				//MONEY CODE HERE
				sessionAttributes.miBatchCount = results.length;
				for (var i = 0; i < results.length; i++) {
					objMenuItem = {
                		"restaurantid": results[i].restaurantid,
        				"restaurantname": results[i].restaurantname,
        				"address": results[i].address,
        				"city": results[i].city,
        				"phone": results[i].phone,
        				"menuitemid": results[i].menuitemid,
        				"name": results[i].name,
        				"description": results[i].description,
        				"cost": results[i].cost,
						"calories": results[i].calories,
						"totalfat": results[i].totalfat,
						"carbs": results[i].carbs,
						"protein": results[i].protein,
						"sortorder": i
               		 };
					arrMenuItems.push(objMenuItem);
					console.log("Menu Item -  " +arrMenuItems[i].name + " from " + arrMenuItems[i].restaurantname);
				}
				sessionAttributes.menuItems = arrMenuItems;
				//sessionAttributes.miNotSelected = arrNotSelected;
				sessionAttributes.currentMenuIndex = 0;
				console.log("Retrieve Menu Query Executed Successfully");
				closeConnection(connection); //all is done so releasing the resources
				helper.constructOrderMealResponse('next batch', session, callback);
            } else {
				closeConnection(connection); //all is done so releasing the resources
				sessionAttributes.miBatchCount = 0;
				helper.constructOrderMealResponse('next', session, callback);
			}
		}
    });
}

//MM 03-05-18 This function verifies that the restaurant provided in the Order a Meal menu is open and within search range
function verifyRestaurant (session, callback) {
	var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
	const functionName = 'verifyRestaurant';
	var foodProfile;

	foodProfile = sessionAttributes.foodProfileId;
	var sql = "select r.restaurantid, r.restaurantname from logoshealth.home2restaurant h2r, logoshealth.restaurant r, logoshealth.profile p, logoshealth.foodpreference fp, " +
		"logoshealth.dictionary d1 " +
		"where r.restaurantid = h2r.restaurantid and h2r.profileid = p.profileid and p.profileid = fp.profileid and r.active = 'Y' and r.opennow = 'Y' and h2r.searchrange = d1.dictionarycode " +
		"and p.profileid = " + foodProfile + " and instr(r.restaurantname, '" + sessionAttributes.orderRestaurant + "') > 0 " +
		"group by r.restaurantid, r.restaurantname";

	console.log("Retrieve verifyRestaurant Query - ", sql);
	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil.' + functionName + ': The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in " + functionName + ".  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
				sessionAttributes.addtionalRestFilter = "and instr(r.restaurantname, '" + sessionAttributes.orderRestaurant + "') > 0 ";
				closeConnection(connection); //all is done so releasing the resources
				retrieveMeal(session, callback);
			} else {
				closeConnection(connection); //all is done so releasing the resources
				var errResponse = sessionAttributes.orderRestaurant + " is not currently open or within your search range.  If you have ordered from " + sessionAttributes.orderRestaurant +
					" before, please try again during open hours.  Main Menu.  For a list of options, simply say, menu.";
				helper.gotoMainMenu(errResponse, session, callback);
			}
		}
    });
}

//MM 01-06-18  Adding function to add an individual weight value
function processAddWeight (intent, session, callback) {
	var sessionAttributes = session.attributes;
	var strWeight = intent.slots.Weight.value;
	var strName = intent.slots.Name.value;
	var connection = getLogosConnection();
	var sql;
	var forFamilyProfileId = 0;

	if (intent.slots.Name.value !== undefined ) {
		sql = "select profileid from  logoshealth.profile where accountid = "+ session.attributes.accountid + " and (lower(firstname) = '" + strName.toLowerCase() + "' or lower(logosname) = '" + strName.toLowerCase() + "')";
		console.log('insertAddWeightRecord : Not undefined  - sql: '+sql);
		connection.query(sql, function (error, results, fields) {
        		if (error) {
            		console.log('DBUtil.processAddWeight : The Error is: ', error);
				closeConnection(connection); //all is done so releasing the resources
				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in processAddWeight.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        		} else {
				forFamilyProfileId = results[0].profileid;
            		if (forFamilyProfileId > 0) {
					closeConnection(connection); //all is done so releasing the resources
                		console.log("DBUtil.processAddWeight: Got Profile ID>>>>>>"+forFamilyProfileId);
					insertAddWeightRecord(forFamilyProfileId, intent, session, callback);
				} else {
					closeConnection(connection); //all is done so releasing the resources
					//Returns an error call back to the user because no food preference record found
					var errResponse = "I could not find a profile for " + intent.slots.Name.value + ".  No weight entry was generated.  Main menu.  For a list of options, simply say 'Menu'";
					helper.processErrResponse(errResponse, 5, session, callback);
				}
			}
    		});
	} else {
		insertAddWeightRecord(forFamilyProfileId, intent, session, callback);
	}
}

//MM 01-06-18 This function executes the addWeight insert statement
function insertAddWeightRecord (forFamilyProfileId, intent, session, callback) {
	var connection = getLogosConnection();
	var sql;
	var sessionAttributes = session.attributes;
	var intFromProfileId = session.attributes.profileid;
	var dtDateofMeasure = session.attributes.dateofmeasure;
	var intWeight = intent.slots.Weight.value;
	var intNewInsert;

	if (forFamilyProfileId == 0) {
		sql = "insert into  logoshealth.weight (profileid, dateofmeasure, weight, createdby, modifiedby) values (" + intFromProfileId + ", '" + dtDateofMeasure + "', " + intWeight + ", " + intFromProfileId + ", " + intFromProfileId + ")";
	} else {
		sql = "insert into  logoshealth.weight (profileid, dateofmeasure, weight, createdby, modifiedby) values (" + forFamilyProfileId + ", '" + dtDateofMeasure + "', " + intWeight + ", " + intFromProfileId + ", " + intFromProfileId + ")";
	}

	console.log('insertAddWeightRecord : SQL: '+ sql);
	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil.insertAddWeightRecord : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in insertAddWeightRecord.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
			intNewInsert = results.insertId;
            if (intNewInsert > 0) {
				closeConnection(connection); //all is done so releasing the resources
                console.log("DBUtil.insertAddWeightRecord: Update Complete New Weight Record ID>>>>>>"+intNewInsert);
				sessionAttributes.currentProcessor = 5;
				sessionAttributes.scriptComplete = true;
				var speechOutput = "Thanks!  The weight record has been added.  Main menu.  For a list of options, simply say menu.";
				helper.gotoMainMenu(speechOutput, session, callback);
            } else {
				closeConnection(connection); //all is done so releasing the resources
				//Returns an error call back to the user because no food preference record found
				var errResponse = "There was a problem inserting the weight record.  If it continues, please contact app support and say error in insertAddWeightRecord.  Main menu.  For a list of options, simply say 'Menu'";
				helper.processErrResponse(errResponse, 5, session, callback);
			}
		}
    });
}


//SECTION GENERIC AND ERROR HANDLING FUNCTIONS
function closeConnection(connection) {
	connection.end();
}

function isEmpty(obj) {
    for (var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

//MM 6-26-2017 Create list of acceptable options for dictionary entry
function getDictionaryListOptions(qnaObj, value, processor, fromEvent, session, callback) {
	var connection = getLogosConnection();
	var dictId = "";
	var fields = "";
	var field = "";
	var query = "";

	if(!fromEvent) {
		fields = qnaObj.answerField === null?"":qnaObj.answerField.split(",");
	} else {
		fields = qnaObj.eventQNArr.answerField === null?"":qnaObj.eventQNArr.answerField.split(",");
	}
	//console.log("DBUtil.getDictionaryListOptions called to get Dictionary : Filed and Fileds are  >>>  "+field+" and "+fields[fields.length-1]);
	if (fields != "") {
		field = fields[fields.length-1];
		query = "SELECT distinct(dictionarycode) as dictionarycode FROM logoshealth.dictionary WHERE fieldname = '"+field.trim()+"'";
	} else {
		query = "SELECT distinct(dictionarycode) as dictionarycode FROM logoshealth.dictionary WHERE questionid = "+qnaObj.questionId;
	}
	//console.log("DBUtil.getDictionaryListOptions Select Query is >>> "+query);
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log("DBUtil.getDictionaryListOptions - Database QUERY ERROR >>>> ");
    		closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getDictionaryListOptions.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
		} else {
			//console.log('DBUtil.getDictionaryListOptions - Query results '+results.length);
			var strOptions = '';
			if (results !== null && results.length > 0) {
                for (var i = 0; i < results.length; i++) {
					strOptions = strOptions + results[i].dictionarycode + ", ";
				}
				var strLength = strOptions.length - 2;
				strOptions = strOptions.substring(0, strLength);
				closeConnection(connection);
				var errResponse = "You must enter a valid option.  Please choose from the following: "+strOptions;
				//console.log('DBUtil.getDictionaryListOptions - errResponse: '+errResponse);
				//console.log('DBUtil.getDictionaryListOptions - processor: '+processor);
				helper.processErrResponse(errResponse, processor, session, callback);
            } else {
				closeConnection(connection);
    			var errResponse = "There is an error in processing this request - no data found.  If it continues, please contact app support and say error in getDictionaryListOptions.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
            }
		}
	});
}

function getLogosConnection() {
	//console.log(' DBUtils.getLogosConnection >>>>>>');
	var connection = mysql.createConnection({
        host     : 'logoshealth.cc99l18g9gw3.us-east-1.rds.amazonaws.com',
        port      : '3306',
        user     : 'logosadmin', //yet to encrypt password and read from properties
        password : 'L0g0sH3alth', //yet to encrypt password and read from properties
        database: 'logoshealth'
    });
    return connection;
}

//MM 6-24-17 Cloned from checkIfAccountHasAnyPrimaryProfile to set PrimaryProfileID
function getPrimary(userName, profileId, hasProfile, accountId, profileComplete, session, callback){
	var connection = getLogosConnection();
	//check if any profile exists for this account
	//console.log("DBUtil.getUserProfileByName - Initiating SQL call "+sql);
	var isPrimary = true;
	var primaryFirstName = "";
	var primaryProfileId = 0;
	var sql = "select * from logoshealth.profile where accountid="+accountId+" and lower(primaryflag) = 'y' ";

	connection.query(sql, function (error, results, fields) {
        if (error) {
            console.log('DBUtil.checkIfProfileHasPrimaryProfile : The Error is: ', error);
			closeConnection(connection); //all is done so releasing the resources
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getPrimary.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
                console.log("DBUtil.getPrimary : Primary account >>>>>"+results[0].logosname);
                isPrimary = false;
                primaryFirstName = results[0].firstname;
				primaryProfileId = results[0].profileid;
            }
        }
        connection.end();
        session.attributes.primaryAccHolder = primaryFirstName;
        session.attributes.primaryProfileId = primaryProfileId;
        helper.processNameIntent(userName, profileId, hasProfile, profileComplete, session, callback);
    });
}

//Check of logosname has already registered account, if not we continue to create one or menu
function getUserProfileByName(userName, accountId, session, callback) {
	var connection = getLogosConnection();
	var hasProfile = false;
	var profileComplete = false;
	var profileId = 0;

	connection.query("SELECT * FROM logoshealth.profile where logosname = '"+userName+ "' and accountid = "+accountId+" and activeflag = 'Y'", function (error, results, fields) {
        if (error) {
            console.log('The Error is: ', error);
	        connection.end();
			var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getUserProfileByName.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
        } else {
            if (results !== null && results.length > 0) {
                console.log("DBUtil.getUserProfileByName Profile ID found as  >>>>>"+results[0].profileid);
                hasProfile = true;
				//MM 6-6-17 Changed to proper database attribute
                //profileComplete = results[0].iscomplete;
				if (results[0].confirmedflag.toLowerCase() == 'y') {
					profileComplete = true;
				}
				profileId = results[0].profileid;
				session.attributes.userTimezone = results[0].timezone;
				console.log('Set UserTimezone in getUserProfileByName to ' + session.attributes.userTimezone);
				if (results[0].primaryflag.toLowerCase() == 'y') {
                	session.attributes.isPrimaryProfile = true;
					session.attributes.primaryProfileId = profileId;
                }
				connection.end();
            } else {
				//user not found - close connection
				connection.end();
			}
        }
        session.attributes.logosname = userName;
        // check if user has completed profile, if yes send them back to main menu
		// if not bring QnA object with current or last save point and respond.

		//MM 6-24-17 If profile is complete and user is not primary, still need to get primary for this account
        if (profileComplete) {
        	if (!session.attributes.isPrimaryProfile){
				getPrimary(userName, profileId, hasProfile, accountId, profileComplete, session, callback);
			} else {
				helper.processNameIntent(userName, profileId, hasProfile, profileComplete, session, callback);
			}
        } else {
        	checkIfAccountHasAnyPrimaryProfile(userName, profileId, hasProfile, accountId, profileComplete, session, callback);
        }
    });
}

//SECTION DRAFT - NEEDS ADDITIONAL WORK AND TESTING
//VG 06/10|| Purpose - Capture raw conversation
//MM 08/21|| Split original code for ansyc - Inserts a new transcript value
function setConversation(newRec, qnaObj, session, callback) {
    console.log("DBUtil.setConversation called and vSQL:");
    var vTranscript = '';
    var connection = getLogosConnection();
	var sessionAttributes = session.attributes;
    var profileId = 0;
    var userProfileId = 0;
	var vScriptId;
	var vUniqueStep;

	vUniqueStep = qnaObj.uniqueStepId;
	userProfileId = sessionAttributes.profileid;
	if(sessionAttributes.onBehalfOf){
		profileId = sessionAttributes.subjectProfileId;
	} else {
		profileId = sessionAttributes.profileid;
	}

	vScriptId = sessionAttributes.stgScriptId;

	if (qnaObj.eventSpecific !== null && qnaObj.eventSpecific.toLowerCase() == 'y') {
    	vTranscript = qnaObj.eventQNArr.eventQuestion;
		if(vTranscript !== undefined && vTranscript !== '') {
			vTranscript = vTranscript + " - " + qnaObj.eventQNArr.answer;
		}
	} else {
    	vTranscript = qnaObj.question + vScriptId + " - " + qnaObj.answer;
	}
	//console.log('DBUtil.setConversation: vTranscript = ' + vTranscript);

	if(vTranscript !== undefined && vTranscript !== '') {
		vSQL = {profileid:profileId,scriptid:vScriptId,uniquestepid:vUniqueStep,transcript:vTranscript,createdby:userProfileId,modifiedby:userProfileId};
		console.log('DBUtil.setConversation: vSQL = ', vSQL);
		connection.query('Insert into logoshealth.transcript Set ?',vSQL, function (error, results, fields) {
			if (error) {
            	console.log('DBUtil.setConversation : The Error is: ', error);
				closeConnection(connection); //all is done so releasing the resources
				var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in setConversation.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(sessionAttributes.accountid, errResponse, session, callback);
			} else {
            	//console.log('No Errors and Result is >>'+results.length);
				closeConnection(connection);
				setTranscriptDetailsChild(newRec, sessionAttributes.stgScriptId, qnaObj, session, callback);
        	}
    	});
	} else {
		setTranscriptDetailsChild(newRec, sessionAttributes.stgScriptId, qnaObj, session, callback);
	}
}//function setConversation ends here

//12-27-17 MM Built for validating input masks - not yet used or tested
function validateUserInput(qnaObj, value, processor, session, callback) {
	console.log("DBUtil.validateUserInput called to get regex script for value >>>  "+value);
	var connection = getLogosConnection();
	var regEx = "";
	var query = "select formatcode from logoshealth.format where formatid="+qnaObj.formatId;
	console.log("DBUtil.validateUserInput Select Query is >>> "+query);

	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log("DBUtil.validateUserInput - Database QUERY ERROR >>>> ");
    		closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in validateUserInput.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
		} else {
			//console.log('DBUtil.validateUserInput - Query results '+results.length);
			if (results !== null && results.length > 0) {
                regEx = results[0].formatcode;
				closeConnection(connection);
                var pattern = "";
                if (qnaObj.formatId == 1) {
                	//validate with zipcode
                	pattern = new RegExp("^[0-9]{5}(?:-[0-9]{4})?$");
                } else if (qnaObj.formatId == 2) {
                	//validate with phone number format
                	pattern = new RegExp("^\\d{10}$");
                } else if (qnaObj.formatId == 3) {
                	//validate with allowed data format yyyy-mm-dd TODO: actual date conversion is required.
                	pattern = new RegExp("^\d{4}-\d{2}-\d{2}$");
                	//pattern = new RegExp("date_format()");
                } else if (qnaObj.formatId == 4) {
                	//validate 9 digits
                	pattern = new RegExp("^\\d{9}$");
                }
       			//console.log("DBUtil.getDictionaryId - RegEx Format retrieved as >>>> "+regEx);

       			//var pattern = new RegExp(results[0].formatcode);
       			if (pattern.test(value)) {
       				qnaObj.answer = value;
    				//console.log(' LogosHelper.executeCreateProfileQNA Found Q answered: skipping to DB for isnert/update >>>>>> '+qnaObj.answer);
    				saveAnswer(qnaObj, session, callback);
    			} else {
    				console.log("DBUtil.validateUserInput - RegEx threw error for user input >>>> "+qnaObj.errResponse);
    				//process error response
    				helper.processErrResponse(qnaObj.errResponse, processor, session, callback);
    			}
            } else {
    			closeConnection(connection);
    			var errResponse = "There is an error in processing this request - no data found.  If it continues, please contact app support and say error in validateUserInput.  Restarting LogosHealth.  Please say your first name.";
				helper.callRestart(session.attributes.accountid, errResponse, session, callback);
			}
		}
	});
}

//SECTION FOR TESTING ONLY OR DEPRECATED - TO BE REMOVED
function setProfileConfirmed(newRec, keyId, qnaObj, session, callback){
   // console.log("DBUtil.setTranscriptDetailsChild called with param >>>>> "+keyId);
	var sessionAttributes = session.attributes;
	var questionId;
    var connection = getLogosConnection();
    var profileId = 0;

		if(sessionAttributes.onBehalfOf){
			profileId = sessionAttributes.subjectProfileId;
		} else {
			profileId = sessionAttributes.profileid;
		}

        // 1. Insert into STG_Record table
        //console.log('Enter setProfileConfirmed');
		connection.query("Update logoshealth.profile Set confirmedflag = 'Y' where profileid = "+ profileId, function (error, results, fields) {
		if (error) {
			console.log('The Error is: ', error);
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in setProfileConfirmed.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
		} else {
			console.log('setProfileConfirmed successful!!');
			closeConnection(connection); //all is done so releasing the resources
			setConversation(newRec, qnaObj, session, callback);
			//setTranscriptDetailsChild(newRec, sessionAttributes.stgScriptId, qnaObj, session, callback);
			}
		});
}//function ends here

//MAY BE DEPRECATED - TEST AND REMOVE
function getStagingParentId(newRec, qnaObj, session, callback) {
	console.log("DBUtil.getStagingParentId called to get Staging script ID for value >>>  ");
	var connection = getLogosConnection();
	var stgId = "";

	var sessionAttributes = session.attributes;
    var profileId = sessionAttributes.profileid;

	var query = "select stg_scriptid from stg_script where profileid ="+profileId+" and uniquestepid="+qnaObj.uniqueStepId;
	//console.log("DBUtil.getStagingParentId Select Query is >>> "+query);

	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log("DBUtil.getStagingParentId - Database QUERY ERROR >>>> ");
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getStagingParentId.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
		} else {
			//console.log('DBUtil.getStagingParentId - Query results '+results.length);

			if (results !== null && results.length > 0) {
                stgId = results[0].stg_scriptid;
				sessionAttributes.stgScriptId = stgId;
       			//console.log("DBUtil.getStagingParentId - Script ID retrieved as >>>> "+stgId);
				closeConnection(connection); //all is done so releasing the resources
    			setTranscriptDetailsChild(newRec, stgId, qnaObj, session, callback);
            } else {
            	console.log("DBUtil.getStagingParentId - RegEx threw error for user input >>>> "+tempObj.errResponse);
				closeConnection(connection); //all is done so releasing the resources
    			//process error response
    			helper.processErrResponse("Couldn't find Staging Script Error - Admin Error ", processor, session, callback);
            }
		}
	});
}

//MAY BE DEPRECATED - TEST AND REMOVE
function getUniqueIdFromAnswerTable(qnaObj, tableNm, colNm, profileId, session, callback) {
	console.log("DBUtil.getUniqueIdFromAnswerTable called "+qnaObj.answer);
	var connection = getLogosConnection();
	var answerVal = "";
	var slotVal = qnaObj.answer;
	var sessionAttributes = session.attributes;

	var query = "";
	if (tableNm != null && tableNm.toLowerCase() == 'profile') {
		query = "SELECT "+colNm+", primaryflag FROM "+tableNm+" where logosname = '"+ sessionAttributes.logosname + "' and accountid = '"+sessionAttributes.accountid+"'";
	} else {
		query = "SELECT "+colNm+" FROM "+tableNm+" where profileid = '"+profileId+"'";
	}
	//console.log("DBUtil.getUniqueIdFromAnswerTable Select Query is >>> "+query);
	connection.query(query, function (error, results, fields) {
		if (error) {
			console.log('The Error is: ', error);
			closeConnection(connection);
    		var errResponse = "There is an error in processing this request.  If it continues, please contact app support and say error in getUniqueIdFromAnswerTable.  Restarting LogosHealth.  Please say your first name.";
			helper.callRestart(session.attributes.accountid, errResponse, session, callback);
		} else {
			console.log('Get Answer Key Value select query works with records size '+results.length);
			if (results !== null && results.length > 0) {
            	answerVal = results[0][qnaObj.answerKey];
                console.log("DBUtil.getUniqueIdFromAnswerTable - ID retrieved as >>>> "+answerVal);
                if (tableNm != null && tableNm.toLowerCase() == 'profile') {
                	profileId = results[0].profileid;
                	session.attributes.profileid = profileId;
                	if (results[0].primaryflag.toLowerCase() == 'y') {
                		session.attributes.isPrimaryProfile = true;
                	}
          		}
                qnaObj.answerFieldValue = answerVal;
				closeConnection(connection);
				setTranscriptDetailsParent(true, qnaObj, session, callback);  //insert records into Parent Transcript Array
            } else {
            	console.log("DBUtil.getUniqueIdFromAnswerTable Results are empty, that mean no profile found which is created just now >>> "+query);
            }
		}
	});
}




