let execute = require("../query_proxy");

class List {
    constructor(connection) {
        this.connection = connection;
    }

    async add(messageId, memberId, listName) {
        return await execute(
            this.connection,
            "INSERT INTO list (message_id, owner_id, list_name) VALUES (?, ?, ?)",
            [messageId, memberId, listName]);
    }

    async fetchById(messageId) {
        return await execute(
            this.connection,
            "SELECT * FROM list WHERE message_id = ?",
            [messageId]);
    }
    async search(listName, ownerId) {
        return await execute(
            this.connection,
            "SELECT * FROM list WHERE list_name = ? AND owner_id = ?",
            [listName, ownerId]);
    }

    async updateMessageId(listId, messageId) {
        return await execute(
            this.connection,
            "UPDATE list SET message_id = ? WHERE list_id = ?",
            [messageId, listId]);
    }
}

module.exports = List;