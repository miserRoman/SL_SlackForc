"use strict";

let SF_CLIENT_ID = process.env.SF_CLIENT_ID;
let SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
let SF_LOGIN_URL = process.env.SF_LOGIN_URL;

let slackConnections = {};

exports.loginLink = (req, res) => {
	if( !slackConnections[req.query.user_id] ) {
        res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + req.query.user_id);
    } else {
        res.send({text: 'Already authenticated!!'});
    }
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
        slackConnections[slackUserId] = JSON.parse(body);
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
                    </div><br/>` + body + ` 
                </body>
            </html>
            `;
        res.send(html);
    });
}

exports.getSlackUser = (slackUserId) => slackConnection[slackUserId];