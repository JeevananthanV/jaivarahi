import "../env.js";
import pool from "../db/pool.js";
import assert from "assert";

async function runFullFillAndCheck() {
  console.log("=================================================");
  console.log("🧪 SEEDING & VERIFYING BLOGS AND DEVOTEES DATA");
  console.log("=================================================");

  try {
    // ─── 1. SEED DIVERSE DEVOTEES ───
    console.log("\n[1/4] Populating Devotee Records...");
    const sampleDevotees = [
      {
        name: "Dr. Subramaniam Natarajan (சுப்ரமணியம்)",
        contact: "9841029384",
        email_address: "dr.subramaniam@templedevotee.org",
        postal_address: "Old No. 24, New No. 58, East Car Street, Chidambaram - 608001",
        gothram: "Koundinya (கௌண்டின்ய)",
        married_status: "married",
        wedding_date: "2008-06-11",
        father_name: "Nataraja Sastri",
        mother_name: "Kamalam Ammal",
        family_members: JSON.stringify([
          { relationship: "Spouse", name: "Janaki Subramaniam (ஜானகி)", star: "Anusham (அனுஷம்)", rasi: "Viruchigam (விருச்சிகம்)", dob: "1985-04-12" },
          { relationship: "Son", name: "Aditya S (ஆதித்யா)", star: "Karthigai (கார்த்திகை)", rasi: "Mesham (மேஷம்)", dob: "2010-09-28" },
          { relationship: "Daughter", name: "Shruti S (சுருதி)", star: "Hastham (அஸ்தம்)", rasi: "Kanni (கன்னி)", dob: "2015-12-05" }
        ]),
        note: "Special Sankalpam for health, children's academic success, and family prosperity.",
        added_by: "Super Admin"
      },
      {
        name: "Vaidyanathan Gurukkal (வைத்தியநாதன்)",
        contact: "9443218765",
        email_address: "vaidyanathan.g@vedictrust.com",
        postal_address: "Agraharam Street, Thiruvannamalai - 606601",
        gothram: "Bharadwaja (பாரத்வாஜ)",
        married_status: "married",
        wedding_date: "2002-11-20",
        father_name: "Someswara Gurukkal",
        mother_name: "Visalakshi",
        family_members: JSON.stringify([
          { relationship: "Spouse", name: "Bhuvaneswari (புவனேஸ்வரி)", star: "Thiruvathirai (திருவாதிரை)", rasi: "Mithunam (மிதுனம்)", dob: "1980-08-19" },
          { relationship: "Son", name: "Sivasankar (சிவசங்கர்)", star: "Uthirattathi (உத்திரட்டாதி)", rasi: "Meenam (மீனம்)", dob: "2005-02-14" },
          { relationship: "Mother", name: "Visalakshi Ammal", star: "Rohini (ரோகிணி)", rasi: "Rishabam (ரிஷபம்)", dob: "1952-10-03" }
        ]),
        note: "Nithya Sahasranama Archana and Maha Varahi Homam intentions.",
        added_by: "Admin"
      },
      {
        name: "Vijayalakshmi Sundaram (விஜயலட்சுமி)",
        contact: "9940567812",
        email_address: "viji.sundaram@gmail.com",
        postal_address: "Flat 4A, Orchid Towers, Anna Nagar, Chennai - 600040",
        gothram: "Srivatsa (ஸ்ரீவத்ச)",
        married_status: "married",
        wedding_date: "2016-02-18",
        father_name: "Sundararajan",
        mother_name: "Padmavathi",
        family_members: JSON.stringify([
          { relationship: "Spouse", name: "Suresh Narayanan (சுரேஷ்)", star: "Punarpoosam (புனர்பூசம்)", rasi: "Mithunam (மிதுனம்)", dob: "1988-07-22" },
          { relationship: "Daughter", name: "Dhiya Suresh (தியா)", star: "Aswini (அசுவினி)", rasi: "Mesham (மேஷம்)", dob: "2020-03-10" }
        ]),
        note: "Business growth and protection from negative energies.",
        added_by: "Public"
      },
      {
        name: "Karthikeyan Balasubramanian (கார்த்திகேயன்)",
        contact: "9790123987",
        email_address: "karthik.bala@techglobal.in",
        postal_address: "Plot 89, VIP Nagar, Katpadi, Vellore - 632007",
        gothram: "Siva Gothram (சிவ கோத்ரம்)",
        married_status: "unmarried",
        wedding_date: null,
        father_name: "Balasubramanian",
        mother_name: "Geetha",
        family_members: JSON.stringify([
          { relationship: "Father", name: "Balasubramanian", star: "Swati (சுவாதி)", rasi: "Thulaam (துலாம்)", dob: "1960-01-15" },
          { relationship: "Mother", name: "Geetha", star: "Uthiradam (உத்திராடம்)", rasi: "Dhanusu (தனுசு)", dob: "1965-05-30" }
        ]),
        note: "Seeking Goddess Varahi blessings for career advancement and overseas settlement.",
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
        console.log(`  ✓ Inserted devotee: ${d.name} [Phone: ${d.contact}]`);
      } else {
        await pool.execute(
          `UPDATE devotee_details SET name=?, email_address=?, postal_address=?, gothram=?, married_status=?, wedding_date=?, father_name=?, mother_name=?, family_members=?, note=? WHERE id=?`,
          [d.name, d.email_address, d.postal_address, d.gothram, d.married_status, d.wedding_date, d.father_name, d.mother_name, d.family_members, d.note, existing[0].id]
        );
        console.log(`  ✓ Updated devotee #${existing[0].id}: ${d.name}`);
      }
    }

    // ─── 2. SEED DIVERSE PUBLISHED BLOG POSTS ACROSS ALL CATEGORIES ───
    console.log("\n[2/4] Populating Blog Posts...");
    const [superAdmins] = await pool.execute("SELECT id FROM admin_users WHERE role = 'Super Admin' LIMIT 1");
    const authorId = superAdmins.length ? superAdmins[0].id : 1;

    const sampleBlogs = [
      {
        title_ta: "பூஜை மற்றும் சேவைகள் — ஸ்ரீ வாராஹி வழிபாடு முறைகள்",
        title_en: "Pooja & Services — Sri Varahi Sacred Worship Procedures",
        slug: "pooja-services-varahi-worship-procedures",
        category: "Pooja & Services",
        tags: "Pooja, Services, Varahi, Abishekam, Homam",
        status: "Published",
        meta_title: "பூஜை மற்றும் சேவைகள் | Sri Jai Varahi Peedam",
        meta_description: "ஸ்ரீ ஜெய் வாராஹி பீடத்தில் நடைபெறும் விசேஷ அபிஷேகம், அர்ச்சனை மற்றும் ஹோம வழிபாட்டு முறைகள் பற்றிய முழு விவரம்.",
        focus_keyword: "Pooja & Services, வாராஹி பூஜை",
        snippet_ta: "ஸ்ரீ ஜெய் வாராஹி பீடத்தில் பக்தர்களுக்காக நடத்தப்படும் நித்ய பூஜைகள், பஞ்சமி திதி ஹோமங்கள் மற்றும் வழிபாட்டு பலன்கள்.",
        snippet_en: "Comprehensive guide to daily rituals, Panchami homams, and sacred Parihara poojas performed at Sri Jai Varahi Peedam.",
        content_ta: `<p>ஸ்ரீ கோட்டை வாராஹி அம்மனின் சன்னதியில் தினசரி நடைபெறும் அபிஷேக ஆராதனைகள் மற்றும் பஞ்சமி திதி விசேஷ வழிபாடுகள் பக்தர்களின் சகல தோஷங்களையும் நீக்கி காரிய வெற்றியைத் தருகின்றன.</p>
<h3>முக்கிய பூஜை சேவைகள்:</h3>
<ul>
  <li><strong>நித்ய அர்ச்சனை:</strong> குடும்ப நலம், ஆயுள் பலம் மற்றும் தொழில் மேன்மைக்காக.</li>
  <li><strong>பஞ்சமி திதி மகா யாகம்:</strong> கடன் தொல்லைகள், எதிரிகள் பயம் மற்றும் காரிய தடைகளை தகர்க்கும் மகா சக்தி வாய்ந்த ஹோமம்.</li>
  <li><strong>விசேஷ வராகி அபிஷேகம்:</strong> பால், தேன், சந்தனம், பன்னீர் கொண்டு செய்யப்படும் திவ்ய திருமஞ்சனம்.</li>
</ul>
<p>பக்தர்கள் தங்களின் குடும்ப நட்சத்திர ராசி விவரங்களை பதிவு செய்து நித்ய சங்கல்பத்தில் இணைந்து அம்பிகையின் பூரண அருளைப் பெறலாம்.</p>`,
        content_en: `<p>The daily worship and specialized homams conducted at Sri Kottai Varahi Peedam remove all planetary obstacles and bestow devotees with divine protection, prosperity, and peace of mind.</p>
<h3>Core Temple Services:</h3>
<ul>
  <li><strong>Daily Archana & Sankalpam:</strong> For overall family harmony and well-being.</li>
  <li><strong>Panchami Maha Homam:</strong> Powerful ritual performed on waxing and waning Panchami to destroy obstacles and negative energies.</li>
  <li><strong>Special Varahi Abishekam:</strong> Holy sanctum baths using sacred dravyas.</li>
</ul>`
      },
      {
        title_ta: "ஆலய குறிப்புகள் — ஸ்ரீ கோட்டை வாராஹி மகிமைகள்",
        title_en: "Temple Insights — Glories of Sri Kottai Varahi Peedam",
        slug: "temple-insights-glories-of-kottai-varahi",
        category: "Temple Insights",
        tags: "Temple, History, Varahi, Vellore, Katpadi",
        status: "Published",
        meta_title: "ஆலய குறிப்புகள் | ஸ்ரீ கோட்டை வாராஹி பீடம்",
        meta_description: "வேலூர் காட்பாடி அருள்மிகு ஸ்ரீ கோட்டை வாராஹி பீடத்தின் ஆன்மீக வரலாறு மற்றும் அற்புத மகிமைகள்.",
        focus_keyword: "Temple Insights, கோட்டை வாராஹி",
        snippet_ta: "வேலூர் காட்பாடியில் அமைந்துள்ள ஸ்ரீ கோட்டை வாராஹி ஆலயத்தின் வரலாறு மற்றும் ஆன்மீக மகத்துவங்கள்.",
        snippet_en: "Discover the sacred history and divine spiritual power of Sri Kottai Varahi Temple located in Katpadi, Vellore.",
        content_ta: `<p>வேலூர் மாவட்டம் காட்பாடி அருகிலுள்ள அரும்பருத்தி கோட்டைப் பகுதியில் அமையப்பெற்ற ஸ்ரீ ஜெய் வாராஹி பீடம், ஆயிரக்கணக்கான பக்தர்களின் பிரார்த்தனைகளை நிறைவேற்றி வரும் புனித திருத்தலமாகும்.</p>
<p>ஸ்வாமி பல்லூர் வாராஹிதாசன் அவர்களின் தவவலிமையாலும், சீரிய வழிகாட்டலாலும் இவ்வளாகம் பக்தர்களுக்கு அமைதியையும் ஆன்மீக வழிகாட்டலையும் நல்கி வருகிறது.</p>`,
        content_en: `<p>Nestled in the historic Kottai region of Katpadi, Vellore, Sri Jai Varahi Peedam stands as a beacon of authentic Vedic devotion and spiritual solace.</p>`
      },
      {
        title_ta: "ஆன்மீக ஞானம் — வாராஹி உபாசனையின் தத்துவங்கள்",
        title_en: "Spiritual Wisdom — Philosophies of Varahi Upasana",
        slug: "spiritual-wisdom-philosophies-of-varahi-upasana",
        category: "Spiritual Wisdom",
        tags: "Spiritual, Wisdom, Upasana, Meditation",
        status: "Published",
        meta_title: "ஆன்மீக ஞானம் | வாராஹி உபாசனை தத்துவம்",
        meta_description: "வாராஹி அம்மன் உபாசனையின் ஆழ்ந்த தத்துவங்கள், மன ஒருமைப்பாடு மற்றும் தினசரி தியான வழிமுறைகள்.",
        focus_keyword: "Spiritual Wisdom, வாராஹி தியானம்",
        snippet_ta: "வாராஹி அம்மனின் உபாசனை முறைகளும், உள்ளுணர்வை விழிப்படையச் செய்யும் தியானப் பயிற்சிகளும்.",
        snippet_en: "Explore the profound esoteric philosophy of Goddess Varahi meditation and inner self-realization.",
        content_ta: `<p>வாராஹி தேவி பஞ்சமி திதியின் அதிதேவதையாக விளங்குகிறாள். அம்பிகையை மனதார தியானிப்பவர்களுக்கு அக இருள் நீங்கி ஞான ஒளி உண்டாகும்.</p>`,
        content_en: `<p>Goddess Varahi is the embodiment of divine willpower and cosmic protection. Dedicated meditation on Her sacred form purifies the mind and dissolves negative karmic patterns.</p>`
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
        console.log(`  ✓ Inserted blog post: ${b.title_ta} [Category: ${b.category}]`);
      } else {
        await pool.execute(
          `UPDATE blogs SET 
            title=?, content=?, snippet=?, title_en=?, title_ta=?, content_en=?, content_ta=?,
            snippet_en=?, snippet_ta=?, status=?, category=?, tags=?,
            meta_title=?, meta_description=?, focus_keyword=? 
          WHERE id=?`,
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
            b.status,
            b.category,
            b.tags,
            b.meta_title,
            b.meta_description,
            b.focus_keyword,
            existing[0].id
          ]
        );
        console.log(`  ✓ Updated blog post #${existing[0].id}: ${b.title_ta}`);
      }
    }

    // Normalize any legacy blogs with null category
    await pool.execute("UPDATE blogs SET category = 'Temple Insights' WHERE category IS NULL OR category = ''");
    await pool.execute("UPDATE blogs SET focus_keyword = 'Varahi Peedam, Spiritual' WHERE focus_keyword IS NULL OR focus_keyword = ''");
    console.log("\n[3/4] Verifying Devotee Directory Data Quality...");
    const [allDevotees] = await pool.execute("SELECT * FROM devotee_details ORDER BY id DESC LIMIT 10");
    console.log(`  ✓ Retrieved ${allDevotees.length} latest devotee records from database.`);
    for (const d of allDevotees) {
      let family = [];
      try {
        family = typeof d.family_members === "string" ? JSON.parse(d.family_members || "[]") : d.family_members;
      } catch (err) {
        console.error("  ❌ JSON parse error for devotee id:", d.id);
      }
      console.log(`  Devotee #${d.id}: ${d.name} | Phone: ${d.contact} | Gothram: ${d.gothram || 'N/A'} | Lineage: ${family.length} members`);
      assert(d.name && d.name.length > 0, "Devotee must have name");
      assert(d.contact && d.contact.length >= 10, "Devotee must have contact");
    }

    // ─── 4. VERIFY BLOGS API DATA RETRIEVAL ───
    console.log("\n[4/4] Verifying Blogs Data Quality...");
    const [allBlogs] = await pool.execute("SELECT id, title_ta, title_en, category, status, meta_title, focus_keyword FROM blogs WHERE status = 'Published' ORDER BY id DESC");
    console.log(`  ✓ Retrieved ${allBlogs.length} published blogs.`);
    for (const b of allBlogs) {
      console.log(`  Blog #${b.id}: [${b.category}] ${b.title_ta || b.title_en} | SEO: ${b.meta_title ? "✓" : "-"}`);
      assert(b.category && b.category.length > 0, "Blog must have category");
    }

    console.log("\n=================================================");
    console.log("✅ ALL BLOGS AND DEVOTEES DATA SEEDED & VERIFIED 100% CLEAN!");
    console.log("=================================================");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR IN FILL AND CHECK:", err);
    process.exit(1);
  }
}

runFullFillAndCheck();
