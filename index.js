// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3331;
var distributor = require("./distributor.js")(io);

app.get("/", function(req, res){
	res.sendfile("public/index.html");
});

server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

var test = io.of("/test");

test.on("connection", function(socket){
	
	socket.join("asf");
	
	socket.on("init", function(){
		socket.emit("new_direct_msg", {
			uid: "2793773712",
			name: "崔斌1",
			count: 2
		});
	});
	socket.on("clear_direct_msg", function(){
		console.log("clear_direct_msg");
	});
	
	setInterval(function(){
		socket.emit("new_direct_msg", {
			uid: "2793773712",
			name: "崔斌1",
			count: 2
		});
	}, 5000);
	
	socket.disconnect();
});

// Routing
app.use(express.static('public'));