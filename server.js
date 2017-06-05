"use strict";

let SLACK_LOGIN_TOKEN = process.env.SLACK_LOGIN_TOKEN;
let SLACK_LOGOUT_TOKEN = process.env.SLACK_LOGOUT_TOKEN;
let SF_CLIENT_ID = process.env.SF_CLIENT_ID;
let SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
let SF_LOGIN_URL = process.env.SF_LOGIN_URL;
let SF_REFRESH_TOKEN = process.env.SF_REFRESH_TOKEN;
let SF_ACCESS_TOKEN = process.env.SF_ACCESS_TOKEN;
let SF_USER_NAME = process.env.SF_USER_NAME;
let SF_PASSWORD = process.env.SF_PASSWORD;

/*let oauth2 = require('./modules/salesforceOauth')*/
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let jsforce = require('jsforce');

let slackConnections = {};

app.enable('trust proxy');
app.set('port', process.env.PORT || 5000);
app.use('/', express.static(__dirname + '/www'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/login', function(req, res){
	
	let oauth2 = new sf.OAuth2({
		loginUrl : SF_LOGIN_URL,
	    clientId: SF_CLIENT_ID,
	    clientSecret: SF_CLIENT_SECRET,
	    redirectUri: ''
	});
	
	slackConnections[req.user_id] = {};

	app.get('/oauth2/auth', function(oAuth2Req, oAuth2Res){
		oAuth2Res.redirect(oauth2.getAuthorizationUrl({scope:req.user_id}));
	});
	
	app.get('/oauth2/callback', function(oAuth2CallbackReq, oAuth2CallbackRes) {
		let conn = new jsforce.Connection({oauth2: oauth2});
		let code = req.query.code;
		conn.authorize(code, function(err, userInfo) {
	        if (err) { return console.error(err); }
	        slackConnections[req.user_id] = {
	        	'accessToken' : conn.accessToken,
	        	'refreshToken': conn.refreshToken
	        }
	        res.send({text:'Login Successful'});
	    });
	});	
});

app.post('/contact', function(req, res) {
	let records = [];

	let conn = new jsforce.Connection({
		loginUrl : SF_LOGIN_URL
	});
	
	conn.login(SF_USER_NAME, SF_PASSWORD, function(err, userInfo) {
	  	if (err) { return console.error(err); }
	  	conn.query("Select Id, Name, Account.Name, Phone from Contact where Name Like '%" + req.body.text + "%'")
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
	  	    	res.json({text: "Contacts matching '" , attachments: records})
	  	    })
	  	    .run({ 
	  	    	autoFetch : true, 
	  	    	maxFetch : 4000 
	  	    });
	});
});

app.listen(app.get('port'), function () {
  console.log('Example app listening on port 3000!')
});







/*
let connection = {};

if(!SF_REFRESH_TOKEN || !SF_ACCESS_TOKEN) {
	
	let aouth2 = new sf.OAuth2({
		clientId: SF_CLIENT_ID,
		clientSecret: SF_CLIENT_SECRET,
		redirectUri : ''
	});

	app.get('/oauth2/auth', function(req, res){
		res.redirect(aouth2.getAuthorizationUrl({scope: ''}))
	});

	app.get('/oauth2/callback', function(req, res) {
	  let conn = new sf.Connection({ oauth2 : oauth2 });
	  connection = conn;
	  let code = req.param('code');
  		conn.authorize(code, function(err, userInfo) {
    		if (err) { 
    			return console.error(err); 
    		}
    		process.env.SF_REFRESH_TOKEN  = conn.refreshToken;
			process.env.SF_ACCESS_TOKEN = conn.refreshToken;    
	  	});
	});
} else {
	let conn = new jsforce.Connection({
		oauth2: {
			clientId: SF_CLIENT_ID,
			clientSecret: SF_CLIENT_SECRET,
			redirectUri: ''
		},
		instanceUrl: SF_LOGIN_URL,
		accessToken: SF_ACCESS_TOKEN, 
		refreshToken: SF_REFRESH_TOKEN
	});
	conn.on('refresh', function(accessToken, res) {
		process.env.SF_REFRESH_TOKEN = res;
		process.env.SF_ACCESS_TOKEN = accessToken;
	});
	connection = conn;
}*/

/*app.enable('trust proxy');
app.set('port', process.env.PORT || 5000);
app.use('/', express.static(__dirname + '/www'));
app.use(bodyParser.urlencoded({extended: true}));    
*/
/*app.post('/contact', function(req, res){
	var records = [];
	var query = connection.query("Select Id, Name from Contact where Name Like '%" + req.body.text + "%'")
			   .on('record',function(record){
			   		records.push(record);
				})
			   .on('end', function(){
			   		console.log('query', query.totalSize);
			   		console.log('query', query.totalFetched);
			   })
			   .on('err', function(){
			   		console.log('err', err);
			   })
			   .run({
			   		autoFetch: true,
			   		maxFetch: 4000
			   })
	console.log('dddddddd', req.body.text);		   
}); */