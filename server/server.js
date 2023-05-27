const { time } = require('console');
const database = require('./database.js');

const express = require('express');
const { createServer } = require("http");
// const { Server } = require("socket.io");

const app = express();
const srv = require("http").Server(app);

const httpServer = createServer(app);
const connections = {}; // this maps usernames to connected 
const WebSocket = require('ws');
const wsServer = new WebSocket.WebSocketServer({ port: 8080 });

// const io = new Server(httpServer);
const io = require("socket.io")(srv);

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
        // esp.write('cN ' + notification + ' ' + time);
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

setInterval(async function(){
	var options = { hour12: false };
	var dateValue = new Date().toLocaleString('en-Gb', options);
	dateValue = dateValue.slice(0, -3);

	console.log('dateValue = ');
	console.log(dateValue);

	var notifications = await database.fetch_timestamped_notifications(dateValue);
	console.log('notifications = ');
	console.log(notifications);
	if(notifications != null ){
		for (var notification of notifications){
			await database.delete_notification(notification.user_id, notification.time);
			io.to(notification.user_id).emit('refresh_list');

			// TODO: broadcast properly
			//broadcast(notification.user_id, 'sA'); //start alarm
		}
	}
}, 30000);

// broadcasts the command to all of the devices under the username
function broadcast(username, cmd) {
	connections[username].forEach((ws) => {
		ws.send(cmd);
	});
}

const dead_ws = setInterval(function ping() {
	wsServer.clients.forEach(function each(ws) {
		if (ws.isAlive === false) return ws.terminate();

		ws.isAlive = false;
		ws.ping();
	});
}, 300000);

wsServer.on('connection', (ws) => {
	ws.isAlive = true;
	ws.on('error', console.error);
	ws.on('pong', () => { this.isAlive = true; });

	ws.on('message', (msg) => {
		username = msg.toString().split(' ')[0]; // this gets the first word of the message

		ws.username = username;
		if (!connections.hasOwnProperty(username)) {
			connections[username] = [ws];

		} else {
			connections[username].push(ws);
		}
		
		console.log('table after coming: \n');
		console.log(connections);
	});

	ws.on('close', () => {
		console.log('we exit');
		connections[ws.username].splice(ws, 1);
		
		console.log('table after leaving: \n');
		console.log(connections);
	});
});

srv.listen(port, () => {
	console.log(`Server running on ${port}`)
});

// database.load_notifications("test", 0, 30)
