/**
 * @fileOverview Manages the signaling channel to comminicate the server with the peers
 * @author Juan Andrade <juandavidandrade@gmail.com>
 */

/* global io:false, console:false */

(function(ppjs) {
	'use strict';

	/**
	 * Represents a socket.io client wrapper
	 * @constructor
	 * @return {Object} Exposed methods
	 */
	ppjs.SocketIO = function(options) {

		/**
		 * Socket
		 * @type {io.socket}
		 */
		var socket,
			/**
			 * Client ID
			 * @type {String}
			 */
			id,
			/**
			 * Current peer is the initiator?
			 * @type {Boolean}
			 */
			isInitiator = false,
			/**
			 * Connection successfully stablished
			 * @type {Boolean}
			 */
			isConnected = false,
			/**
			 * Current peer is the initiator?
			 * @type {Boolean}
			 */
			isChannelReady = false,

			isServerConnected = false,
			/**
			 * Pin number
			 * @type {Number}
			 */
			code,
			/**
			 * Room Identifier
			 * @type {String}
			 */
			room = 'test',

			SETTINGS = {
			//	url: 'http://192.168.0.15:8889/',
				url: 'http://172.16.3.157:8889/',
			//	url: 'http://rtdroid.herokuapp.com/',
				onConnected: function() {},
				onOffer: function() {},
				onAnswer: function() {},
				onCandidate: function() {},
				onFailed: function() {},
				onLeave: function() {},
				onServerConnection: function() {}
			};


		/**
		 * @construcs net.Client
		 */
		(function() {
			Object.extend(SETTINGS, options);

			socket = io.connect(SETTINGS.url);
			socket.on('connect', io_connectionHandler);

		}());

		function io_connectionHandler() {
			addEventListeners();
			SETTINGS.onServerConnection();
		}

		function addEventListeners() {
			//	room states
			socket.on('failed', socket_failedHandler);
			socket.on('join', socket_roomJoinHandler);
			socket.on('joined', socket_roomJoinedHandler);
			socket.on('leave', socket_roomLeaveHandler);
			socket.on('full', socket_roomFullHandler);

			//	signaling
			socket.on('message', socket_messageHandler);

			//	logging
			socket.on('log', socket_logHandler);
		}

		/**
		 * Start connection
		 * @private
		 */

		function connect(connections) {
			if (!isConnected && isChannelReady) {
				console.log("CONNECTION DONE!!!!!!!!!! ", id, " -- with: ", connections);
				isConnected = true;
				if (typeof SETTINGS.onConnected === 'function') {
					SETTINGS.onConnected(isInitiator, id, connections);
				}
			}
		}

		/**
		 * Joins a room
		 * @param  {Number} value - The room code
		 */

		function join(value) {
			isConnected = false;
			if (typeof value !== 'undefined') {
				code = value;
			}
			console.log('server connected?? ', isServerConnected, ' -- Joining ', room, " -- code: ", code);

			socket.emit('create or join', {
				room: room,
				pin: code,
				username: SETTINGS.username
			});
		}

		/**
		 * Leave room
		 * @param  {*} message - The message to be sent
		 */

		function leave() {
			console.log("leaving channell.....");
			isConnected = false;
			socket.emit('leave', room);
		}

		/**
		 * Send messages to the server
		 * @param  {*} message - The message to be sent
		 */

		function send(message, from, to) {
			socket.emit('message', message, from, to);
		}

		/**
		 * The initiator is informed that someone has been joined into the room
		 * @param  {String} room - The room ID
		 * @event
		 */

		function socket_roomJoinHandler(data) {
			isChannelReady = true;
			isConnected = false;
			console.debug("________________________________");
			console.debug("User joins: ", data);
			connect(data.connections);
		}

		/**
		 * Peer joins to the room
		 * @param  {String} room - The room ID
		 * @event
		 */

		function socket_roomJoinedHandler(data) {
			if (data.initiator) {
				console.debug("Room created: ", data);
				isInitiator = true;
			} else {
				isChannelReady = true;
			}
			console.debug("----------Room joined: ", data);
			id = data.clientid;

			connect(data.connections);
		}

		/**
		 * Peer leaves to the room
		 * @param  {String} room - The room ID
		 * @event
		 */

		function socket_roomLeaveHandler(data) {
			if (typeof SETTINGS.onLeave === 'function') {
				SETTINGS.onLeave();
			}
		}

		/**
		 * Wrong ping number
		 * @param  {String} data - The room ID
		 * @event
		 */

		function socket_failedHandler(data) {
			console.log("Failed: You must enter a valid code!!!");
			if (typeof SETTINGS.onFailed === 'function') {
				SETTINGS.onFailed();
			}
		}

		/**
		 * Room is full
		 * @param  {String} room - The room ID
		 * @event
		 */

		function socket_roomFullHandler(room) {
			console.error("ROOM FULL");
		}


		/**
		 * Signaling messages between peers
		 * @param  {*} message Message from peer
		 */

		function socket_messageHandler(message, from, to) {
			console.log(">>>> ", Date.now(), " socketMSG: ", message, from, to);
			//	peer 1 is sending an offer
			if (message.type === 'offer') {
				console.log("Offer received!!!! ", from, to);
				if (typeof SETTINGS.onOffer === 'function') {
					SETTINGS.onOffer(message, from, to);
				}
				//	peer 2 is sending his answer
			} else if (message.type === 'answer' && isConnected) {
				if (typeof SETTINGS.onAnswer === 'function') {
					SETTINGS.onAnswer(message, from, to);
				}
				//	peers are exchanging candidates	
			} else if (message.type === 'candidate' && isConnected) {
				if (typeof SETTINGS.onCandidate === 'function') {
					SETTINGS.onCandidate(message, from, to);
				}
				//	peers are sending arbitrary messages
			}
			/*else {
				if (typeof SETTINGS.onMessage === 'function') {
					SETTINGS.onMessage(message);
				}
			}*/
		}

		/**
		 * Logging system
		 * @param  {Array} array - Log arguments
		 */

		function socket_logHandler(array) {
			console.log.apply(console, array);
		}


		//	public methods and properties
		return {
			join: join,
			leave: leave,
			send: send
		};
	};

}(window.ppjs = window.ppjs || {}));