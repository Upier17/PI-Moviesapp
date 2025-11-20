import mysql from "mysql2/promise";

export const db = await mysql.createPool({
  host: process.env.MYSQLHOST,     // centerbeam.proxy.rlwy.net
  user: process.env.MYSQLUSER,     // root
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,     // 42524
  ssl: {
    rejectUnauthorized: false
  }
});
