const cassandra = require('cassandra-driver');

const client = new cassandra.Client({
	contactPoints: ['localhost'],
	keyspace : 'app_data',
	localDataCenter: 'datacenter1'

});

async function check_user(username){
    var params = [username];
    const queryExisting = "SELECT * FROM users WHERE username = ?";
	var isExisting =  !( (await client.execute(queryExisting, params)).rows.length == 0 )

    return isExisting;
}

async function fetch_uuid(username){
	const params = [username];
	var res = (await client.execute("SELECT * FROM users WHERE username = ?", params)).rows;

	return (res.length != 0) ? res[0].user_id : null;
}

async function fetch_username(uuid){
	const params = [uuid];
	console.log("uuid in fetch: " + params[0]);
	var res = (await client.execute("SELECT * FROM users WHERE user_id = ?", params)).rows;

	return (res.length != 0) ? res[0].username : null;
}

async function connect() {
	await client.connect();
	console.log('Connected to Cassandra');
}

async function register_user(username, password){
	

	if(await check_user(username)){
		return {
			"code" : 404,
			"message" : "user already exists"
		}
	}

	const params = [username, password];
	const query = "INSERT INTO users (username, user_id, password) VALUES (?, uuid(), ?)";
	await client.execute(query, params);
	var res = (await client.execute("SELECT * FROM users WHERE username = ?", [params[0]])).rows
	
	return {
		"code" : 200,
		"id" : res[0].user_id,
		"message" : "registered successfully"
	}

}

async function login_user(username, password){
	
    const params = [username];
	const query = "SELECT * FROM users WHERE username = ?";
	var res = (await client.execute(query, params)).rows;

	console.log(res)

	if(res.length == 0){
		return {
			"code" : 404,
			"message" : "wrong username/password"
		}
	}
	else if(res[0].password == password){
		return {
			"code" : 200,
			"id" : res[0].user_id,
			"message" : "logged in successfully"
		}
	}
	else{
		return {
			"code" : 404,
			"message" : "wrong username/password"
		}
	}
}


async function post_notification(user_id, time, content){

    const params = [user_id, time, content];
    const query = "INSERT INTO notification (user_id, time, content, notification_id) VALUES (?, ?, ?, uuid())";

    client.execute(query, params);

}

async function load_notifications(user_id, lower_limit, upper_limit){
	
    const params = [user_id];
	const query = "SELECT * FROM notification WHERE user_id = ? LIMIT " + upper_limit;

	var res = (await client.execute(query, params)).rows.map((row) => {
		return {
			user_id : row.user_id, 
            id: row.notification_id,
			content: row.content,
			time: new Date(row.time).getTime()
		};
	});

    sortedRes = res.sort((a, b) => a.time - b.time);

	return sortedRes = res.slice(lower_limit, upper_limit+1);
}

async function delete_notification(user_id, time){
    const params = [user_id, time];
    const query = 'DELETE FROM notification WHERE user_id = ? AND time = ?'

    client.execute(query, params);
}

async function has_notification(user_id){
    const params = [user_id];
    const query = 'SELECT * FROM notification WHERE user_id = ?'

    var hasNotifications =  !( (await client.execute(query, params)).rows.length == 0 )

    return hasNotifications;
}

async function fetch_timestamped_notifications(time){
	const params = [time]
	const query = 'SELECT * FROM notification WHERE time = ?'

	var notifications = await client.execute(query, params)
	var hasNotifications =  !( notifications.rows.length == 0 )

	if(hasNotifications){
		var res = (notifications.rows.map((row) => {
			return {
				user_id : row.user_id,
				time : row.time
			}
		}));
		return res;
	}
	return null;
}

module.exports = {
	cassandra, client, 
	connect, register_user, 
	login_user, post_notification, 
	load_notifications, delete_notification, 
	has_notification, fetch_timestamped_notifications,
	fetch_uuid, fetch_username
};

connect();





