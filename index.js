'use strict'

var ghostRunner = require('./ghostRunner.js');

function setIntervalX(callback, delay, repetitions) {
    var counter = 0;
    var intervalID = setInterval(function () {
    	console.log('doing a run', counter);
       	callback();

       	if (counter++ === repetitions) {
           clearInterval(intervalID);
       	}
    }, delay);
}

var exec = require('child_process').exec;

setIntervalX(function () {
	exec('casperjs --verbose --ignore-ssl-errors=true --ssl-protocol=any ./ghostRunner.js', function(error, stdout, stderr) {
	  if (error) console.log(error);
	  process.stdout.write(stdout);
	  process.stderr.write(stderr);
	});
}, 1000*60, 3);