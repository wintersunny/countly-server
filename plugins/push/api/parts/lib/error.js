'use strict';

var util = require('util');

var PushlyError = function(code, name, messageId, deviceTokens) {
	Error.call(this, [name]);
	this.code = code;
    this.message = name;
	if (messageId) this.messageId = messageId;				// Message ID responsible for this error
	if (deviceTokens) {										// Array of objects: {bad: 'bad token'}, or {bad: 'bad token', good: 'new token for GCM'}
		var tokens = [];
		deviceTokens.forEach(function(d){
			if (d.bad instanceof Buffer) {
				// do nothing
			} else if (typeof d.bad === 'string') {
				// do nothing
			} else if (d.bad.type === 'Buffer') {
				d.bad = new Buffer(d.bad.data);
				if (d.good) {
					d.good = new Buffer(d.good.data);
				}
			}
			tokens.push(d);
		});
		this.deviceTokens = tokens;
	}

	Object.defineProperties(this, {
		isRecoverable: {
			value: function(){
				return (this.code & PushlyError.IS_RECOVERABLE) > 0;
			}
		},
		isNonRecoverable: {
			value: function(){
				return (this.code & PushlyError.IS_NON_RECOVERABLE) > 0;
			}
		},
		isSkippable: {
			value: function(){
				return (this.code & PushlyError.IS_SKIPPABLE) > 0;
			}
		},
		isConnection: {
			value: function(){
				return this.code === PushlyError.CONNECTION;
			}
		},
		isCredentials: {
			value: function(){
				return this.code === PushlyError.CREDENTIALS;
			}
		},
		isMessage: {
			value: function(){
				return this.code === PushlyError.MESSAGE;
			}
		},
		isToken: {
			value: function(){
				return this.code === PushlyError.TOKEN;
			}
		},
	});
};

util.inherits(PushlyError, Error);

PushlyError.IS_RECOVERABLE 			= 1 << 1;	// Notification can be resent									2
PushlyError.IS_NON_RECOVERABLE 		= 1 << 2;	// Message cannot be processed									4
PushlyError.IS_SKIPPABLE			= 1 << 3;	// Notification should be removed from queue					8

PushlyError.CONNECTION 				= 1 << 6  | PushlyError.IS_RECOVERABLE;									//  66
PushlyError.CREDENTIALS 			= 1 << 7  | PushlyError.IS_NON_RECOVERABLE;								// 	132
PushlyError.MESSAGE 				= 1 << 8  | PushlyError.IS_NON_RECOVERABLE;								// 	260
PushlyError.TOKEN 					= 1 << 9  | PushlyError.IS_RECOVERABLE | PushlyError.IS_SKIPPABLE;		// 	522
PushlyError.ILLEGAL_STATE			= 1 << 10 | PushlyError.IS_NON_RECOVERABLE;								// 	1028

module.exports = PushlyError;
