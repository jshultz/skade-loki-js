let execute = require("../query_proxy");

class Task {
    constructor(connection) {
        this.connection = connection;
    }

    async add(listId, taskName, taskAssignee) {
        return await execute(
            this.connection,
            "INSERT INTO task (list_id, task_name, task_assignee) VALUES (?, ?, ?)",
            [listId, taskName, taskAssignee]);
    }

    async fetchById(listId) {
        return await execute(
            this.connection,
            "SELECT * FROM task WHERE list_id = ?",
            [listId]);
    }
}

module.exports = Task;