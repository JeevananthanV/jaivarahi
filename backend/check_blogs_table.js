import pool from "./db/pool.js";

async function run() {
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'blogs'");
    if (tables.length === 0) {
      console.log("Creating blogs table...");
      await pool.query(`
        CREATE TABLE blogs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content MEDIUMTEXT NOT NULL,
          snippet VARCHAR(1000) DEFAULT NULL,
          title_en VARCHAR(255) DEFAULT NULL,
          title_ta VARCHAR(255) DEFAULT NULL,
          content_en MEDIUMTEXT DEFAULT NULL,
          content_ta MEDIUMTEXT DEFAULT NULL,
          snippet_en VARCHAR(1000) DEFAULT NULL,
          snippet_ta VARCHAR(1000) DEFAULT NULL,
          thumbnail_url VARCHAR(500) DEFAULT NULL,
          gallery_urls JSON DEFAULT NULL,
          author_id INT NULL,
          status ENUM('Draft', 'Pending', 'Published', 'Rejected') NOT NULL DEFAULT 'Draft',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT fk_blogs_author FOREIGN KEY (author_id) REFERENCES admin_users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("blogs table created successfully.");
    } else {
      console.log("blogs table exists. Checking/adding columns...");
      const [columns] = await pool.query("DESCRIBE blogs");
      const colNames = columns.map(c => c.Field);
      
      const neededCols = [
        { name: "title_en", type: "VARCHAR(255) DEFAULT NULL" },
        { name: "title_ta", type: "VARCHAR(255) DEFAULT NULL" },
        { name: "content_en", type: "MEDIUMTEXT DEFAULT NULL" },
        { name: "content_ta", type: "MEDIUMTEXT DEFAULT NULL" },
        { name: "snippet_en", type: "VARCHAR(1000) DEFAULT NULL" },
        { name: "snippet_ta", type: "VARCHAR(1000) DEFAULT NULL" },
        { name: "gallery_urls", type: "JSON DEFAULT NULL" },
        { name: "category", type: "VARCHAR(255) DEFAULT NULL" },
        { name: "tags", type: "VARCHAR(500) DEFAULT NULL" },
        { name: "slug", type: "VARCHAR(255) DEFAULT NULL" }
      ];

      for (const col of neededCols) {
        if (!colNames.includes(col.name)) {
          console.log(`Adding column ${col.name}...`);
          await pool.query(`ALTER TABLE blogs ADD COLUMN ${col.name} ${col.type}`);
        }
      }
      console.log("Blogs table is fully updated.");
    }
  } catch (err) {
    console.error("Error checking/creating blogs table:", err);
  } finally {
    process.exit(0);
  }
}

run();
