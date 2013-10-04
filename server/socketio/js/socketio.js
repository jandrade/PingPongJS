/**
 * @fileOverview Manages the functionality for the signaling channel on the server, using socket.io
 * @author Juan Andrade <juandavidandrade@gmail.com>
 * @requires socket.io
 */

(function (app) {
	'use strict';
	
	/**
	 * Represents a Socket manager
	 * @constructor
	 * @return {Object} Exposed methods
	 */
	app.Socket = function(io, options) {

		/**
		 * io.socket Connection
		 * @type {io.socket}
		 */
		var sockets,
		/**
		 * Total of clients
		 * @type {Number}
		 */
		numClients = 0,
		/**
		 * Maximum number of clients (2 max)
		 * @type {Number}
		 */
		maxClients = 20,
		/**
		 * Pin code
		 * @type {Number}
		 */
		pin,
		/**
		 * Room Identifier
		 * @type {String}
		 */
		room = '',
		/**
		 * Default settings
		 * @type {Enum}
		 */
		SETTINGS = {
			
		};

		/**
		 * @construcs app.Socket
		 */
		(function () {
			console.log(".______________.");
			io.sockets.on('connection', io_connectionHandler);
		}());

		function io_connectionHandler(socket) {
			log("Message From Server ---> SOcket connected!!!!!!!!!!");

			socket.on('message', client_getMessage);
			socket.on('create or join', handleRoom);
			socket.on('leave', leaveRoom);
		
			/**
			 * Signaling channel
			 * @param  {String} message - The message sent from the client
			 */
			function client_getMessage(message, from, to) {
			//	console.log("Server new Message: ", message);
				if (to) {
					console.log("Emiting to a single user: ", to);
					io.sockets.socket(to).emit('message', message, from, to);	
				} else {
					socket.broadcast.emit('message', message);	
					console.log("Emiting to all users: ", to);
				}
				
			}

			/**
			 * Receive room request
			 * @event
			 */
			function handleRoom(data) {
				var response = {
					room: data.room,
					initiator: false
				};

				if (data.username) {
					response.username = data.username;
				}

				numClients = io.sockets.clients(data.room).length;
				
				room = data.room;
			
				log("[- -] socket connected");
				log("Joinning ... ", numClients, " + pin: ", pin, " / ", data.pin);
			
				//	create game
				if (numClients === 0) {
					pin = generatePin();
					socket.join(data.room);
					response.initiator = true;
					response.clients = io.sockets.in(data.room).length;
					
					var clients = io.sockets.clients(data.room);
					response.clientid = clients[numClients].id;
					
					response.pin = pin;
					socket.emit('joined', response);
				//	join game
				} else if (numClients >= 1 && numClients < maxClients) {
					if ( data.pin && pin === parseInt(data.pin) ) {

						response.pin = pin;
						
						socket.join(data.room);

						console.log("Join Successful ... ", numClients, " + pin: ", pin, " / ", data.pin);
						
						var clients = io.sockets.clients(data.room),
							i = 0,
							connections = [],
							separator = '';

						numClients = clients.length;
						for ( ; i < numClients; i++ ) {
							connections.push(clients[i].id);
						}
						console.log("connections: ", connections);
						response.clientid = clients[numClients-1].id;
						response.clients = numClients;
						response.connections = connections;

						//io.sockets.in(data.room).emit('join', response);
						socket.broadcast.emit('join', response);
						
						socket.emit('joined', response);

					} else {
						socket.emit('failed', response);
					}
				//	no more clients allowed
				} else {
					socket.emit('full', response);
				}
			}

			/**
			 * Leave current room
			 * @param  {String} room - The room identifier
			 * @event
			 */
			function leaveRoom(room) {
				var response = {
					room: room,
					clients: io.sockets.clients(room).length
				};
				console.log("Node: Leaving room1!!! ", response);
				socket.leave(room);
				socket.broadcast.emit('leave', response);
			}

			/**
			 * Send log message to Client
			 * @private
			 */
			function log() {
				var array = [">>> "];
				for (var i = 0; i < arguments.length; i++) {
					array.push(arguments[i]);
				}
				socket.emit('log', array);
			}
		}

		/**
		 * Generates a random pin number
		 * @return {Number} The random pin number
		 * @private
		 */
		function generatePin() {
			return Math.round(Math.random()*1000);
		}
		
		
		//	public methods and properties
		return {
		
		};
	};

}(module.exports || {}));