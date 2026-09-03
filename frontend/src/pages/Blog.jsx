import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import MobileNav from "../components/common/MobileNav.jsx";
import FloatActions from "../components/common/FloatActions.jsx";
import Footer from "../components/common/Footer.jsx";
import SeoEnhanced from "../components/common/SeoEnhanced.jsx";
import adminApi from "../components/admin/adminApi";
import Preloader from "../components/common/Preloader.jsx";
import BACKEND_URL from "../api/config";

const getBlogCategoryAndTags = (blog, isTamil) => {
  if (!blog) return { category: "", tags: [] };
  const combinedText = [
    blog.title_en,
    blog.title_ta,
    blog.title,
    blog.snippet_en,
    blog.snippet_ta,
    blog.snippet
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let category = isTamil ? "ஆலய குறிப்புகள்" : "Temple Insights";
  let tags = ["#VarahiAmman", "#KottaiVarahi", "#DivineBlessings", "#SpiritualJourney"];

  if (
    combinedText.includes("homam") ||
    combinedText.includes("pooja") ||
    combinedText.includes("பூஜை") ||
    combinedText.includes("ஹோமம்") ||
    combinedText.includes("seva") ||
    combinedText.includes("goseva") ||
    combinedText.includes("சேவை") ||
    combinedText.includes("கோசேவை") ||
    combinedText.includes("அபிஷேகம்") ||
    combinedText.includes("abhishekam")
  ) {
    category = isTamil ? "பூஜை மற்றும் சேவைகள்" : "Pooja & Services";
    tags = ["#VarahiHomam", "#PoojaServices", "#DivineBlessings", "#KottaiVarahi"];
  } else if (
    combinedText.includes("navarathiri") ||
    combinedText.includes("navaratri") ||
    combinedText.includes("festival") ||
    combinedText.includes("விழா") ||
    combinedText.includes("நவராத்திரி") ||
    combinedText.includes("தரிசனம்") ||
    combinedText.includes("dharshanam") ||
    combinedText.includes("panchami") ||
    combinedText.includes("பஞ்சமி") ||
    combinedText.includes("pournami") ||
    combinedText.includes("பௌர்ணமி") ||
    combinedText.includes("உற்சவம்")
  ) {
    category = isTamil ? "விழாக்கள் & நிகழ்வுகள்" : "Festivals & Events";
    tags = ["#Navarathiri", "#VarahiFestivals", "#Festivals", "#DivineBlessings"];
  } else if (
    combinedText.includes("story") ||
    combinedText.includes("stories") ||
    combinedText.includes("experience") ||
    combinedText.includes("miracle") ||
    combinedText.includes("அனுபவம்") ||
    combinedText.includes("கதை") ||
    combinedText.includes("பகிர்வு") ||
    combinedText.includes("சாட்சி") ||
    combinedText.includes("பக்தர்களின் கதைகள்")
  ) {
    category = isTamil ? "பக்தர்களின் கதைகள்" : "Devotee Stories";
    tags = ["#DevoteeStories", "#Miracles", "#VarahiAmman", "#Faith"];
  } else if (
    combinedText.includes("wisdom") ||
    combinedText.includes("teachings") ||
    combinedText.includes("meditation") ||
    combinedText.includes("chanting") ||
    combinedText.includes("mantra") ||
    combinedText.includes("மந்திரம்") ||
    combinedText.includes("தியானம்") ||
    combinedText.includes("தத்துவம்") ||
    combinedText.includes("ஞானம்") ||
    combinedText.includes("உபதேசம்") ||
    combinedText.includes("self-realization") ||
    combinedText.includes("சுய-உணர்தல்")
  ) {
    category = isTamil ? "ஆன்மீக ஞானம்" : "Spiritual Wisdom";
    tags = ["#SpiritualWisdom", "#SpiritualJourney", "#DivineGrace", "#InnerPeace"];
  } else if (
    combinedText.includes("guidelines") ||
    combinedText.includes("rules") ||
    combinedText.includes("management") ||
    combinedText.includes("administration") ||
    combinedText.includes("guide") ||
    combinedText.includes("வழிகாட்டுதல்") ||
    combinedText.includes("விதிகள்") ||
    combinedText.includes("விதிமுறை") ||
    combinedText.includes("நிர்வாகம்") ||
    combinedText.includes("ஆலய") ||
    combinedText.includes("கோயில்")
  ) {
    category = isTamil ? "ஆலய குறிப்புகள்" : "Temple Insights";
    tags = ["#TempleInsights", "#TempleGuidelines", "#VarahiAmman", "#KottaiVarahi"];
  }

  return { category, tags };
};

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeLang, setActiveLang] = useState("en"); // Default to English
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const navItems = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      {
        label: "Ubasana",
        href: "#",
        children: [
          { label: "Varahi Malai", href: "/varahimalai" },
          { label: "Who is varahi ?", href: "/who_is_varahi" },
          { label: "Uchchishta Ganapati", href: "/Uchchishta_Ganapati" },
          { label: "Sri Bala manthiram", href: "/sri_bala_manthiram" }
        ]
      },
      {
        label: "Kosala",
        href: "#",
        children: [
          { label: "Donation", href: "/payment" },
          { label: "Donation Archive", href: "/payment" }
        ]
      },
      {
        label: "Jothidam",
        href: "#",
        children: [
          { label: "Astrology prediction", href: "/Jothidam" },
          { label: "Sri Varahi Jothida Vidyalayam", href: "/comingsoon" }
        ]
      },
      {
        label: "Events",
        href: "#",
        children: [
          { label: "Asta Varahi Dharshanam", href: "/astavarahi" },
          { label: "Asta Varahi 2.0", href: "/astavarahi2" },
          { label: "Ashada Navarathiri", href: "/ashada_navarathiri" }
        ]
      },
      { label: "Blog", href: "/blog" },
      { label: "Latest Updates", href: "/comingsoon" }
    ],
    []
  );

  const monthNames = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ta: ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"]
  };

  const t = {
    en: {
      title: "Varahi Vani",
      subtitle: "Spiritual Wisdom, Divine Insights & Temple Chronicles",
      searchPlaceholder: "Search blogs by title, keywords or content...",
      filterYear: "Filter by Year",
      filterMonth: "Filter by Month",
      allYears: "All Years",
      allMonths: "All Months",
      resetFilters: "Reset Filters",
      by: "Published by :",
      readMore: "Read More",
      emptyState: "No posts published in this language yet.",
      emptyStateSub: "Try switching the language or changing search query / date filters.",
      loading: "Loading spiritual insights...",
      tag: "Spiritual",
      langLabel: "Language / மொழி"
    },
    ta: {
      title: "வாராஹி வாணி",
      subtitle: "ஆன்மீக ஞானம், தெய்வீக நுண்ணறிவு மற்றும் ஆலய குறிப்புகள்",
      searchPlaceholder: "பதிவுகளை தலைப்பு அல்லது விவரம் கொண்டு தேடுக...",
      filterYear: "ஆண்டு வாரியாக",
      filterMonth: "மாத வாரியாக",
      allYears: "அனைத்து ஆண்டுகள்",
      allMonths: "அனைத்து மாதங்கள்",
      resetFilters: "வடிகட்டிகளை நீக்கு",
      by: "எழுதியவர்",
      readMore: "மேலும் படிக்க",
      emptyState: "இந்த மொழியில் இன்னும் பதிவுகள் வெளியிடப்படவில்லை.",
      emptyStateSub: "வடிகட்டிகள் அல்லது தேடல் சொற்களை மாற்றி முயற்சிக்கவும்.",
      loading: "ஆன்மீக பதிவுகள் ஏற்றப்படுகின்றன...",
      tag: "ஆன்மீகம்",
      langLabel: "Language / மொழி"
    }
  };

  const fetchPublishedBlogs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await adminApi.getBlogs({
        year: selectedYear || undefined,
        month: selectedMonth || undefined
      });
      setBlogs(data);
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPublishedBlogs(false);
  }, [selectedYear, selectedMonth]);

  // Real-time SSE updates
  useEffect(() => {
    const streamUrl = `${BACKEND_URL}/api/blogs/stream`;
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.event === "blog_published" ||
          data.event === "blog_deleted" ||
          data.event === "reload"
        ) {
          fetchPublishedBlogs(true);
        }
      } catch (err) {
        console.error("Failed to parse SSE payload:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("SSE stream error", err);
    };

    return () => {
      eventSource.close();
    };
  }, [selectedYear, selectedMonth]);

  // Parse query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search") || "";
    const langParam = params.get("lang") || "";
    const categoryParam = params.get("category") || "";

    if (searchParam) setSearchQuery(searchParam);
    if (langParam && (langParam === "ta" || langParam === "en")) setActiveLang(langParam);
    if (categoryParam) setSelectedCategory(categoryParam);
  }, []);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedMonth, searchQuery, activeLang, selectedCategory]);

  const availableYears = useMemo(() => {
    const years = blogs.map((b) => new Date(b.created_at).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  }, [blogs]);

  // Client-side filtering
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      // 1. Language Filter: Verify content exists in active language
      const blogTitle = activeLang === "ta" ? b.title_ta : b.title_en;
      const blogContent = activeLang === "ta" ? b.content_ta : b.content_en;
      const titleText = blogTitle || b.title;
      const contentText = blogContent || b.content;

      if (!titleText && !contentText) return false;

      // 2. Search Query Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const snippetVal = activeLang === "ta" ? b.snippet_ta : b.snippet_en;
        const snippetText = snippetVal || b.snippet || "";

        const titleMatch = titleText.toLowerCase().includes(query);
        const snippetMatch = snippetText.toLowerCase().includes(query);
        const contentMatch = contentText.toLowerCase().includes(query);
        const authorMatch = (b.author_name || "Pallur Varahi Dhasan").toLowerCase().includes(query);
        if (!titleMatch && !snippetMatch && !contentMatch && !authorMatch) {
          return false;
        }
      }

      // 3. Category Filter
      if (selectedCategory) {
        let bCategory = b.category;
        let bResolvedCategory = "";
        if (bCategory) {
          if (activeLang === "ta") {
            if (bCategory === "Temple Insights") bResolvedCategory = "ஆலய குறிப்புகள்";
            else if (bCategory === "Pooja & Services") bResolvedCategory = "பூஜை மற்றும் சேவைகள்";
            else if (bCategory === "Festivals & Events") bResolvedCategory = "விழாக்கள் & நிகழ்வுகள்";
            else if (bCategory === "Spiritual Wisdom") bResolvedCategory = "ஆன்மீக ஞானம்";
            else if (bCategory === "Devotee Stories") bResolvedCategory = "பக்தர்களின் கதைகள்";
            else bResolvedCategory = bCategory;
          } else {
            bResolvedCategory = bCategory;
          }
        } else {
          bResolvedCategory = getBlogCategoryAndTags(b, activeLang === "ta").category;
        }

        if (bResolvedCategory !== selectedCategory) {
          return false;
        }
      }

      return true;
    });
  }, [blogs, activeLang, searchQuery, selectedCategory]);

  // Paginated blogs slice
  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);
  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredBlogs.slice(startIndex, startIndex + postsPerPage);
  }, [filteredBlogs, currentPage]);

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
    setActiveMobileDropdown(null);
  };

  return (
    <>
      <SeoEnhanced
        title={`${t[activeLang].title} - Spiritual Wisdom & Temple Insights | Jai Varahi Peedam`}
        description={activeLang === "ta" ? "ஸ்ரீ கோட்டை வாராஹி அம்மன் ஆன்மீக பதிவுகள், பூஜைகள், விரத முறைகள், பரிகாரங்கள் மற்றும் பக்தி செய்திகள். பல்லூர் வாராஹி தாசன் ஆசிகள்." : "Official spiritual articles, pooja procedures, vratam rules, homam benefits, and temple insights from Sri Kottai Varahi Amman Temple, Jai Varahi Peedam."}
        keywords="Varahi Amman, Sri Kottai Varahi, Jai Varahi Peedam, Varahi Pooja Benefits, Panchami Pooja, Varahi Homam, Spiritual Wisdom, Tamil Hindu Rituals, வாராஹி அம்மன், பஞ்சமி விரதம், வாராஹி மாலை, பல்லூர் வாராஹி தாசன், ஆன்மீக தகவல்கள்"
        canonical="https://www.jaivarahi.org/blog"
        ogTitle="Varahi Vani - Spiritual Blog | Jai Varahi Peedam"
        ogDescription="Spiritual articles, pooja procedures, vratam rules, and divine insights from Sri Kottai Varahi Amman Temple."
        ogImage="https://www.jaivarahi.org/assets/img/images_new/VARAHI%20LOGO.svg"
        ogUrl="https://www.jaivarahi.org/blog"
      />

      <Preloader autoHide />
      <Navbar items={navItems} onOpenMobile={() => setIsMobileOpen(true)} isMobileOpen={isMobileOpen} />
      <MobileNav
        items={navItems}
        isOpen={isMobileOpen}
        activeDropdown={activeMobileDropdown}
        onClose={closeMobileMenu}
        onToggleDropdown={(label) => setActiveMobileDropdown((curr) => (curr === label ? null : label))}
      />
      <div
        className={`mobile-nav-overlay${isMobileOpen ? " active" : ""}`}
        onClick={closeMobileMenu}
        role="presentation"
      />

      <main className="blog-page">
        <div className="blog-container">
          {/* Header */}
          <div className="blog-header">
            <h1>{t[activeLang].title}</h1>
            <p>{t[activeLang].subtitle}</p>
            <div className="blog-header-line" />
            
            {/* Language Switcher Bar */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "15px" }}>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)" }}>{t[activeLang].langLabel}:</span>
              <button 
                onClick={() => setActiveLang("ta")}
                className={`blog-lang-btn${activeLang === "ta" ? " active" : ""}`}
              >
                தமிழ்
              </button>
              <button 
                onClick={() => setActiveLang("en")}
                className={`blog-lang-btn${activeLang === "en" ? " active" : ""}`}
              >
                English
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px", padding: "0 10px" }}>
            <input
              type="text"
              placeholder={t[activeLang].searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="blog-search-input"
            />
          </div>

          {/* Filtering Section */}
          <div className="blog-filters">
            <div className="blog-filter-group">
              <label className="blog-filter-label">{t[activeLang].filterYear}</label>
              <select
                className="blog-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">{t[activeLang].allYears}</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            <div className="blog-filter-group">
              <label className="blog-filter-label">{t[activeLang].filterMonth}</label>
              <select
                className="blog-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">{t[activeLang].allMonths}</option>
                {monthNames[activeLang].map((mName, idx) => (
                  <option key={idx + 1} value={idx + 1}>{mName}</option>
                ))}
              </select>
            </div>
            
            {(selectedYear || selectedMonth || searchQuery || selectedCategory) && (
              <button
                className="blog-reset-btn"
                onClick={() => {
                  setSelectedYear("");
                  setSelectedMonth("");
                  setSearchQuery("");
                  setSelectedCategory("");
                  window.history.pushState({}, "", window.location.pathname);
                }}
              >
                {t[activeLang].resetFilters}
              </button>
            )}
          </div>

          {/* Blogs Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--primary-color)" }}>{t[activeLang].loading}</div>
          ) : filteredBlogs.length === 0 ? (
            <div className="blog-empty-state">
              <p>{t[activeLang].emptyState}</p>
              <span>{t[activeLang].emptyStateSub}</span>
            </div>
          ) : (
            <>
              <div className="blog-grid">
                {paginatedBlogs.map((b) => {
                  const currentTitle = (activeLang === "ta" ? b.title_ta : b.title_en) || b.title;
                  const currentSnippet = (activeLang === "ta" ? b.snippet_ta : b.snippet_en) || b.snippet || (
                    (activeLang === "ta" ? b.content_ta : b.content_en) || b.content ? 
                    ((activeLang === "ta" ? b.content_ta : b.content_en) || b.content).replace(/<[^>]*>/g, "").slice(0, 150) + "..." : ""
                  );

                  return (
                    <article key={b.id} className="blog-card">
                      {/* Thumbnail */}
                      <div className="blog-card-img-wrap" style={{ position: "relative", height: "200px" }}>
                        <div className="blog-card-placeholder" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          Jai Varahi
                        </div>
                        {b.thumbnail_url && (
                          <img
                            src={b.thumbnail_url}
                            alt={currentTitle}
                            className="blog-card-img"
                            loading="lazy"
                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <span className="blog-card-tag" style={{ zIndex: 2 }}>
                          {(() => {
                            let bCategory = b.category;
                            if (bCategory) {
                              if (activeLang === "ta") {
                                if (bCategory === "Temple Insights") return "ஆலய குறிப்புகள்";
                                if (bCategory === "Pooja & Services") return "பூஜை மற்றும் சேவைகள்";
                                if (bCategory === "Festivals & Events") return "விழாக்கள் & நிகழ்வுகள்";
                                if (bCategory === "Spiritual Wisdom") return "ஆன்மீக ஞானம்";
                                if (bCategory === "Devotee Stories") return "பக்தர்களின் கதைகள்";
                              }
                              return bCategory;
                            }
                            return getBlogCategoryAndTags(b, activeLang === "ta").category;
                          })()}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className="blog-card-content">
                        <div className="blog-card-meta">
                          <span>{t[activeLang].by} <strong>{activeLang === "ta" ? "ஸ்வாமி பல்லூர் வாராஹிதாசன்" : "Swamy Pallur Varahidhasan (Founder)"}</strong></span>
                          <span>{new Date(b.created_at).toLocaleDateString(activeLang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>

                        <h2 className="blog-card-title">
                          {currentTitle}
                        </h2>

                        <p className="blog-card-snippet">
                          {currentSnippet}
                        </p>

                        <Link to={`/blog/${b.slug || b.id}?lang=${activeLang}`} className="blog-card-btn">
                          {t[activeLang].readMore}
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Grid Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "40px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--background-medium)",
                      background: "#fff",
                      color: currentPage === 1 ? "var(--text-muted)" : "var(--primary-color)",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      transition: "all 0.2s"
                    }}
                  >
                    {activeLang === "ta" ? "முந்தைய" : "Previous"}
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "8px",
                        border: currentPage === pg ? "1px solid var(--primary-color)" : "1px solid var(--background-medium)",
                        background: currentPage === pg ? "var(--primary-color)" : "#fff",
                        color: currentPage === pg ? "#fff" : "var(--text-color)",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.2s"
                      }}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--background-medium)",
                      background: "#fff",
                      color: currentPage === totalPages ? "var(--text-muted)" : "var(--primary-color)",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      transition: "all 0.2s"
                    }}
                  >
                    {activeLang === "ta" ? "அடுத்தது" : "Next"}
                  </button>
                </div>
              )}
              {/* ─── TEMPLE ENGAGEMENT & SEVA CTAS ─── */}
              <div style={{ margin: "60px 0 20px", padding: "32px 24px", background: "linear-gradient(135deg, #fdfaf4 0%, #f7f1e6 100%)", borderRadius: "16px", border: "1px solid #ebdcc5", boxShadow: "0 4px 20px rgba(100,50,20,0.06)" }}>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <span style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px", color: "var(--primary-color, #7a0c0c)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    🔱 {activeLang === "ta" ? "ஆன்மீக சேவைகள் & திருப்பணிகள்" : "Divine Seva & Temple Services"}
                  </span>
                  <h3 style={{ fontFamily: "'Georgia', serif", fontSize: "1.45rem", color: "#361c10", margin: "6px 0 0" }}>
                    {activeLang === "ta" ? "வாராஹி அம்மனின் பரிபூரண அருளைப் பெறுங்கள்" : "Connect with Goddess Varahi's Divine Grace"}
                  </h3>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px" }}>
                  {/* 1. Services & Homam CTA */}
                  <div style={{ background: "#ffffff", padding: "22px 20px", borderRadius: "12px", border: "1px solid #e3d5c1", display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "center" }}>
                    <div>
                      <div style={{ fontSize: "30px", marginBottom: "10px" }}>🪔</div>
                      <h4 style={{ fontFamily: "'Georgia', serif", fontSize: "16px", margin: "0 0 6px", color: "#7a0c0c", fontWeight: "700" }}>
                        {activeLang === "ta" ? "பூஜை & ஹோமங்கள்" : "Temple Services"}
                      </h4>
                      <p style={{ fontSize: "13px", color: "#6e5d53", lineHeight: "1.5", margin: "0 0 16px" }}>
                        {activeLang === "ta" ? "உங்கள் தோஷ நிவர்த்தி மற்றும் காரிய சித்திக்காக விசேஷ ஹோமங்கள் முன்பதிவு செய்யுங்கள்." : "Book special Homams, Abishekam, and Parihara rituals at the sanctum."}
                      </p>
                    </div>
                    <Link to="/services" style={{ display: "inline-block", background: "#7a0c0c", color: "#ffffff", padding: "10px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", textDecoration: "none", boxShadow: "0 3px 10px rgba(122,12,12,0.2)" }}>
                      {activeLang === "ta" ? "சேவைகள் காண்க →" : "Book Services →"}
                    </Link>
                  </div>

                  {/* 2. Donations CTA */}
                  <div style={{ background: "#ffffff", padding: "22px 20px", borderRadius: "12px", border: "1px solid #e3d5c1", display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "center" }}>
                    <div>
                      <div style={{ fontSize: "30px", marginBottom: "10px" }}>🙏</div>
                      <h4 style={{ fontFamily: "'Georgia', serif", fontSize: "16px", margin: "0 0 6px", color: "#7a0c0c", fontWeight: "700" }}>
                        {activeLang === "ta" ? "அன்னதானம் & நன்கொடை" : "Temple Donation"}
                      </h4>
                      <p style={{ fontSize: "13px", color: "#6e5d53", lineHeight: "1.5", margin: "0 0 16px" }}>
                        {activeLang === "ta" ? "நித்ய அன்னதானம் மற்றும் கோசாலை திருப்பணிக்கு உங்கள் காணிக்கையை செலுத்துங்கள் (80G)." : "Contribute to daily Annadhanam and Kosala maintenance with 80G tax benefits."}
                      </p>
                    </div>
                    <Link to="/payment" style={{ display: "inline-block", background: "linear-gradient(135deg, #b8860b 0%, #d4af37 100%)", color: "#ffffff", padding: "10px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", textDecoration: "none", boxShadow: "0 3px 10px rgba(184,134,11,0.2)" }}>
                      {activeLang === "ta" ? "நன்கொடை அளிக்க →" : "Donate Online →"}
                    </Link>
                  </div>

                  {/* 3. Devotee Registration CTA */}
                  <div style={{ background: "#ffffff", padding: "22px 20px", borderRadius: "12px", border: "1px solid #e3d5c1", display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "center" }}>
                    <div>
                      <div style={{ fontSize: "30px", marginBottom: "10px" }}>✍️</div>
                      <h4 style={{ fontFamily: "'Georgia', serif", fontSize: "16px", margin: "0 0 6px", color: "#7a0c0c", fontWeight: "700" }}>
                        {activeLang === "ta" ? "பக்தர் சங்கல்ப பதிவு" : "Devotee Registration"}
                      </h4>
                      <p style={{ fontSize: "13px", color: "#6e5d53", lineHeight: "1.5", margin: "0 0 16px" }}>
                        {activeLang === "ta" ? "உங்கள் குடும்ப நட்சத்திரம், ராசி விவரங்களை நித்ய பூஜை சங்கல்பத்தில் இணைக்கவும்." : "Register your family Nakshatram and Rasi details for nithya pooja sankalpam."}
                      </p>
                    </div>
                    <Link to="/devoteesdetails" style={{ display: "inline-block", background: "#361c10", color: "#ffffff", padding: "10px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", textDecoration: "none", boxShadow: "0 3px 10px rgba(54,28,16,0.2)" }}>
                      {activeLang === "ta" ? "இலவச பதிவு →" : "Register Free →"}
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <FloatActions />
      <Footer />
    </>
  );
};

export default Blog;
