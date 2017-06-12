"use strict";

let memjs = require("memjs").Client;
let mjs = memjs.create();

exports.getOAuth2Token = (slackUserId) => {
	return new Promise((resolve, reject)=>{
		mjs.get(slackUserId, function(err, oauth2Token){
			if( oauth2Token ) {
				resolve(oauth2Token)
			} else {
				reject();
			}
		});
	})
}

exports.setOAuth2Token = (slackUserId, oauth2Token) => {
	mjs.set(slackUserId, oauth2Token, function(err){

	});
}
