/**
 * @fileOverview Manages the Real-Time Communication Abstraction Layer
 * @author Juan Andrade <juandavidandrade@gmail.com>
 */
(function (ppjs) {
	'use strict';

	/**
	 * Represents the Real-Time Communication Wrapper
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