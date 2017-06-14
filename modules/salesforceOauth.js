"use strict";

let SF_CLIENT_ID = process.env.SF_CLIENT_ID;
let SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
let SF_LOGIN_URL = process.env.SF_LOGIN_URL;

let request = require('request');
let jsforce = require('jsforce');
let memory = require('./memcachier');

let slackConnections = {};

exports.loginLink = (req, res) => {
	memory.getOAuth2Token(req.query.user_id).then(function(oAuthToken){
        res.send({text: '*Already authenticated!!*'});        
    }, function(){
        res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + req.query.user_id);
    })
}

exports.oAuthLink = (req, res) => {
    res.redirect(`${SF_LOGIN_URL}/services/oauth2/authorize?response_type=code&prompt=login&display=popup&client_id=${SF_CLIENT_ID}&redirect_uri=https://${req.hostname}/oauthcallback&state=${req.params.slackUserId}`);
}

exports.oAuthCallback = (req, res) => {
    let slackUserId = req.query.state;

    let options = {
        url: `${SF_LOGIN_URL}/services/oauth2/token`,
        qs: {
            grant_type: "authorization_code",
            code: req.query.code,
            client_id: SF_CLIENT_ID,
            client_secret: SF_CLIENT_SECRET,
            redirect_uri: `https://${req.hostname}/oauthcallback`
        }
    };
    request.post(options, function (error, response, body){
        if (error) {
            console.log(error);
            return res.send("error");
        }
        
        let successFunction = function() {
            let htmlSuccess = `<html>
                        <body style="text-align:center;padding-top:100px">
                            <div style="font-family:'Helvetica Neue';font-weight:300;color:#444">
                                <h2 style="font-weight: normal">
                                    Authentication completed
                                </h2>
                                <h3>
                                    Your Slack User Id is now linked to your Salesforce User Id.<br/>
                                    You can now go back to Slack and execute authenticated Salesforce commands.
                                </h3>
                            </div><br/>
                        </body>
                    </html>`;
            res.send(htmlSuccess);        
        } 
        let failureFunction = function() {
            let htmlError = `<html>
                        <body style="text-align:center;padding-top:100px">
                            <div style="font-family:'Helvetica Neue';font-weight:300;color:#444">
                                <h2 style="font-weight: normal">
                                    Authentication Error
                                </h2>
                            </div><br/>
                        </body>
                    </html>`;
            res.send(htmlError);        
        }
        memory.setOAuth2Token(slackUserId, body).then(successFunction, failureFunction);
    });
}

exports.getOauthConnection = (slackUserId) => {
    return new Promise((connResolve, connReject) => {
        memory.getOAuth2Token(slackUserId).then(function(oAuth2Token){
            connResolve(getSalesforceConnection(oAuth2Token, slackUserId));
        }, function(){
            connReject();
        });
    });    
}

let getSalesforceConnection = (oAuth2Token, slackUserId) => {
    let conn = new jsforce.Connection({
            oauth2 : {
                clientId : SF_CLIENT_ID,
                clientSecret : SF_CLIENT_SECRET,
                redirectUri : ''
            },
            accessToken: oAuth2Token.access_token,
            refreshToken: oAuth2Token.refresh_token,
            instanceUrl: oAuth2Token.instance_url,
            id: oAuth2Token.id
        });
     
    conn.on('refresh', function(accessToken, resp) {
        oAuth2Token.access_token = accessToken;
        memory.setOAuth2Token(slackUserId, oAuth2Token).then(function(){},function(){});             
    });

    return conn;
}

exports.getSlackUser = (slackUserId) => slackConnections[slackUserId];
