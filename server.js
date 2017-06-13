"use strict";

/*let relic = require('newrelic');*/
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let request = require('request');

let salesforce = require('./modules/salesforceOauth');
let contact = require('./modules/contact');

app.enable('trust proxy');
app.set('port', process.env.PORT || 5000);
app.use('/', express.static(__dirname + '/www'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/login', salesforce.loginLink);
app.get('/login/:slackUserId', salesforce.oAuthLink);
app.get('/oauthcallback', salesforce.oAuthCallback);

app.post('/contact', contact.getRecords);

app.listen(app.get('port'), function () {
  console.log('Example app listening on port 3000!')
});