'use strict';

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var mongoose = require('mongoose');
var dbConfig = require('./secret/config-mongo.json');
var passport = require('passport');
var moment = require('moment-timezone');

var Events = require('./models/events.js');
var Admin = require('./models/admin.js');

// password used to hash the session IDs
// Terminal: 
// uuidgen
// export COOKIE_SIG_SECRET="05e8c46b-d0f8-4208-b0ac-fc2944150052"
var cookieSigSecret = process.env.COOKIE_SIG_SECRET;
if (!cookieSigSecret) {
	console.error('Please set COOKIE_SIG_SECRET');
	process.exit(1);
}

var app = express();
app.use(morgan('dev'));

// parse JSON post bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: cookieSigSecret,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore()
}));

// Begins Passport Serializing the user
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/static/public'));

// Signs the User Out
app.get('/signout', function(req, res) {
    req.logout();
    res.redirect('../index.html');
});

// Connects to the Database
mongoose.connect(dbConfig.url);
mongoose.connection.on('error', function(err) {
    console.error(err);
});

// Locates to Sign the Admin in
app.post('/secure/signin', passport.authenticate('local-signin'),
    function(req, res) { return res.json(req.user); }
);

// Posts a new event
app.post('/newevent', function(req, res) {
    Events.find({ 'orgname': req.body.orgname }, function(err, org) {
        if (err) { return done(err); }
        var newEvent = new Events({
            eventname: req.body.eventname,
            fblink: req.body.link,
            orgname: req.body.orgname,
            start: moment.tz(Date.parse(req.body.start), "America/Los_Angeles").format(),
            end: moment.tz(Date.parse(req.body.end), "America/Los_Angeles").format(),
            loc: req.body.loc,
            room: req.body.room,
            description: req.body.description,
            approved: false
        });
        
        if (org.length == 0) {
            console.log("Organization doesn't exist, curently adding organization and event to database");            
            newEvent.save(function(err) {
                if (err) { return done(err); }
                return res.status(200).json({ message: "New event successfully created" });
            });
        } else {
            var exists = false;
            for (var i = 0; i < org.length; i++) {
                if (org[i].eventname == req.body.eventname) {
                    exists = true;
                    console.log("Event already exists");
                    return res.status(400).json({ message: "Event already exists" });
                }
            }
            if (!exists) {
                newEvent.save(function(err) {
                    if (err) { return done(err); }
                    return res.status(200).json({ message: "New event successfully created" });
                });
            }
        }
    });
});

app.get('/api/v1/eventslist', function(req, res) {
    Events.find(function(err, events) {
        if (events.length == 0) {
            // res.json("No current events.");
            res.status(400).json({ message: "No Current Events." });
        } else {
            res.json(events);
        }
    });
});

// listen for HTTP requests on port 80
app.listen(80, function() {
	console.log('server is listening');
});