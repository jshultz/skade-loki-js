let execute = require('../query_proxy');

class Task {
	constructor(connection) {
		this.connection = connection;
	}

	async add(listId, taskName) {
		return await execute(
			this.connection,
			'INSERT INTO task (list_id, task_name, taskAssignee) VALUES (?, ?, ?)',
			[listId, taskName, '-1']);
	}

	async fetchByListId(listId) {
		return await execute(
			this.connection,
			'SELECT * FROM task WHERE list_id = ?',
			[listId]);
	}
}

module.exports = Task;