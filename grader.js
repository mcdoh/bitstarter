#!/usr/bin/env node

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = 'index.html';
var CHECKSFILE_DEFAULT = 'checks.json';

var assertFileExists = function(infile) {
	var instr = infile.toString();

	if (!fs.existsSync(instr)) {
		console.log('%s does not exist, exiting.', instr);
		process.exit(1);
	}

	return instr;
};

var cheerioHtmlFile = function(htmlfile) {
	return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
	return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
	$ = cheerioHtmlFile(htmlfile);
	var checks = loadChecks(checksfile).sort();
	var out = {};

	for (var ii in checks) {
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}

	return out;
};

var checkURL = function(url, checksfile, callback) {
	rest.get(url).on('complete', function(response) {
		$ = cheerio.load(response);
		var checks = loadChecks(checksfile).sort();
		var out = {};

		for (var ii in checks) {
			var present = $(checks[ii]).length > 0;
			out[checks[ii]] = present;
		}

		callback(out);
	});
};

var clone = function(fn) {
	return fn.bind({});
};

if (require.main == module) {
	program
	.option('-c, --checks <check_file>', 'path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <html_file>', 'url to index.html')
	.parse(process.argv);

	if (program.url) {
		checkURL(program.url, program.checks, function(response) {
			var outJSON = JSON.stringify(response, null, 4);
			console.log(outJSON);
		});
	}
	else {
		var checkJSON = checkHtmlFile(program.file, program.checks);
		var outJSON = JSON.stringify(checkJSON, null, 4);
		console.log(outJSON);
	}
}
else {
	exports.checkHtmlFile = checkHtmlFile;
	exports.checkURL = checkURL;
}
