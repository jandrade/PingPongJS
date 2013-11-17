/**
 * @fileOverview Manages the Real-Time Communication Abstraction Layer
 * @author Juan Andrade <juandavidandrade@gmail.com>
 */

(function(ppjs) {
	'use strict';

	/**
	 * Represents the Real-Time Communication Wrapper
	 * @constructor
	 * @return {Object} Exposed methods
	 */
	ppjs.RTC = function(key, options) {

		/**
		 * RTC Indentifier
		 * @type {String}
		 */
		var id,
			/**
			 * Signaling Channel
			 * @type {ppjs.SocketIO || ppjs.XHR}
			 */
			signalingChannel,
			/**
			 * Current connections (peers), identified by session key
			 * @type {Object}
			 */
			connections = {},
			/**
			 * Current connection connected
			 * @type {Boolean}
			 */
			isConnected = false,
			/**
			 * Current connection has been started the group?
			 * @type {Boolean}
			 */
			isInitiator = false,
			/**
			 * Default Settings
			 * @type {Object}
			 */
			SETTINGS = {
				audio: false,
				video: false,
				data: true,
				channel: 'SocketIO',
				stream: undefined,
				onMessage: function() {},
				onRemoteStream: function() {},
				onConnected: function() {}
			};

		/**
		 * @construcs ppjs.RTC
		 */
		(function() {
			Object.extend(SETTINGS, options);
			console.debug("////////// new signalingChannel /////////");
			signalingChannel = new ppjs[SETTINGS.channel]({
				onConnected: buildConnection,
				onOffer: setOfferer,
				onAnswer: setAnswerer,
				onCandidate: addCandidate,
				onServerConnection: function() {
					console.log("joining......................");
					signalingChannel.join(key);
				}
			});


		}());

		function buildConnection(initiator, clientid, _connections) {
			isInitiator = initiator;
			id = clientid;
			console.debug("prp.RTC.buildConnection >>>>> ", isInitiator, clientid);
			var i = 0,
				newConn = getNewConnections(_connections),
				newConnLength = newConn.length;

			for (; i < newConnLength; i++) {
				if (i === 1) {
					isInitiator = true;
				}
				console.log("Creating new peer........ ", newConn[i]);
				connections[newConn[i]] = new ppjs.Peer(isInitiator, id, newConn[i], {
					audio: SETTINGS.audio,
					video: SETTINGS.video,
					data: SETTINGS.data,
					stream: SETTINGS.stream,
					onRemoteStream: addRemoteStream,
					onMessage: onMessage,
					onConnected: onConnected
				});
			}
		}

		function onConnected() {
			isConnected = true;
			SETTINGS.onConnected();
		}

		function getInitiator() {
			return isInitiator;
		}

		function getNewConnections(_connections) {
			var i = 0,
				newConnections = [],
				numConnections = _connections.length;

			for (; i < numConnections; i++) {
				if (_connections[i] !== id && typeof connections[_connections[i]] === 'undefined') {
					newConnections.push(_connections[i]);
				}
			}

			return newConnections;
		}

		function addRemoteStream(stream) {
			if (typeof SETTINGS.onRemoteStream === 'function') {
				SETTINGS.onRemoteStream(stream);
			}
		}

		function onLeave() {
			console.log("RTC.On Leave");
		}

		function setOfferer(message, from, to) {
			console.log("RTC.On setOfferer: ", from, to);
			if (connections[from]) {
				connections[from].setOfferer(message);
			}
		}

		function setAnswerer(message, from, to) {
			console.log("RTC.On setAnswerer: ", from, to);
			if (connections[from]) {
				connections[from].setAnswerer(message);
			}
		}

		function addCandidate(message, from, to) {
			console.log("RTC.On addCandidate: ", from, to);
			if (connections[from]) {
				connections[from].addCandidate(message);
			}
		}

		function leave() {
			console.log("RTC.LEAVE!!!!!");
		}


		/**
		 * Send message to signaling channel
		 * @param  {*} message - The message object, string ....
		 * @param  {String} to - Who will receive the message
		 */

		function onMessage(message, from, to) {
			if (!isConnected) {
				signalingChannel.send(message, from, to);
			} else {
				SETTINGS.onMessage(message);
			}
		}

		function send(message) {
			if (isConnected) {
				console.debug("SEND VIA RTC: ", message, connections.length);
				for (var key in connections) {
					connections[key].send(message);
				}
			}
		}

		//	public methods and properties
		return {
			initiator: getInitiator,
			leave: leave,
			send: send
		};
	};

}(window.ppjs = window.ppjs || {}));