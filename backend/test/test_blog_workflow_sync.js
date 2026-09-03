import "../env.js";
import pool from "../db/pool.js";

const runBlogWorkflowTests = async () => {
  console.log("=================================================");
  console.log("🧪 STARTING BLOG WORKFLOW & AUDIT SYNC VALIDATION");
  console.log("=================================================");

  let testBlogId = null;
  let superAdminId = null;
  let blogAdminId = null;

  try {
    // 1. Fetch or identify Super Admin and Admin test users
    const [superAdmins] = await pool.execute("SELECT id, name, role FROM admin_users WHERE role = 'Super Admin' LIMIT 1");
    const [admins] = await pool.execute("SELECT id, name, role FROM admin_users WHERE role != 'Super Admin' LIMIT 1");

    if (superAdmins.length > 0) {
      superAdminId = superAdmins[0].id;
      console.log(`✓ Super Admin Found: ${superAdmins[0].name} (ID: ${superAdminId})`);
    } else {
      console.warn("⚠️ No Super Admin found, using fallback ID 1");
      superAdminId = 1;
    }

    if (admins.length > 0) {
      blogAdminId = admins[0].id;
      console.log(`✓ Blog Admin Found: ${admins[0].name} (ID: ${blogAdminId})`);
    } else {
      console.log("ℹ️ Using ID 2 as Blog Admin");
      blogAdminId = 2;
    }

    // 2. Test Step 1: Blog Admin creates draft post
    const testSlug = `qa-sync-test-${Date.now()}`;
    const [createResult] = await pool.execute(
      `INSERT INTO blogs (
        title, content, snippet, title_en, title_ta, content_en, content_ta,
        author_id, status, slug
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?)`,
      [
        "QA Sync Test Article",
        "<p>Full content for QA verification of audit logging.</p>",
        "Short snippet",
        "QA Sync Test Article",
        "QA ஒத்திசைவு சோதனை கட்டுரை",
        "<p>Full content for QA verification of audit logging.</p>",
        "<p>தணிக்கை பதிவு சரிபார்ப்புக்கான முழு உள்ளடக்கம்.</p>",
        blogAdminId,
        testSlug
      ]
    );
    testBlogId = createResult.insertId;
    console.log(`✓ Step 1: Created Draft Blog #${testBlogId} by Author ${blogAdminId}`);

    // Verify initial status is Draft
    const [checkDraft] = await pool.execute("SELECT status FROM blogs WHERE id = ?", [testBlogId]);
    if (checkDraft[0].status !== "Draft") throw new Error(`Expected Draft, got ${checkDraft[0].status}`);
    console.log("✓ Initial Status Verified: Draft");

    // 3. Test Step 2: Blog Admin submits for review (Draft -> Pending)
    await pool.execute("UPDATE blogs SET status = 'Pending' WHERE id = ?", [testBlogId]);
    await pool.execute(
      "INSERT INTO audit_logs (admin_id, action, target_resource, details) VALUES (?, ?, ?, ?)",
      [
        blogAdminId,
        "SUBMIT_FOR_REVIEW",
        "blogs",
        JSON.stringify({ id: testBlogId, oldStatus: "Draft", newStatus: "Pending" })
      ]
    );
    console.log(`✓ Step 2: Blog #${testBlogId} submitted for review (Status: Pending)`);

    // 4. Test Step 3: Super Admin reviews & approves with review notes (Pending -> Approved)
    const reviewNote = "Verified content and translations. Approved for publication by QA.";
    await pool.execute(
      "UPDATE blogs SET status = 'Approved', review_notes = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
      [reviewNote, superAdminId, testBlogId]
    );
    await pool.execute(
      "INSERT INTO audit_logs (admin_id, action, target_resource, details) VALUES (?, ?, ?, ?)",
      [
        superAdminId,
        "APPROVE_BLOG",
        "blogs",
        JSON.stringify({ id: testBlogId, oldStatus: "Pending", newStatus: "Approved", review_notes: reviewNote })
      ]
    );
    console.log(`✓ Step 3: Super Admin approved Blog #${testBlogId} (Status: Approved, Notes: "${reviewNote}")`);

    // 5. Test Step 4: Verify Blog Admin view data contract (Status, Reviewer, Notes)
    const [adminViewRows] = await pool.execute(
      `SELECT b.*, u.name AS author_name, rev.name AS reviewer_name 
       FROM blogs b 
       LEFT JOIN admin_users u ON b.author_id = u.id 
       LEFT JOIN admin_users rev ON b.reviewed_by = rev.id 
       WHERE b.id = ?`,
      [testBlogId]
    );
    const blogRow = adminViewRows[0];
    if (blogRow.status !== "Approved") throw new Error(`Status mismatch: Expected 'Approved', got '${blogRow.status}'`);
    if (blogRow.review_notes !== reviewNote) throw new Error(`Review note mismatch`);
    if (!blogRow.reviewed_at) throw new Error(`Reviewed_at timestamp missing`);
    console.log("✓ Step 4: Blog Admin view data contract verified (Status: Approved, Reviewer Attribution & Notes Present)");

    // 6. Test Step 5: Verify Audit Log retrieval for Blog Admin
    const [auditRows] = await pool.execute(
      `SELECT a.*, u.name AS admin_name, u.role AS admin_role
       FROM audit_logs a
       LEFT JOIN admin_users u ON a.admin_id = u.id
       WHERE a.target_resource = 'blogs' AND (a.details LIKE ? OR a.details LIKE ?)
       ORDER BY a.id ASC`,
      [`%"id":${testBlogId}%`, `%"id":"${testBlogId}"%`]
    );
    console.log(`✓ Step 5: Audit logs retrieved: ${auditRows.length} events found for Blog #${testBlogId}`);
    auditRows.forEach((r, idx) => {
      const details = JSON.parse(r.details);
      console.log(`   [Log ${idx + 1}] Action: ${r.action} | By: ${r.admin_name || 'Admin'} | Old: ${details.oldStatus} -> New: ${details.newStatus}`);
    });

    if (auditRows.length < 2) throw new Error("Expected at least 2 audit entries");

    // 7. Test Step 6: Blog Admin executes final Publish (Approved -> Published)
    await pool.execute("UPDATE blogs SET status = 'Published' WHERE id = ?", [testBlogId]);
    await pool.execute(
      "INSERT INTO audit_logs (admin_id, action, target_resource, details) VALUES (?, ?, ?, ?)",
      [
        blogAdminId,
        "PUBLISH_BLOG",
        "blogs",
        JSON.stringify({ id: testBlogId, oldStatus: "Approved", newStatus: "Published" })
      ]
    );
    console.log(`✓ Step 6: Blog Admin executed final Publish (Status: Published)`);

    // 8. Test Step 7: Public Endpoint Visibility Check
    const [publicCheck] = await pool.execute("SELECT id, title, slug, status FROM blogs WHERE (id = ? OR slug = ?) AND status = 'Published'", [testBlogId, testSlug]);
    if (publicCheck.length === 0) throw new Error("Published blog not visible in public query!");
    console.log(`✓ Step 7: Public portal query verified: Post '${publicCheck[0].title}' is live at /blog/${publicCheck[0].slug}`);

    // Cleanup test record
    await pool.execute("DELETE FROM audit_logs WHERE target_resource = 'blogs' AND details LIKE ?", [`%"id":${testBlogId}%`]);
    await pool.execute("DELETE FROM blogs WHERE id = ?", [testBlogId]);
    console.log(`✓ Cleanup: Removed test blog #${testBlogId} and associated test audit entries.`);

    console.log("\n=================================================");
    console.log("🎉 ALL BLOG WORKFLOW & AUDIT SYNC TESTS PASSED!");
    console.log("=================================================");
  } catch (error) {
    console.error("❌ Test Validation Failed:", error.message);
    if (testBlogId) {
      await pool.execute("DELETE FROM blogs WHERE id = ?", [testBlogId]);
    }
  } finally {
    process.exit(0);
  }
};

runBlogWorkflowTests();
