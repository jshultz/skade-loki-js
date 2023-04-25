let execute = require('../query_proxy');

class List {
	constructor(connection) {
		this.connection = connection;
	}

	async add(listName, creatorId) {
		return await execute(
			this.connection,
			'INSERT INTO list (creator_id, list_name) VALUES (?, ?)',
			[creatorId, listName]);
	}

	async search(listName) {
		return await execute(
			this.connection,
			'SELECT * FROM list WHERE list_name = ?',
			[listName]);
	}

	async fetchById(listId) {
		return await execute(
			this.connection,
			'SELECT * FROM list WHERE id = ?',
			[listId]);
	}
}

module.exports = List;