/**
 * @fileOverview Manages a Single Peer connection
 * @author Juan Andrade <juandavidandrade@gmail.com>
 */

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
				//console.log("message sent over RTC DataChannel> ", e.data);
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