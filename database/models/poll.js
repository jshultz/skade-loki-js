let execute = require('../query_proxy');

class Poll {
	constructor(connection) {
		this.connection = connection;
	}

	async add(messageId, pollName) {
		return await execute(
			this.connection,
			'INSERT INTO poll (message_id, name) VALUES (?, ?)',
			[messageId, pollName]
		);
	}

	async fetch(messageId) {
		return await execute(
			this.connection,
			'SELECT * FROM poll WHERE message_id = ?',
			[messageId]
		);
	}

	async update(messageId, response) {
		return await execute(
			this.connection,
			'UPDATE poll SET response = ? WHERE message_id = ?',
			[messageId, response]
		);
	}
}