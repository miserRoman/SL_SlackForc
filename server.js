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

let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let jsforce = require('jsforce');
let request = require('request');

let connection = require('./salesforceOauth');

let slackConnections = {};

app.enable('trust proxy');
app.set('port', process.env.PORT || 5000);
app.use('/', express.static(__dirname + '/www'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/login', connection.loginLink);
app.get('/login/:slackUserId', connection.oAuthLink);

/*app.get('/login', function(req, res){
	res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + req.query.user_id);
});*/

/*app.get('/login/:slackUserId', function(req, res){
	res.redirect(`${SF_LOGIN_URL}/services/oauth2/authorize?response_type=code&client_id=${SF_CLIENT_ID}&redirect_uri=https://salesforce-slack-connect.herokuapp.com/oauthcallback&state=${req.params.slackUserId}`);
});*/

app.get('/oauthcallback', function(req, res){
	let slackUserId = req.query.state;
	let options = {
        url: `${SF_LOGIN_URL}/services/oauth2/token`,
        qs: {
            grant_type: "authorization_code",
            code: req.query.code,
            client_id: SF_CLIENT_ID,
            client_secret: SF_CLIENT_SECRET,
            redirect_uri: `https://salesforce-slack-connect.herokuapp.com/oauthcallback`
        }
    };
    request.post(options, function (error, response, body){
    	if (error) {
            console.log(error);
            return res.send("error");
        }
        slackConnections[slackUserId] = JSON.parse(body);
        let html = `
            <html>
            <body style="text-align:center;padding-top:100px">
            <img src="images/linked.png"/>
            <div style="font-family:'Helvetica Neue';font-weight:300;color:#444">
                <h2 style="font-weight: normal">Authentication completed</h2>
                Your Slack User Id is now linked to your Salesforce User Id.<br/>
                You can now go back to Slack and execute authenticated Salesforce commands.
            </h2>` + body + ` 
            </body>
            </html>
            `;
        res.send(html);
    });
});

app.post('/contact', function(req, res) {
	
	let slackUserId = req.body.user_id;

	if( !slackConnections[slackUserId] ) {
		res.send({text: 'Please authenticate with /sfdclogin commmand first'});
	}

	console.log('connection', slackConnections[slackUserId]);

	let conn = new jsforce.Connection({
		oauth2 : {
			clientId : SF_CLIENT_ID,
			clientSecret : SF_CLIENT_SECRET,
			redirectUri : ''
		},
		instanceUrl : SF_LOGIN_URL,
		accessToken : slackConnections[slackUserId].access_token,
		refreshToken : slackConnections[slackUserId].refresh_token
	});
	conn.on('refresh', function(accessToken, resp) {
  			
  	});
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