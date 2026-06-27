require("dotenv").config({ quiet: true });

const mysql = require("mysql2");

const REQUIRED_ENV = ["MYSQLHOST", "MYSQLPORT", "MYSQLUSER", "MYSQLPASSWORD", "MYSQLDATABASE"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.warn(`Database is not configured. Missing: ${missingEnv.join(", ")}`);

  module.exports = {
    isConfigured: false,
    query(_sql, _values, callback) {
      const cb = typeof _values === "function" ? _values : callback;
      if (typeof cb !== "function") return;

      const err = new Error(`Database is not configured. Missing: ${missingEnv.join(", ")}`);
      err.code = "DB_NOT_CONFIGURED";
      cb(err);
    },
  };
} else {
  const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    port: Number(process.env.MYSQLPORT),
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    connectTimeout: 20000,
  });

  db.connect((err) => {
    if (err) {
      console.error("Database connection failed");
      console.error(err);
      return;
    }

    console.log("MySQL connected");
  });

  db.isConfigured = true;

  module.exports = db;
}
