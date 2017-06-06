"use strict";

let SLACK_LOGIN_TOKEN = process.env.SLACK_LOGIN_TOKEN;
let SLACK_LOGOUT_TOKEN = process.env.SLACK_LOGOUT_TOKEN;
let SF_CLIENT_ID = process.env.SF_CLIENT_ID;
let SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
let SF_LOGIN_URL = process.env.SF_LOGIN_URL;
let SF_REFRESH_TOKEN = process.env.SF_REFRESH_TOKEN;
let SF_ACCESS_TOKEN = process.env.SF_ACCESS_TOKEN;
let SF_LOGIN_URL = process.env.SF_LOGIN_URL;

let slackConnection = {};

exports.loginLink = (req, res) => {
	res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + req.query.user_id);
}

exports.oAuthLink = (req, res) => {
	res.redirect(`${SF_LOGIN_URL}/services/oauth2/authorize?response_type=code&client_id=${SF_CLIENT_ID}&redirect_uri=https://salesforce-slack-connect.herokuapp.com/oauthcallback&state=${req.params.slackUserId}`);
}

exports.oAuthCallback = (req, res) => {

}

exports.getSlackUser = (slackUserId) => slackConnection[slackUserId];