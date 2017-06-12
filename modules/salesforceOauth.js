"use strict";

let SF_CLIENT_ID = process.env.SF_CLIENT_ID;
let SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
let SF_LOGIN_URL = process.env.SF_LOGIN_URL;

let request = require('request');
let jsforce = require('jsforce');
let memory = require('./memcachier');

/*let slackConnections = {};*/

exports.loginLink = (req, res) => {
	/*if( !slackConnections[req.query.user_id] ) {
        res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + req.query.user_id);
    } else {
        res.send({text: '*Already authenticated!!*'});
    }*/
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
        memory.setOAuth2Token(slackUserId, body);
        /*slackConnections[slackUserId] = JSON.parse(body);*/
        let html = `
            <html>
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
            </html>
            `;
        res.send(html);
    });
}

exports.getOauthConnection = (slackUserId) => {
    
    /*let connection = slackConnections[slackUserId];
    
    if( slackConnections[slackUserId] ) {
        let conn = new jsforce.Connection({
            oauth2 : {
                clientId : SF_CLIENT_ID,
                clientSecret : SF_CLIENT_SECRET,
                redirectUri : ''
            },
            accessToken: connection.access_token,
            refreshToken: connection.refresh_token,
            instanceUrl: connection.instance_url,
            id: connection.id
        });
        
        conn.on('refresh', function(accessToken, resp) {
            connection.access_token = accessToken;             
        });

        return conn;
    }*/   
    return new Promise((resolveConn, rejectConn) => {
        memory.getOAuth2Token(slackUserId).then(function(oAuthToken){
            let conn = new jsforce.Connection({
                oauth2 : {
                    clientId : SF_CLIENT_ID,
                    clientSecret : SF_CLIENT_SECRET,
                    redirectUri : ''
                },
                accessToken: oAuthToken.access_token,
                refreshToken: oAuthToken.refresh_token,
                instanceUrl: oAuthToken.instance_url,
                id: oAuthToken.id
            });
        
            conn.on('refresh', function(accessToken, resp) {
                oAuthToken.access_token = accessToken;  
                memory.setOAuth2Token(slackUserId, oAuthToken);           
            });
            console.log('ssssss', conn);

            resolveConn(conn);

        }, function(){
            rejectConn();
        });
    });
}

/*exports.getSlackUser = (slackUserId) => slackConnections[slackUserId];*/
