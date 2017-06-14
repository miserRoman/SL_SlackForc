"use strict";

let salesforce = require('./salesforceOauth');

exports.getRecords = (req, res) => {
	let slackUserId = req.body.user_id;
	let records = [];
	let fetchRecords = function(connection) {
		connection.apex.post("/getContacts/", {"strName": req.body.text}, function(err, result){
			let recordsResult = JSON.parse(result);
			recordsResult.forEach(function(record, index){
				records.push({
	  	    		color: "#8370C2",
	  	    		fields: compileRecords(record)
	  	    	});
			});
			if(recordsResult && recordsResult.length > 0) {
  	    		res.json({text: "Contacts matching " , attachments: records});
	  	    } else {
  	    		res.json({text: "No Contacts found"});
  	    	}	
		});
	}

	let failureFunction = function() {
		res.send({text: 'Please authenticate with /sfdclogin commmand first'});	
	}

	salesforce.getOauthConnection(slackUserId).then(fetchRecords, failureFunction); 	
}

let compileRecords = (recordWrapper) => {
	let record = recordWrapper.objContact;
	let activity = recordWrapper.objActivity;
	let fields = [];
	fields.push({
		title: 'Name', 
		value: record.Name, 
		short: true,
		mrkdwn: true
	});
	fields.push({
		title: 'Record Type', 
		value: record.RecordType.Name, 
		short: true,
		mrkdwn: true
	});
	fields.push({
		title: 'Title', 
		value: record.Title, 
		short: true,
		mrkdwn: true
	});
	fields.push({
		title: 'Company Name', 
		value: (record.Account) ? record.Account.Name : '',
		short: true,
		mrkdwn: true
	});
	//Executive record Type
	if( record.RecordType.Name == 'Executive' ) {
		fields.push({
    		title: 'GTCR Vertical', 
    		value: record.GTCR_Vertical__c,
    		short: true,
    		mrkdwn: true
		});
		fields.push({
    		title: 'Industry', 
    		value: record.Industry__c,
    		short: true,
    		mrkdwn: true
		});
		fields.push({
    		title: 'Priority', 
    		value: record.Priority__c,
    		short: true,
    		mrkdwn: true
		});
		fields.push({
    		title: 'Priority Tier', 
    		value: record.Priority_Tier__c,
    		short: true,
    		mrkdwn: true
		});
		fields.push({
    		title: 'Targeted Role', 
    		value: record.Targeted_Role__c,
    		short: true,
    		mrkdwn: true
		});
		fields.push({
    		title: 'Relationship Manager', 
    		value: (record.Relationship_Manager__r) ? record.Relationship_Manager__r.Name : '',
    		short: true,
    		mrkdwn: true
		});
		fields.push({
			title: 'Latest Activity Date',
			value: activity.dtActivityDate,
			short: true
		});
		fields.push({
			title: 'Latest Activity Subject',
			value: activity.strActivitySubject,
			short: true
		});
		fields.push({
			title: 'Latest GTCR Attendees',
			value: activity.strGTCRAttendees,
			short: true
		});
	} 
	//Intermediary Record Type
	if( record.RecordType.Name == 'Intermediary' ) {
		fields.push({
    		title: 'Verticals Covered', 
    		value: record.Verticals_Covered__c,
    		short: true,
    		mrkdwn: true
		});
		fields.push({
    		title: 'Intermediary Type', 
    		value: record.Intermediary_Type__c,
    		short: true,
    		mrkdwn: true
		});
		fields.push({
    		title: 'Banker Type', 
    		value: record.Banker_Type__c,
    		short: true,
    		mrkdwn: true
		});
	}
	return fields;    	
}