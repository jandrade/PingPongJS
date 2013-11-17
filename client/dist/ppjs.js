/*! ppjs v1.0.0 2013-11-16 */
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
				url: 'http://192.168.0.15:8889/',
			//	url: 'http://172.16.3.157:8889/',
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
				//console.log("CONNECTION DONE!!!!!!!!!! ", id, " -- with: ", connections);
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
(function (ppjs) {
	'use strict';

	/**
	 * Represents the Real-Time Communication Data Wrapper
	 * @constructor
	 * @return {Object} Exposed methods
	 */
	ppjs.Data = function(key, options) {

		/**
		 * RTC instance
		 * @type {ppjs.RTC}
		 */
		var rtc,
		/**
		 * Data wrapper
		 * @type {HTMLElement}
		 */
			container,

		/**
		 * Input wrapper
		 * @type {HTMLElement}
		 */
			control,

			peers = [],
		/**
		 * Default Settings
		 * @type {Enum}
		 */
			SETTINGS = {
				data: true,
				container: '[name=group-conversation]',
				control: '[name=conversation]',
				channel: 'SocketIO',
				onConnected: function () {},
				onMessage: function () {}
			},
			/**
			 * User media constraints
			 * @type {Object}
			 */
				constraints = {
					data: SETTINGS.data
				};


		/**
		 * @construcs ppjs.Stream
		 */
		(function () {
			Object.extend(SETTINGS, options);
			console.log("ppjs.DATA STREAM using: ", SETTINGS.channel);
			
			container = document.querySelector(SETTINGS.container);
			control = document.querySelector(SETTINGS.control);

			init();
			
			console.log("Joining with: ", key);

			addEventListeners();
		}());

		function init() {
			console.debug("################ new data added ########");
			//appStream = stream;
			rtc = new ppjs.RTC(key, {
				data: true,
				channel: SETTINGS.channel,
				onMessage: onMessage,
				onLeave: onLeave,
				onConnected: enable
			});
		}

		function addEventListeners() {
			control.addEventListener('keyup', function(e) {
				// enter key pressed
				if (e.keyCode === 13) {
					rtc.send(control.value);
					control.value = '';
				}
			});
		}

		function enable() {
			console.log("<<<<<<<<<<< connected >>>>>>>>>>");
			control.disabled = false;
		}

		function onMessage(message) {
			console.log("ppjs.Data.onMessage: ", message);
			container.value += message;
			//SETTINGS.onMessage(message);
		}

		function onLeave() {
			console.log("ppjs.Data.onLeave");
		}

		function leave() {
			rtc.leave();
		}

		function send(message) {
			rtc.send(message);
		}

		//	public methods and properties
		return {
			leave: leave,
			send: send
		};
	};

}(window.ppjs = window.ppjs || {}));
(function(ppjs) {
	'use strict';

	/**
	 * Represents the Real-Time Communication Wrapper
	 * @constructor
	 * @return {Object} Exposed methods
	 */
	ppjs.Peer = function(_isInitiator, clientid, guestid, options) {

		/**
		 * Peer identifier
		 */
		var id,
			/**
			 * RTC connection
			 * @type {RTCPeerConnection}
			 */
			peerConnection,
			/**
			 * RTC Data Channel
			 * @type {RTCDataChannel}
			 */
			channel,
			/**
			 * RTC connection
			 * @type {RTCPeerConnection}
			 */
			signalingChannel,
			/**
			 * Peer connection completed
			 * @type {Boolean}
			 */
			isConnected = false,
			/**
			 * Is current peer the initiator?
			 * @type {Boolean}
			 */
			isInitiator = false,
			/**
			 * List of servers
			 * @type {Enum}
			 */
			servers = {
				iceServers: [{
						url: 'stun:stun.l.google.com:19302'
					}
					/*, {
					url: "turn:numb.viagenie.ca",
					credential: "tsp2004",
					username: "juandavidandrade@gmail.com"
				}, {
					credential: "w6TvvngkVZh77jIdMFKUVl4GBv0=",
					url: "turn:8.35.196.131:3478?transport=udp",
					username: "66688435:1380233238"
				}, {
					credential: "w6TvvngkVZh77jIdMFKUVl4GBv0=",
					url: "turn:8.35.196.131:3478?transport=tcp",
					username: "66688435:1380233238"
				}, {
					credential: "w6TvvngkVZh77jIdMFKUVl4GBv0=",
					url: "turn:8.35.196.131:3479?transport=udp",
					username: "66688435:1380233238"
				}, {
					credential: "w6TvvngkVZh77jIdMFKUVl4GBv0=",
					url: "turn:8.35.196.131:3479?transport=tcp",
					username: "66688435:1380233238"
				}*/
				]
			},
			/**
			 * Optional parameters
			 * @type {Enum}
			 */
			peerOptions = {
				optional: [{
						DtlsSrtpKeyAgreement: true
					}, // chrome/moz interop
					{
						RtpDataChannels: true
					}
				]
			},
			/**
			 * Offer Options
			 * @type {Object}
			 */
			mediaConstraints = {
				optional: [],
				mandatory: {
					OfferToReceiveAudio: (options && options.audio),
					OfferToReceiveVideo: (options && options.video)
				}
			},
			/**
			 * Default Settings
			 * @type {Object}
			 */
			SETTINGS = {
				audio: false,
				video: false,
				data: true,
				stream: undefined,
				onMessage: function() {},
				onConnected: function() {},
				onRemoteStream: function() {}
			};

		(function() {
			Object.extend(SETTINGS, options);
			id = clientid;
			isInitiator = _isInitiator;
			connect();
		}());

		/**
		 * Create PeerConnection instance
		 * @param {Boolean} [isInitiator] Is the current peer the initiator?
		 */

		function connect() {
			// 1. pc1 = new RTCPeerConnection
			peerConnection = new RTCPeerConnection(servers, peerOptions);


			console.log("===================================new peerConnection!!!! ", isInitiator, " -- to: ", guestid);

			if (SETTINGS.video && typeof SETTINGS.stream !== 'undefined') {
				peerConnection.addStream(SETTINGS.stream);

				console.debug(">>>>>>>Adding stream....... ", peerConnection.getLocalStreams()[0].id);


				peerConnection.onaddstream = function(e) {
					console.log("Remote Stream added!!!!!!!!!", peerConnection.getRemoteStreams()[0].id);
					if (typeof SETTINGS.onRemoteStream === 'function') {
						SETTINGS.onRemoteStream(e.stream);
					}
				};
			}

			peerConnection.onicecandidate = function(e) {
				if (e.candidate) {
					send({
						type: 'candidate',
						label: e.candidate.sdpMLineIndex,
						id: e.candidate.sdpMid,
						candidate: e.candidate.candidate
					});
				} else {
					console.warn("-------End of Candidates------ is Connected");
					isConnected = true;
					SETTINGS.onConnected();
				}
			};

			peerConnection.onsignalingstatechange = function(e) {
				console.log("pc.onsignalingstatechange: ", e);
			};


			peerConnection.ondatachannel = function(e) {
				console.log(">>>>>>listening data channel: ", e.channel);
				channel = e.channel;
				configureDataChannel();
			};


			if (isInitiator) {

				if (SETTINGS.data) {
					console.warn("-------- initiator wants to create a new DataChannel -------");
					channel = peerConnection.createDataChannel('dataChannel', {
						reliable: true
					});
					configureDataChannel();
				}

				create(guestid);
			}
		}

		/**
		 * Creates an offer.. this would be used for the peer connection (guest/receiver), to join the room
		 */

		function create(to) {
			console.warn("ppjs.RTC >> createOFFER >>> ", to);
			// 2. pc1.createOffer
			peerConnection.createOffer(function(sessionDescription) {
				setLocalAndSendMessage(sessionDescription, to);
			}, null, mediaConstraints);
		}

		/**
		 * Leaves the current connection
		 */

		function leave() {
			isConnected = false;
			signalingChannel.leave();
			if (SETTINGS.data) {
				channel.close();
			}
			if (SETTINGS.video) {
				peerConnection.removeStream();
			}

		}

		function onLeave() {
			console.log("Leave!!!!!!!!");
			isConnected = false;
			if (typeof SETTINGS.onLeave === 'function') {
				SETTINGS.onLeave();
			}
		}

		/**
		 * Configure DataChannel to send arbitrary data
		 */

		function configureDataChannel() {

			channel.onmessage = function(e) {
				console.log("message sent over RTC DataChannel> ", e.data);
				if (isConnected && typeof SETTINGS.onMessage === 'function') {
					SETTINGS.onMessage(e.data);
				}
			};

			channel.onerror = function(e) {
				console.log("channel error: ", e);
			};

			channel.onclose = function(e) {
				console.log("channel closed: ", e);
			};
			channel.onopen = function(e) {
				console.log("channel openned: ", e);
			};
		}

		/**
		 * Sets the local description (initiator/sender) and sends the session description to the signaling channel (guest/receiver)
		 * @param {[type]} sessionDescription [description]
		 */

		function setLocalAndSendMessage(sessionDescription, to) {
			console.log("setLocalAndSendMessage: ", isInitiator, to);
			// 3. pc1.setLocalDescription
			// 7. pc2.setLocalDescription
			peerConnection.setLocalDescription(sessionDescription);
			// 4. signalingChannel.send()
			// 8. signalingChannel.send()
			send(sessionDescription, to);
		}

		/**
		 * The guest/receiver has accepted the invitation and notified to the initiator/sender
		 * @param  {SessionDescription} message - The offer message
		 */

		function setOfferer(message) {
			console.log("Connect PC1 in PC2 >>>>> createAnswer------- > ", message);
			// 5. pc2.setRemoteDescription
			peerConnection.setRemoteDescription(new RTCSessionDescription(message));
			// 6. pc2.createAnswer
			peerConnection.createAnswer(setLocalAndSendMessage, null, mediaConstraints);
		}

		/**
		 * The initiator/sender gets the remote description from guest/receiver
		 * @param {[type]} message [description]
		 */

		function setAnswerer(message) {
			console.log("Connect PC2 in PC1 <<<<<<< !!! set remote desc ", message);
			// 9. pc1.setRemoteDescription
			peerConnection.setRemoteDescription(new RTCSessionDescription(message));
		}

		/**
		 * Send ICE candidates to the other peer (guest/receiver)
		 * @param {[type]} message [description]
		 */

		function addCandidate(message) {
			var candidate = new RTCIceCandidate({
				sdpMLineIndex: message.label,
				candidate: message.candidate
			});
			peerConnection.addIceCandidate(candidate);
		}

		function send(message) {
			if (!isConnected) {
				//	console.warn("Peer.send: ", message, id, guestid);
				SETTINGS.onMessage(message, id, guestid);
			} else {
				console.debug("CHANNEL.send: ", message, id, guestid);

				channel.send(message);
			}
		}

		return {
			send: send,
			setOfferer: setOfferer,
			setAnswerer: setAnswerer,
			addCandidate: addCandidate
		};
	};

}(window.ppjs = window.ppjs || {}));
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
(function (ppjs) {
	'use strict';

	/**
	 * Represents the Real-Time Communication Stream Wrapper
	 * @constructor
	 * @return {Object} Exposed methods
	 */
	ppjs.Stream = function(key, options) {

		/**
		 * RTC instance
		 * @type {ppjs.RTC}
		 */
		var rtc,
		/**
		 * Video wrapper
		 * @type {HTMLElement}
		 */
			container,

			peers = [],
		/**
		 * Default Settings
		 * @type {Enum}
		 */
			SETTINGS = {
				audio: true,
				video: true,
				container: '.video-container',
				channel: 'SocketIO',
				onConnected: function () {},
				onRemoteStream: function () {}
			},
			/**
			 * User media constraints
			 * @type {Object}
			 */
				constraints = {
					video: SETTINGS.video,
					audio: SETTINGS.audio
				};


		/**
		 * @construcs ppjs.Stream
		 */
		(function () {
			Object.extend(SETTINGS, options);
			console.log("ppjs.Stream using: ", SETTINGS.channel);
			
			container = document.querySelector(SETTINGS.container);

			attachCamera();
			
			console.log("Joining with: ", key);
		}());

		function attachCamera() {
			navigator.getUserMedia(constraints, gotStream, function(error) {
				console.log("Navigator.getUserMedia ERROR: ", error);
			});
		}

		function gotStream(stream) {
			createVideo(stream, true);
			console.debug("################ new camera added ########");
			//appStream = stream;
			rtc = new ppjs.RTC(key, {
				audio: SETTINGS.audio,
				video: SETTINGS.video,
				data: false,
				stream: stream,
				channel: SETTINGS.channel,
				onMessage: onMessage,
				onLeave: onLeave,
				onRemoteStream: createVideo
			});
		}


		function createVideo(stream, isLocal) {
			console.log("Creating new video.... ", stream, isLocal);
		
			var video = document.createElement('video');
			video.src = URL.createObjectURL(stream);
			video.play();

			container.appendChild(video);
		}



		function onMessage(message) {
			console.log("ppjs.Stream.onMessage: ", message);
		}

		function onLeave() {
			console.log("ppjs.Stream.onLeave");
		}

		function leave() {
			rtc.leave();
		}

		function send() {

		}

		//	public methods and properties
		return {
			leave: leave,
			send: send
		};
	};

}(window.ppjs = window.ppjs || {}));
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

/**
 * Extends an object with another object
 * @param  {Object} dest Source Object
 * @param  {Object} source      Object to be merged
 * @return {Object}             Merged object
 */
Object.extend = function(dest, source) {
	for (var property in source) {
		dest[property] = source[property];
	}
    
	return dest;
};