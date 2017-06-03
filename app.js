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
	let connection = new jsforce.Connection({
		oauth2: {
			clientId: SF_CLIENT_ID,
			clientSecret: SF_CLIENT_SECRET,
			redirectUri: ''
		},
		instanceUrl: SF_LOGIN_URL,
		accessToken: SF_ACCESS_TOKEN,
		refreshToken: SF_REFRESH_TOKEN
	});
	connection.on('refresh', function(accessToken, res) {
		process.env.SF_REFRESH_TOKEN = res;
		process.env.SF_ACCESS_TOKEN = accessToken;
	});
}

app.enable('trust proxy');
app.set('port', process.env.PORT || 5000);
app.use('/', express.static(__dirname + '/www'));
app.use(bodyParser.urlencoded({extended: true}));    

app.post('/contact', function(req, res){
	var query = [];
	/*conn.query("Select Id, Name from Contact where Name Like '%" + req.)*/
}); 

app.listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});