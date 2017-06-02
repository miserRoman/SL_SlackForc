"use strict";

let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let auth = require('./modules/salesforceOauth');

app.enable('trust proxy');
app.set('port', process.env.PORT || 5000);
app.use('/', express.static(__dirname + '/www'));
app.use(bodyParser.urlencoded({extended: true}));    

app.get('/contact', function(req, res){
	console.log('here')
	auth.salesforceConnection;
}); 

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});