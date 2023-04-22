 const database = require('./database.js');

const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();

const httpServer = createServer(app);
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

io.on('connection', (socket) => {
	console.log('a user connected');
	socket.room = '';

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('connect_esp', async (username) => {
		
		latest_notification = await database.load_notifications(username, 0, 30)[0];
		time = latest_notification.time;
		content = latest_notification.time;

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

		socket.io.emit('esp_receive', centerText(content+time))
		
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

	// socket.on('createChatroom', async (user, name, members) => {
	// 	var res = await database.create_room(name, user, members, false);		
	// 	socket.emit('createChatroomResponse', res);
	// });

	// socket.on('load_messages', async(lower_limit, upper_limit) => {
	// 	if(socket.room != ''){
	// 		var res = await database.load_messages(socket.room, lower_limit, upper_limit);
	// 		socket.emit('post_messages', res);
	// 	}
	// });
	
});

httpServer.listen(port, () => {
	console.log(`Server running on ${port}`)
});

database.load_notifications("test", 0, 30)