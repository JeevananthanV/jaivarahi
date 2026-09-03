import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  FileText, Plus, Edit2, Check, X, Trash2, Eye, ExternalLink, 
  History, Send, MessageSquare, AlertCircle, Clock, ShieldCheck, CheckCircle2, XCircle, ImageIcon, RefreshCw,
  ArrowLeft, Save, Sparkles, Monitor, Smartphone, Tablet, Globe, Search, Tag, Folder, Quote,
  ListOrdered, List, Code, Maximize2, Minimize2, EyeOff, Layout, Columns, Calendar, User, AlignLeft
} from "lucide-react";
import { useAdminAuth } from "./AdminAuthContext";
import adminApi from "./adminApi";
import { isRole } from "./roles";
import MediaLibrary from "./MediaLibrary";
import BACKEND_URL from "../../api/config";
import DOMPurify from "dompurify";

const RichTextEditor = ({ value, onChange, onOpenMediaPicker, placeholder = "Start writing your sacred article..." }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const sanitizeUrl = (raw) => {
    if (!raw || typeof raw !== "string") return null;
    let url = raw.trim();
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
      return null;
    }
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) {
      url = "https://" + url;
    }
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) return null;
      return parsed.toString();
    } catch {
      return null;
    }
  };

  const sanitizeImageUrl = (raw) => {
    if (!raw || typeof raw !== "string") return null;
    let url = raw.trim();
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.startsWith("javascript:") || lower.startsWith("vbscript:")) {
      return null;
    }
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) {
      url = "https://" + url;
    }
    try {
      const parsed = new URL(url);
      if (!["http:", "https:", "data:"].includes(parsed.protocol)) return null;
      if (parsed.protocol === "data:" && !parsed.href.startsWith("data:image/")) return null;
      return parsed.toString();
    } catch {
      return null;
    }
  };

  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertSpiritualCallout = () => {
    const html = `<div style="background: rgba(154, 59, 52, 0.08); border-left: 4px solid #9a3b34; padding: 14px 18px; border-radius: 6px; margin: 16px 0; font-style: italic; color: #1a1a1a;">
      <strong>🔱 அருள் வாக்கு / Divine Guidance:</strong> <p style="margin: 6px 0 0 0;">Enter special spiritual mantra, sloka, or temple message here...</p>
    </div><p><br></p>`;
    executeCommand("insertHTML", html);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div style={{ border: "1px solid var(--bd)", borderRadius: "var(--r)", background: "var(--bg2)", overflow: "hidden", boxShadow: "var(--sh-xs)" }}>
      {/* Sticky Contextual Formatting Toolbar */}
      <div style={{ 
        display: "flex", 
        gap: "6px", 
        padding: "8px 12px", 
        borderBottom: "1px solid var(--bd)", 
        background: "var(--bg)", 
        flexWrap: "wrap", 
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 5
      }}>
        <div style={{ display: "flex", gap: "2px", background: "var(--bg2)", padding: "2px", borderRadius: "6px", border: "1px solid var(--bd)" }}>
          <button type="button" className="btn btn-ol btn-sm" onClick={() => executeCommand("bold")} style={{ minWidth: "28px", padding: "3px 6px", border: "none" }} title="Bold (Ctrl+B)"><b>B</b></button>
          <button type="button" className="btn btn-ol btn-sm" onClick={() => executeCommand("italic")} style={{ minWidth: "28px", padding: "3px 6px", border: "none" }} title="Italic (Ctrl+I)"><i>I</i></button>
          <button type="button" className="btn btn-ol btn-sm" onClick={() => executeCommand("underline")} style={{ minWidth: "28px", padding: "3px 6px", border: "none" }} title="Underline (Ctrl+U)"><u>U</u></button>
          <button type="button" className="btn btn-ol btn-sm" onClick={() => executeCommand("strikeThrough")} style={{ minWidth: "28px", padding: "3px 6px", border: "none" }} title="Strikethrough"><s>S</s></button>
        </div>

        <div style={{ width: "1px", height: "20px", background: "var(--bd)", margin: "0 2px" }} />

        <div style={{ display: "flex", gap: "2px", background: "var(--bg2)", padding: "2px", borderRadius: "6px", border: "1px solid var(--bd)" }}>
          <button type="button" className="btn btn-ol btn-sm" onClick={() => executeCommand("formatBlock", "H2")} style={{ padding: "3px 8px", border: "none", fontWeight: 700 }} title="Heading 2">H2</button>
          <button type="button" className="btn btn-ol btn-sm" onClick={() => executeCommand("formatBlock", "H3")} style={{ padding: "3px 8px", border: "none", fontWeight: 600 }} title="Heading 3">H3</button>
          <button type="button" className="btn btn-ol btn-sm" onClick={() => executeCommand("formatBlock", "P")} style={{ padding: "3px 8px", border: "none" }} title="Normal Paragraph">¶</button>
          <button type="button" className="btn btn-ol btn-sm" onClick={() => executeCommand("formatBlock", "BLOCKQUOTE")} style={{ padding: "3px 8px", border: "none" }} title="Quote Block"><Quote size={12} /></button>
        </div>

        <div style={{ width: "1px", height: "20px", background: "var(--bd)", margin: "0 2px" }} />

        <div style={{ display: "flex", gap: "2px", background: "var(--bg2)", padding: "2px", borderRadius: "6px", border: "1px solid var(--bd)" }}>
          <button type="button" className="btn btn-ol btn-sm" onClick={() => executeCommand("insertUnorderedList")} style={{ padding: "3px 6px", border: "none" }} title="Bullet List"><List size={13} /></button>
          <button type="button" className="btn btn-ol btn-sm" onClick={() => executeCommand("insertOrderedList")} style={{ padding: "3px 6px", border: "none" }} title="Numbered List"><ListOrdered size={13} /></button>
          <button type="button" className="btn btn-ol btn-sm" onClick={() => executeCommand("insertHorizontalRule")} style={{ padding: "3px 6px", border: "none" }} title="Horizontal Line">―</button>
        </div>

        <div style={{ width: "1px", height: "20px", background: "var(--bd)", margin: "0 2px" }} />

        <button type="button" className="btn btn-ol btn-sm" onClick={() => {
          const raw = prompt("Enter link URL:");
          if (!raw) return;
          const url = sanitizeUrl(raw);
          if (!url) {
            alert("Invalid URL. Use http(s) links only.");
            return;
          }
          executeCommand("createLink", url);
        }} style={{ padding: "4px 8px" }} title="Add Link">🔗 Link</button>

        {onOpenMediaPicker ? (
          <button type="button" className="btn btn-ol btn-sm" onClick={onOpenMediaPicker} style={{ padding: "4px 8px", color: "var(--pr)", borderColor: "var(--pr)" }} title="Pick from Media Library">
            <ImageIcon size={13} /> Media Library
          </button>
        ) : (
          <button type="button" className="btn btn-ol btn-sm" onClick={() => {
            const raw = prompt("Enter image URL:");
            if (raw) {
              const url = sanitizeImageUrl(raw);
              if (url) executeCommand("insertImage", url);
            }
          }} style={{ padding: "4px 8px" }}>
            <ImageIcon size={13} /> Image
          </button>
        )}

        <button type="button" className="btn btn-ol btn-sm" onClick={insertSpiritualCallout} style={{ padding: "4px 8px", color: "var(--special)", borderColor: "var(--special-08)" }} title="Insert Divine Guidance Callout">
          🔱 Callout Box
        </button>

        <button type="button" className="btn btn-ol btn-sm" onClick={() => executeCommand("removeFormat")} style={{ padding: "4px 6px", marginLeft: "auto", fontSize: "11px" }} title="Clear Formatting">
          Clear
        </button>
      </div>

      {/* Main Content Editable Surface */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{
          minHeight: "420px",
          maxHeight: "75vh",
          overflowY: "auto",
          padding: "24px",
          outline: "none",
          color: "var(--tx)",
          background: "var(--bg2)",
          fontSize: "15px",
          lineHeight: "1.75",
          fontFamily: "'Inter', sans-serif"
        }}
      />
    </div>
  );
};

const BlogManagement = () => {
  const { user } = useAdminAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [adminSearch, setAdminSearch] = useState("");
  const [adminPage, setAdminPage] = useState(1);
  const adminPerPage = 10;

  // Full Screen & Preview States
  const [previewModal, setPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop"); // 'desktop' | 'tablet' | 'mobile'
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // Review / Approval Modal State (Super Admin)
  const [reviewModal, setReviewModal] = useState({
    open: false,
    blog: null,
    targetStatus: "",
    reviewNotes: ""
  });

  // Audit Logs Modal State
  const [auditModal, setAuditModal] = useState({
    open: false,
    blogId: null,
    blogTitle: "",
    logs: [],
    loading: false
  });

  const [formData, setFormData] = useState({
    id: null,
    title_en: "",
    title_ta: "",
    snippet_en: "",
    snippet_ta: "",
    content_en: "",
    content_ta: "",
    thumbnail_url: "",
    gallery_urls: [],
    status: "Draft",
    created_at: "",
    category: "Temple Insights",
    tags: "",
    focus_keyword: "",
    meta_title: "",
    meta_description: "",
    review_notes: ""
  });
  const [editTab, setEditTab] = useState("ta"); // 'ta' | 'en' | 'split'
  const [serpViewMode, setSerpViewMode] = useState("desktop"); // 'desktop' | 'mobile'

  // Media Library Picker Modal State
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState("thumbnail"); // "thumbnail" | "gallery" | "inline"
  const [uploadingImage, setUploadingImage] = useState(false);

  const openMediaPicker = (target = "thumbnail") => {
    setMediaPickerTarget(target);
    setShowMediaPicker(true);
  };

  const handleMediaSelect = (selectedItem) => {
    if (!selectedItem) return;
    const chosenUrl = selectedItem.optimized_url || selectedItem.original_url || selectedItem.thumbnail_url || "";
    if (!chosenUrl) return;

    if (mediaPickerTarget === "thumbnail") {
      setFormData((prev) => ({ ...prev, thumbnail_url: chosenUrl }));
    } else if (mediaPickerTarget === "gallery") {
      setFormData((prev) => ({
        ...prev,
        gallery_urls: [...(prev.gallery_urls || []), chosenUrl]
      }));
    } else if (mediaPickerTarget === "inline") {
      const imgTag = `<img src="${chosenUrl}" alt="${selectedItem.alt_text || 'Blog image'}" style="max-width: 100%; border-radius: 8px; margin: 16px 0;" />`;
      document.execCommand("insertHTML", false, imgTag);
    }
    setShowMediaPicker(false);
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAdminBlogs();
      setBlogs(data);
    } catch (err) {
      console.error("Failed to fetch blogs", err);
    } finally {
      setLoading(false);
    }
  };

  const lastRefreshTime = useRef(0);
  const [isRealtimeUpdating, setIsRealtimeUpdating] = useState(false);

  const scheduleRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshTime.current < 1500) return;
    lastRefreshTime.current = now;
    setIsRealtimeUpdating(true);
    adminApi.getAdminBlogs()
      .then(setBlogs)
      .catch(console.error)
      .finally(() => setTimeout(() => setIsRealtimeUpdating(false), 300));
  }, []);

  useEffect(() => {
    fetchBlogs();

    const streamUrl = `${BACKEND_URL}/api/blogs/stream`;
    let eventSource;
    let reconnectTimeout;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_DELAY = 30000;

    const connect = () => {
      eventSource = new EventSource(streamUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "backlog") return;
          if (
            data.event === "blog_created" ||
            data.event === "blog_updated" ||
            data.event === "blog_status_changed" ||
            data.event === "blog_deleted" ||
            data.event === "blog_published" ||
            data.event === "media_changed" ||
            data.event === "reload"
          ) {
            scheduleRefresh();
          }
        } catch (err) {
          console.error("Failed to parse SSE payload:", err);
        }
      };

      eventSource.onerror = (err) => {
        eventSource.close();
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
        reconnectTimeout = setTimeout(() => {
          reconnectAttempts += 1;
          connect();
        }, delay);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (eventSource) eventSource.close();
    };
  }, [scheduleRefresh]);

  // Keyboard shortcut for quick save (Ctrl + S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        if (showForm) {
          e.preventDefault();
          handleSubmit(null, "saveDraft");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showForm, formData]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await adminApi.uploadBlogImage(file);
      setFormData((prev) => ({ ...prev, thumbnail_url: res.url }));
    } catch (err) {
      alert("Failed to upload image: " + (err.response?.data?.error || err.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingImage(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const res = await adminApi.uploadBlogImage(file);
        uploaded.push(res.url);
      }
      setFormData((prev) => ({
        ...prev,
        gallery_urls: [...(prev.gallery_urls || []), ...uploaded]
      }));
    } catch (err) {
      alert("Failed to upload gallery: " + (err.response?.data?.error || err.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      gallery_urls: (prev.gallery_urls || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleCreateNew = () => {
    setFormData({
      id: null,
      title_en: "",
      title_ta: "",
      snippet_en: "",
      snippet_ta: "",
      content_en: "",
      content_ta: "",
      thumbnail_url: "",
      gallery_urls: [],
      status: "Draft",
      created_at: new Date().toISOString().substring(0, 16),
      category: "Temple Insights",
      tags: "",
      focus_keyword: "",
      meta_title: "",
      meta_description: "",
      review_notes: ""
    });
    setEditTab("ta");
    setShowForm(true);
    setLastSavedTime(null);
  };

  const handleEdit = (blog) => {
    let parsedGallery = [];
    try {
      if (blog.gallery_urls) {
        parsedGallery = typeof blog.gallery_urls === "string" ? JSON.parse(blog.gallery_urls) : blog.gallery_urls;
      }
    } catch (e) {
      console.error("Failed to parse gallery_urls", e);
    }

    setFormData({
      id: blog.id,
      title_en: blog.title_en || blog.title || "",
      title_ta: blog.title_ta || blog.title || "",
      snippet_en: blog.snippet_en || blog.snippet || "",
      snippet_ta: blog.snippet_ta || blog.snippet || "",
      content_en: blog.content_en || blog.content || "",
      content_ta: blog.content_ta || blog.content || "",
      thumbnail_url: blog.thumbnail_url || "",
      gallery_urls: parsedGallery,
      status: blog.status || "Draft",
      created_at: blog.created_at ? new Date(new Date(blog.created_at).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 16) : "",
      category: blog.category || "Temple Insights",
      tags: blog.tags || "",
      focus_keyword: blog.focus_keyword || "",
      meta_title: blog.meta_title || "",
      meta_description: blog.meta_description || "",
      review_notes: blog.review_notes || ""
    });
    setEditTab("ta");
    setShowForm(true);
    setLastSavedTime(new Date());
  };

  const handleSubmit = async (e, forcedAction = null) => {
    if (e) e.preventDefault();
    if ((!formData.title_en && !formData.title_ta) || (!formData.content_en && !formData.content_ta)) {
      alert("At least one language title and content is required.");
      return;
    }

    setIsSaving(true);
    try {
      let targetStatus = formData.status;
      if (forcedAction === "saveDraft") targetStatus = "Draft";
      if (forcedAction === "publishLive") targetStatus = "Published";
      if (forcedAction === "submitReview") targetStatus = "Pending";

      const payload = {
        ...formData,
        status: targetStatus,
        content_en: formData.content_en ? DOMPurify.sanitize(formData.content_en) : formData.content_en,
        content_ta: formData.content_ta ? DOMPurify.sanitize(formData.content_ta) : formData.content_ta,
      };

      if (formData.id) {
        await adminApi.updateBlog(formData.id, payload);
      } else {
        const res = await adminApi.createBlog(payload);
        if (res?.id) setFormData((prev) => ({ ...prev, id: res.id }));
      }

      setLastSavedTime(new Date());
      fetchBlogs();
      if (forcedAction === "publishLive") {
        alert("🎉 Blog post published live to the temple website!");
        setShowForm(false);
      } else if (forcedAction === "submitReview") {
        alert("✓ Blog post submitted to Super Admin for verification!");
        setShowForm(false);
      }
    } catch (err) {
      alert("Error saving blog: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (id, newStatus, reviewNotes = "") => {
    try {
      await adminApi.updateBlogStatus(id, { status: newStatus, review_notes: reviewNotes });
      fetchBlogs();
    } catch (err) {
      alert("Error updating status: " + (err.response?.data?.error || err.message));
    }
  };

  const openReviewModal = (blog, targetStatus) => {
    setReviewModal({
      open: true,
      blog,
      targetStatus,
      reviewNotes: blog.review_notes || ""
    });
  };

  const confirmReviewModal = async () => {
    if (!reviewModal.blog) return;
    if (reviewModal.targetStatus === "Rejected" && !reviewModal.reviewNotes.trim()) {
      alert("Please provide a reason / review remark for rejecting the blog post.");
      return;
    }
    await handleStatusChange(reviewModal.blog.id, reviewModal.targetStatus, reviewModal.reviewNotes.trim());
    setReviewModal({ open: false, blog: null, targetStatus: "", reviewNotes: "" });
  };

  const handleViewAuditLogs = async (blog) => {
    setAuditModal({
      open: true,
      blogId: blog.id,
      blogTitle: blog.title_ta || blog.title_en || blog.title || `Blog #${blog.id}`,
      logs: [],
      loading: true
    });
    try {
      const res = await adminApi.getBlogAuditLogs(blog.id);
      setAuditModal((prev) => ({
        ...prev,
        logs: res.logs || [],
        loading: false
      }));
    } catch (err) {
      setAuditModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this blog post?")) return;
    try {
      await adminApi.deleteBlog(id);
      fetchBlogs();
    } catch (err) {
      alert("Error deleting blog: " + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    setAdminPage(1);
  }, [statusFilter, adminSearch]);

  const filteredBlogs = blogs.filter((b) => {
    if (statusFilter !== "All" && b.status !== statusFilter) return false;
    if (adminSearch.trim() !== "") {
      const q = adminSearch.toLowerCase();
      const titleText = `${b.title_en || ""} ${b.title_ta || ""} ${b.title || ""}`.toLowerCase();
      const snippetText = `${b.snippet_en || ""} ${b.snippet_ta || ""} ${b.snippet || ""}`.toLowerCase();
      const authorText = (b.author_name || "").toLowerCase();
      if (!titleText.includes(q) && !snippetText.includes(q) && !authorText.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const totalAdminPages = Math.ceil(filteredBlogs.length / adminPerPage);
  const paginatedBlogs = filteredBlogs.slice((adminPage - 1) * adminPerPage, adminPage * adminPerPage);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Published":
        return <span className="badge b-ok" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><CheckCircle2 size={11} /> Published</span>;
      case "Approved":
        return <span className="badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", display: "inline-flex", alignItems: "center", gap: "4px" }}><ShieldCheck size={11} /> Approved</span>;
      case "Pending":
        return <span className="badge b-in" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Clock size={11} /> Pending Review</span>;
      case "Rejected":
        return <span className="badge b-er" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><XCircle size={11} /> Revision Required</span>;
      default:
        return <span className="badge b-mu">Draft</span>;
    }
  };

  // Word count & reading time calculation
  const currentContent = editTab === "en" ? (formData.content_en || "") : (formData.content_ta || "");
  const plainText = currentContent.replace(/<[^>]+>/g, " ").trim();
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Generated slug
  const activeTitle = (formData.title_ta || formData.title_en || "").trim() || "untitled-article";
  const generatedSlug = activeTitle
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);

  // Dynamic SEO & Google SERP Preview Calculations
  const rawActiveTitle = (editTab === "en" ? formData.title_en : formData.title_ta) || formData.title_en || formData.title_ta || "";
  const dynamicPreviewTitle = (formData.meta_title && formData.meta_title.trim())
    ? formData.meta_title.trim()
    : (rawActiveTitle
        ? (rawActiveTitle.toLowerCase().includes("varahi") 
            ? rawActiveTitle 
            : `${rawActiveTitle} | Sri jai Varahi Peedam`)
        : "Sri jai Varahi Peedam | Divine Temple Blessings");

  const rawSnippet = (editTab === "en" ? formData.snippet_en : formData.snippet_ta) || formData.snippet_en || formData.snippet_ta || "";
  const dynamicPreviewSnippet = (formData.meta_description && formData.meta_description.trim())
    ? formData.meta_description.trim()
    : (rawSnippet.trim()
        ? rawSnippet.trim().slice(0, 160)
        : (plainText
            ? (plainText.slice(0, 155) + (plainText.length > 155 ? "..." : ""))
            : "Discover spiritual insights, sacred pooja schedules, and divine blessings of Sri jai Varahi Amman at Sri jai Varahi Peedam..."));

  const trimmedKeyword = (formData.focus_keyword || "").trim().toLowerCase();
  const hasKeywordInTitle = Boolean(trimmedKeyword && dynamicPreviewTitle.toLowerCase().includes(trimmedKeyword));
  const hasKeywordInDesc = Boolean(trimmedKeyword && dynamicPreviewSnippet.toLowerCase().includes(trimmedKeyword));
  const hasKeywordInSlug = Boolean(trimmedKeyword && (generatedSlug || "").toLowerCase().includes(trimmedKeyword.replace(/\s+/g, "-")));

  // ══════════════════════════════════════════════════════════════════
  // RENDER: FULL BLOG EDIT SCREEN (DEDICATED WRITING STUDIO)
  // ══════════════════════════════════════════════════════════════════
  if (showForm) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Sticky Zen Top Bar */}
        <header style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "var(--bg2)",
          borderBottom: "1px solid var(--bd)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "var(--sh-xs)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              type="button"
              className="btn btn-ol btn-sm"
              onClick={() => {
                if (window.confirm("Exit writing studio? Unsaved changes will be lost.")) {
                  setShowForm(false);
                }
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <ArrowLeft size={14} /> Back to Blogs
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--tx)" }}>
                {formData.id ? `Edit Post #${formData.id}` : "Create New Post"}
              </span>
              {getStatusBadge(formData.status)}
              {lastSavedTime && (
                <span style={{ fontSize: "11px", color: "var(--tx3)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Check size={11} color="#10b981" /> Auto-saved {lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          {/* Sticky Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className="btn btn-ol btn-sm"
              onClick={() => setPreviewModal(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Eye size={14} /> Live Devotee Preview
            </button>

            <button
              type="button"
              className="btn btn-ol btn-sm"
              disabled={isSaving}
              onClick={(e) => handleSubmit(e, "saveDraft")}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Save size={14} /> {isSaving ? "Saving..." : "Save Draft"}
            </button>

            {isRole(user, "Super Admin") ? (
              <button
                type="button"
                className="btn btn-pr btn-sm"
                disabled={isSaving}
                onClick={(e) => handleSubmit(e, "publishLive")}
                style={{ background: "#10b981", borderColor: "#10b981", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Check size={14} /> Publish Live
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-pr btn-sm"
                disabled={isSaving}
                onClick={(e) => handleSubmit(e, "submitReview")}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Send size={14} /> Submit for Review
              </button>
            )}
          </div>
        </header>

        {/* 2-Column Asymmetric Canvas (70% Studio / 30% Inspector) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", maxWidth: "1520px", width: "100%", margin: "0 auto", padding: "24px 20px" }}>
          
          {/* ─── LEFT COLUMN: 70% MAIN WRITING STUDIO ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Language Selection Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg2)", padding: "8px 16px", borderRadius: "var(--r)", border: "1px solid var(--bd)" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setEditTab("ta")}
                  className={`btn ${editTab === "ta" ? "btn-pr" : "btn-ol"} btn-sm`}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  🇮🇳 தமிழ் Content (Tamil)
                </button>
                <button
                  type="button"
                  onClick={() => setEditTab("en")}
                  className={`btn ${editTab === "en" ? "btn-pr" : "btn-ol"} btn-sm`}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  🇬🇧 English Content
                </button>
                <button
                  type="button"
                  onClick={() => setEditTab("split")}
                  className={`btn ${editTab === "split" ? "btn-pr" : "btn-ol"} btn-sm`}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Columns size={13} /> Side-by-Side Translate
                </button>
              </div>

              <div style={{ fontSize: "12px", color: "var(--tx3)", display: "inline-flex", alignItems: "center", gap: "12px" }}>
                <span>📊 <strong>{wordCount}</strong> words</span>
                <span>⏱️ <strong>{readingTime}</strong> min read</span>
                <span style={{ color: "#10b981", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <ShieldCheck size={13} /> HTML Sanitized
                </span>
              </div>
            </div>

            {/* Title & Slug Section */}
            {editTab !== "split" ? (
              <div className="card" style={{ padding: "24px" }}>
                <div style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--tx2)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Article Headline ({editTab === "en" ? "English" : "Tamil"})
                  </label>
                  <span style={{ fontSize: "11px", color: "var(--tx3)" }}>
                    {((editTab === "en" ? formData.title_en : formData.title_ta) || "").length}/120 chars
                  </span>
                </div>
                <input
                  type="text"
                  className="fi"
                  value={editTab === "en" ? formData.title_en : formData.title_ta}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((p) => ({ ...p, [editTab === "en" ? "title_en" : "title_ta"]: val }));
                  }}
                  placeholder={editTab === "en" ? "Enter a sacred, engaging English title..." : "பக்திமிக்க தமிழ் தலைப்பை உள்ளிடவும்..."}
                  style={{ fontSize: "22px", fontWeight: 700, fontFamily: "Georgia, serif", padding: "12px 16px", margin: 0 }}
                />

                {/* Slug Indicator */}
                <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--tx3)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Globe size={13} />
                  <span>Public URL: <code>https://jaivarahi.org/blog/{generatedSlug}</code></span>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="card" style={{ padding: "16px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--tx2)", marginBottom: "6px" }}>
                    TAMIL TITLE (தமிழ்)
                  </label>
                  <input
                    type="text"
                    className="fi"
                    value={formData.title_ta}
                    onChange={(e) => setFormData((p) => ({ ...p, title_ta: e.target.value }))}
                    placeholder="தமிழ் தலைப்பு..."
                    style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}
                  />
                </div>
                <div className="card" style={{ padding: "16px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--tx2)", marginBottom: "6px" }}>
                    ENGLISH TITLE
                  </label>
                  <input
                    type="text"
                    className="fi"
                    value={formData.title_en}
                    onChange={(e) => setFormData((p) => ({ ...p, title_en: e.target.value }))}
                    placeholder="English headline..."
                    style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}
                  />
                </div>
              </div>
            )}

            {/* Rich Text Editor Studio */}
            {editTab !== "split" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <RichTextEditor
                  key={editTab}
                  value={editTab === "en" ? formData.content_en : formData.content_ta}
                  onChange={(html) => setFormData((p) => ({ ...p, [editTab === "en" ? "content_en" : "content_ta"]: html }))}
                  onOpenMediaPicker={() => openMediaPicker("inline")}
                  placeholder={editTab === "en" ? "Write the sacred wisdom in English..." : "தெய்வீக கருத்துக்களை தமிழில் எழுதவும்..."}
                />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--tx2)", marginBottom: "6px" }}>🇮🇳 TAMIL BODY</div>
                  <RichTextEditor
                    key="split-ta"
                    value={formData.content_ta}
                    onChange={(html) => setFormData((p) => ({ ...p, content_ta: html }))}
                    onOpenMediaPicker={() => openMediaPicker("inline")}
                    placeholder="தமிழ் உள்ளடக்கம்..."
                  />
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--tx2)", marginBottom: "6px" }}>🇬🇧 ENGLISH BODY</div>
                  <RichTextEditor
                    key="split-en"
                    value={formData.content_en}
                    onChange={(html) => setFormData((p) => ({ ...p, content_en: html }))}
                    onOpenMediaPicker={() => openMediaPicker("inline")}
                    placeholder="English content..."
                  />
                </div>
              </div>
            )}

            {/* Short Snippet / Excerpt Box */}
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--tx2)" }}>
                  Article Summary / Short Excerpt ({editTab === "en" ? "English" : "Tamil"})
                </label>
                <span style={{ fontSize: "11px", color: "var(--tx3)" }}>
                  {((editTab === "en" ? formData.snippet_en : formData.snippet_ta) || "").length}/300 chars
                </span>
              </div>
              <textarea
                className="fi"
                value={editTab === "en" ? formData.snippet_en : formData.snippet_ta}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((p) => ({ ...p, [editTab === "en" ? "snippet_en" : "snippet_ta"]: val }));
                }}
                placeholder={editTab === "en" ? "Enter a 1-2 sentence hook for search engines & preview cards..." : "கட்டுரையின் சுருக்கத்தை 1-2 வாக்கியங்களில் உள்ளிடவும்..."}
                style={{ width: "100%", height: "70px", resize: "none", margin: 0 }}
                maxLength={300}
              />
            </div>
          </div>

          {/* ─── RIGHT COLUMN: 30% SETTINGS & METADATA INSPECTOR ─── */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* 1. Publishing Workflow & Status */}
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--tx)", borderBottom: "1px solid var(--bd)", paddingBottom: "10px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={14} color="var(--pr)" /> Publishing & Workflow
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--tx3)", marginBottom: "4px" }}>
                  Status
                </label>
                <select
                  className="fi"
                  style={{ width: "100%", margin: 0 }}
                  value={formData.status}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending Verification (Submit)</option>
                  {isRole(user, "Super Admin") && (
                    <>
                      <option value="Approved">Approved (Ready to Publish)</option>
                      <option value="Published">Published (Live)</option>
                      <option value="Rejected">Rejected</option>
                    </>
                  )}
                </select>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--tx3)", marginBottom: "4px" }}>
                  Publish Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="fi"
                  style={{ width: "100%", margin: 0 }}
                  value={formData.created_at}
                  onChange={(e) => setFormData((p) => ({ ...p, created_at: e.target.value }))}
                />
              </div>

              {formData.review_notes && (
                <div style={{ padding: "8px 12px", borderRadius: "6px", background: "var(--bg)", border: "1px solid var(--bd)", fontSize: "11px", color: "var(--tx2)" }}>
                  <strong>Audit Remark:</strong> <em>{formData.review_notes}</em>
                </div>
              )}
            </div>

            {/* 2. Featured Image Card */}
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--tx)", borderBottom: "1px solid var(--bd)", paddingBottom: "10px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <ImageIcon size={14} color="var(--pr)" /> Featured Header Image
              </div>

              {formData.thumbnail_url ? (
                <div style={{ position: "relative", marginBottom: "12px", borderRadius: "var(--r)", overflow: "hidden", border: "1px solid var(--bd)" }}>
                  <img
                    src={formData.thumbnail_url}
                    alt="Featured header"
                    style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, thumbnail_url: "" }))}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "22px",
                      height: "22px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title="Remove Image"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    height: "110px",
                    border: "2px dashed var(--bd)",
                    borderRadius: "var(--r)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    marginBottom: "12px",
                    background: "var(--bg)",
                    color: "var(--tx3)"
                  }}
                >
                  <ImageIcon size={24} style={{ opacity: 0.5 }} />
                  <span style={{ fontSize: "11px" }}>No featured image selected</span>
                </div>
              )}

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn btn-ol btn-sm"
                  onClick={() => openMediaPicker("thumbnail")}
                  style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                >
                  <Folder size={12} /> Media Library
                </button>
                <label className="btn btn-ol btn-sm" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px", cursor: "pointer", margin: 0 }}>
                  <Plus size={12} /> Upload File
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} disabled={uploadingImage} />
                </label>
              </div>
            </div>

            {/* 3. Category & Taxonomy */}
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--tx)", borderBottom: "1px solid var(--bd)", paddingBottom: "10px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Tag size={14} color="var(--pr)" /> Category & Tags
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--tx3)", marginBottom: "4px" }}>
                  Primary Category
                </label>
                <select
                  className="fi"
                  style={{ width: "100%", margin: 0 }}
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                >
                  <option value="Temple Insights">Temple Insights</option>
                  <option value="Pooja & Services">Pooja & Services</option>
                  <option value="Festivals & Events">Festivals & Events</option>
                  <option value="Spiritual Wisdom">Spiritual Wisdom</option>
                  <option value="Devotee Stories">Devotee Stories</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--tx3)", marginBottom: "4px" }}>
                  Tags (Hashtags)
                </label>
                <input
                  type="text"
                  className="fi"
                  style={{ width: "100%", margin: 0 }}
                  value={formData.tags}
                  onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="#VarahiAmman, #DivineBlessings"
                />
              </div>
            </div>

            {/* 4. Google SERP & SEO Studio */}
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--bd)", paddingBottom: "10px", marginBottom: "14px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--tx)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Search size={14} color="var(--pr)" /> SEO & Google SERP Preview
                </div>
                
                {/* Desktop / Mobile Preview Toggle */}
                <div style={{ display: "flex", background: "var(--bg)", borderRadius: "16px", padding: "2px", border: "1px solid var(--bd)" }}>
                  <button
                    type="button"
                    onClick={() => setSerpViewMode("desktop")}
                    style={{
                      border: "none",
                      background: serpViewMode === "desktop" ? "var(--pr)" : "transparent",
                      color: serpViewMode === "desktop" ? "#fff" : "var(--tx3)",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: "14px",
                      cursor: "pointer"
                    }}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setSerpViewMode("mobile")}
                    style={{
                      border: "none",
                      background: serpViewMode === "mobile" ? "var(--pr)" : "transparent",
                      color: serpViewMode === "mobile" ? "#fff" : "var(--tx3)",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: "14px",
                      cursor: "pointer"
                    }}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              {/* Realistic Google SERP Preview Box */}
              <div style={{ 
                background: "#ffffff", 
                border: "1px solid #dfe1e5", 
                borderRadius: serpViewMode === "mobile" ? "12px" : "8px", 
                padding: "14px 16px", 
                marginBottom: "16px",
                boxShadow: "0 1px 6px rgba(32,33,36,0.08)",
                fontFamily: "Roboto, Arial, sans-serif"
              }}>
                {serpViewMode === "mobile" ? (
                  /* Mobile Google Result Layout */
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#7a0c0c", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "10px", fontWeight: 700 }}>
                        🔱
                      </div>
                      <div style={{ lineHeight: "1.2" }}>
                        <div style={{ fontSize: "12px", color: "#202124", fontWeight: 600 }}>jaivarahi.org</div>
                        <div style={{ fontSize: "10px", color: "#4d5156" }}>https://www.jaivarahi.org › blog › {generatedSlug}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 500, color: "#1a0dab", lineHeight: "1.3", marginBottom: "4px" }}>
                      {dynamicPreviewTitle}
                    </div>
                    <div style={{ fontSize: "12px", color: "#4d5156", lineHeight: "1.45" }}>
                      {dynamicPreviewSnippet}
                    </div>
                  </div>
                ) : (
                  /* Desktop Google Result Layout */
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#202124", marginBottom: "4px" }}>
                      <span style={{ color: "#202124" }}>jaivarahi.org</span>
                      <span style={{ color: "#70757a" }}>›</span>
                      <span style={{ color: "#4d5156" }}>blog</span>
                      <span style={{ color: "#70757a" }}>›</span>
                      <span style={{ color: "#4d5156" }}>{generatedSlug}</span>
                    </div>
                    <div style={{ fontSize: "17px", fontWeight: 400, color: "#1a0dab", lineHeight: "1.3", marginBottom: "4px", textDecoration: "none" }}>
                      {dynamicPreviewTitle}
                    </div>
                    <div style={{ fontSize: "13px", color: "#4d5156", lineHeight: "1.5" }}>
                      {dynamicPreviewSnippet}
                    </div>
                  </div>
                )}
              </div>

              {/* Focus Keyword & Score Badges */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--tx3)" }}>
                    Focus Keyword
                  </label>
                  {formData.focus_keyword && (
                    <span style={{ fontSize: "10px", color: (hasKeywordInTitle && hasKeywordInDesc && hasKeywordInSlug) ? "#10b981" : "#f59e0b", fontWeight: 700 }}>
                      {(hasKeywordInTitle && hasKeywordInDesc && hasKeywordInSlug) ? "✓ Great SEO Match" : "⚠️ Partial Match"}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  className="fi"
                  style={{ width: "100%", margin: "0 0 6px 0" }}
                  value={formData.focus_keyword}
                  onChange={(e) => setFormData((p) => ({ ...p, focus_keyword: e.target.value }))}
                  placeholder="e.g. Varahi Peedam, Varahi Malai"
                />

                {/* Keyword Placement Checklist Badges */}
                {formData.focus_keyword && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                    <span style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: hasKeywordInTitle ? "rgba(16,185,129,0.15)" : "var(--bg)",
                      color: hasKeywordInTitle ? "#065f46" : "var(--tx3)",
                      border: `1px solid ${hasKeywordInTitle ? "rgba(16,185,129,0.3)" : "var(--bd)"}`,
                      fontWeight: 600
                    }}>
                      {hasKeywordInTitle ? "✓ In Title" : "✗ Missing in Title"}
                    </span>
                    <span style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: hasKeywordInDesc ? "rgba(16,185,129,0.15)" : "var(--bg)",
                      color: hasKeywordInDesc ? "#065f46" : "var(--tx3)",
                      border: `1px solid ${hasKeywordInDesc ? "rgba(16,185,129,0.3)" : "var(--bd)"}`,
                      fontWeight: 600
                    }}>
                      {hasKeywordInDesc ? "✓ In Description" : "✗ Missing in Description"}
                    </span>
                    <span style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: hasKeywordInSlug ? "rgba(16,185,129,0.15)" : "var(--bg)",
                      color: hasKeywordInSlug ? "#065f46" : "var(--tx3)",
                      border: `1px solid ${hasKeywordInSlug ? "rgba(16,185,129,0.3)" : "var(--bd)"}`,
                      fontWeight: 600
                    }}>
                      {hasKeywordInSlug ? "✓ In URL Slug" : "✗ Missing in URL"}
                    </span>
                  </div>
                )}
              </div>

              {/* Custom SEO Meta Title Input */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--tx3)" }}>
                    SEO Meta Title (Custom)
                  </label>
                  <span style={{ 
                    fontSize: "10px", 
                    fontWeight: 600,
                    color: (formData.meta_title?.length || 0) > 60 ? "#ef4444" : ((formData.meta_title?.length || 0) >= 30 ? "#10b981" : "var(--tx3)")
                  }}>
                    {formData.meta_title?.length || 0} / 60
                  </span>
                </div>
                <input
                  type="text"
                  className="fi"
                  style={{ width: "100%", margin: "0 0 4px 0" }}
                  value={formData.meta_title}
                  onChange={(e) => setFormData((p) => ({ ...p, meta_title: e.target.value }))}
                  placeholder={dynamicPreviewTitle}
                />
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, meta_title: (p.title_ta || p.title_en || "") }))}
                  style={{ background: "none", border: "none", color: "var(--pr)", fontSize: "11px", cursor: "pointer", padding: 0, fontWeight: 600 }}
                >
                  ✨ Auto-fill from Post Title
                </button>
              </div>

              {/* Custom SEO Meta Description Input */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--tx3)" }}>
                    SEO Meta Description (Custom)
                  </label>
                  <span style={{ 
                    fontSize: "10px", 
                    fontWeight: 600,
                    color: (formData.meta_description?.length || 0) > 160 ? "#ef4444" : ((formData.meta_description?.length || 0) >= 100 ? "#10b981" : "var(--tx3)")
                  }}>
                    {formData.meta_description?.length || 0} / 160
                  </span>
                </div>
                <textarea
                  className="fi"
                  rows={2}
                  style={{ width: "100%", margin: "0 0 4px 0", fontSize: "12px", resize: "vertical" }}
                  value={formData.meta_description}
                  onChange={(e) => setFormData((p) => ({ ...p, meta_description: e.target.value }))}
                  placeholder={dynamicPreviewSnippet}
                />
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, meta_description: (p.snippet_ta || p.snippet_en || "") }))}
                  style={{ background: "none", border: "none", color: "var(--pr)", fontSize: "11px", cursor: "pointer", padding: 0, fontWeight: 600 }}
                >
                  ✨ Auto-fill from Post Snippet
                </button>
              </div>
            </div>

            {/* 5. Gallery Images */}
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--tx)", borderBottom: "1px solid var(--bd)", paddingBottom: "10px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Columns size={14} color="var(--pr)" /> Gallery Assets ({formData.gallery_urls?.length || 0})
              </div>

              {formData.gallery_urls && formData.gallery_urls.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
                  {formData.gallery_urls.map((url, idx) => (
                    <div key={idx} style={{ position: "relative", aspectRatio: "16/9", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--bd)" }}>
                      <img src={url} alt={`Gallery item ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          background: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: "18px",
                          height: "18px",
                          fontSize: "10px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="btn btn-ol btn-sm"
                onClick={() => openMediaPicker("gallery")}
                style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
              >
                <Plus size={12} /> Add from Media Library
              </button>
            </div>
          </aside>
        </div>

        {/* ─── LIVE DEVOTEE PREVIEW MODAL ─── */}
        {previewModal && (
          <div className="modal-ov" onClick={() => setPreviewModal(false)}>
            <div
              className="modal"
              style={{
                maxWidth: previewDevice === "mobile" ? "420px" : previewDevice === "tablet" ? "760px" : "1100px",
                width: "95%",
                height: "90vh",
                display: "flex",
                flexDirection: "column"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-hd" style={{ background: "var(--bg)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="modal-title">Live Devotee Preview</span>
                  <div style={{ display: "flex", gap: "4px", background: "var(--bg2)", padding: "2px", borderRadius: "6px", border: "1px solid var(--bd)" }}>
                    <button
                      type="button"
                      className={`btn ${previewDevice === "desktop" ? "btn-pr" : "btn-ol"} btn-sm`}
                      onClick={() => setPreviewDevice("desktop")}
                      style={{ padding: "4px 8px" }}
                      title="Desktop View"
                    >
                      <Monitor size={12} />
                    </button>
                    <button
                      type="button"
                      className={`btn ${previewDevice === "tablet" ? "btn-pr" : "btn-ol"} btn-sm`}
                      onClick={() => setPreviewDevice("tablet")}
                      style={{ padding: "4px 8px" }}
                      title="Tablet View"
                    >
                      <Tablet size={12} />
                    </button>
                    <button
                      type="button"
                      className={`btn ${previewDevice === "mobile" ? "btn-pr" : "btn-ol"} btn-sm`}
                      onClick={() => setPreviewDevice("mobile")}
                      style={{ padding: "4px 8px" }}
                      title="Mobile View"
                    >
                      <Smartphone size={12} />
                    </button>
                  </div>
                </div>
                <button className="modal-x" onClick={() => setPreviewModal(false)}>×</button>
              </div>

              {/* Devotee Blog Detail Simulation */}
              <div className="modal-body" style={{ flex: 1, overflowY: "auto", padding: "24px 32px", background: "#fcfbf9" }}>
                {formData.thumbnail_url && (
                  <div style={{ width: "100%", maxHeight: "360px", overflow: "hidden", borderRadius: "12px", marginBottom: "20px" }}>
                    <img src={formData.thumbnail_url} alt="Header" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ fontSize: "12px", color: "var(--pr)", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>
                  {formData.category} • {readingTime} min read
                </div>
                <h1 style={{ fontSize: "28px", fontFamily: "Georgia, serif", color: "#1a1a1a", lineHeight: "1.3", marginBottom: "12px" }}>
                  {formData.title_ta || formData.title_en || "Sacred Article Title"}
                </h1>
                <div style={{ fontSize: "13px", color: "#666", marginBottom: "20px", display: "flex", gap: "12px", borderBottom: "1px solid #eee", paddingBottom: "12px" }}>
                  <span>Published: {new Date().toLocaleDateString("en-IN")}</span>
                  <span>Author: Swamy Pallur Varahidhasan (Founder)</span>
                </div>
                <div
                  style={{ fontSize: "16px", lineHeight: "1.8", color: "#222" }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content_ta || formData.content_en || "<p>No content written yet.</p>") }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Media Library Picker Modal */}
        {showMediaPicker && (
          <div className="modal-ov" onClick={() => setShowMediaPicker(false)}>
            <div className="modal" style={{ maxWidth: "900px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-hd">
                <span className="modal-title">
                  {mediaPickerTarget === "thumbnail" ? "Select Featured Thumbnail" : mediaPickerTarget === "inline" ? "Insert Image into Article" : "Select Gallery Images"}
                </span>
                <button className="modal-x" onClick={() => setShowMediaPicker(false)}>×</button>
              </div>
              <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <MediaLibrary
                  multiple={mediaPickerTarget === "gallery"}
                  onSelectMedia={handleMediaSelect}
                  allowUpload={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // RENDER: BLOG MANAGEMENT LIST & TABLE VIEW
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="page on">
      {/* Header */}
      <div className="ph">
        <div>
          <div className="ph-title">Blog Management</div>
          <div className="ph-sub">
            {isRole(user, "Super Admin")
              ? "Verify, audit, approve, reject, and publish blogs with complete audit tracking"
              : "Write, draft, and submit blog posts for Super Admin approval & publish once approved"}
          </div>
        </div>
        <button className="btn btn-pr" onClick={handleCreateNew} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Plus size={14} /> Create Post
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        {["All", "Draft", "Pending", "Approved", "Published", "Rejected"].map((status) => (
          <button
            key={status}
            className={`btn ${statusFilter === status ? "btn-pr" : "btn-ol"}`}
            onClick={() => setStatusFilter(status)}
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            {status}
          </button>
        ))}
        {isRealtimeUpdating && (
          <span style={{ fontSize: "11px", color: "var(--tx3)", display: "inline-flex", alignItems: "center", gap: "4px", marginLeft: "8px" }}>
            <RefreshCw size={10} style={{ animation: "sp 1s linear infinite" }} />
            Updating...
          </span>
        )}
      </div>

      {/* Search Input Bar */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search by title, author, or summary..."
          value={adminSearch}
          onChange={(e) => setAdminSearch(e.target.value)}
          className="fi"
          style={{ maxWidth: "400px", margin: 0 }}
        />
      </div>

      {/* Main List Grid */}
      <div className="card">
        <div className="tbl-wrap">
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--tx3)" }}>Loading blogs...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Thumbnail</th>
                  <th>Title & Remarks</th>
                  <th>Author</th>
                  <th>Status & Verification</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBlogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--tx3)" }}>
                      No blog posts found.
                    </td>
                  </tr>
                ) : (
                  paginatedBlogs.map((b) => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>
                        {b.thumbnail_url ? (
                          <img
                            src={b.thumbnail_url}
                            alt="thumbnail"
                            style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "60px",
                              height: "40px",
                              background: "var(--bg3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "4px",
                              fontSize: "10px",
                              color: "var(--tx3)"
                            }}
                          >
                            No Image
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{b.title_ta || b.title_en || b.title}</strong>
                        {(b.snippet_ta || b.snippet_en || b.snippet) && (
                          <div style={{ fontSize: "11px", color: "var(--tx3)", marginTop: "4px", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {b.snippet_ta || b.snippet_en || b.snippet}
                          </div>
                        )}
                        {b.review_notes && (
                          <div style={{ 
                            marginTop: "6px", 
                            fontSize: "11px", 
                            padding: "4px 8px", 
                            borderRadius: "4px", 
                            background: b.status === "Rejected" ? "rgba(239, 68, 68, 0.08)" : "rgba(59, 130, 246, 0.08)",
                            color: b.status === "Rejected" ? "#ef4444" : "var(--tx2)",
                            borderLeft: `2px solid ${b.status === "Rejected" ? "#ef4444" : "#3b82f6"}`
                          }}>
                            <strong>Review Note:</strong> {b.review_notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{b.author_name && !b.author_name.toLowerCase().includes('admin') ? b.author_name : "Swamy Pallur Varahidhasan (Founder)"}</div>
                        {b.reviewer_name && (
                          <div style={{ fontSize: "10px", color: "var(--tx3)", marginTop: "2px" }}>
                            Reviewer: {b.reviewer_name}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{getStatusBadge(b.status)}</div>
                        {b.reviewed_at && (
                          <div style={{ fontSize: "10px", color: "var(--tx3)", marginTop: "4px" }}>
                            Audited: {new Date(b.reviewed_at).toLocaleDateString("en-IN")}
                          </div>
                        )}
                      </td>
                      <td style={{ color: "var(--tx3)", fontSize: "12px" }}>
                        {new Date(b.created_at).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {/* Common Edit button */}
                          <button className="btn btn-ol btn-sm" onClick={() => handleEdit(b)} title="Edit blog in full writing studio">
                            <Edit2 size={12} /> Edit Studio
                          </button>
                          
                          {/* View Audit Trail button */}
                          <button 
                            className="btn btn-ol btn-sm" 
                            onClick={() => handleViewAuditLogs(b)}
                            title="View complete audit & action history"
                          >
                            <History size={12} /> Audit Trail
                          </button>

                          {/* ─── BLOG ADMIN SPECIFIC ACTIONS ─── */}
                          {!isRole(user, "Super Admin") && (
                            <>
                              {b.status === "Approved" && (
                                <button
                                  className="btn btn-pr btn-sm"
                                  onClick={() => handleStatusChange(b.id, "Published")}
                                  style={{ background: "#10b981", borderColor: "#10b981", color: "#fff" }}
                                  title="Publish this approved blog to public site"
                                >
                                  <Check size={12} /> Publish Post
                                </button>
                              )}
                              {(b.status === "Draft" || b.status === "Rejected") && (
                                <button
                                  className="btn btn-ol btn-sm"
                                  onClick={() => handleStatusChange(b.id, "Pending")}
                                  style={{ color: "#3b82f6", borderColor: "#3b82f6" }}
                                  title="Submit blog post to Super Admin for verification"
                                >
                                  <Send size={12} /> Submit Review
                                </button>
                              )}
                              {b.status === "Published" && (
                                <button
                                  className="btn btn-ol btn-sm"
                                  onClick={() => handleStatusChange(b.id, "Draft")}
                                  style={{ color: "var(--tx3)" }}
                                  title="Unpublish and return to Draft"
                                >
                                  Unpublish
                                </button>
                              )}
                            </>
                          )}
                          
                          {/* ─── SUPER ADMIN SPECIFIC ACTIONS ─── */}
                          {isRole(user, "Super Admin") && (
                            <>
                              {b.status === "Pending" && (
                                <>
                                  <button
                                    className="btn btn-ol btn-sm"
                                    onClick={() => openReviewModal(b, "Approved")}
                                    style={{ color: "var(--ok)", borderColor: "var(--ok)" }}
                                    title="Verify and Approve blog"
                                  >
                                    <Check size={12} /> Verify & Approve
                                  </button>
                                  <button
                                    className="btn btn-ol btn-sm"
                                    onClick={() => openReviewModal(b, "Rejected")}
                                    style={{ color: "var(--er)", borderColor: "var(--er)" }}
                                    title="Reject with notes"
                                  >
                                    <X size={12} /> Reject
                                  </button>
                                </>
                              )}
                              {b.status === "Approved" && (
                                <button
                                  className="btn btn-pr btn-sm"
                                  onClick={() => handleStatusChange(b.id, "Published")}
                                  style={{ background: "#10b981", borderColor: "#10b981" }}
                                  title="Directly publish approved post"
                                >
                                  <Check size={12} /> Publish Live
                                </button>
                              )}
                              {b.status === "Published" && (
                                <button
                                  className="btn btn-ol btn-sm"
                                  onClick={() => handleStatusChange(b.id, "Draft")}
                                  style={{ color: "var(--tx3)" }}
                                  title="Unpublish to Draft"
                                >
                                  Unpublish
                                </button>
                              )}
                              {b.status === "Draft" && (
                                <button
                                  className="btn btn-ol btn-sm"
                                  onClick={() => openReviewModal(b, "Approved")}
                                  style={{ color: "var(--ok)", borderColor: "var(--ok)" }}
                                  title="Approve directly"
                                >
                                  Approve
                                </button>
                              )}
                              <button
                                className="btn btn-ol btn-sm"
                                onClick={() => handleDelete(b.id)}
                                style={{ color: "var(--er)", borderColor: "var(--erb)" }}
                                title="Delete post permanently"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </>
                          )}
                          
                          {/* View Live Link if Published */}
                          {b.status === "Published" && (
                            <a
                              href={`/blog/${b.slug || b.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-ol btn-sm"
                              style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                            >
                              <ExternalLink size={12} /> View Live
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Admin Pagination Controls */}
        {totalAdminPages > 1 && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px", paddingRight: "16px", paddingBottom: "16px" }}>
            <button
              className="btn btn-ol btn-sm"
              onClick={() => setAdminPage(prev => Math.max(prev - 1, 1))}
              disabled={adminPage === 1}
            >
              Previous
            </button>
            <span style={{ alignSelf: "center", fontSize: "13px", color: "var(--tx3)", fontWeight: "600" }}>
              Page {adminPage} of {totalAdminPages}
            </span>
            <button
              className="btn btn-ol btn-sm"
              onClick={() => setAdminPage(prev => Math.min(prev + 1, totalAdminPages))}
              disabled={adminPage === totalAdminPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ─── REVIEW / APPROVAL MODAL (Super Admin) ─── */}
      {reviewModal.open && (
        <div className="modal-ov" onClick={(e) => { if (e.target.className === "modal-ov") setReviewModal({ open: false, blog: null, targetStatus: "", reviewNotes: "" }); }}>
          <div className="modal" style={{ maxWidth: "520px", width: "95%" }}>
            <div className="modal-hd">
              <span className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {reviewModal.targetStatus === "Approved" ? (
                  <>
                    <ShieldCheck size={18} color="#10b981" />
                    Verify & Approve Blog Post
                  </>
                ) : (
                  <>
                    <AlertCircle size={18} color="#ef4444" />
                    Reject Blog Post & Request Revisions
                  </>
                )}
              </span>
              <button className="modal-x" onClick={() => setReviewModal({ open: false, blog: null, targetStatus: "", reviewNotes: "" })}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: "12px", fontSize: "13px", color: "var(--tx)" }}>
                <strong>Post:</strong> {reviewModal.blog?.title_ta || reviewModal.blog?.title_en || reviewModal.blog?.title}
              </div>
              <div style={{ marginBottom: "16px", fontSize: "12px", color: "var(--tx3)" }}>
                {reviewModal.targetStatus === "Approved"
                  ? "Approving will transition the post to 'Approved' status. The Blog Admin will be notified to perform the final 'Publish' step."
                  : "Please provide detailed feedback so the Blog Admin can revise and resubmit the article."}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--tx2)", marginBottom: "6px" }}>
                  {reviewModal.targetStatus === "Approved" ? "Audit / Approval Remarks (Optional)" : "Rejection Reason / Required Changes *"}
                </label>
                <textarea
                  className="fi"
                  style={{ width: "100%", height: "90px", resize: "vertical" }}
                  placeholder={reviewModal.targetStatus === "Approved" ? "e.g., Content reviewed, approved for publishing." : "e.g., Please update the header image and expand the Tamil translation."}
                  value={reviewModal.reviewNotes}
                  onChange={(e) => setReviewModal(p => ({ ...p, reviewNotes: e.target.value }))}
                  required={reviewModal.targetStatus === "Rejected"}
                />
              </div>
            </div>
            <div className="modal-ft">
              <button 
                type="button" 
                className="btn btn-ol" 
                onClick={() => setReviewModal({ open: false, blog: null, targetStatus: "", reviewNotes: "" })}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-pr" 
                onClick={confirmReviewModal}
                style={{ 
                  background: reviewModal.targetStatus === "Approved" ? "#10b981" : "#ef4444", 
                  borderColor: reviewModal.targetStatus === "Approved" ? "#10b981" : "#ef4444" 
                }}
              >
                Confirm {reviewModal.targetStatus === "Approved" ? "Approval" : "Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── AUDIT TRAIL MODAL ─── */}
      {auditModal.open && (
        <div className="modal-ov" onClick={(e) => { if (e.target.className === "modal-ov") setAuditModal({ open: false, blogId: null, blogTitle: "", logs: [], loading: false }); }}>
          <div className="modal" style={{ maxWidth: "650px", width: "95%" }}>
            <div className="modal-hd">
              <span className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <History size={18} />
                Audit Trail & Action Log: {auditModal.blogTitle}
              </span>
              <button className="modal-x" onClick={() => setAuditModal({ open: false, blogId: null, blogTitle: "", logs: [], loading: false })}>×</button>
            </div>
            <div className="modal-body" style={{ maxHeight: "65vh", overflowY: "auto" }}>
              {auditModal.loading ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--tx3)" }}>Loading audit history...</div>
              ) : auditModal.logs.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--tx3)" }}>No audit log entries recorded for this post yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {auditModal.logs.map((log) => (
                    <div 
                      key={log.id} 
                      style={{ 
                        padding: "12px", 
                        borderRadius: "var(--r)", 
                        border: "1px solid var(--bd)", 
                        background: "var(--bg2)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
                        <span className="badge b-in" style={{ fontSize: "11px", fontWeight: 700 }}>
                          {log.action}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--tx3)" }}>
                          {new Date(log.created_at).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--tx2)" }}>
                        <strong>Action By:</strong> {log.admin_name} <span style={{ color: "var(--tx3)" }}>({log.admin_role})</span>
                      </div>
                      {log.details && (
                        <div style={{ fontSize: "11px", color: "var(--tx)", background: "var(--bg)", padding: "8px", borderRadius: "4px", marginTop: "4px" }}>
                          {log.details.oldStatus && log.details.newStatus && (
                            <div>
                              <strong>Status Transition:</strong> <span className="badge b-mu" style={{ padding: "2px 6px" }}>{log.details.oldStatus}</span> &rarr; <span className="badge b-ok" style={{ padding: "2px 6px" }}>{log.details.newStatus}</span>
                            </div>
                          )}
                          {log.details.review_notes && (
                            <div style={{ marginTop: "4px" }}>
                              <strong>Review Remarks:</strong> <em>{log.details.review_notes}</em>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-ft">
              <button 
                type="button" 
                className="btn btn-ol" 
                onClick={() => setAuditModal({ open: false, blogId: null, blogTitle: "", logs: [], loading: false })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
