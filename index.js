// Setup basic express server
var path = require('path');
var serveStatic = require('serve-static');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3331;
var distributor = require("./distributor.js")(io);

app.use(serveStatic('public'));

app.get("/", function(req, res){
	res.sendfile("public/index.html");
});

server.listen(port, function () {
	console.log('Server listening at port %d', port);
});