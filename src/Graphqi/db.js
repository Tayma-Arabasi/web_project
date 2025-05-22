

const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
    port: 3306,
  password: '0000',
  database: 'taskmanager',
});

db.connect((err) => {
  if (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL DB");
});

module.exports = db;
