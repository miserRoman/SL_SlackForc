"use strict";

let SLACK_LOGIN_TOKEN = process.env.SLACK_LOGIN_TOKEN;
let SLACK_LOGOUT_TOKEN = process.env.SLACK_LOGOUT_TOKEN;
let SF_CLIENT_ID = process.env.SF_CLIENT_ID;
let SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
let SF_LOGIN_URL = process.env.SF_LOGIN_URL;
let SF_REFRESH_TOKEN = process.env.SF_REFRESH_TOKEN;
let SF_ACCESS_TOKEN = process.env.SF_ACCESS_TOKEN;
let SF_LOGIN_URL = process.env.SF_LOGIN_URL;

let mappings = {};
let connection = {};

let jsforce = require('jsforce');

exports.login = (req, res) => {
		
}

exports.oAuthLogin = (req, res) => {
	res.redirect(oAuth2.getAuthorizationUrl({ scope : 'api id web' }));
}

exports.oAuthCallback = (req, res) => {

}

exports.sfConnection = connection;
exports.getSlackUserMappings = (slackUserId) => mappings[slackUserId];