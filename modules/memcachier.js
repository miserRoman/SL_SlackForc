"use strict";

let memjs = require("memjs").Client;
let mjs = memjs.create();

exports.getOAuth2Token = (slackUserId) => {
	return new Promise((resolve, reject)=>{
		mjs.get(slackUserId, function(err, oauth2Token){
			if( oauth2Token ) {
				resolve(JSON.parse(oauth2Token.toString()))
			} else {
				reject();
			}
		});
	})
}

exports.setOAuth2Token = (slackUserId, oauth2Token) => {
	return new Promise((resolve, reject) => {
		mjs.set(slackUserId, oauth2Token, function(err){
			if(err) {
				reject();
			} else {
				resolve();
			}
		});
	});
}

exports.deleteOauth2Token = (slackUserId) => {
	
}
