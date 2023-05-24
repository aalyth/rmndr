const database = require('./database.js');

var WebSocketServer = require('websocket').server;
const express = require('express');
const { createServer } = require("http");
// const { Server } = require("socket.io");

const app = express();
const srv = require("http").Server(app);

const httpServer = createServer(app);
wsServer = new WebSocketServer({
	httpServer: srv,
	autoAcceptConnections: false
});
// const io = new Server(httpServer);
const io = require("socket.io")(srv);

const SerialPort = require('serialport').SerialPort;
var esp = new SerialPort({
    path: 'COM8',  
    baudRate: 115200,
    autoOpen: false,
});
esp.open((e) => {
    console.log(`serial error: ${e}`);
});

const port = 80;

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

io.on('connection', (socket) => {
	console.log('a user connected');
	socket.room = '';

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('remind', (msg) => {
		response = msg;
        esp.write('huj');
        console.log('writing huj');
	});

	socket.on('esp_notification', (notification, time) => {
        esp.write('cN ' + notification + ' ' + time);
	});

	socket.on('esp_alarm', () => {
        console.log('we start the alarm');
        esp.write('startAlarm');
	})
	
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
        console.log('we deleted the notification');
        console.log('we start the alarm');
        esp.write('startAlarm');
	})

	socket.on('has_notifications', async(user_id) => {
		var res = await database.has_notification(user_id);
		socket.emit('notifications_fetch_result', res);
	})
	
});

srv.listen(port, () => {
	console.log(`Server running on ${port}`)
});

database.load_notifications("test", 0, 30)
