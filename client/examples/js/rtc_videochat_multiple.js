var	rtc,
	leaveBtn = document.getElementById('leave-btn');



leaveBtn.addEventListener('click', function(e) {
	e.preventDefault();
	console.log("Leave clicked");
	rtc.leave();
});



function init() {
	
//	
	var pin;

	if (window.location.search) {
		pin = window.location.search.replace('?', '');
	}

	rtc = new ppjs.Stream(pin, {
			channel: 'SocketIO',
			onMessage: onMessage,
			onRemoteStream: onRemoteStream,
			onLeave: onLeave
		});
	
	function onMessage(message) {
		console.log("New message: ", message);
	}

	function onLeave() {
		localText.disabled = true;
	}

	function onRemoteStream(stream) {

	}
}

init();