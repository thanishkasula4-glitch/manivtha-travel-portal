const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Thanish@1234",
  database: "travel_portal",
});

db.connect((err) => {
  if (err) {
    console.log("❌ Database connection failed");
    console.log(err);
    return;
  }

  console.log("✅ MySQL Connected");
});

module.exports = db;