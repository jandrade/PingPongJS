/**
 * @fileOverview Manages the Real-Time Communication Data Layer
 * @author Juan Andrade <juandavidandrade@gmail.com>
 */
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