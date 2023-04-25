let execute = require('../query_proxy');

class CommandEntry {
	constructor(connection) {
		this.connection = connection;
	}

	async add(messageId, commandName, timestamp) {
		return await execute(
			this.connection,
			'INSERT INTO command_entry (message_id, command_name, created_at) VALUES (?, ?, ?)',
			[messageId, commandName, timestamp]);
	}

	async fetchCommandMessages(messageId, commandName) {
		return await execute(
			this.connection,
			'SELECT * FROM command_entry WHERE message_id = ? AND command_name = ?',
			[messageId, commandName]);
	}
}

module.exports = CommandEntry;