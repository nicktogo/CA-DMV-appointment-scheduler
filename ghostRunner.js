'use strict'

var config = require('./config');
var utils = require('utils');

var findDriveTestUrl = 'https://www.dmv.ca.gov/wasapp/foa/findDriveTest.do';
var checkForDriveTestConflictsUrl = 'https://www.dmv.ca.gov/wasapp/foa/checkForDriveTestConflicts.do';
var selectNotificationUrl = 'https://www.dmv.ca.gov/wasapp/foa/selectNotification.do';
var confirmApptUrl = 'https://www.dmv.ca.gov/wasapp/foa/confirmAppt.do';
// var recaptchaToken = config.g-recaptcha-response;

var url = 'https://www.dmv.ca.gov/wasapp/foa/clear.do?goTo=driveTest&localeName=en';
var firstName = config.firstName;
var lastName = config.lastName;
var areaCode = config.areaCode;
var telPrefix = config.telPrefix;
var telSuffix = config.telSuffix;

var dlNumber = config.dlNumber;
var birthMM = config.birthMM;
var birthDD = config.birthDD;
var birthYYYY = config.birthYYYY;

var monthMap = config.monthMap;

var botToken = config.botToken;
var chatId = config.chatId;
var text = config.text;

var officeId;
var rawDate;
var days;
var notify;
var booked = false;

function CasperException(message, stack) {
  this.name = 'CasperException';
  this.message = message;
  this.stack = stack;
}

function createAGhost() {
  var casper = require('casper').create({
    clientScripts: ['./jquery.min.js'],
    waitTimeout: 1000 * 60,
    verbose: true
  });

  officeId = casper.cli.get('officeId');
  days = casper.cli.get('days');

  casper.on('error', function(msg, backtrace) {
    this.echo('Exception: ' + msg + backtrace);
    this.capture('./out/error.png');
    throw new CasperException(msg, backtrace);
  });
  casper.on('remote.message', function(msg) {
    this.echo('remote console.log:' + msg);
  });
  return casper;  
}

function runTheGhooooOOoost () {
  var casper = createAGhost();
  casper.start();
  
  casper.then(function() {
     var body = {
         'numberItems': '1',
         'mode': 'DriveTest',
         'officeId': officeId,
         'requestedTask': 'DT',
         'firstName': firstName,
         'lastName': lastName,
         'dlNumber': dlNumber,
         'birthMonth': birthMM,
         'birthDay': birthDD,
         'birthYear': birthYYYY,
         'telArea': areaCode,
         'telPrefix': telPrefix,
         'telSuffix': telSuffix,
         'resetCheckFields': 'true'
     };
     httpPost(this, findDriveTestUrl, body);
     this.waitForSelector('#ApptForm', function _then() {
         this.echo('Page loaded.');
     }, function _onTimeout() {
         this.echo('Timeout, give up.');
         this.exit();
     });
  });

  casper.then(function() {
    this.echo('Landed on page: ' + this.getTitle());
  });

  casper.then(function () {
    this.echo('Finding appointment time...');
    rawDate = this.evaluate(function() {
      var apptTime = $('[data-title="Appointment"]').children().last().text().trim();
      console.log('Appointment time is', apptTime);
      return apptTime.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\W\d+/);
    });
    
    this.evaluate(function() {
      var office = $('[data-title="Office"]').children().first().text().trim();
      console.log('Office is: ', office);
    })
  });

  casper.then(function () {
    if (rawDate !== null) {
      var raw = rawDate[0].split(' ');
      var month = monthMap[raw[0]];
      var day = raw[1].length < 2 ? '0' + raw[1] : raw[1];

      var provided = '2018-' + month + '-' + day;
      console.log(provided);

      var nextDay = new Date(provided);
      var today = new Date();
      console.log('Next available: ' + nextDay);
      console.log('Today: ' + today);
      var oneDay = 1000 * 60 * 60 * 24;
      var numDays = Math.ceil(
        (nextDay.getTime() - today.getTime()) / (oneDay)
      );
      
      console.log(numDays);
      
      if (numDays < days && numDays >= 1) {
        console.log('it is good!');
        notify = true;
        makeAppointment(this);
      }
    }
  });

  casper.run(function() {
    this.echo('Done');
    this.exit();
  });
}

function makeAppointment(casper) {
    
    casper.then(function() {
        httpPost(this, checkForDriveTestConflictsUrl, {});
    });
    
    casper.then(function() {
        this.echo('Waiting for next page to load');
        this.waitForSelector('#none_method', function _then() {
            this.echo('Page loaded.');
        }, function _onTimeout() {
            this.echo('Timeout, give up.');
            this.exit();
        });
    });
    
    casper.then(function() {
        var data = {
            'notify_smsTelArea': '',
            'notify_smsTelPrefix': '',
            'notify_smsTelSuffix': '',
            'notify_smsTelArea_confirm': '',
            'notify_smsTelPrefix_confirm': '',
            'notify_smsTelSuffix_confirm': '',
            'notify_email': '',
            'notify_email_confirm': '',
            'telArea': areaCode,
            'telPrefix': telPrefix,
            'telSuffix': telSuffix,
            'notify_telArea': '',
            'notify_telPrefix': '',
            'notify_telSuffix': '',
            'notificationMethod': 'NONE'
        };
        httpPost(this, selectNotificationUrl, data);
    });
    
    casper.then(function() {
        this.echo('Waiting for next page to load');
        this.waitForSelector('.warning', function _then() {
            this.echo('Page loaded.');
        }, function _onTimeout() {
            this.echo('Timeout, give up.');
            this.exit();
        });
    });
    
    casper.then(function() {
        httpPost(this, confirmApptUrl, {});
    })
    
    casper.then(function() {
        this.echo('Waiting for next page to load');
        this.waitForSelector('.alert-success', function _then() {
            this.echo('Page loaded.');
        }, function _onTimeout() {
            this.echo('Timeout, give up.');
            this.exit();
        });
        this.echo('Success to book!');
    });
    
    casper.then(function() {
        var url = utils.format('https://api.telegram.org/%s/sendMessage?chat_id=%s&text=%s', botToken, chatId, text);
        this.open(url).then(function () {
            this.echo('Message sent.');
            booked = true;
        });
    })
}

function httpPost(casper, url, data) {
    casper.then(function() {
        this.open(url, {
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'insomnia/5.16.1'
            },
            data: data
        }).then(function() {
            this.echo(utils.format('Posting to %s', url));
        });
    })
}

runTheGhooooOOoost();
