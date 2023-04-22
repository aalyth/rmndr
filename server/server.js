// const database = require('./db.js');

var WebSocketServer = require('websocket').server;
const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();

const httpServer = createServer(app);
wsServer = new WebSocketServer({
	httpServer: httpServer,
	autoAcceptConnections: false
});
const io = new Server(httpServer);

const port = 8080;

app.use(express.static('./client/static'));

app.get('/', (req, res) => {
	res.sendFile('/client/html/home.html', { root: './' });
});

app.get('/auth', (req, res) => {
	res.sendFile('/client/html/login.html', { root: './' });
});

app.get('/reminder', (req, res) => {
	res.sendFile('/client/html/reminder.html', { root: './' });
});

response = '';
io.on('connection', (socket) => {
	console.log('a user connected');
	socket.room = '';

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('paca', (msg) => {
		console.log('paca from ' + msg);
	});
	
	socket.on('remind', (msg) => {
		response = msg;
	});
});

wsServer.on('request', (request) => {
	if (request.resource === '/esp') {
		const connection = request.accept(null, request.origin);
		console.log('WebSocket connection established');

		connection.on('message', (message) => {
			// console.log('Received message:', message.utf8Data);
			if (message.utf8Data == 'getNotification') {
				// get the notification string from the db and send it via

			} else if (response != '') {
				// startAlarm -> starts the alarm
				// changeNotification <msg> -> changes the notification message

				connection.send(response);
				response = '';
				//connection.send('changeNotification     pacanui        at 07:00    ');
				//connection.send('startAlarm');
			}
		});

		connection.on('close', () => {
			console.log('WebSocket connection closed');
		});

	} else {
		request.reject();
	}
});


httpServer.listen(port, () => {
	console.log(`Server running on ${port}`)
});
