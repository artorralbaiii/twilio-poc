'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cfenv = require('cfenv');
var appenv = cfenv.getAppEnv();
var services = appenv.isLocal ? config.services : appenv.services;
var twilioService = services["user-provided"];
var twilioCredentials = twilioService[0].credentials;

var port = process.env.PORT || 3000;
var app = express();

/*** MIDDLEWARES ***/

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/pages/');
app.use(express.static('./src/client/'));

/*** ROUTES ***/

app.get('/', function (req, res) {
    res.render('home');
});

var twilioClient = require('twilio')(twilioCredentials.accountSID, twilioCredentials.authToken);

app.post('/', function (req, res) {

    twilioClient.sendMessage({
        to: req.body.mobileNumber,
        from: process.env.TWILIO_NUMBER,
        body: req.body.message
    }, function (err, data) {
        if (err) {
            res.render('result', {
                message: err.message
            });
            return;
        }

        res.render('result', {
            message: 'Message Sent! (Reference ID: ' + data.sid + ')'
        });

    });

});

/*** SERVER ***/

app.listen(port, function () {
    console.log('Express server listening on port ' + port);
    console.log('\n__dirname = ' + __dirname +
        '\nprocess.cwd = ' + process.cwd());
});