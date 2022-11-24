let MySql = require("mysql2");
let Config = require("./database/config");

const ResetFlag = process.argv[1].search(/^-r$/) ? true : false;
const Tables = ["command_entry", "list", "task"];

const Pool = MySql.createPool(Config);
if (ResetFlag) {
    Tables.forEach((table, _a, _b) => {
        Pool.query(`DROP TABLE IF EXISTS ${table}`);
    });
}

Pool.getConnection((err, conn) => {
    if (err) console.error;
    conn.query(`CREATE TABLE IF NOT EXISTS ${Tables[0]} (` +
        "message_id INTEGER PRIMARY KEY NOT NULL, " +
        "command_name VARCHAR(255) NOT NULL, " +
        "created_at TIMESTAMP)");
    conn.query(`CREATE TABLE IF NOT EXISTS ${Tables[1]} (` +
        "list_id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT, " +
        "message_id VARCHAR(255) NOT NULL, " +
        "list_name VARCHAR(255) NOT NULL, " +
        "owner_id VARCHAR(255) NOT NULL, " +
        "due_date DATE)");
    conn.query(`CREATE TABLE IF NOT EXISTS ${Tables[2]} (` +
        "task_id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT, " +
        "list_id INTEGER NOT NULL, " +
        "task_name VARCHAR(255) NOT NULL, " +
        "assignee_id VARCHAR(255) NOT NULL)");

    let message = ResetFlag ?
        "Successfully re-created tables" : "Successfully created tables";
    console.log(message);
});