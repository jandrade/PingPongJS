/**
 * Cross browsing support (webkit, mozilla)
 */
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