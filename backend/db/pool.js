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

// ─── Connection Pool Factory ─────────────────────────────────────────
const createPool = (host) => mysql.createPool({
  host,
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

// ─── Primary (Write) Pool ───────────────────────────────────────────
const primaryHost = env("MYSQL_HOST", "DB_HOST") || 'localhost';
export const writePool = createPool(primaryHost);

// ─── Read Replica Pools ─────────────────────────────────────────────
const replicaHostsEnv = env("MYSQL_REPLICA_HOSTS", "DB_REPLICA_HOSTS");
const replicaHosts = replicaHostsEnv ? replicaHostsEnv.split(",").map(h => h.trim()).filter(Boolean) : [];

let readPools = [];
if (replicaHosts.length > 0) {
  readPools = replicaHosts.map(host => createPool(host));
  console.log(`📊 MySQL Read Replicas configured: ${replicaHosts.length} (${replicaHosts.join(", ")})`);
} else {
  console.log(`📊 MySQL Read Replicas: none configured, using primary for reads`);
}

// ─── Round-Robin Read Pool Selector ─────────────────────────────────
let readPoolIndex = 0;
export const getReadPool = () => {
  if (readPools.length === 0) return writePool;
  const pool = readPools[readPoolIndex];
  readPoolIndex = (readPoolIndex + 1) % readPools.length;
  return pool;
};

// ─── Unified Pool Interface (backward compatibility) ────────────────
// Default export uses write pool for backward compatibility
const pool = writePool;

// Graceful connection error handling
[writePool, ...readPools].forEach((p, i) => {
  p.on("error", (err) => {
    const label = i === 0 ? "PRIMARY" : `REPLICA-${i}`;
    console.error(`⚠️ Unexpected MySQL ${label} Pool Error:`, err.message || err);
  });
});

if (!hasMysqlConfig) {
  console.warn('Database env vars are not fully set. Falling back to local defaults for booking persistence.');
}

// ─── Helper Functions ───────────────────────────────────────────────
export const executeWrite = (sql, params) => writePool.execute(sql, params);
export const executeRead = (sql, params) => getReadPool().execute(sql, params);
export const queryWrite = (sql, params) => writePool.query(sql, params);
export const queryRead = (sql, params) => getReadPool().query(sql, params);

// ─── Health Check ───────────────────────────────────────────────────
export const checkDatabaseHealth = async () => {
  try {
    await writePool.query("SELECT 1 as primary");
    let replicas = 0;
    for (const rp of readPools) {
      try {
        await rp.query("SELECT 1");
        replicas++;
      } catch {}
    }
    return { 
      primary: true, 
      replicas: replicas,
      total: 1 + replicas 
    };
  } catch (e) {
    return { 
      primary: false, 
      replicas: 0, 
      error: e.message 
    };
  }
};

export default pool;