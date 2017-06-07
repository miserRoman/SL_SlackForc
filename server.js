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

	  	let query = "Select Id, Name, Account.Name, Phone from Contact where Name Like '%" + req.body.text + "%' LIMIT 10";
	  	console.log('Query', query)
	  	
	  	conn.query(query)
	  	    .on("record", function(record){
	  	    	let fields = [];
	  	    	fields.push({
	  	    		'title': 'Name', 
	  	    		value: record.Name, 
	  	    		short: true
	  	    	});
	  	    	fields.push({
	  	    		'title': 'Account Name', 
	  	    		value: (record.Account) ? record.Account.Name : '',
	  	    		short: true
	  	    	});
	  	    	fields.push({
	  	    		'title': 'Phone', 
	  	    		value: record.Phone, 
	  	    		short: true
	  	    	});
	  	    	records.push({
	  	    		color: "#A094ED",
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