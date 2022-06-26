let mysql = require('mysql2');

let conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'EvanTalks',
});

conn.connect((err) => {
    if (err) throw err;
    console.log('Connected!');
    conn.query('CREATE DATABASE IF NOT EXISTS loki', (err, result) => {
        if (err) throw err;
        console.log('Created database loki');
        let projectsTblCmd = 'CREATE TABLE IF NOT EXISTS projects (project_name VARCHAR(255) NOT NULL, due_date DATE, user VARCHAR(255), tasks_completed int, total_tasks int)';
        conn.query(projectsTblCmd, (err, result) => {
            console.log('Created projects table');
        });
        let tasksTblCmd = 'CREATE TABLE IF NOT EXISTS tasks (task_name VARCHAR(255) NOT NULL, project_id int NOT NULL default 0, completed BOOL)';
        conn.query(tasksTblCmd, (err, result) => {
            console.log('Created tasks table');
        });
    });
});