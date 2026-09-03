import mysql from "mysql2/promise";

const env = (primary, fallback) => process.env[primary] || process.env[fallback] || "";

const isProd = process.env.NODE_ENV === "production";
const dbPassword = env("MYSQL_PASSWORD", "DB_PASSWORD");

if (isProd && !dbPassword) {
  throw new Error("CRITICAL SECURITY ERROR: Database password (MYSQL_PASSWORD/DB_PASSWORD) environment variable is missing in production!");
}

const hasMysqlConfig =
  env("MYSQL_HOST", "DB_HOST") &&
  env("MYSQL_USER", "DB_USER") &&
  env("MYSQL_DATABASE", "DB_NAME");

const pool = mysql.createPool({
  host: env("MYSQL_HOST", "DB_HOST") || 'localhost',
  user: env("MYSQL_USER", "DB_USER") || 'root',
  password: String(dbPassword || '').trim(),
  database: env("MYSQL_DATABASE", "DB_NAME") || 'jaivarahi',
  port: Number(env("MYSQL_PORT", "DB_PORT")) || 3306,
  waitForConnections: true,
  connectionLimit: Number(env("DB_POOL_LIMIT", "MYSQL_POOL_LIMIT") || 25),
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  queueLimit: 0,
});

if (!hasMysqlConfig) {
  console.warn('Database env vars are not fully set. Falling back to local defaults for booking persistence.');
}

export default pool;
