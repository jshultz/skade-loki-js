let MySql = require('mysql2');
let Config = require('./database/config');

const ResetFlag = process.argv[1].search(/^-r$/) ? true : false;
const Tables = ['poll', 'command_entry', 'list', 'task'];

const Pool = MySql.createPool(Config);
if (ResetFlag) {
	Tables.forEach((table) => {
		Pool.query(`DROP TABLE IF EXISTS ${table}`);
	});
}

Pool.getConnection((err, conn) => {
	if (err) console.error;
	conn.query(`CREATE TABLE IF NOT EXISTS ${Tables[0]} (` +
                'message_id VARCHAR(255) PRIMARY KEY NOT NULL, ' +
                'name VARCHAR(255) NOT NULL, ' +
                'response VARCHAR(255))');
	conn.query(`CREATE TABLE IF NOT EXISTS ${Tables[1]} (` +
                'message_id VARCHAR(255) PRIMARY KEY NOT NULL, ' +
                'command_name VARCHAR(255) NOT NULL, ' +
                'created_at TIMESTAMP)');
	conn.query(`CREATE TABLE IF NOT EXISTS ${Tables[2]} (` +
                'id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT, ' +
                'list_name VARCHAR(255) NOT NULL, ' +
                'creator_id VARCHAR(255) NOT NULL, ' +
                'due_date VARCHAR(255))');
	conn.query(`CREATE TABLE IF NOT EXISTS ${Tables[3]} (` +
                'id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT, ' +
                'list_id INTEGER NOT NULL, ' +
                'task_name VARCHAR(255) NOT NULL, ' +
                'assignee_id VARCHAR(255) NOT NULL, ' +
                'status VARCHAR(255) NOT NULL)');

	let message = ResetFlag ?
		'Successfully re-created tables' : 'Successfully created tables';
	console.log(message);
});