'use strict'

var config = require('./config');

var url = 'https://www.dmv.ca.gov/wasapp/foa/clear.do?goTo=officeVisit';
var firstName = config.firstName;
var lastName = config.lastName;
var areaCode = config.areaCode;
var telPrefix = config.telPrefix;
var telSuffix = config.telSuffix;

var accountSid = config.twilio.accountSid;
var authToken = config.twilio.authToken;
var toNumber = config.twilio.toNumber;
var fromNumber = config.twilio.fromNumber;

var monthMap = config.monthMap;

var twilioLinked = (
  accountSid &&
  authToken &&
  toNumber &&
  fromNumber
);

var city;
var rawDate;
var days;
var notify;

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

  city = casper.cli.get('city').split('_').join(' ');
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
  casper.start(url);

  casper.then(function() {
    this.echo('Landed on page: ' + this.getTitle());
  });

  casper.then(function() {
    this.echo('selecting a city...');
    var value = this.evaluate(function () {
      return $('select option')
      .filter(function () { return $(this).html() === city; }).val()
    })
    this.evaluate(function() {
      $('select option:eq(122)').prop('selected', true);
    });
  });

  casper.then(function () {
    this.echo('Clicking a one task...');
    this.click('#one_task');
  });

  casper.then(function() {
    this.echo('Clicking on "Replace ID"');
    this.click('#taskCID');
  });

  casper.then(function () {
    this.echo('Sending first name...');
    this.sendKeys('#first_name', firstName);
  });

  casper.then(function() {
    this.echo('Sending last name...');
    this.sendKeys('#last_name', lastName);
  });

  casper.then(function() {
    this.echo('Sending area code...');
    this.sendKeys('#areaCode', areaCode);
  });

  casper.then(function() {
    this.echo('Sending telPrefix...');
    this.sendKeys('#telPrefix', telPrefix);
  });

  casper.then(function() {
    this.echo('Sending telSuffix...');
    this.sendKeys('#telSuffix', telSuffix);
  });

  casper.then(function() {
    this.echo('Clicking on "Continue"');
    this.click('.btn-primary');
  });

  casper.then(function () {
    this.echo('Waiting for next page to load');
    this.waitForSelector('.panel-heading');
  });

  casper.then(function () {
    this.echo('Finding appointment time...');
    rawDate = this.evaluate(function() {
      var apptTime = $('[data-title="Appointment"]').children().last().text().trim();
      console.log('Appointment time is', apptTime);
      return apptTime.match(/(March|April|May)\W\d+/);
    });
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
      
      if (numDays < days) {
        console.log('it is good!');
        notify = true;
      }
    }
  });

  casper.then(function() {
    console.log(rawDate)
    if (twilioLinked && notify) {
      var messageBody = 'New appointment slot open: ' + rawDate[0] + 
      '. Schedule appointment here: https://www.dmv.ca.gov/wasapp/foa/findOfficeVisit.do';

      this.echo('Sending twilio request...');
      this.open(
        'https://' + accountSid + ':' + authToken + '@' +
        'api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages',
        {
          method: 'post',
          data: {
            To: toNumber,
            From: fromNumber,
            Body: messageBody
          },
        }
      ).then(function() {
        require('utils').dump(this.getPageContent());
      });
    }
  });

  casper.run(function() {
    this.echo('Done');
    this.exit();
  });
}

runTheGhooooOOoost();

