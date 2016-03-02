var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;
var Admin = require('../models/admin.js');

passport.use('local-signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, username, password, done, err) {
    Admin.findOne({ 'username': username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
            console.log("Creating a new Admin");
            var newAdmin = new Admin({
                username: req.body.username,
                password: req.body.password
            });
            
            newAdmin.password = newAdmin.generateHash(password);
            newAdmin.save(function(err) {
                if (err) { return done(err); }
                return done(null, newAdmin);
            });
        } else {
            console.log("Unsuccessful in creating a new Admin");
            return done(null, false);
        }
    })
}));