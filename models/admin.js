'use strict';

var mongoose = require('mongoose');
var dbConfig = require('../secret/config-mongo.json');
var bluebird = require('bluebird');
var bcrypt = bluebird.promisifyAll(require('bcrypt'));

// Creates a Admin Schema
var adminSchema = new mongoose.Schema({
    username: String,
    password: String
});

// Generates Hash
adminSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Compares Salts/Hashes given password
adminSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

var Admin = mongoose.model('User', adminSchema);

module.exports = mongoose.model('User', adminSchema);