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
                if (org[i].eventname == req.body.eventname && org[i].start == newEvent.start && org[i].loc == req.body.loc) {
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

// Shows approved events
// app.get('/api/v1/eventslist', function(req, res) {
//     Events.find(function(err, events) {
//         if (events.length == 0 || err) {
//             console.log("No Current Events");
//             res.status(400).json({ message: "No Current Events." });
//         } else {
//             // res.json(events);
//             var eventslist = [];
//             for (var i = 0; i < events.length; i++) {
//                 if (events[i].approved) {
//                     eventslist.push(events[i]);
//                 }
//             }
//             if (eventslist.length == 0) {
//                 res.status(401).json({ message: "No events have been approved yet." });
//             } else {
//                 res.json(eventslist);
//             }
//         }
//     });
// });

// Events for the next 7 days
app.get('/api/v1/events7', function(req, res) {
    var today = new Date();
    var week = new Date();
    week.setDate(week.getDate() + 7);
    
    Events.find(function(err, events) {
        if (events.length == 0 || err) {
            console.log("No Current Events");
            res.status(400).json({ message: "No Current Events." });
        } else {
            var eventslist = [];
            for (var i = 0; i < events.length; i++) {
                if (events[i].approved) {
                    var start = new Date(events[i].start);
                    
                    if (start >= today && start < week) {
                        eventslist.push(events[i]);
                    }
                }
            }
            if (eventslist.length == 0) {
                res.status(401).json({ message: "No events have been approved yet." });
            } else {
                res.json(eventslist);
            }
        }
    });
});

// Events for the next month (31) days
app.get('/api/v1/events31', function(req, res) {
    var today = new Date();
    today.setDate(today.getDate() + 7)
    var month = new Date();
    month.setDate(month.getDate() + 31);
    
    Events.find(function(err, events) {
        if (events.length == 0 || err) {
            console.log("No Current Events");
            res.status(400).json({ message: "No Current Events." });
        } else {
            var eventslist = [];
            for (var i = 0; i < events.length; i++) {
                if (events[i].approved) {
                    var start = new Date(events[i].start);
                    
                    if (start >= today && start < month) {
                        eventslist.push(events[i]);
                    }
                }
            }
            if (eventslist.length == 0) {
                res.status(401).json({ message: "No events have been approved yet." });
            } else {
                res.json(eventslist);
            }
        }
    });
});

// All events after 31 days from today's date
app.get('/api/v1/allevents', function(req, res) {
    var today = new Date();
    today.setDate(today.getDate() + 31);
    
    Events.find(function(err, events) {
        if (events.length == 0 || err) {
            console.log("No Current Events");
            res.status(400).json({ message: "No Current Events." });
        } else {
            var eventslist = [];
            for (var i = 0; i < events.length; i++) {
                if (events[i].approved) {
                    var start = new Date(events[i].start);
                    
                    if (start >= today) {
                        eventslist.push(events[i]);
                    }
                }
            }
            if (eventslist.length == 0) {
                res.status(401).json({ message: "No events have been approved yet." });
            } else {
                res.json(eventslist);
            }
        }
    });
});

require('./controllers/passport.js');

// Locates to Sign the Admin in
app.post('/secure/signin', passport.authenticate('local-signin'),
    function(req, res) { return res.json(req.user); }
);

// Checks to see if use hard-coded the url and if they're logged in or not
app.use(function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/index.html');
    } else {
        next();
    }
});

// Goes to Profile Page 
app.use(express.static(__dirname + '/static/secure/'));

app.get('/dashboard', function(req, res) {
    console.log("Gets in here for dashboard.html");
    res.json(req.user);
});

app.get('/api/v1/admin/approve/', function(req, res) {
    Events.find(function(err, events) {
        if (events.length == 0 || err) {
            console.log("No approved events.");
            res.status(400).json({ message: "No Approved Events."});
        } else {
            res.json(events);
        }
    })
})

// Grab All Events Awaiting Approval
app.get('/api/v1/admin/approve/wait', function(req, res) {
    Events.find(function(err, events) {
        if (events.length == 0 || err) {
            console.log("No Current Events");
            res.status(400).json({ message: "No Current Events." });
        } else {
            var eventslist = [];
            for (var i = 0; i < events.length; i++) {
                if (!events[i].approved) {
                    eventslist.push(events[i]);
                }
            }
            if (eventslist.length == 0) {
                res.status(401).json({ message: "No events to approve." });
            } else {
                res.json(eventslist);
            }
        }
    });
});

// Displays upcoming approved events
app.get('/api/v1/admin/approve/approved', function(req, res) {
    var today = new Date();
    
    Events.find(function(err, events) {
        if (events.length == 0 || err) {
            console.log("No Current Events");
            res.status(400).json({ message: "No Current Events." });
        } else {
            var eventslist = [];
            for (var i = 0; i < events.length; i++) {
                var start = new Date(events[i].start);
                if (events[i].approved && start >= today) {
                    eventslist.push(events[i]);
                }
            }
            if (eventslist.length == 0) {
                res.status(401).json({ message: "No events have been approved." });
            } else {
                res.json(eventslist);
            }
        }
    })
})

// Event has been approved.
app.post('/api/v1/admin/approve/:event_id', function(req, res) {
    Events.findById(req.params.event_id, function(err, event) {
        event.approved = true;
        event.save(function(err) {
            if (err) { console.log(err); }
        });
        res.status(202).json({ message: "Event Approved." });
    });
});

// All past approved events
app.get('/api/v1/admin/past', function(req, res) {
    var today = new Date();

    Events.find(function(err, events) {
        var pastEvents = [];
        for (var i = 0; i < events.length; i++) {
            var edate = Date.parse(events[i].start);
            if (Date.parse(events[i].start) < today) {
                pastEvents.push(events[i]);
            }
        }
        if (pastEvents.length == 0) {
            res.status(401).json({ message: "No events have passed." });
        } else {
            res.json(pastEvents);
        }
    });
})

// Admin declined the approval. Remove from database.
app.delete('/api/v1/admin/decline/:event_id', function(req, res) {
    Events.findById(req.params.event_id, function(err, event) {
        event.remove({ "_id": req.params.event_id});
        console.log("Successfully Removed the Event");
    });
    Events.find(function(err, events) {
        if (events.length == 0 || err) {
            console.log("No Current Events");
            res.status(400).json({ mesage: "No Current Events." });
        } else {
            res.json(events);
        }
    })
});

// listen for HTTP requests on port 80
app.listen(80, function() {
	console.log('server is listening');
});