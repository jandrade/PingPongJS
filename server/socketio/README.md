#RTHockey

A simple hockey game using WebRTC and socket.io.

*NOTE*: To install socket.io go to server/ and insert the following command:

	npm install .

---------------------------------------

##SERVER
- SocketServer
- Game (room)
	+ Pin

##CLIENT
- MainApp
- Net
	+ RTC
	+ Client
- Screens
	+ Instructions
	+ GameOver
	+ GameScreen
- Game
	+ Viewport (spectator, player)
	+ Score
	+ Input (swipe)
	+ Player (player1, player2)
	+ Ball

---------------------------------------

##Game Messages
	+ g_move (x,y)
	+ g_shot (x,y)
	+ g_score (player1, player2)
	+ g_win	(player)
	+ g_lose (player)


###Example: 
	main.send('{g_move: {x: 0, y: 0}}')