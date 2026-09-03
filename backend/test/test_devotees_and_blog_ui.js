import "../env.js";
import pool from "../db/pool.js";

async function populateAndTestDevoteesAndBlogs() {
  console.log("=================================================");
  console.log("🧪 SEEDING & TESTING DEVOTEES AND BLOG POSTS DATA");
  console.log("=================================================");

  try {
    // 1. Seed Sample Devotees for UI/UX testing
    console.log("\n--- 1. Testing Devotees Directory ---");
    const sampleDevotees = [
      {
        name: "Senthil Nathan K (செந்தில் நாதன்)",
        contact: "9840123456",
        email_address: "senthil.varahi@example.com",
        postal_address: "No. 14, Sannadhi Street, Katpadi, Vellore - 632106",
        gothram: "Kasyapa (காசியப)",
        married_status: "married",
        wedding_date: "2015-05-24",
        father_name: "Krishnamurthy",
        mother_name: "Lakshmi Ammal",
        family_members: JSON.stringify([
          { relationship: "Spouse", name: "Priya Senthil (பிரியா)", star: "Rohini (ரோகிணி)", rasi: "Rishabam (ரிஷபம்)", dob: "1990-08-14" },
          { relationship: "Daughter", name: "Adhira Senthil (ஆதிரா)", star: "Chitra (சித்திரை)", rasi: "Kanni (கன்னி)", dob: "2018-11-03" },
          { relationship: "Son", name: "Kavin Senthil (கவின்)", star: "Uttara Bhadrapada (உத்திரட்டாதி)", rasi: "Meenam (மீனம்)", dob: "2021-02-19" }
        ]),
        note: "Daily Sahasranama Archana and protection prayers for family harmony.",
        added_by: "Super Admin"
      },
      {
        name: "Ramesh Sundaram (ரமேஷ் சுந்தரம்)",
        contact: "9789012345",
        email_address: "ramesh.s@example.com",
        postal_address: "Flat 3B, Temple View Apartments, Arumparuthi, Vellore - 632106",
        gothram: "Bharadwaja (பாரத்வாஜ)",
        married_status: "married",
        wedding_date: "2012-10-18",
        father_name: "Sundara Iyer",
        mother_name: "Saraswathi",
        family_members: JSON.stringify([
          { relationship: "Spouse", name: "Meenakshi Ramesh (மீனாட்சி)", star: "Revati (ரேவதி)", rasi: "Meenam (மீனம்)", dob: "1988-03-21" },
          { relationship: "Father", name: "Sundara Iyer", star: "Moola (மூலம்)", rasi: "Dhanusu (தனுசு)", dob: "1955-06-12" }
        ]),
        note: "Health improvement and business prosperity Sankalpam.",
        added_by: "Admin"
      },
      {
        name: "Ananya Venkatesh (அனன்யா)",
        contact: "9444567890",
        email_address: "ananya.v@example.com",
        postal_address: "No. 7, Gandhi Road, Ranipet - 632401",
        gothram: "Siva Gothram (சிவ கோத்ரம்)",
        married_status: "unmarried",
        wedding_date: null,
        father_name: "Venkatesh",
        mother_name: "Bhavani",
        family_members: JSON.stringify([
          { relationship: "Father", name: "Venkatesh", star: "Ashwini (அசுவினி)", rasi: "Mesham (மேஷம்)", dob: "1962-09-05" },
          { relationship: "Mother", name: "Bhavani", star: "Swati (சுவாதி)", rasi: "Thulaam (துலாம்)", dob: "1968-12-22" }
        ]),
        note: "Career growth and education blessings from Goddess Varahi.",
        added_by: "Public"
      }
    ];

    for (const d of sampleDevotees) {
      const [existing] = await pool.execute("SELECT id FROM devotee_details WHERE contact = ?", [d.contact]);
      if (existing.length === 0) {
        await pool.execute(
          `INSERT INTO devotee_details (name, contact, email_address, postal_address, gothram, married_status, wedding_date, father_name, mother_name, family_members, note, added_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [d.name, d.contact, d.email_address, d.postal_address, d.gothram, d.married_status, d.wedding_date, d.father_name, d.mother_name, d.family_members, d.note, d.added_by]
        );
        console.log(`✓ Seeded Devotee: ${d.name} (${d.contact})`);
      } else {
        console.log(`- Devotee already exists: ${d.name} (${d.contact})`);
      }
    }

    // 2. Seed Sample Published / Approved Blog Posts for UI/UX testing
    console.log("\n--- 2. Testing Blog Management ---");
    const [superAdmins] = await pool.execute("SELECT id FROM admin_users WHERE role = 'Super Admin' LIMIT 1");
    const authorId = superAdmins.length ? superAdmins[0].id : 1;

    const sampleBlogs = [
      {
        title_ta: "நவீன வாழ்க்கையில் ஆன்மீக சுய-உணர்தல்",
        title_en: "Spiritual Self-Realization in Modern Life",
        slug: "spiritual-self-realization-modern-life",
        category: "Spiritual Wisdom",
        tags: "Varahi, Meditation, Wisdom, Spiritual",
        status: "Published",
        meta_title: "நவீன வாழ்க்கையில் ஆன்மீக சுய-உணர்தல் | Sri jai Varahi Peedam",
        meta_description: "தொழில்முறை வாழ்க்கை மற்றும் ஆழமான தினசரி தியானப் பயிற்சிகளை சமநிலைப்படுத்துவதற்கான நடைமுறை குறிப்புகள்.",
        focus_keyword: "Varahi Peedam, தியானம்",
        snippet_ta: "தொழில்முறை வாழ்க்கை மற்றும் ஆழமான தினசரி தியானப் பயிற்சிகளை சமநிலைப்படுத்துவதற்கான நடைமுறை ஆன்மீக வழிகாட்டி.",
        snippet_en: "Practical insights on balancing modern professional routines with sacred inner spiritual discipline.",
        content_ta: "<p>ஸ்ரீ வாராஹி அம்மனின் வழிபாட்டு முறைகள் பக்தர்களுக்கு மன அமைதியையும், ஆன்மீக பலத்தையும் வழங்குகின்றன. தினசரி தியானம் மற்றும் நாம ஜபம் செய்வதன் மூலம் நமது உள்முக சக்தி விழிப்படைகிறது.</p><p>அனைத்து காரியங்களிலும் வெற்றி பெற வாராஹி அம்மனை சரணடைவது சாலச் சிறந்தது.</p>",
        content_en: "<p>Worship of Sri Varahi Devi bestows devotees with unyielding inner courage, clarity of purpose, and divine spiritual protection.</p>"
      },
      {
        title_ta: "ஸ்ரீ வாராஹி மாலை — பாராயண முறைகளும் பலன்களும்",
        title_en: "Sri Varahi Malai — Sacred Chanting Methods and Benefits",
        slug: "varahi-malai-sacred-chanting-methods",
        category: "Temple Insights",
        tags: "VarahiMalai, Mantra, Pooja, Stotram",
        status: "Published",
        meta_title: "ஸ்ரீ வாராஹி மாலை பாராயண முறை | Jai Varahi Peedam",
        meta_description: "ஸ்ரீ வாராஹி மாலை 32 பாடல்களை பாராயணம் செய்யும் முறைகள், விரத நியதிகள் மற்றும் ஆன்மீக நன்மைகள்.",
        focus_keyword: "Varahi Malai, வாராஹி மாலை",
        snippet_ta: "ஸ்ரீ வாராஹி மாலை பாடல்களை முறைப்படி பாடி வழிபட்டால் எதிரிகள் பயம் நீங்கி வெற்றி உண்டாகும்.",
        snippet_en: "Learn the proper chanting discipline and spiritual benefits of reciting the sacred 32 verses of Varahi Malai.",
        content_ta: "<p>ஸ்ரீ வாராஹி மாலை என்பது பராசக்தியின் அவதாரமான வாராஹி அம்மனை போற்றி இயற்றப்பட்ட திவ்ய மந்திரப் பாடல்களின் தொகுப்பாகும்.</p>",
        content_en: "<p>Sri Varahi Malai is an ancient garland of sacred Tamil verses dedicated to the goddess of protection and truth.</p>"
      }
    ];

    for (const b of sampleBlogs) {
      const [existing] = await pool.execute("SELECT id FROM blogs WHERE slug = ?", [b.slug]);
      if (existing.length === 0) {
        await pool.execute(
          `INSERT INTO blogs (
            title, content, snippet, title_en, title_ta, content_en, content_ta,
            snippet_en, snippet_ta, author_id, status, slug, category, tags,
            meta_title, meta_description, focus_keyword
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            b.title_en,
            b.content_en,
            b.snippet_en,
            b.title_en,
            b.title_ta,
            b.content_en,
            b.content_ta,
            b.snippet_en,
            b.snippet_ta,
            authorId,
            b.status,
            b.slug,
            b.category,
            b.tags,
            b.meta_title,
            b.meta_description,
            b.focus_keyword
          ]
        );
        console.log(`✓ Seeded Blog: ${b.title_ta} [Status: ${b.status}]`);
      } else {
        console.log(`- Blog already exists: ${b.title_ta}`);
      }
    }

    // 3. Verify total counts in DB
    const [devoteeCount] = await pool.execute("SELECT COUNT(*) as cnt FROM devotee_details");
    const [blogCount] = await pool.execute("SELECT COUNT(*) as cnt FROM blogs");
    console.log("\n=================================================");
    console.log(`📊 TOTAL DEVOTEES IN DB: ${devoteeCount[0].cnt}`);
    console.log(`📊 TOTAL BLOGS IN DB: ${blogCount[0].cnt}`);
    console.log("=================================================");
    console.log("✅ SEEDING AND VERIFICATION COMPLETED SUCCESSFULLY!");
    process.exit(0);

  } catch (err) {
    console.error("❌ ERROR DURING POPULATION & TEST:", err);
    process.exit(1);
  }
}

populateAndTestDevoteesAndBlogs();
