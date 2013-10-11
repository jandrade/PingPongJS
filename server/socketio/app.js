var server = require('http').createServer(handler),
	io = require('socket.io').listen(server, { log: false }),
	fs = require('fs'),
	so = require('./js/socketio');

var port = process.env.PORT || 8889;
console.log("socket io!!! port: ", port);
server.listen(port);

function handler(req, res) {
	console.log("Heroku connected in port: ", port);
	fs.readFile(__dirname + '/public/index.html', function (err, data) {
		if (err) {
			res.writeHead(500);
			return res.end("error loading index.html");
		}

		res.writeHead(200);
		res.end(data);
	});
}

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

var socket = new so.Socket(io,{});