'use strict';

var mongoose = require('mongoose');
var dbConfig = require('../secret/config-mongo.json');

var eventsSchema = new mongoose.Schema({
	eventname: String,
	fblink: String,
	orgname: String,
	start: String,
	end: String,
	loc: String,
	room: String,
	description: String,
    approved: Boolean
});

var Events = mongoose.model('Event', eventsSchema);

module.exports = mongoose.model('Event', eventsSchema);