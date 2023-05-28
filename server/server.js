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

		const username = (await database.fetch_username(user));
		const notification = (await database.load_notifications(user, 0, 1))[0];
		if (notification == undefined) {
			broadcast(username, 'cN lacking notifications');

		} else {
			notification.time = new Date(notification.time).toLocaleString('en-Gb', { hour12: false});
			notification.time = notification.time.slice(0, -3);
			var dateRaw = notification.time.split('/');
			var yearHr = dateRaw[2].split(' ');
			notification.time = dateRaw[1] + '/' + dateRaw[0] + '/' + yearHr[0] + yearHr[1];

			broadcast(username,  'cN ' + notification.content + ' ' + notification.time);
		}
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
	
	socket.on('auth', async (user, userid) => {
		var uid = await database.fetch_uuid(user);
		socket.emit('auth_resp', (uid == null) ? false : (userid == uid));
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
	var dateRaw = dateValue.split('/');
    dateValue = dateRaw[1] + '/' + dateRaw[0] + '/' + dateRaw[2];
	console.log('dateValue = ');
	console.log(dateValue);

	var notifications = await database.fetch_timestamped_notifications(dateValue);
	var nextNotifications = [];
	console.log('notifications = ');
	console.log(notifications);
	if(notifications != null ){
		for (var notification of notifications){
			console.log(notification.user_id);
			io.to(notification.user_id).emit('refresh_list');
			
			var nextNotification = (await database.load_notifications(notification.user_id, 0, 2))[1];
			var notificationUser = await database.fetch_username(notification.user_id);
			if (nextNotification == undefined) {
				nextNotifications.push({
					user_id: notificationUser,
					time: 0
				});

			} else {
				nextNotification.user_id = notificationUser;
				nextNotifications.push(nextNotification);
			}
			// console.log('notification in socket : ' + notification.user_id);
			// console.log("username : " + notificationUser); 
			broadcast(notificationUser, 'sA'); //start alarm
			await database.delete_notification(notification.user_id, notification.time);
		}
	//await delay(10000)
	function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}
	await sleep(10000);

	if(nextNotifications.length!=0){
		for(var notification of nextNotifications){
			console.log('next notifs:');
			console.log(notification);
			if (notification.time == 0) {
				broadcast(notification.user_id, 'cN lacking notifications');

			} else {
				notification.time = new Date(notification.time).toLocaleString('en-Gb', { hour12: false});
				notification.time = notification.time.slice(0, -3);
				var dateRaw = notification.time.split('/');
				var yearHr = dateRaw[2].split(' ');
				notification.time = dateRaw[1] + '/' + dateRaw[0] + '/' + yearHr[0] + yearHr[1];

				broadcast(notification.user_id,  'cN ' + notification.content + ' ' + notification.time);
			}
		}
	}

	}
}, 10000);

// broadcasts the command to all of the devices under the username
function broadcast(username, cmd) {
	if (connections[username] == undefined) return;
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

	ws.on('message', async (msg) => {
		username = msg.toString().split(' ')[0]; // this gets the first word of the message
		username = username.replace(/(\r\n|\n|\r)/gm, ""); // this removes any \r or \n in the string

		ws.username = username;
		if (!connections.hasOwnProperty(username)) {
			connections[username] = [ws];

		} else {
			connections[username].push(ws);
		}
		
		console.log('table after coming: \n');
		console.log(connections);

		var uuid = (await database.fetch_uuid(username));
		console.log('uuid = ' + uuid);
		var notification = (await database.load_notifications(uuid, 0, 1))[0];
		console.log(notification);
		if (notification == undefined) {
			ws.send('cN lacking notifications');

		} else {
			notification.time = new Date(notification.time).toLocaleString('en-Gb', { hour12: false});
			notification.time = notification.time.slice(0, -3);
			var dateRaw = notification.time.split('/');
			var yearHr = dateRaw[2].split(' ');
			notification.time = dateRaw[1] + '/' + dateRaw[0] + '/' + yearHr[0] + yearHr[1];

			ws.send('cN ' + notification.content + ' ' + notification.time);
		}
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
