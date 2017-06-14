"use strict";

let salesforce = require('./salesforceOauth');

exports.getRecords = (req, res) => {
	let slackUserId = req.body.user_id;
	let records = [];
	let fetchRecords = function(connection) {
		let allFields = ['Id', 'Recordtype.DeveloperName', 
	  		'Name', 'Recordtype.Name', 'Title', 'Account.Name',
	  		'GTCR_Vertical__c', 'Industry__c', 'Priority__c', 'Priority_Tier__c', 'Targeted_Role__c', 'Relationship_Manager__r.Name',
	  		'Verticals_Covered__c', 'Intermediary_Type__c', 'Banker_Type__c'
	  	];
	  	
	  	let query = "Select " + allFields.join(',') + " from Contact where Name Like '%" + req.body.text + "%' LIMIT 10";
	  	console.log('Query', query)
	  	
	  	connection.query(query)
	  	    .on("record", function(record){
	  	    	let fields = [];
	  	    	//common fields 
	  	    	
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
	  	    	records.push({
	  	    		color: "#8370C2",
	  	    		fields: fields
	  	    	});
	  	    })
	  	    .on("end", function(){
	  	    	if(records && records.length > 0)
	  	    		res.json({text: "Contacts matching " , attachments: records})
	  	    	else 
	  	    		res.json({text: "No Contacts found"})
	  	    })
	  	    .on("error", function(err) {
	  	    	console.log('err', err);
	    		res.send({text: err.toString()});
	  		})
	  	    .run({ 
	  	    	autoFetch : true, 
	  	    	maxFetch : 4000 
	  	    });
	}

	let failureFunction = function() {
		res.send({text: 'Please authenticate with /sfdclogin commmand first'});	
	}
	salesforce.getOauthConnection(slackUserId).then(fetchRecords, failureFunction); 	
}