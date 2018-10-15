'use strict'

var config = require('./config');
var utils = require('utils');

var url = 'https://www.dmv.ca.gov/wasapp/foa/clear.do?goTo=officeVisit';
var firstName = config.firstName;
var lastName = config.lastName;
var areaCode = config.areaCode;
var telPrefix = config.telPrefix;
var telSuffix = config.telSuffix;

var monthMap = config.monthMap;

var botToken = config.botToken;
var chatId = config.chatId;
var text = config.text;

var city;
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

  city = casper.cli.get('city');
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
    var selector = utils.format('select option:eq(%s)', city);
    this.evaluate(function(selector) {
      $(selector).prop('selected', true);
    }, selector);
  });

  casper.then(function () {
    this.echo('Clicking a one task...');
    this.click('#one_task');
  });

  casper.then(function() {
    this.echo('Clicking on "Replace ID"');
    this.click('#taskRID');
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
    this.waitForSelector('.panel-heading', function _then() {
        this.echo('Page loaded.');
    }, function _onTimeout() {
        this.echo('Timeout, give up.');
        this.exit();
    });
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
        this.echo('Clicking on "Continue" to schedule');
        this.click('.btn-primary');
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
        this.echo('Sending area code...');
        this.sendKeys('#notify_telArea', areaCode);
    });
    
    casper.then(function() {
        this.echo('Sending telPrefix...');
        this.sendKeys('#notify_telPrefix', telPrefix);
    });
    
    casper.then(function() {
        this.echo('Sending telSuffix...');
        this.sendKeys('#notify_telSuffix', telSuffix);
    });
    
    casper.then(function() {
        this.echo('Clicking on "Continue" to schedule');
        this.click('.btn-primary');
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
        this.echo('Clicking on "Confirm" to confirm');
        this.click('.btn-primary');
    });
    
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

runTheGhooooOOoost();
