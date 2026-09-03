import React, { useState, useMemo } from "react";
import Navbar from "../common/Navbar.jsx";
import MobileNav from "../common/MobileNav.jsx";
import Footer from "../common/Footer.jsx";
import FloatActions from "../common/FloatActions.jsx";
import SeoEnhanced from "../common/SeoEnhanced.jsx";
import Preloader from "../common/Preloader.jsx";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  FileText,
  AlertCircle,
  Flame,
  Star
} from "lucide-react";
import { 
  STAR_OPTIONS, 
  RASI_OPTIONS, 
  RELATIONSHIP_OPTIONS, 
  GOTHRAM_SUGGESTIONS 
} from "../../utils/astrologyData";

const DevoteesDetails = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [postalAddress, setPostalAddress] = useState("");
  const [gothram, setGothram] = useState("");
  const [marriedStatus, setMarriedStatus] = useState("unmarried");
  const [weddingDate, setWeddingDate] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [note, setNote] = useState("");
  const [familyMembers, setFamilyMembers] = useState([]);

  // Field validation errors
  const [errors, setErrors] = useState({});

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
          { label: "Sri Bala manthiram", href: "/sri_bala_manthiram" },
        ],
      },
      {
        label: "Kosala",
        href: "#",
        children: [
          { label: "Donation", href: "/payment" },
          { label: "Donation Archive", href: "/payment" },
        ],
      },
      {
        label: "Jothidam",
        href: "#",
        children: [
          { label: "Astrology prediction", href: "/Jothidam" },
          { label: "Sri Varahi Jothida Vidyalayam", href: "/comingsoon" },
        ],
      },
      {
        label: "Events",
        href: "#",
        children: [
          { label: "Asta Varahi Dharshanam", href: "/astavarahi" },
          { label: "Asta Varahi 2.0", href: "/astavarahi2" },
          { label: "Ashada Navarathiri", href: "/ashada_navarathiri" },
        ],
      },
      { label: "Blog", href: "/blog" },
      { label: "Latest Updates", href: "/comingsoon" },
    ],
    []
  );

  const addFamilyMember = () => {
    setFamilyMembers(prev => [
      ...prev, 
      { 
        name: "", 
        relationship: prev.length === 0 ? "Spouse" : "Child", 
        star: "", 
        rasi: "", 
        dob: "" 
      }
    ]);
  };

  const removeFamilyMember = (index) => {
    setFamilyMembers(prev => prev.filter((_, i) => i !== index));
  };

  const updateFamilyMember = (index, field, value) => {
    setFamilyMembers(prev => prev.map((m, i) => {
      if (i !== index) return m;
      return { ...m, [field]: value };
    }));
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Primary devotee name is required";
    const cleanedContact = contact.replace(/\D/g, "");
    if (!cleanedContact || cleanedContact.length < 10) {
      errs.contact = "Please enter a valid 10-digit mobile number";
    }
    if (emailAddress && !/^\S+@\S+\.\S+$/.test(emailAddress)) {
      errs.emailAddress = "Please enter a valid email address";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setMessage({ type: "error", text: "Please correct the highlighted fields before submitting." });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ type: "", text: "" });

      const response = await fetch("/api/devotees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          postal_address: postalAddress.trim() || null,
          gothram: gothram.trim() || null,
          family_members: familyMembers,
          married_status: marriedStatus,
          wedding_date: marriedStatus === "married" && weddingDate ? weddingDate : null,
          email_address: emailAddress.trim() || null,
          father_name: fatherName.trim() || null,
          mother_name: motherName.trim() || null,
          note: note.trim() || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit devotee details");
      }

      setIsSubmitted(true);
      setMessage({
        type: "success",
        text: "Your devotee registration has been completed successfully. Goddess Varahi's divine blessings upon you and your family!"
      });
      
      // Scroll to top of form smoothly
      window.scrollTo({ top: 300, behavior: "smooth" });

    } catch (err) {
      setMessage({ type: "error", text: err.message || "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setName("");
    setContact("");
    setEmailAddress("");
    setPostalAddress("");
    setGothram("");
    setMarriedStatus("unmarried");
    setWeddingDate("");
    setFatherName("");
    setMotherName("");
    setNote("");
    setFamilyMembers([]);
    setErrors({});
    setIsSubmitted(false);
    setMessage({ type: "", text: "" });
  };

  return (
    <div style={{ backgroundColor: "#fbf8f2", minHeight: "100vh", color: "#2d241e" }}>
      <SeoEnhanced
        title="Devotee Registration & Sankalpam Form | Jai Varahi Peedam"
        description="Register your family details at Sri Kottai Varahi Amman Temple for nithya pooja sankalpam, divine blessings, and festival updates."
        keywords="Devotee Registration, Varahi Amman Temple, Pooja Sankalpam, Jai Varahi Peedam, Vellore Temple"
        canonical="https://www.jaivarahi.org/devoteesdetails"
        ogTitle="Devotee Registration | Sri Kottai Varahi Amman Temple"
        ogDescription="Register your family for nithya pooja sankalpam and receive sacred updates from Jai Varahi Peedam."
        ogImage="https://www.jaivarahi.org/assets/img/banner/banner1.webp"
        ogUrl="https://www.jaivarahi.org/devoteesdetails"
      />

      <Preloader autoHide />
      <Navbar
        items={navItems}
        onOpenMobile={() => setIsMobileOpen(true)}
        isMobileOpen={isMobileOpen}
      />
      <MobileNav
        items={navItems}
        isOpen={isMobileOpen}
        activeDropdown={activeMobileDropdown}
        onClose={() => {
          setIsMobileOpen(false);
          setActiveMobileDropdown(null);
        }}
        onToggleDropdown={(label) => {
          setActiveMobileDropdown((current) => (current === label ? null : label));
        }}
      />
      <div
        className={`mobile-nav-overlay${isMobileOpen ? " active" : ""}`}
        onClick={() => setIsMobileOpen(false)}
        role="presentation"
      />

      {/* ─── SACRED HERO BANNER ────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          backgroundImage: "linear-gradient(rgba(45, 12, 12, 0.82), rgba(20, 5, 5, 0.90)), url('/assets/img/banner/banner1.webp')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          padding: "100px 20px 70px",
          textAlign: "center",
          color: "#ffffff"
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(218, 165, 32, 0.18)", border: "1px solid rgba(218, 165, 32, 0.4)", padding: "6px 18px", borderRadius: "30px", fontSize: "13px", fontWeight: "600", color: "#f7d984", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "16px" }}>
            <Sparkles size={14} /> ஸ்ரீ கோட்டை வாராஹி பீடம்
          </div>
          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "700", margin: "0 0 12px", color: "#ffffff", letterSpacing: "0.5px" }}>
            Devotees Registration & Sankalpam
          </h1>
          <p style={{ fontSize: "15px", color: "#e8d9c5", lineHeight: "1.6", maxWidth: "680px", margin: "0 auto 20px" }}>
            Register your family details to participate in temple prayers, daily nithya pooja sankalpam, and receive sacred prasadam updates.
          </p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", fontSize: "13px", color: "#f7d984" }}>
            <a href="/" style={{ color: "#ffffff", textDecoration: "none" }}>Home</a>
            <span>•</span>
            <span>Devotee Registration</span>
          </div>
        </div>
      </section>

      {/* ─── REGISTRATION CONTAINER ───────────────────────────────────── */}
      <main style={{ maxWidth: "960px", margin: "-40px auto 80px", padding: "0 20px", position: "relative", zIndex: 10 }}>
        
        {/* Trust Badges */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "14px", border: "1px solid #ebdcc5", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(180, 20, 20, 0.08)", color: "#8a1010", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#361c10" }}>Nithya Sankalpam</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#7a6558" }}>Family names included in prayers</p>
            </div>
          </div>

          <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "14px", border: "1px solid #ebdcc5", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(180, 20, 20, 0.08)", color: "#8a1010", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#361c10" }}>Temple Direct</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#7a6558" }}>Official temple database entry</p>
            </div>
          </div>

          <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "14px", border: "1px solid #ebdcc5", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(180, 20, 20, 0.08)", color: "#8a1010", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#361c10" }}>Devotee Community</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#7a6558" }}>Special event & Pooja notices</p>
            </div>
          </div>
        </div>

        {/* Form Container Card */}
        <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e8dbca", boxShadow: "0 15px 45px rgba(100, 60, 20, 0.08)", padding: "clamp(24px, 4vw, 44px)", overflow: "hidden" }}>
          
          {isSubmitted ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ width: "76px", height: "76px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <CheckCircle2 size={44} />
              </div>
              <h2 style={{ fontFamily: "Cinzel, serif", color: "#8a1010", fontSize: "26px", fontWeight: "700", marginBottom: "12px" }}>
                Registration Submitted Successfully
              </h2>
              <p style={{ color: "#615047", fontSize: "15px", maxWidth: "560px", margin: "0 auto 28px", lineHeight: "1.6" }}>
                Thank you, <strong>{name}</strong>. Your family details have been saved for Sri Kottai Varahi Amman temple prayers and sankalpams. May Goddess Varahi bless your home with peace, protection, and prosperity.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    padding: "12px 28px",
                    background: "#8a1010",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "30px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(138, 16, 16, 0.25)"
                  }}
                >
                  Register Another Devotee
                </button>
                <a
                  href="/"
                  style={{
                    padding: "12px 28px",
                    background: "#f7f1e6",
                    color: "#361c10",
                    border: "1px solid #dfd2be",
                    borderRadius: "30px",
                    fontWeight: "600",
                    fontSize: "14px",
                    textDecoration: "none",
                    display: "inline-block"
                  }}
                >
                  Return to Home
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              
              {message.text && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 18px",
                    marginBottom: "28px",
                    borderRadius: "10px",
                    borderLeft: "4px solid",
                    borderColor: message.type === "success" ? "#10b981" : "#ef4444",
                    backgroundColor: message.type === "success" ? "#ecfdf5" : "#fef2f2",
                    color: message.type === "success" ? "#065f46" : "#991b1b",
                    fontSize: "14px"
                  }}
                >
                  {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* ── 1. PRIMARY DEVOTEE DETAILS ── */}
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "10px", borderBottom: "2px solid #f3e9d8", marginBottom: "20px" }}>
                  <User size={20} color="#8a1010" />
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#8a1010", fontFamily: "Cinzel, serif" }}>
                    Primary Devotee Information (முதன்மை பக்தர் விவரங்கள்)
                  </h3>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#361c10", marginBottom: "6px" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                      }}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "8px",
                        border: errors.name ? "1px solid #ef4444" : "1px solid #d8ccb8",
                        backgroundColor: "#fdfbf8",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                    {errors.name && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.name}</span>}
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#361c10", marginBottom: "6px" }}>
                      Contact Mobile Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={contact}
                      onChange={(e) => {
                        setContact(e.target.value);
                        if (errors.contact) setErrors(prev => ({ ...prev, contact: "" }));
                      }}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "8px",
                        border: errors.contact ? "1px solid #ef4444" : "1px solid #d8ccb8",
                        backgroundColor: "#fdfbf8",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                    {errors.contact && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.contact}</span>}
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#361c10", marginBottom: "6px" }}>
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      value={emailAddress}
                      onChange={(e) => {
                        setEmailAddress(e.target.value);
                        if (errors.emailAddress) setErrors(prev => ({ ...prev, emailAddress: "" }));
                      }}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "8px",
                        border: errors.emailAddress ? "1px solid #ef4444" : "1px solid #d8ccb8",
                        backgroundColor: "#fdfbf8",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                    {errors.emailAddress && <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{errors.emailAddress}</span>}
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#361c10", marginBottom: "6px" }}>
                      Gothram (கோத்திரம்)
                    </label>
                    <input
                      type="text"
                      list="public-gothram-suggestions"
                      placeholder="e.g. Siva, Kashyapa, Harita"
                      value={gothram}
                      onChange={(e) => setGothram(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "8px",
                        border: "1px solid #d8ccb8",
                        backgroundColor: "#fdfbf8",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                    <datalist id="public-gothram-suggestions">
                      {GOTHRAM_SUGGESTIONS.map((g, i) => (
                        <option key={i} value={g} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#361c10", marginBottom: "6px" }}>
                      Father's Name (தந்தை பெயர்)
                    </label>
                    <input
                      type="text"
                      placeholder="Father's full name"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "8px",
                        border: "1px solid #d8ccb8",
                        backgroundColor: "#fdfbf8",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#361c10", marginBottom: "6px" }}>
                      Mother's Name (தாய் பெயர்)
                    </label>
                    <input
                      type="text"
                      placeholder="Mother's full name"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        borderRadius: "8px",
                        border: "1px solid #d8ccb8",
                        backgroundColor: "#fdfbf8",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ── 2. POSTAL ADDRESS ── */}
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "10px", borderBottom: "2px solid #f3e9d8", marginBottom: "20px" }}>
                  <MapPin size={20} color="#8a1010" />
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#8a1010", fontFamily: "Cinzel, serif" }}>
                    Postal Address for Communications & Prasadam (முகவரி)
                  </h3>
                </div>

                <div>
                  <textarea
                    rows={3}
                    placeholder="Enter complete door no, street name, city, and pincode for prasadam delivery / correspondence"
                    value={postalAddress}
                    onChange={(e) => setPostalAddress(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid #d8ccb8",
                      backgroundColor: "#fdfbf8",
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* ── 3. MARITAL STATUS ── */}
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "10px", borderBottom: "2px solid #f3e9d8", marginBottom: "20px" }}>
                  <Heart size={20} color="#8a1010" />
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#8a1010", fontFamily: "Cinzel, serif" }}>
                    Marital Status & Sacred Dates (திருமண நிலை)
                  </h3>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px", alignItems: "center" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#361c10", marginBottom: "8px" }}>
                      Status
                    </label>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        type="button"
                        onClick={() => setMarriedStatus("unmarried")}
                        style={{
                          flex: 1,
                          padding: "10px 16px",
                          borderRadius: "8px",
                          border: marriedStatus === "unmarried" ? "2px solid #8a1010" : "1px solid #d8ccb8",
                          backgroundColor: marriedStatus === "unmarried" ? "rgba(138, 16, 16, 0.08)" : "#fdfbf8",
                          color: marriedStatus === "unmarried" ? "#8a1010" : "#5a4b41",
                          fontWeight: "600",
                          fontSize: "14px",
                          cursor: "pointer"
                        }}
                      >
                        Unmarried (திருமணமாகாதவர்)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarriedStatus("married")}
                        style={{
                          flex: 1,
                          padding: "10px 16px",
                          borderRadius: "8px",
                          border: marriedStatus === "married" ? "2px solid #8a1010" : "1px solid #d8ccb8",
                          backgroundColor: marriedStatus === "married" ? "rgba(138, 16, 16, 0.08)" : "#fdfbf8",
                          color: marriedStatus === "married" ? "#8a1010" : "#5a4b41",
                          fontWeight: "600",
                          fontSize: "14px",
                          cursor: "pointer"
                        }}
                      >
                        Married (திருமணமானவர்)
                      </button>
                    </div>
                  </div>

                  {marriedStatus === "married" && (
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#361c10", marginBottom: "6px" }}>
                        Wedding Anniversary Date (திருமண நாள்)
                      </label>
                      <input
                        type="date"
                        value={weddingDate}
                        onChange={(e) => setWeddingDate(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #d8ccb8",
                          backgroundColor: "#fdfbf8",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ── 4. FAMILY MEMBERS FOR SANKALPAM ── */}
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", borderBottom: "2px solid #f3e9d8", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Users size={20} color="#8a1010" />
                      <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#8a1010", fontFamily: "Cinzel, serif" }}>
                        Family Members for Sankalpam (குடும்ப உறுப்பினர்கள்)
                      </h3>
                    </div>
                    <div style={{ fontSize: "12px", color: "#7a675a", marginTop: "2px" }}>
                      ⭐ Selecting Star (நட்சத்திரம்) automatically auto-fills Moon Sign (ராசி)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addFamilyMember}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      backgroundColor: "rgba(138, 16, 16, 0.08)",
                      color: "#8a1010",
                      border: "1px solid rgba(138, 16, 16, 0.3)",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    <Plus size={16} /> + Add Member
                  </button>
                </div>

                {familyMembers.length === 0 ? (
                  <div style={{ background: "#fcf9f4", border: "1px dashed #d8ccb8", borderRadius: "10px", padding: "24px", textAlign: "center", color: "#7a675a" }}>
                    <p style={{ margin: "0 0 10px", fontSize: "14px" }}>
                      No additional family members added yet.
                    </p>
                    <button
                      type="button"
                      onClick={addFamilyMember}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#8a1010",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: "pointer",
                        textDecoration: "underline"
                      }}
                    >
                      Click here to add family members for Sankalpam prayers
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {familyMembers.map((member, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "#faf6ef",
                          border: "1px solid #ebdcc5",
                          borderRadius: "12px",
                          padding: "16px",
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr)) 40px",
                          gap: "12px",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#6e594d", textTransform: "uppercase", marginBottom: "4px" }}>
                            Relationship (உறவு)
                          </label>
                          <select
                            value={member.relationship || "Member"}
                            onChange={(e) => updateFamilyMember(idx, "relationship", e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #d8ccb8",
                              backgroundColor: "#ffffff",
                              fontSize: "13px",
                              outline: "none",
                              boxSizing: "border-box"
                            }}
                          >
                            {RELATIONSHIP_OPTIONS.map((rel, rIdx) => (
                              <option key={rIdx} value={rel.value}>{rel.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#6e594d", textTransform: "uppercase", marginBottom: "4px" }}>
                            Member {idx + 1} Name
                          </label>
                          <input
                            type="text"
                            placeholder="Name"
                            value={member.name}
                            onChange={(e) => updateFamilyMember(idx, "name", e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid #d8ccb8",
                              backgroundColor: "#ffffff",
                              fontSize: "13px",
                              outline: "none",
                              boxSizing: "border-box"
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#6e594d", textTransform: "uppercase", marginBottom: "4px" }}>
                            Nakshatram (நட்சத்திரம்)
                          </label>
                          <select
                            value={member.star || ""}
                            onChange={(e) => updateFamilyMember(idx, "star", e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #d8ccb8",
                              backgroundColor: "#ffffff",
                              fontSize: "13px",
                              outline: "none",
                              boxSizing: "border-box"
                            }}
                          >
                            <option value="">Select Star</option>
                            {STAR_OPTIONS.map((s, i) => (
                              <option key={i} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#6e594d", textTransform: "uppercase", marginBottom: "4px" }}>
                            Rasi (ராசி)
                          </label>
                          <select
                            value={member.rasi || ""}
                            onChange={(e) => updateFamilyMember(idx, "rasi", e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #d8ccb8",
                              backgroundColor: "#ffffff",
                              fontSize: "13px",
                              outline: "none",
                              boxSizing: "border-box"
                            }}
                          >
                            <option value="">Select Rasi</option>
                            {RASI_OPTIONS.map((r, i) => (
                              <option key={i} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#6e594d", textTransform: "uppercase", marginBottom: "4px" }}>
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={member.dob || ""}
                            onChange={(e) => updateFamilyMember(idx, "dob", e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #d8ccb8",
                              backgroundColor: "#ffffff",
                              fontSize: "13px",
                              outline: "none",
                              boxSizing: "border-box"
                            }}
                          />
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", paddingTop: "16px" }}>
                          <button
                            type="button"
                            onClick={() => removeFamilyMember(idx)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#dc2626",
                              cursor: "pointer",
                              padding: "6px",
                              borderRadius: "6px"
                            }}
                            title="Remove Member"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── 5. PRAYER NOTES ── */}
              <div style={{ marginBottom: "36px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "10px", borderBottom: "2px solid #f3e9d8", marginBottom: "20px" }}>
                  <FileText size={20} color="#8a1010" />
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#8a1010", fontFamily: "Cinzel, serif" }}>
                    Special Prayers / Notes (பிரார்த்தனை குறிப்புகள்)
                  </h3>
                </div>

                <div>
                  <textarea
                    rows={3}
                    placeholder="Enter any specific prayer intentions (e.g. health, family harmony, marriage blessings, debt relief, business progress)..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px solid #d8ccb8",
                      backgroundColor: "#fdfbf8",
                      fontSize: "14px",
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>


              {/* ── SUBMIT BUTTON ── */}
              <div style={{ textAlign: "center", paddingTop: "10px" }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    background: isLoading ? "#999999" : "linear-gradient(135deg, #8a1010 0%, #b31414 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "30px",
                    padding: "14px 44px",
                    fontSize: "16px",
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    boxShadow: "0 6px 20px rgba(138, 16, 16, 0.3)",
                    transition: "all 0.2s ease-in-out"
                  }}
                >
                  <Sparkles size={18} />
                  {isLoading ? "Submitting Registration..." : "Submit Devotee Registration"}
                </button>
                <p style={{ margin: "14px 0 0", fontSize: "12px", color: "#827063" }}>
                  Sri Kottai Varahi Amman Temple • All devotee information is treated as sacred and confidential.
                </p>
              </div>

            </form>
          )}

        </div>
      </main>

      <Footer />
      <FloatActions />
    </div>
  );
};

export default DevoteesDetails;
