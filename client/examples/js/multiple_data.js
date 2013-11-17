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

	rtc = new ppjs.Data(pin, {
			channel: 'SocketIO',
			onMessage: onMessage,
			onLeave: onLeave
		});
	
	function onMessage(message) {
		console.log("New message: ", message);
		remoteText.value += message;
	}

	function onLeave() {
		localText.disabled = true;
	}
}

init();