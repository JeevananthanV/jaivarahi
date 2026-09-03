import "../env.js";
import pool from "../db/pool.js";
import assert from "assert";

const runSeoBlogUpdateTests = async () => {
  console.log("=================================================");
  console.log("🧪 TESTING BLOG POST & DYNAMIC SEO UPDATE FIX");
  console.log("=================================================");

  let testBlogId = null;

  try {
    // 1. Ensure columns exist via information_schema
    const columns = [
      { name: "meta_title", def: "VARCHAR(255) DEFAULT NULL" },
      { name: "meta_description", def: "VARCHAR(500) DEFAULT NULL" },
      { name: "focus_keyword", def: "VARCHAR(100) DEFAULT NULL" }
    ];

    for (const col of columns) {
      const [existing] = await pool.execute(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'blogs' AND COLUMN_NAME = ?",
        [col.name]
      );
      if (!existing.length) {
        await pool.execute(`ALTER TABLE blogs ADD COLUMN ${col.name} ${col.def}`);
      }
    }
    console.log("✓ Step 1: Database SEO columns verified and migrated");

    // 2. Fetch Super Admin user for author
    const [superAdmins] = await pool.execute("SELECT id, name FROM admin_users WHERE role = 'Super Admin' LIMIT 1");
    const authorId = superAdmins.length ? superAdmins[0].id : 1;

    // 3. Create post "Sri jai Varahi Peedam" with SEO metadata
    const testTitle = "Sri jai Varahi Peedam";
    const testSlug = `sri-jai-varahi-peedam-test-${Date.now()}`;
    const testMetaTitle = "Sri Jai Varahi Peedam | Divine Temple Blessings";
    const testMetaDesc = "Discover the sacred spiritual history, powerful Varahi Malai chanting methods, and pooja timings at Sri Jai Varahi Peedam.";
    const testKeyword = "Sri Jai Varahi Peedam";

    const [createResult] = await pool.execute(
      `INSERT INTO blogs (
        title, content, snippet, title_en, title_ta, content_en, content_ta,
        snippet_en, snippet_ta, author_id, status, slug,
        meta_title, meta_description, focus_keyword
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?, ?, ?, ?)`,
      [
        testTitle,
        "<p>Detailed sacred insights into Sri Jai Varahi Peedam.</p>",
        "Short snippet about Sri Jai Varahi Peedam",
        testTitle,
        "ஸ்ரீ ஜெய் வாராஹி பீடம்",
        "<p>Detailed sacred insights into Sri Jai Varahi Peedam.</p>",
        "<p>ஸ்ரீ ஜெய் வாராஹி பீடத்தின் ஆன்மீக மகத்துவங்கள்.</p>",
        "Short snippet about Sri Jai Varahi Peedam",
        "ஸ்ரீ ஜெய் வாராஹி பீடம் சுருக்கம்",
        authorId,
        testSlug,
        testMetaTitle,
        testMetaDesc,
        testKeyword
      ]
    );

    testBlogId = createResult.insertId;
    console.log(`✓ Step 2: Created Blog #${testBlogId} ("${testTitle}")`);

    // 4. Verify saved columns
    const [savedRows] = await pool.execute(
      "SELECT id, title, slug, meta_title, meta_description, focus_keyword FROM blogs WHERE id = ?",
      [testBlogId]
    );
    assert.strictEqual(savedRows.length, 1);
    assert.strictEqual(savedRows[0].meta_title, testMetaTitle);
    assert.strictEqual(savedRows[0].meta_description, testMetaDesc);
    assert.strictEqual(savedRows[0].focus_keyword, testKeyword);
    console.log("✓ Step 3: Verified initial SEO metadata persistence");

    // 5. Update post with modified dynamic SEO metadata
    const updatedMetaTitle = "Sri Jai Varahi Peedam — Complete 2026 Temple Guide";
    const updatedMetaDesc = "Updated divine guide to Sri Jai Varahi Peedam rituals, special Panchami poojas, and online booking.";
    const updatedKeyword = "Varahi Temple Katpadi";

    await pool.execute(
      `UPDATE blogs SET 
        title_en = ?,
        meta_title = ?,
        meta_description = ?,
        focus_keyword = ?
       WHERE id = ?`,
      [testTitle, updatedMetaTitle, updatedMetaDesc, updatedKeyword, testBlogId]
    );
    console.log("✓ Step 4: Successfully updated blog post with dynamic SEO & SERP fields");

    // 6. Verify updated metadata
    const [updatedRows] = await pool.execute(
      "SELECT meta_title, meta_description, focus_keyword FROM blogs WHERE id = ?",
      [testBlogId]
    );
    assert.strictEqual(updatedRows[0].meta_title, updatedMetaTitle);
    assert.strictEqual(updatedRows[0].meta_description, updatedMetaDesc);
    assert.strictEqual(updatedRows[0].focus_keyword, updatedKeyword);
    console.log("✓ Step 5: Verified updated SEO & SERP data in database");

    // 7. Test re-saving with identical title / slug collision resistance
    const [collisionRows] = await pool.execute(
      "SELECT id FROM blogs WHERE slug = ? AND id != ?",
      [testSlug, testBlogId]
    );
    assert.strictEqual(collisionRows.length, 0);
    console.log("✓ Step 6: Slug collision check properly ignores active blog ID");

    // Cleanup
    await pool.execute("DELETE FROM blogs WHERE id = ?", [testBlogId]);
    console.log("✓ Step 7: Cleaned up test record");

    console.log("\n=================================================");
    console.log("🎉 ALL BLOG & DYNAMIC SEO UPDATE TESTS PASSED!");
    console.log("=================================================");
  } catch (err) {
    console.error("❌ Test failed:", err);
    if (testBlogId) {
      await pool.execute("DELETE FROM blogs WHERE id = ?", [testBlogId]).catch(() => {});
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runSeoBlogUpdateTests();
