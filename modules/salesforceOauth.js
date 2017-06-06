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

exports.sfrequest = (oauth, path, options) => new Promise((resolve, reject) => {

    if (!oauth || (!oauth.access_token && !oauth.refresh_token)) {
        reject({code: 401});
        return;
    }

    options = options || {};

    options.method = options.method || 'GET';

    // dev friendly API: Add leading '/' if missing so url + path concat always works
    if (path.charAt(0) !== '/') {
        path = '/' + options.path;
    }

    options.url = oauth.instance_url + path;

    options.headers = options.headers || {};

    options.headers["Accept"]= "application/json";
    options.headers["Authorization"] = "Bearer " + oauth.access_token;

    request(options, function (error, response, body) {
        if (error) {
            console.log(error);
            if (response.statusCode === 401) {
                // Could implement refresh token and retry logic here
                reject({code: 401});
            } else {
                reject(error);
            }
        } else {
            resolve(body);
        }
    });

});

exports.loginLink = (req, res) => {
	res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + req.query.user_id);
}

exports.oAuthLink = (req, res) => {
	res.redirect(`${SF_LOGIN_URL}/services/oauth2/authorize?response_type=code&client_id=${SF_CLIENT_ID}&redirect_uri=https://salesforce-slack-connect.herokuapp.com/oauthcallback&state=${req.params.slackUserId}`);
}

exports.oAuthCallback = (req, res) => {

}

exports.getSlackUser = (slackUserId) => slackConnection[slackUserId];