var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());
var indexHTML = fs.readFileSync('index.html');
var buf = new Buffer(indexHTML);

app.get('/', function(request, response) {
	response.send(buf.toString());
});

var port = process.env.PORT || 3002;
app.listen(port, function() {
	console.log("Listening on " + port);
});

