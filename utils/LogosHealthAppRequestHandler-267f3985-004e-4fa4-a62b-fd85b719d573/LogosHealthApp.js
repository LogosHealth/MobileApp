'use strict';

var dbUtil = require('./utils/DBUtils');
var helper = require('./utils/LogosHelper');
//var deepstream = require('./utils/DeepstreamUtils');
var moment = require('moment-timezone');

var request = require('request');

//var googleMapsClient = require('@google/maps').createClient({
//  key: 'AIzaSyBIX3hQyWMfJHRk8zRlkzUtCIXXlcntELc'
//});

// --------------- Functions that control the skill's behavior -----------------------
function onLaunch(event, launchRequest, session, callback) {	
	accountEmail(event, request, session, accountId, callback);
}

function accountId(error, data, session, callback) {
    if (error) throw error;
    console.log(" The Email found from account is "+data.email);
    dbUtil.getAccountIdFromEmail(data.email, session, callback);
}

function accountEmail(event, request, session, accountId, callback) {
    console.log(" Getting Account Linked Email ");
    console.log(" Object Keys: ", Object.keys(event));
	
	var amznProfileURL = 'https://api.amazon.com/user/profile?access_token=';
    amznProfileURL += event.session.user.accessToken;
    
	//console.log('amznProfileURL: ' + amznProfileURL);
	console.log('Event: ', event);
	console.log('User: ', session.user);
	
    request(amznProfileURL, function(error, response, body) {
 	    var respBody = "";
 	    if (!error && response.statusCode == 200) {
    	    respBody = JSON.parse(body);
    	    console.log('Email from Amazon: ' + respBody.email);
    	    console.log('JSON Body: ', respBody);
	    } else {
    	    console.log('error: ' + error);
    	    console.log('response.statusCode: ' + response.statusCode);
			
		}		
	    accountId(error,respBody, session, callback);
	});
}

function handleSessionEndRequest(callback) {
    helper.processSessionEnd(callback);
}

function onSessionStarted(event, sessionStartedRequest, context, session, callback) {
    console.log('onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}');    
}

function onSessionEnded(sessionEndedRequest, session) {
	var dateNow = Date.now();	
	console.log('Date Now >>>>>', moment.tz(dateNow, "America/Los_Angeles").format());
    console.log('onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}');
}

// --------------- Main handler -----------------------
exports.handler = (event, context, callback) => {
    try {        
            if (event.session.new) {           
                console.log('New Session created >>>>>');
                onSessionStarted(event,{ requestId: event.request.requestId }, context, event.session,  
            		(sessionAttributes, speechletResponse) => {
                        callback(null, helper.buildResponse(sessionAttributes, speechletResponse));
                    });
                onLaunch(event,event.request,event.session,
                    (sessionAttributes, speechletResponse) => {
                        callback(null, helper.buildResponse(sessionAttributes, speechletResponse));
                    });                    
            } else {        
                if (event.request.type === 'LaunchRequest') {
                    console.log('Launch Request processing >>>>>.');
                    onLaunch(event,event.request,event.session,
                        (sessionAttributes, speechletResponse) => {
                            callback(null, helper.buildResponse(sessionAttributes, speechletResponse));
                        });
                } else if (event.request.type === 'IntentRequest') {
                    console.log('Intent Request processing >>>>>');
                    helper.processUserReponse(event, context, event.request,event.session,
                        (sessionAttributes, speechletResponse) => {
                            callback(null, helper.buildResponse(sessionAttributes, speechletResponse));
                        });            
                } else if (event.request.type === 'SessionEndedRequest') {
                    console.log('SessionEndedRequest >>>>>>');
                    console.log('event.request: ', event.request);
                    console.log('event.session: ', event.session);
                
                    onSessionEnded(event.request, event.session);
                    callback();
                } else {
                    console.log('SessionRequest fall through');
                    console.log('event.request: ', event.request);
                    console.log('event.session: ', event.session);
                }
            }
        } catch (err) {
            console.log('***Main Try Catch Error from exports.handler***', err);
            callback(err);
    }
};