"use strict";

let SLACK_LOGIN_TOKEN = process.env.SLACK_LOGIN_TOKEN;
let SLACK_LOGOUT_TOKEN = process.env.SLACK_LOGOUT_TOKEN;
let SF_CLIENT_ID = process.env.SF_CLIENT_ID;
let SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
let SF_LOGIN_URL = process.env.SF_LOGIN_URL;

let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let jsforce = require('jsforce');
let request = require('request');

let salesforce = require('./modules/salesforceOauth');

let slackConnections = {};

app.enable('trust proxy');
app.set('port', process.env.PORT || 5000);
app.use('/', express.static(__dirname + '/www'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/login', salesforce.loginLink);
app.get('/login/:slackUserId', salesforce.oAuthLink);
app.get('/oauthcallback', salesforce.oAuthCallback);

app.post('/contact', function(req, res) {
	
	let slackUserId = req.body.user_id;
	let records = [];

	let slackConnection = salesforce.getSlackUser(slackUserId);

	if(slackConnection) {
		let conn = new jsforce.Connection({
		  	oauth2 : {
				clientId : SF_CLIENT_ID,
				clientSecret : SF_CLIENT_SECRET,
				redirectUri : ''
			},
			accessToken: slackConnection.access_token,
			refreshToken: slackConnection.refresh_token,
			instanceUrl: slackConnection.instance_url,
			id: slackConnection.id
  		});
  	
	  	conn.on('refresh', function(accessToken, resp) {
	  		slackConnection.access_token = accessToken;				
	  	});

	  	let fieldMappings = {
	  		'Executive' : {
	  			'GTCR_Vertical__c' : 'GTCR Vertical',
	  			'Industry__c' : 'Industry',
	  			'Priority__c' : 'Priority',
	  			'Priority_Tier__c' : 'Priority Tier',
	  			'Targeted_Role__c' : 'Targeted Role',
	  			'Relationship_Manager__r.Name' : 'Relationship Manager' 
	  		}, 
	  		'Intermediary': {
	  			'Verticals_Covered__c' : 'Verticals Covered',
	  			'Intermediary_Type__c' : 'Intermediary Type',
	  			'Banker_Type__c' : 'Banker Type'
	  		}
	  	}			  
	  	let commonFields = {
	  		'Name' : 'Name',
	  		'Recordtype.Name' : 'Recordtype',
	  		'Title' : 'Title',
	  		'Account.Name': 'Company Name'
	  	}
	  	
	  	let allFields = ['Id', 'Recordtype.DeveloperName'];
	  	allFields = allFields.concat(Object.keys(commonFields));
	  	for( let recordtype in fieldMappings) {
	  		allFields = allFields.concat(Object.keys(fieldMappings[recordtype]));
	  	}

	  	let query = "Select " + allFields.join(',') + " from Contact where Name Like '%" + req.body.text + "%' LIMIT 10";
	  	console.log('Query', query)
	  	
	  	conn.query(query)
	  	    .on("record", function(record){
	  	    	let fields = [];
	  	    	//common fields 
	  	    	console.log('record', record);
	  	    	fields.push({
    				title: '*Name*', 
	  	    		value: record.Name, 
	  	    		short: true,
	  	    		mrkdwn: true
	  	    	});
	  	    	fields.push({
    				title: '*Record Type*', 
	  	    		value: record.RecordType.Name, 
	  	    		short: true,
	  	    		mrkdwn: true
	  	    	});
	  	    	fields.push({
    				title: '*Title*', 
	  	    		value: record.Title, 
	  	    		short: true,
	  	    		mrkdwn: true
	  	    	});
	  	    	fields.push({
	  	    		title: '*Company Name*', 
	  	    		value: (record.Account) ? record.Account.Name : '',
	  	    		short: true,
	  	    		mrkdwn: true
	  	    	});
	  	    	//Executive record Type
	  	    	if( record.RecordType.Name == 'Executive' ) {
	  	    		fields.push({
		  	    		title: '*GTCR Vertical*', 
		  	    		value: record.GTCR_Vertical__c,
		  	    		short: true,
		  	    		mrkdwn: true
	  	    		});
	  	    		fields.push({
		  	    		title: '*Industry*', 
		  	    		value: record.Industry__c,
		  	    		short: true,
		  	    		mrkdwn: true
	  	    		});
	  	    		fields.push({
		  	    		title: '*Priority*', 
		  	    		value: record.Priority__c,
		  	    		short: true,
		  	    		mrkdwn: true
	  	    		});
	  	    		fields.push({
		  	    		title: '*Priority Tier*', 
		  	    		value: record.Priority_Tier__c,
		  	    		short: true,
		  	    		mrkdwn: true
	  	    		});
	  	    		fields.push({
		  	    		title: '*Targeted Role*', 
		  	    		value: record.Targeted_Role__c,
		  	    		short: true,
		  	    		mrkdwn: true
	  	    		});
	  	    		fields.push({
		  	    		title: '*Relationship Manager*', 
		  	    		value: (record.Relationship_Manager__r) ? record.Relationship_Manager__r.Name : '',
		  	    		short: true,
		  	    		mrkdwn: true
	  	    		});
	  	    	} 
	  	    	//Intermediary Record Type
	  	    	if( record.RecordType.Name == 'Intermediary' ) {
	  	    		fields.push({
		  	    		title: '*Verticals Covered*', 
		  	    		value: record.Verticals_Covered__c,
		  	    		short: true,
		  	    		mrkdwn: true
	  	    		});
	  	    		fields.push({
		  	    		title: '*Intermediary Type*', 
		  	    		value: record.Intermediary_Type__c,
		  	    		short: true,
		  	    		mrkdwn: true
	  	    		});
	  	    		fields.push({
		  	    		title: '*Banker Type*', 
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
	  	    	res.json({text: "Contacts matching " , attachments: records})
	  	    })
	  	    .on("error", function(err) {
	  	    	console.log('err', err);
	    		res.send({text: err});
	  		})
	  	    .run({ 
	  	    	autoFetch : true, 
	  	    	maxFetch : 4000 
	  	    });

	} else {
		res.send({text: 'Please authenticate with /sfdclogin commmand first'});
	} 	
});

app.listen(app.get('port'), function () {
  console.log('Example app listening on port 3000!')
});