const database = require('./database.js');

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
	res.sendFile('/client/html/auth.html', { root: './' });
});

app.get('/remind', (req, res) => {
	res.sendFile('/client/html/reminder.html', { root: './' });
});

response = '';
io.on('connection', (socket) => {
	console.log('a user connected');
	socket.room = '';

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('remind', (msg) => {
		response = msg;
	});

	socket.on('connect_esp', async (notification, time) => {
		
		function centerText(text) {

			if (text.length > 14) {
			  text = text.substring(0, 14);
			}

			const totalSpaces = 16 - text.length;
			const leftSpaces = Math.floor(totalSpaces / 2);
			const rightSpaces = totalSpaces - leftSpaces;
			const centeredText = " ".repeat(leftSpaces) + text + " ".repeat(rightSpaces);
			 
			return centeredText;
		}

		socket.emit('esp_send', centerText(notification+time));
		
	});

	
	 socket.on('postNotification', async (user, time, content) => {
	 	await database.post_notification(user, time, content);
	 });

	socket.on('changeRoom', async (newRoom) => {
		if (socket.room != '') socket.leave(socket.room);
		console.log('left ' + socket.room + ' and joined ' + newRoom);
	 	socket.join(newRoom);
	 	socket.room = newRoom;
	});

	socket.on('login', async (username, password) => {
		var res = await database.login_user(username, password);
		socket.emit('login_resp', res);
	});

	socket.on('register', async (username, password) => {
		var res = await database.register_user(username, password);
		socket.emit('register_resp', res);
	})

	

	 socket.on('get_notifications', async(user, lower_bound, upper_bound) => {
		var res = await database.load_notifications(user, lower_bound, upper_bound);
		socket.emit('post_notifications', res);
	});

	socket.on('get_time', async(time) => {
		socket.emit('receive_time', time);
	})

	socket.on('delete_notification', async(user_id, time) => {
		await database.delete_notification(user_id, time);
	})

	socket.on('has_notifications', async(user_id) => {
		var res = await database.has_notifications(user_id);
		socket.emit('notifications_fetch_result', res);
	})

	socket.on('esp_receive', async(str) => {
		receive = 'changeNotification' + str;
	})

	socket.on('start_alarm', async() => {
		receive = 'startAlarm';
	})
	
	
});

wsServer.on('request', (request) => {
	if (request.resource === '/esp') {
		const connection = request.accept(null, request.origin);
		console.log('WebSocket connection established');

		connection.on('message', (message) => {
			// console.log('Received message:', message.utf8Data);
			if (message.utf8Data == 'getNotification' || response != '') {
				// get the notification string from the db and send it via
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

database.load_notifications("test", 0, 30)
