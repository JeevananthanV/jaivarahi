import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import MobileNav from "../components/common/MobileNav.jsx";
import FloatActions from "../components/common/FloatActions.jsx";
import Footer from "../components/common/Footer.jsx";
import SeoEnhanced from "../components/common/SeoEnhanced.jsx";
import adminApi from "../components/admin/adminApi";
import Preloader from "../components/common/Preloader.jsx";
import DOMPurify from "dompurify";

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

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);

  // Reader experience states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSize, setFontSize] = useState(17);
  const [copied, setCopied] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterInput, setNewsletterInput] = useState("");

  // Redesign sidebar & related posts states
  const [searchVal, setSearchVal] = useState("");
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);

  const queryParams = new URLSearchParams(window.location.search);
  const activeLang = queryParams.get("lang") || "ta";
  const isTamil = activeLang === "ta";

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterInput.trim()) {
      setNewsletterSubscribed(true);
    }
  };

  const handleSearch = () => {
    if (searchVal.trim()) {
      window.location.href = `/blog?search=${encodeURIComponent(searchVal)}&lang=${activeLang}`;
    }
  };

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

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getBlogById(id);
        setBlog(data);
      } catch (err) {
        console.error("Failed to load blog post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogDetails();
  }, [id]);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const data = await adminApi.getBlogs();
        setAllBlogs(data);
        const filtered = data.filter(b => b.id !== parseInt(id)).slice(0, 3);
        setRecentBlogs(filtered);
      } catch (err) {
        console.error("Failed to fetch sidebar data:", err);
      }
    };
    fetchSidebarData();
  }, [id]);

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
    setActiveMobileDropdown(null);
  };

  // Structured Data Schema for SEO / AEO / GEO
  const schemaMarkup = useMemo(() => {
    if (!blog) return null;
    const currentTitle = (activeLang === "ta" ? blog.title_ta : blog.title_en) || blog.title;
    const currentSnippet = (activeLang === "ta" ? blog.snippet_ta : blog.snippet_en) || blog.snippet;
    const effectiveTitle = blog.meta_title?.trim() || currentTitle;
    const effectiveDescription = blog.meta_description?.trim() || currentSnippet || currentTitle;
    const canonicalUrl = `https://www.jaivarahi.org/blog/${blog.slug || blog.id}`;
    const rawImageUrl = blog.thumbnail_url || "https://www.jaivarahi.org/assets/img/og-image.jpg";
    const imageUrl = rawImageUrl.startsWith("http") ? rawImageUrl : `https://www.jaivarahi.org${rawImageUrl}`;

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": activeLang === "ta" ? "முகப்பு" : "Home",
              "item": "https://www.jaivarahi.org"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": activeLang === "ta" ? "வாராஹி வாணி" : "Blog",
              "item": `https://www.jaivarahi.org/blog?lang=${activeLang}`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": effectiveTitle,
              "item": canonicalUrl
            }
          ]
        },
        {
          "@type": "BlogPosting",
          "@id": `${canonicalUrl}#article`,
          "isPartOf": {
            "@type": "WebPage",
            "@id": canonicalUrl
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          },
          "headline": effectiveTitle,
          "description": effectiveDescription,
          "image": [imageUrl],
          "author": {
            "@type": "Person",
            "name": "Swamy Pallur Varahidhasan",
            "jobTitle": "Founder & Spiritual Head",
            "url": "https://www.jaivarahi.org/about"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Jai Varahi Peedam Charitable Trust",
            "url": "https://www.jaivarahi.org",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.jaivarahi.org/assets/img/logo.png",
              "width": 180,
              "height": 60
            }
          },
          "datePublished": new Date(blog.created_at).toISOString(),
          "dateModified": new Date(blog.updated_at || blog.created_at).toISOString(),
          "inLanguage": activeLang === "ta" ? "ta-IN" : "en-US"
        }
      ]
    };
  }, [blog, activeLang]);

  const currentTitle = blog ? ((activeLang === "ta" ? blog.title_ta : blog.title_en) || blog.title) : "";
  const currentContent = blog ? ((activeLang === "ta" ? blog.content_ta : blog.content_en) || blog.content) : "";
  const currentSnippet = blog ? ((activeLang === "ta" ? blog.snippet_ta : blog.snippet_en) || blog.snippet) : "";

  let gallery = [];
  try {
    if (blog && blog.gallery_urls) {
      gallery = typeof blog.gallery_urls === "string" ? JSON.parse(blog.gallery_urls) : blog.gallery_urls;
    }
  } catch (e) {
    console.error("Failed to parse gallery_urls", e);
  }

  // Dynamically compute category and tags (reading from DB first, falling back to dynamic mapping helper)
  const { category, tags } = useMemo(() => {
    if (!blog) return { category: "", tags: [] };

    let dbCategory = blog.category;
    let dbTags = blog.tags;

    let resolvedCategory = "";
    if (dbCategory) {
      if (isTamil) {
        if (dbCategory === "Temple Insights") resolvedCategory = "ஆலய குறிப்புகள்";
        else if (dbCategory === "Pooja & Services") resolvedCategory = "பூஜை மற்றும் சேவைகள்";
        else if (dbCategory === "Festivals & Events") resolvedCategory = "விழாக்கள் & நிகழ்வுகள்";
        else if (dbCategory === "Spiritual Wisdom") resolvedCategory = "ஆன்மீக ஞானம்";
        else if (dbCategory === "Devotee Stories") resolvedCategory = "பக்தர்களின் கதைகள்";
        else resolvedCategory = dbCategory;
      } else {
        resolvedCategory = dbCategory;
      }
    }

    let resolvedTags = [];
    if (dbTags) {
      resolvedTags = dbTags.split(",").map(t => t.trim()).filter(t => t.length > 0);
    }

    if (!dbCategory || !dbTags) {
      const fallback = getBlogCategoryAndTags(blog, isTamil);
      if (!dbCategory) resolvedCategory = fallback.category;
      if (!dbTags) resolvedTags = fallback.tags;
    }

    return { category: resolvedCategory, tags: resolvedTags };
  }, [blog, isTamil]);

  // Dynamically compute related posts based on category and exclude current post
  const relatedBlogs = useMemo(() => {
    if (!blog || !allBlogs || allBlogs.length === 0) return [];
    const currentId = parseInt(id);
    const filtered = allBlogs.filter((b) => b.id !== currentId);
    
    // Annotate with categories
    const annotated = filtered.map((b) => {
      let bCategory = b.category;
      let bResolvedCategory = "";
      if (bCategory) {
        if (isTamil) {
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
        bResolvedCategory = getBlogCategoryAndTags(b, isTamil).category;
      }
      return {
        ...b,
        resolvedCategory: bResolvedCategory
      };
    });

    // Group into same category first
    const sameCat = annotated.filter((b) => b.resolvedCategory === category);
    const diffCat = annotated.filter((b) => b.resolvedCategory !== category);

    return [...sameCat, ...diffCat].slice(0, 3);
  }, [blog, allBlogs, id, category, isTamil]);

  return (
    <>
      {blog && (
        <SeoEnhanced
          title={blog.meta_title?.trim() || `${currentTitle} - Varahi Vani | Jai Varahi Peedam`}
          description={blog.meta_description?.trim() || currentSnippet || "Spiritual teachings and updates from Jai Varahi Peedam."}
          keywords={blog.focus_keyword?.trim() ? `${blog.focus_keyword.trim()}, Varahi Amman, Spiritual Wisdom, ${currentTitle}, Jai Varahi Peedam` : `Varahi Amman, Spiritual Wisdom, ${currentTitle}, Jai Varahi Peedam`}
          canonical={`https://www.jaivarahi.org/blog/${blog.slug || blog.id}`}
          ogTitle={blog.meta_title?.trim() || `${currentTitle} | Jai Varahi Peedam`}
          ogDescription={blog.meta_description?.trim() || currentSnippet || "Spiritual teachings and updates from Jai Varahi Peedam."}
          ogImage={blog.thumbnail_url || "https://www.jaivarahi.org/assets/img/images_new/VARAHI%20LOGO.svg"}
          ogUrl={`https://www.jaivarahi.org/blog/${blog.slug || blog.id}`}
          ogType="article"
          ogLocale={activeLang === "ta" ? "ta_IN" : "en_US"}
          twitterTitle={blog.meta_title?.trim() || `${currentTitle} | Jai Varahi Peedam`}
          twitterDescription={blog.meta_description?.trim() || currentSnippet || "Spiritual teachings and updates from Jai Varahi Peedam."}
          twitterImage={blog.thumbnail_url || "https://www.jaivarahi.org/assets/img/images_new/VARAHI%20LOGO.svg"}
          author={{
            name: "Swamy Pallur Varahidhasan",
            jobTitle: "Founder & Spiritual Head, Sri Jai Varahi Peedam",
            url: "https://www.jaivarahi.org/about",
            datePublished: blog.created_at ? new Date(blog.created_at).toISOString().split("T")[0] : undefined,
            dateModified: blog.updated_at ? new Date(blog.updated_at).toISOString().split("T")[0] : undefined
          }}
        />
      )}

      {/* JSON-LD Structured Data Schema */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}

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

      <main className="blog-detail-page" style={{ padding: "0 0 60px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "120px 20px 80px", color: "var(--primary-color)" }}>
            {isTamil ? "ஆன்மீகப் பதிவு ஏற்றப்படுகிறது..." : "Loading blog content..."}
          </div>
        ) : !blog ? (
          <div style={{ textAlign: "center", padding: "120px 20px 80px" }}>
            <h2 style={{ color: "var(--primary-color)", fontFamily: "'Georgia', serif" }}>
              {isTamil ? "ஆன்மீகப் பதிவு காணப்படவில்லை" : "Spiritual Insight Not Found"}
            </h2>
            <p style={{ marginTop: "16px" }}>
              {isTamil ? "நீங்கள் தேடும் பதிவு இல்லை அல்லது நீக்கப்பட்டுள்ளது." : "The post you are trying to reach does not exist or is unpublished."}
            </p>
            <Link to="/blog" style={{ color: "var(--primary-color)", textDecoration: "underline", display: "block", marginTop: "24px", fontWeight: "600" }}>
              {isTamil ? "பதிவுகளுக்குத் திரும்புக" : "Return to Blogs"}
            </Link>
          </div>
        ) : (
          <>
            {/* Fixed Top Reading Progress Bar */}
            <div 
              style={{ 
                position: "fixed", 
                top: 0, 
                left: 0, 
                height: "4px", 
                width: `${scrollProgress}%`, 
                background: "linear-gradient(90deg, #9a3b34 0%, #b45309 50%, #f5bc35 100%)", 
                zIndex: 9999, 
                transition: "width 0.1s ease" 
              }} 
            />

            {/* Elegant Top Breadcrumb Navigation Bar */}
            <div style={{
              background: "#faf8f5",
              borderBottom: "1px solid #ede8e0",
              padding: "14px 0",
              marginBottom: "28px"
            }}>
              <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px"
              }}>
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", fontSize: "13.5px" }}>
                  <Link 
                    to="/" 
                    style={{ 
                      color: "#6b7280", 
                      textDecoration: "none", 
                      fontWeight: 500,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>🏠</span> {isTamil ? "முகப்பு" : "Home"}
                  </Link>

                  <span style={{ color: "#d1d5db", fontSize: "12px" }}>›</span>

                  <Link 
                    to={`/blog?lang=${activeLang}`} 
                    style={{ 
                      color: "#6b7280", 
                      textDecoration: "none", 
                      fontWeight: 500 
                    }}
                  >
                    {isTamil ? "ஆன்மீகப் பதிவுகள்" : "Varahi Vani"}
                  </Link>

                  <span style={{ color: "#d1d5db", fontSize: "12px" }}>›</span>

                  <span style={{ 
                    color: "#7a0c0c", 
                    fontWeight: 600, 
                    background: "rgba(122, 12, 12, 0.08)", 
                    padding: "3px 10px", 
                    borderRadius: "6px",
                    border: "1px solid rgba(122, 12, 12, 0.15)",
                    fontSize: "12.5px"
                  }}>
                    {category}
                  </span>
                </nav>

                {/* Language Switcher */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                  <span style={{ color: "#9ca3af", fontWeight: 500 }}>
                    {isTamil ? "மொழி:" : "Language:"}
                  </span>
                  <Link 
                    to={`/blog/${blog.slug || id}?lang=ta`} 
                    style={{ 
                      padding: "3px 9px", 
                      borderRadius: "6px", 
                      textDecoration: "none",
                      fontWeight: activeLang === "ta" ? 700 : 500,
                      background: activeLang === "ta" ? "#7a0c0c" : "#f3f0ea",
                      color: activeLang === "ta" ? "#ffffff" : "#4b5563",
                      border: "1px solid",
                      borderColor: activeLang === "ta" ? "#7a0c0c" : "#e5e0d8",
                      fontSize: "12px"
                    }}
                  >
                    தமிழ்
                  </Link>
                  <Link 
                    to={`/blog/${blog.slug || id}?lang=en`} 
                    style={{ 
                      padding: "3px 9px", 
                      borderRadius: "6px", 
                      textDecoration: "none",
                      fontWeight: activeLang === "en" ? 700 : 500,
                      background: activeLang === "en" ? "#7a0c0c" : "#f3f0ea",
                      color: activeLang === "en" ? "#ffffff" : "#4b5563",
                      border: "1px solid",
                      borderColor: activeLang === "en" ? "#7a0c0c" : "#e5e0d8",
                      fontSize: "12px"
                    }}
                  >
                    English
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Layout Container */}
            <div className="blog-detail-layout">
              {/* Left Column: Main Article */}
              <div className="blog-detail-main">
                <article>
                  {/* Category Badge */}
                  <span className="blog-category-badge" style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #7a0c0c 0%, #a81c1c 100%)",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "14px"
                  }}>
                    {category}
                  </span>

                  {/* Title */}
                  <h1 className="blog-detail-title">
                    {currentTitle}
                  </h1>

                  {/* Metadata Bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #eee", paddingBottom: "14px", marginBottom: "20px" }}>
                    <div className="blog-detail-meta" style={{ margin: 0, padding: 0, border: "none" }}>
                      <span>📅 {new Date(blog.created_at).toLocaleDateString(isTamil ? "ta-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                      <span>👤 {isTamil ? "ஸ்வாமி பல்லூர் வாராஹிதாசன் (நிறுவுநர்)" : "Swamy Pallur Varahidhasan (Founder)"}</span>
                      <span>⏱️ {Math.max(1, Math.ceil(currentContent.replace(/<[^>]*>/g, '').split(/\s+/).length / 200))} {isTamil ? "நிமிட வாசிப்பு" : "min read"}</span>
                    </div>
                  </div>

                  {/* Featured Image */}
                  {blog.thumbnail_url && (
                    <div className="blog-detail-img-wrap">
                      <img
                        src={blog.thumbnail_url}
                        alt={`${currentTitle} - Sri Varahi Peedam`}
                        className="blog-detail-img"
                        loading="eager"
                        fetchpriority="high"
                        decoding="async"
                        onError={(e) => { e.target.src = "/assets/img/images_new/banner1.webp"; }}
                      />
                    </div>
                  )}

                  {/* Snippet / Introduction */}
                  {currentSnippet && (
                    <div className="blog-detail-snippet">
                      {currentSnippet}
                    </div>
                  )}

                  {/* Main Content Body with Dynamic Font Scaling */}
                  <div
                    className="blog-detail-content"
                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(currentContent || "", {
                        ADD_TAGS: ["iframe"],
                        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "loading"],
                        hooks: {
                          uponSanitizeElement: (element, data) => {
                            if (data.tagName === 'iframe') {
                              const src = element.getAttribute('src') || '';
                              const allowedDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'player.vimeo.com'];
                              const isAllowed = allowedDomains.some(domain => src.includes(domain));
                              if (!isAllowed) {
                                element.remove();
                              }
                            }
                          }
                        }
                      })
                    }}
                  />


                  {/* ─── SPIRITUAL ACTION CARDS (SERVICES, DONATIONS, DEVOTEES) ─── */}
                  <div style={{ margin: "40px 0 30px", padding: "28px 24px", background: "linear-gradient(135deg, #fdfaf4 0%, #f7f1e6 100%)", borderRadius: "16px", border: "1px solid #ebdcc5", boxShadow: "0 4px 20px rgba(100,50,20,0.06)" }}>
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                      <span style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px", color: "var(--primary-color, #7a0c0c)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        🔱 {isTamil ? "ஆன்மீக சேவைகள் & திருப்பணிகள்" : "Divine Seva & Temple Services"}
                      </span>
                      <h3 style={{ fontFamily: "'Georgia', serif", fontSize: "1.35rem", color: "#361c10", margin: "6px 0 0" }}>
                        {isTamil ? "வாராஹி அம்மனின் பரிபூரண அருளைப் பெறுங்கள்" : "Connect with Goddess Varahi's Divine Grace"}
                      </h3>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                      {/* 1. Services & Homam CTA */}
                      <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e3d5c1", display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "center" }}>
                        <div>
                          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🪔</div>
                          <h4 style={{ fontFamily: "'Georgia', serif", fontSize: "15px", margin: "0 0 6px", color: "#7a0c0c", fontWeight: "700" }}>
                            {isTamil ? "பூஜை & ஹோமங்கள்" : "Temple Services"}
                          </h4>
                          <p style={{ fontSize: "12px", color: "#6e5d53", lineHeight: "1.5", margin: "0 0 14px" }}>
                            {isTamil ? "உங்கள் தோஷ நிவர்த்தி மற்றும் காரிய சித்திக்காக விசேஷ ஹோமங்கள் முன்பதிவு செய்யுங்கள்." : "Book special Homams, Abishekam, and Parihara rituals at the sanctum."}
                          </p>
                        </div>
                        <Link to="/services" style={{ display: "inline-block", background: "#7a0c0c", color: "#ffffff", padding: "9px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", textDecoration: "none", boxShadow: "0 3px 10px rgba(122,12,12,0.2)" }}>
                          {isTamil ? "சேவைகள் காண்க →" : "Book Services →"}
                        </Link>
                      </div>

                      {/* 2. Donations CTA */}
                      <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e3d5c1", display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "center" }}>
                        <div>
                          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🙏</div>
                          <h4 style={{ fontFamily: "'Georgia', serif", fontSize: "15px", margin: "0 0 6px", color: "#7a0c0c", fontWeight: "700" }}>
                            {isTamil ? "அன்னதானம் & நன்கொடை" : "Temple Donation"}
                          </h4>
                          <p style={{ fontSize: "12px", color: "#6e5d53", lineHeight: "1.5", margin: "0 0 14px" }}>
                            {isTamil ? "நித்ய அன்னதானம் மற்றும் கோசாலை திருப்பணிக்கு உங்கள் காணிக்கையை செலுத்துங்கள் (80G)." : "Contribute to daily Annadhanam and Kosala maintenance with 80G tax benefits."}
                          </p>
                        </div>
                        <Link to="/payment" style={{ display: "inline-block", background: "linear-gradient(135deg, #b8860b 0%, #d4af37 100%)", color: "#ffffff", padding: "9px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", textDecoration: "none", boxShadow: "0 3px 10px rgba(184,134,11,0.2)" }}>
                          {isTamil ? "நன்கொடை அளிக்க →" : "Donate Online →"}
                        </Link>
                      </div>

                      {/* 3. Devotee Registration CTA */}
                      <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e3d5c1", display: "flex", flexDirection: "column", justifyContent: "space-between", textAlign: "center" }}>
                        <div>
                          <div style={{ fontSize: "28px", marginBottom: "8px" }}>✍️</div>
                          <h4 style={{ fontFamily: "'Georgia', serif", fontSize: "15px", margin: "0 0 6px", color: "#7a0c0c", fontWeight: "700" }}>
                            {isTamil ? "பக்தர் சங்கல்ப பதிவு" : "Devotee Registration"}
                          </h4>
                          <p style={{ fontSize: "12px", color: "#6e5d53", lineHeight: "1.5", margin: "0 0 14px" }}>
                            {isTamil ? "உங்கள் குடும்ப நட்சத்திரம், ராசி விவரங்களை நித்ய பூஜை சங்கல்பத்தில் இணைக்கவும்." : "Register your family Nakshatram and Rasi details for nithya pooja sankalpam."}
                          </p>
                        </div>
                        <Link to="/devoteesdetails" style={{ display: "inline-block", background: "#361c10", color: "#ffffff", padding: "9px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", textDecoration: "none", boxShadow: "0 3px 10px rgba(54,28,16,0.2)" }}>
                          {isTamil ? "இலவச பதிவு →" : "Register Free →"}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Devotional Callout Box */}
                  <div className="devotional-callout">
                    <span className="callout-symbol">🔱</span>
                    <div className="callout-text">
                      <p className="callout-en">“Kottai Varahi Destroys Any Root of Nexus Karma”</p>
                      <p className="callout-ta">“வினை எதுவாயினும் வேரறுப்பாள் கோட்டை வாராஹி”</p>
                    </div>
                  </div>

                  {/* Gallery Grid */}
                  {gallery && gallery.length > 0 && (
                    <div style={{ marginTop: "40px", borderTop: "1px solid var(--background-medium)", paddingTop: "30px", marginBottom: "30px" }}>
                      <h3 style={{ fontFamily: "'Georgia', serif", color: "var(--primary-color)", marginBottom: "20px" }}>
                        {isTamil ? "புகைப்பட தொகுப்பு" : "Image Gallery"}
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
                        {gallery.map((url, idx) => (
                          <div key={idx} style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid var(--background-medium)", height: "130px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                            <img 
                              src={url} 
                              alt={`Gallery Image ${idx + 1}`} 
                              style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", transition: "transform 0.3s" }} 
                              onClick={() => window.open(url, "_blank")}
                              onError={(e) => { e.target.src = "/assets/img/images_new/banner1.webp"; }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {tags && tags.length > 0 && (
                    <div className="blog-tags-wrap">
                      {tags.map((tag, tIdx) => (
                        <Link 
                          key={tIdx} 
                          to={`/blog?search=${encodeURIComponent(tag)}&lang=${activeLang}`} 
                          className="blog-tag-pill"
                          aria-label={isTamil ? `டேக்: ${tag}` : `Tag: ${tag}`}
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Author Section */}
                  <div className="blog-author-card">
                    <img src="/VARAHI LOGO.svg" alt="Author" className="blog-author-img" onError={(e) => { e.target.src = "/assets/img/logo.webp"; }} />
                    <div className="blog-author-info">
                      <h4>{blog.author_name || "Pallur Varahi Dhasan"}</h4>
                      <p><strong>{isTamil ? "நிர்வாகி - கோட்டை வாராஹி பீடம்" : "Admin - Kottai Varahi Temple"}</strong></p>
                      <p style={{ marginTop: "4px", fontSize: "13px" }}>
                        {isTamil ? "ஸ்ரீ வாராஹி அம்மனின் தெய்வீக ஞானத்தையும் அருளையும் பக்தர்களுடன் பகிர்ந்து கொள்கிறோம்." : "Sharing the divine wisdom and blessings of Sri Varahi Amman with devotees."}
                      </p>
                    </div>
                  </div>
                </article>
              </div>

              {/* Right Column: Sidebar */}
              <div className="blog-detail-sidebar">
                
                {/* Widget 1: Search */}
                <div className="sidebar-widget">
                  <h3 className="sidebar-title">{isTamil ? "தேடல்" : "Search Blog"}</h3>
                  <div className="sidebar-search-box">
                    <input
                      type="text"
                      placeholder={isTamil ? "பதிவுகளைத் தேடு..." : "Search articles..."}
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                      aria-label={isTamil ? "பதிவுகளைத் தேடு" : "Search articles"}
                    />
                    <button onClick={handleSearch} aria-label={isTamil ? "தேடுக" : "Search"}>🔍</button>
                  </div>
                </div>

                {/* Widget 2: Categories */}
                <div className="sidebar-widget">
                  <h3 className="sidebar-title">{isTamil ? "பிரிவுகள்" : "Categories"}</h3>
                  <ul className="sidebar-categories-list">
                    {[
                      { label: isTamil ? "ஆலய குறிப்புகள்" : "Temple Insights", icon: "🕌" },
                      { label: isTamil ? "பூஜை மற்றும் சேவைகள்" : "Pooja & Services", icon: "🔥" },
                      { label: isTamil ? "விழாக்கள் & நிகழ்வுகள்" : "Festivals & Events", icon: "✨" },
                      { label: isTamil ? "ஆன்மீக ஞானம்" : "Spiritual Wisdom", icon: "📖" },
                      { label: isTamil ? "பக்தர்களின் கதைகள்" : "Devotee Stories", icon: "🙌" }
                    ].map((cat, idx) => (
                      <li key={idx} className="sidebar-category-item">
                        <Link 
                          to={`/blog?category=${encodeURIComponent(cat.label)}&lang=${activeLang}`} 
                          className="sidebar-category-link"
                          aria-label={isTamil ? `பிரிவு: ${cat.label}` : `Category: ${cat.label}`}
                        >
                          <span className="sidebar-category-icon" role="img" aria-label={cat.label}>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Widget 3: Recent Posts */}
                <div className="sidebar-widget">
                  <h3 className="sidebar-title">{isTamil ? "சமீபத்திய பதிவுகள்" : "Recent Posts"}</h3>
                  <div className="sidebar-recent-posts">
                    {recentBlogs.length === 0 ? (
                      <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{isTamil ? "பதிவுகள் இல்லை" : "No recent posts"}</p>
                    ) : (
                      recentBlogs.map((b) => {
                        const bTitle = (activeLang === "ta" ? b.title_ta : b.title_en) || b.title;
                        return (
                          <Link key={b.id} to={`/blog/${b.slug || b.id}?lang=${activeLang}`} className="recent-post-item">
                            {b.thumbnail_url ? (
                              <img src={b.thumbnail_url} alt={bTitle} className="recent-post-thumb" onError={(e) => { e.target.src = "/assets/img/images_new/banner1.webp"; }} />
                            ) : (
                              <div className="recent-post-thumb" style={{ background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>No Image</div>
                            )}
                            <div className="recent-post-info">
                              <h4 className="recent-post-title">{bTitle}</h4>
                              <span className="recent-post-date">{new Date(b.created_at).toLocaleDateString(isTamil ? "ta-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Widget 3: Devotee Registration CTA */}
                <div className="sidebar-widget" style={{ padding: 0, border: "none", marginBottom: "20px" }}>
                  <div style={{ background: "linear-gradient(135deg, #2d1212 0%, #4a1515 100%)", borderRadius: "12px", padding: "20px", color: "#ffffff", textAlign: "center", border: "1px solid rgba(218,165,32,0.4)" }}>
                    <div style={{ fontSize: "24px", marginBottom: "6px" }}>✍️</div>
                    <h4 style={{ fontFamily: "'Georgia', serif", fontSize: "16px", color: "#f7d984", margin: "0 0 8px" }}>
                      {isTamil ? "பக்தர் பதிவு & சங்கல்பம்" : "Devotee Sankalpam"}
                    </h4>
                    <p style={{ fontSize: "12px", color: "#e8d9c5", margin: "0 0 14px", lineHeight: "1.5" }}>
                      {isTamil ? "கோவில் நித்ய பூஜையில் உங்கள் குடும்பத்தினரின் பெயர் மற்றும் நட்சத்திரத்தை சேர்க்கவும்." : "Enroll your family details for nithya pooja sankalpam and blessings."}
                    </p>
                    <Link to="/devoteesdetails" style={{ display: "inline-block", background: "#f7d984", color: "#361c10", padding: "8px 18px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", textDecoration: "none", width: "80%" }}>
                      {isTamil ? "இப்போதே பதிவு செய்" : "Register Details"}
                    </Link>
                  </div>
                </div>

                {/* Widget 4: Donations & Annadhanam CTA */}
                <div className="sidebar-widget" style={{ padding: 0, border: "none", marginBottom: "20px" }}>
                  <div style={{ background: "linear-gradient(135deg, #fffcf5 0%, #f9f2e3 100%)", borderRadius: "12px", padding: "20px", color: "#361c10", textAlign: "center", border: "1px solid #e3d3ba" }}>
                    <div style={{ fontSize: "24px", marginBottom: "6px" }}>🙏</div>
                    <h4 style={{ fontFamily: "'Georgia', serif", fontSize: "16px", color: "#8a1010", margin: "0 0 8px" }}>
                      {isTamil ? "அன்னதான நன்கொடை" : "Annadhanam Donation"}
                    </h4>
                    <p style={{ fontSize: "12px", color: "#6b594e", margin: "0 0 14px", lineHeight: "1.5" }}>
                      {isTamil ? "தினசரி பக்தர்களுக்கு அன்னதானம் வழங்க உங்கள் பங்களிப்பை அளியுங்கள் (80G வரி விலக்கு)." : "Support daily Annadhanam and Kosala seva with 80G tax exemption."}
                    </p>
                    <Link to="/payment" style={{ display: "inline-block", background: "#8a1010", color: "#ffffff", padding: "8px 18px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", textDecoration: "none", width: "80%" }}>
                      {isTamil ? "நன்கொடை செலுத்து" : "Donate Now"}
                    </Link>
                  </div>
                </div>

                {/* Widget 5: Pooja CTA */}
                <div className="sidebar-widget" style={{ padding: 0, border: "none" }}>
                  <div className="pooja-cta-card">
                    <div className="pooja-cta-icon">🪔</div>
                    <h4>{isTamil ? "தெய்வீக அருளைப் பெறுங்கள்" : "Experience Divine Blessings"}</h4>
                    <p>{isTamil ? "இன்றே உங்கள் பூஜை அல்லது தரிசனத்தை முன்பதிவு செய்து வாராஹி அம்மனின் அருளைப் பெறுங்கள்." : "Book your pooja or darshan today and seek the grace of Goddess Varahi."}</p>
                    <Link to="/services" className="pooja-cta-btn">
                      <span>📅</span> {isTamil ? "சேவைகள் முன்பதிவு" : "Book Services"}
                    </Link>
                  </div>
                </div>

              </div>
            </div>

            {/* Related Posts bottom bar */}
            {relatedBlogs.length > 0 && (
              <div className="related-posts-section">
                <div className="related-posts-header">
                  <h3>{isTamil ? "தொடர்புடைய பதிவுகள்" : "Related Posts"}</h3>
                  <Link to={`/blog?lang=${activeLang}`} className="related-view-all">
                    {isTamil ? "அனைத்தையும் காண்க →" : "View All →"}
                  </Link>
                </div>
                <div className="related-posts-grid">
                  {relatedBlogs.map((b) => {
                    const bTitle = (activeLang === "ta" ? b.title_ta : b.title_en) || b.title;
                    const bSnippet = (activeLang === "ta" ? b.snippet_ta : b.snippet_en) || b.snippet || "";
                    const bCatInfo = getBlogCategoryAndTags(b, isTamil);
                    return (
                      <article key={b.id} className="blog-card" style={{ display: "flex", flexDirection: "column", background: "#fff", borderRadius: "12px", border: "1px solid var(--background-medium)", overflow: "hidden", height: "100%" }}>
                        <div style={{ height: "160px", position: "relative", overflow: "hidden" }}>
                          {b.thumbnail_url ? (
                            <img src={b.thumbnail_url} alt={bTitle} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.src = "/assets/img/images_new/banner1.webp"; }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>No Image</div>
                          )}
                        </div>
                        <div style={{ padding: "16px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "11px", color: "var(--accent-color, #b8860b)", fontWeight: "600", textTransform: "uppercase", marginBottom: "8px", display: "block" }}>
                            {bCatInfo.category}
                          </span>
                          <h4 style={{ fontFamily: "'Georgia', serif", fontSize: "1.15rem", color: "var(--text-strong)", margin: "0 0 10px", lineHeight: "1.4" }}>
                            {bTitle}
                          </h4>
                          <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.5", margin: "0 0 16px", flexGrow: 1 }}>
                            {bSnippet.replace(/<[^>]*>/g, "").slice(0, 100)}...
                          </p>
                          <Link to={`/blog/${b.slug || b.id}?lang=${activeLang}`} style={{ color: "var(--primary-color)", fontWeight: "600", fontSize: "13px", textDecoration: "none", marginTop: "auto" }}>
                            {isTamil ? "மேலும் படிக்க →" : "Read More →"}
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <FloatActions />
      <Footer />
    </>
  );
};

export default BlogDetail;
