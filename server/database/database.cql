CREATE KEYSPACE IF NOT EXISTS app_data WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'} AND durable_writes = true;
USE app_data;

CREATE TABLE IF NOT EXISTS users (
	username TEXT PRIMARY KEY,
	user_id UUID,
	password TEXT
);

CREATE INDEX IF NOT EXISTS uuid ON users (user_id);

CREATE TABLE IF NOT EXISTS notification (
	user_id UUID,
	notification_id UUID,
	content TEXT,
	time TEXT,
	PRIMARY KEY(user_id, time)
);

CREATE INDEX IF NOT EXISTS time ON notification (time);