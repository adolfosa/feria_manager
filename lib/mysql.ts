// lib/mysql.ts
import mysql from "mysql2/promise"

const globalForMysql = global as unknown as { mysqlPool?: mysql.Pool }

export const mysqlPool =
  globalForMysql.mysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    namedPlaceholders: true,
  })

if (process.env.NODE_ENV !== "production") {
  globalForMysql.mysqlPool = mysqlPool
}

export default mysqlPool
