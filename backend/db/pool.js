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
  connectionLimit: Number(env("DB_POOL_LIMIT", "MYSQL_POOL_LIMIT") || 100),
  maxIdle: Number(env("DB_POOL_MAX_IDLE", "MYSQL_POOL_MAX_IDLE") || 50),
  idleTimeout: 120000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  queueLimit: Number(env("DB_QUEUE_LIMIT", "MYSQL_QUEUE_LIMIT") || 500),
  connectTimeout: 20000,
});

// Graceful connection error handling
pool.on("error", (err) => {
  console.error("⚠️ Unexpected MySQL Pool Error:", err.message || err);
});

if (!hasMysqlConfig) {
  console.warn('Database env vars are not fully set. Falling back to local defaults for booking persistence.');
}

export default pool;
