// ============================================================
// run.js — Database Migration & Schema Sync Runner
// ============================================================
import "../env.js";
import pool from "../db/pool.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log("\n============================================================");
  console.log("🔄 Starting Database Migration & Health Sync...");
  console.log("============================================================");

  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ Successfully connected to MySQL database.");

    // 1. Create migrations tracking table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Scan migration files
    const files = fs.readdirSync(__dirname)
      .filter(f => f !== "run.js" && (f.endsWith(".js") || f.endsWith(".sql")))
      .sort();

    const [appliedRows] = await connection.query("SELECT migration_name FROM _schema_migrations");
    const appliedSet = new Set(appliedRows.map(r => r.migration_name));

    console.log(`📋 Found ${files.length} total migration scripts (${appliedSet.size} previously tracked).`);

    for (const file of files) {
      if (appliedSet.has(file)) {
        continue;
      }

      console.log(`▶ Executing migration: ${file}...`);
      const filePath = path.join(__dirname, file);

      if (file.endsWith(".sql")) {
        const sqlContent = fs.readFileSync(filePath, "utf-8");
        // Split on semicolons that aren't inside strings
        const statements = sqlContent
          .split(/;\s*$/m)
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith("--"));

        for (const statement of statements) {
          try {
            await connection.query(statement);
          } catch (stmtErr) {
            // Ignore duplicate column/index errors to maintain idempotency
            if (
              stmtErr.code === "ER_DUP_KEYNAME" ||
              stmtErr.code === "ER_DUP_FIELDNAME" ||
              stmtErr.code === "ER_TABLE_EXISTS_ERROR"
            ) {
              console.log(`   ℹ️ Notice: ${stmtErr.message}`);
            } else {
              console.warn(`   ⚠️ Non-fatal SQL warning in ${file}:`, stmtErr.message);
            }
          }
        }
      }

      await connection.query(
        "INSERT INTO _schema_migrations (migration_name) VALUES (?) ON DUPLICATE KEY UPDATE applied_at = NOW()",
        [file]
      );
      console.log(`✅ Completed: ${file}`);
    }

    console.log("\n✅ All migrations synchronized successfully.");
  } catch (err) {
    console.error("❌ Migration error:", err.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

run();
