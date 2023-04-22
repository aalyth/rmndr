CREATE KEYSPACE IF NOT EXISTS app_data WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'} AND durable_writes = true;
USE app_data;

CREATE TABLE IF NOT EXISTS users (
	username TEXT PRIMARY KEY,
	password TEXT
);

CREATE TABLE IF NOT EXISTS notification (
	user_id TEXT,
	notification_id UUID,
	content TEXT,
	time TEXT,
	PRIMARY KEY(user_id, time)
);