/**
 * @fileOverview Manages the signaling channel to comminicate the server with the peers
 * @author Juan Andrade <juandavidandrade@gmail.com>
 */

/* global ActiveXObject:false, console:false */

(function(ppjs) {
	'use strict';

	/**
	 * Represents a socket.io client wrapper
	 * @constructor
	 * @return {Object} Exposed methods
	 */
	ppjs.XHR = function(options) {

		/**
		 * Socket
		 * @type {io.socket}
		 */
		var signal,
			socket,
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
				url: 'http://172.16.3.157/rtdroid/php/',
				onConnected: function() {},
				onOffer: function() {},
				onAnswer: function() {},
				onCandidate: function() {},
				onFailed: function() {},
				onLeave: function() {}
			};


		/**
		 * @construcs net.Client
		 */
		(function() {
			Object.extend(SETTINGS, options);

			ajax(SETTINGS.url, function(data) {
				//console.log("XHR: ", data);
			});
			//addEventListeners();
		}());


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

		function ajax(url, successFn) {
			var httpRequest;
			//	Mozilla, Webkit, etc
			if (window.XMLHttpRequest) {
				httpRequest = new XMLHttpRequest();
				//	IE
			} else if (window.ActiveXObject) {
				try {
					httpRequest = new ActiveXObject('Msxml2.XMLHTTP');
				} catch (e) {
					httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
				}
			}

			if (!httpRequest) {
				return false;
			}

			function handleResponse() {
				//httpRequest.setRequestHeader('Access-Control-Allow-Origin', '*');
				console.log("Handle response: ", httpRequest);
				if (httpRequest.readyState === 4) {
					if (httpRequest.status === 200) {
						if (typeof successFn === 'function') {
							var response = JSON.parse(httpRequest.responseText);
							successFn(response);
						}
					}
				}
			}

			httpRequest.onreadystatechange = handleResponse;
			console.log("ajax: ", httpRequest);

			httpRequest.open('GET', url, true);
			httpRequest.send();
		}

		/**
		 * Start connection
		 * @private
		 */

		function connect() {
			if (!isConnected && isChannelReady) {
				console.log("CONNECTION DONE!!!!!!!!!!");
				isConnected = true;
				if (typeof SETTINGS.onConnected === 'function') {
					SETTINGS.onConnected(isInitiator);
				}
			}
		}


		/**
		 * Joins a room
		 * @param  {Number} value - The room code
		 */

		function join(value) {

			if (typeof value !== 'undefined') {
				code = value;
			}
			console.log('Joining ', room, " -- code: ", code);
			return;
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

		function send(message) {
			socket.emit('message', message);
		}

		/**
		 * The initiator is informed that someone has been joined into the room
		 * @param  {String} room - The room ID
		 * @event
		 */

		function socket_roomJoinHandler(data) {
			isChannelReady = true;
			connect();
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

			connect();
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

		function socket_messageHandler(message) {
			//	peer 1 is sending an offer
			if (message.type === 'offer') {
				if (typeof SETTINGS.onOffer === 'function') {
					SETTINGS.onOffer(message);
				}
				//	peer 2 is sending his answer
			} else if (message.type === 'answer' && isConnected) {
				if (typeof SETTINGS.onAnswer === 'function') {
					SETTINGS.onAnswer(message);
				}
				//	peers are exchanging candidates	
			} else if (message.type === 'candidate' && isConnected) {
				if (typeof SETTINGS.onCandidate === 'function') {
					SETTINGS.onCandidate(message);
				}
				//	peers are sending arbitrary messages
			} else {
				if (typeof SETTINGS.onMessage === 'function') {
					SETTINGS.onMessage(message);
				}
			}
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