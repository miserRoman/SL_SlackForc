/*"use strict";

let SLACK_LOGIN_TOKEN = process.env.SLACK_LOGIN_TOKEN;
let SLACK_LOGOUT_TOKEN = process.env.SLACK_LOGOUT_TOKEN;
let SF_CLIENT_ID = process.env.SF_CLIENT_ID;
let SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
let SF_LOGIN_URL = process.env.SF_LOGIN_URL;
let SF_REFRESH_TOKEN = process.env.SF_REFRESH_TOKEN;
let SF_ACCESS_TOKEN = process.env.SF_ACCESS_TOKEN;

let mappings = {};

let jsforce = require('jsforce');

let oth = {};

exports.login = (req, res) => {
	let oauth2 = new sf.OAuth2({
	  	clientId : SF_CLIENT_ID,
	  	clientSecret : SF_CLIENT_SECRET,
	  	redirectUri : ''
	});
	oth = oauth2;
}

exports.oAuthLogin = (req, res) => {
	res.redirect(oth.getAuthorizationUrl({ scope :  }));
}

exports.oAuthCallback = (req, res) => {
	var conn = new sf.Connection({ oauth2 : oth });
  	var code = req.param('code');
  	conn.authorize(code, function(err, userInfo) {
	    if (err) { return console.error(err); }
	    mappings[]
	    console.log(conn.accessToken);
	    console.log(conn.refreshToken);
	    console.log(conn.instanceUrl);
	    console.log("User ID: " + userInfo.id);
	    console.log("Org ID: " + userInfo.organizationId);
	});
}

exports.getSlackUserMappings = (slackUserId) => mappings[slackUserId];*/