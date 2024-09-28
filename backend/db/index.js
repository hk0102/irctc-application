import mysql from "mysql2/promise";
import config from "../config/Database.js";

const con = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,
});

console.log('Connected to MySQL database');
export default con;
