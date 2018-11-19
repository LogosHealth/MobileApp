/**
 * LogosHealth App Deepstream Utility. 
 * This Util has all support functions for deepstream operations 
 * Copyright Logos Health, Inc
 * 
 */

//global variables
var dbUtil = require('./DBUtils');
var helper = require('./LogosHelper');

const deepstream = require('deepstream.io-client-js');

/**
 * Create a new Deepstream Access.
 * @param {object|string} JSON
 * @return True/False
 * @public
 */
exports.getDeepStreamConnection = function getDeepStreamConnection(event, isInsert, qnaObj, session, callback) {
  	//console.log(' DBUtils.getDBConnection >>>>>>');
    return openDeepstreamChannel(event, isInsert, qnaObj, session, callback);
};

/**
 * Test Harness
 * @param String
 * @return welcome message
 * @public
 */
exports.verifyDeepstreamObj = function verifyDeepstreamObj() {
  	//console.log(' DBUtils.getDBConnection >>>>>>');
    return verifyDeepstreamObjMsg();
};

function openDeepstreamChannel(event, isInsert, qnaObj, session, callback) {
	console.log(' DeepstreamUtils.openDeepstreamChannel Begin>>>>>>');
	
	const client = deepstream('wss://logos.healthcare:6020');
	
	client.login({}, (success, data) => {
        if (success) {
            // start application
            // client.getConnectionState() will now return 'OPEN'
            //console.log("success login");
            //console.log(" Data >> "+data);
            //console.log(" Event >> "+client.event);

            var record = client.record.getRecord(event.recordname);

			if (qnaObj.uniqueStepId == session.attributes.minScriptId || session.attributes.continueInProgress == true || isInsert) {
				//|| isInsert
                //console.log('Function openDeepstreamChannel: New interview - Refresh Page - email =' + event.accountEmail);
                console.log('Function openDeepstreamChannel: Check session - email =' + session.attributes.accountEmail);
				session.attributes.continueInProgress = false;
				client.event.emit(session.attributes.accountEmail, 'reload');
			}
			
            record.set(event.recordname, event.data, err => {
                if (err) {
                    console.log('Record set with error:', err);
                    client.close();
                } else {
                    console.log('Record set without error');
                    client.close();
                    //Callback DB Util for the next set of action
                    dbUtil.setTranscriptParentDetails(isInsert, qnaObj, session, callback); 
                }
            });

        } else {
            // extra data can be optionaly sent from deepstream for
            // both successful and unsuccesful logins
            
            //alert(data);
	        console.log(' DeepstreamUtils.client login failed!!!!!!!!!');
            client.close();
            dbUtil.setTranscriptParentDetails(isInsert, qnaObj, session, callback); 

            // client.getConnectionState() will now return
            // 'AWAITING_AUTHENTICATION' or 'CLOSED'
            // if the maximum number of authentication
            // attempts has been exceeded.
        }
    })

    client.on( 'error', function( msg, event, topic ){
        console.log( 'From DeepstreamUtils - on error handler: ' + msg );
        client.close();
        dbUtil.setTranscriptParentDetails(isInsert, qnaObj, session, callback);     
    });
	
	//console.log(' DeepstreamUtils.openDeepstreamChannel <<<<<<');
	
    return true;
}

function verifyDeepstreamObjMsg() {
	console.log(' DeepstreamUtils.openDeepstreamChannel >>>>>>');
	console.log('DeepstreamUtils. Object instantiated >>>>');
}