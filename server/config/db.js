const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT),
  ssl: {
    rejectUnauthorized: false,
  },
  connectTimeout: 30000,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed");
    console.error(err);
    return;
  }

  console.log("✅ MySQL Connected Successfully!");
});

module.exports = db;