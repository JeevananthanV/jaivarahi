import pool from "../db/pool.js";

const updateBlogsSchema = async () => {
  try {
    console.log("Updating blogs table schema...");

    // 1. Check current columns
    const [cols] = await pool.execute("SHOW COLUMNS FROM blogs");
    const colNames = cols.map(c => c.Field);

    // 2. Add review_notes if not exists
    if (!colNames.includes("review_notes")) {
      await pool.execute("ALTER TABLE blogs ADD COLUMN review_notes TEXT DEFAULT NULL");
      console.log("Added review_notes column");
    }

    // 3. Add reviewed_by if not exists
    if (!colNames.includes("reviewed_by")) {
      await pool.execute("ALTER TABLE blogs ADD COLUMN reviewed_by INT NULL");
      console.log("Added reviewed_by column");
    }

    // 4. Add reviewed_at if not exists
    if (!colNames.includes("reviewed_at")) {
      await pool.execute("ALTER TABLE blogs ADD COLUMN reviewed_at TIMESTAMP NULL DEFAULT NULL");
      console.log("Added reviewed_at column");
    }

    // 5. Modify status column to include 'Approved'
    try {
      await pool.execute("ALTER TABLE blogs MODIFY COLUMN status ENUM('Draft', 'Pending', 'Approved', 'Published', 'Rejected') NOT NULL DEFAULT 'Draft'");
      console.log("Modified status column ENUM to include 'Approved'");
    } catch (enumErr) {
      console.warn("Could not modify ENUM directly, trying VARCHAR fallback:", enumErr.message);
      await pool.execute("ALTER TABLE blogs MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'Draft'");
    }

    console.log("✅ blogs schema updated successfully!");
  } catch (error) {
    console.error("Migration error:", error.message);
  } finally {
    process.exit(0);
  }
};

updateBlogsSchema();
