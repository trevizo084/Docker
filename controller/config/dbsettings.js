// importar la version de promesas de mysql
const mysql = require("mysql2/promise");

// configurar la conexion a la base de datos
const dotenv = require("dotenv");

// configuracion de la db
dotenv.config();
const dbSettings = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// conexion con la base de datos
const pool = mysql.createPool(dbSettings);

module.exports = pool;