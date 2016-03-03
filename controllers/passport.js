var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;
var Admin = require('../models/admin.js');

// Creates a new admin. Uncomment and comment out passport below to create a new admin.
// passport.use('local-signin', new LocalStrategy({
//     usernameField: 'username',
//     passwordField: 'password',
//     passReqToCallback: true
// }, function(req, username, password, done, err) {
//     Admin.findOne({ 'username': username }, function(err, user) {
//         if (err) { return done(err); }
//         if (!user) {
//             console.log("Creating a new Admin");
//             var newAdmin = new Admin({
//                 username: req.body.username,
//                 password: req.body.password
//             });
            
//             newAdmin.password = newAdmin.generateHash(password);
//             newAdmin.save(function(err) {
//                 if (err) { return done(err); }
//                 return done(null, newAdmin);
//             });
//         } else {
//             console.log("Unsuccessful in creating a new Admin");
//             return done(null, false);
//         }
//     })
// }));

// Signs admin users in to see dashboard to accept/decline events
passport.use('local-signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, username, password, done) {
    Admin.findOne({ 'username': req.body.username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
            console.log("User doesn't exist");
            return new Error("User doesn't exist");
        }
        if (!user.validPassword(req.body.password)) {
            console.log("Password is incorrect.");
            return new Error("Password is incorrect");
        } else {
            console.log("User sucessfully signed in.");
            done(null, user);
        }
    });
}))