"use strict";

let SLACK_LOGIN_TOKEN = process.env.SLACK_LOGIN_TOKEN;
let SLACK_LOGOUT_TOKEN = process.env.SLACK_LOGOUT_TOKEN;
let SF_CLIENT_ID = process.env.SF_CLIENT_ID;
let SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
let SF_LOGIN_URL = process.env.SF_LOGIN_URL;
let SF_REFRESH_TOKEN = process.env.SF_REFRESH_TOKEN;
let SF_ACCESS_TOKEN = process.env.SF_ACCESS_TOKEN;

let jsforce = require('jsforce');

let connectiontesting = () => {
	console.log('dddddd')
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
		console.log('res', res)
		process.env.SF_REFRESH_TOKEN = res;
		process.env.SF_ACCESS_TOKEN = accessToken;
	}); 
}

exports.salesforceConnection = () => connectiontesting
