import React, { useState, useEffect, useCallback } from "react";
import {
  Upload, FolderPlus, Search, Filter, Image as ImageIcon,
  Film, FileText, Trash2, Copy, ExternalLink, RefreshCw,
  ChevronRight, X, AlertCircle, CheckCircle2
} from "lucide-react";
import adminApi from "./adminApi";

const MediaLibrary = ({ onSelectMedia, selectedMediaIds = [], multiple = false, allowUpload = true }) => {
  const [media, setMedia] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);

  const perPage = 20;

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: perPage,
        ...(search ? { search } : {}),
        ...(typeFilter !== "all" ? { type: typeFilter } : {}),
        ...(folderFilter ? { folder_id: folderFilter } : {}),
      };
      const data = await adminApi.getMedia(params);
      setMedia(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch media:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, folderFilter]);

  const fetchFolders = async () => {
    try {
      const data = await adminApi.getMediaFolders();
      setFolders(data || []);
    } catch (err) {
      console.error("Failed to fetch folders:", err);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      formData.append("folder_id", folderFilter || "");
      const res = await adminApi.uploadMedia(formData);
      alert(`Uploaded ${res.uploaded} of ${files.length} images`);
      fetchMedia();
      setShowUploadModal(false);
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    const name = e.target.folderName.value.trim();
    if (!name) return;
    try {
      await adminApi.createMediaFolder({ name, parent_id: folderFilter });
      fetchFolders();
      setShowFolderModal(false);
      e.target.reset();
    } catch (err) {
      alert("Failed to create folder: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = useCallback(async (mediaId) => {
    if (!window.confirm("Delete this image? This action cannot be undone.")) return;
    try {
      await adminApi.deleteMedia(mediaId);
      fetchMedia();
      if (previewMedia?.id === mediaId) setPreviewMedia(null);
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.error || err.message));
    }
  }, [fetchMedia, previewMedia]);

  const handleSelect = (item) => {
    if (!onSelectMedia) return;
    if (multiple) {
      const isSelected = selectedMediaIds.includes(item.id);
      if (isSelected) {
        onSelectMedia(selectedMediaIds.filter((id) => id !== item.id));
      } else {
        onSelectMedia([...selectedMediaIds, item.id]);
      }
    } else {
      onSelectMedia(item.id);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        {allowUpload && (
          <>
            <button className="btn btn-pr" onClick={() => setShowUploadModal(true)}>
              <Upload size={14} /> Upload
            </button>
            <button className="btn btn-ol" onClick={() => setShowFolderModal(true)}>
              <FolderPlus size={14} /> New Folder
            </button>
          </>
        )}
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--tx3)" }} />
          <input
            className="fi"
            style={{ paddingLeft: "32px", width: "100%" }}
            placeholder="Search media..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="fi"
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          style={{ width: "auto" }}
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="application">Documents</option>
        </select>
      </div>

      {/* Folder breadcrumb + filter */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <button
          className={`btn ${!folderFilter ? "btn-pr" : "btn-ol"}`}
          onClick={() => setFolderFilter(null)}
          style={{ padding: "4px 10px", fontSize: "12px" }}
        >
          All
        </button>
        {folders.map((folder) => (
          <button
            key={folder.id}
            className={`btn ${folderFilter === folder.id ? "btn-pr" : "btn-ol"}`}
            onClick={() => setFolderFilter(folderFilter === folder.id ? null : folder.id)}
            style={{ padding: "4px 10px", fontSize: "12px" }}
          >
            {folder.name}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--tx3)" }}>Loading media...</div>
      ) : media.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--tx3)" }}>
          <ImageIcon size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
          <div>No media found.</div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: "12px"
        }}>
          {media.map((item) => {
            const isSelected = selectedMediaIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  border: isSelected ? "2px solid var(--pr)" : "1px solid var(--bd)",
                  borderRadius: "var(--r)",
                  overflow: "hidden",
                  cursor: "pointer",
                  background: "var(--bg2)",
                }}
              >
                <img
                  src={item.thumbnail_url || item.optimized_url || item.original_url}
                  alt={item.alt_text || item.original_name}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {isSelected && (
                  <div style={{
                    position: "absolute", top: "4px", right: "4px",
                    background: "var(--pr)", color: "#fff", borderRadius: "50%",
                    width: "20px", height: "20px", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: "12px"
                  }}>
                    ✓
                  </div>
                )}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                  padding: "4px 8px", fontSize: "10px", color: "#fff",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                }}>
                  {item.original_name}
                </div>
                <div style={{ position: "absolute", top: "4px", left: "4px", display: "flex", gap: "4px" }}>
                  <button
                    className="btn btn-ol btn-sm"
                    onClick={(e) => { e.stopPropagation(); setPreviewMedia(item); }}
                    style={{ padding: "2px 6px", fontSize: "10px", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none" }}
                    title="Preview"
                  >
                    <ExternalLink size={10} />
                  </button>
                  <button
                    className="btn btn-ol btn-sm"
                    onClick={(e) => { e.stopPropagation(); copyUrl(item.optimized_url || item.original_url); }}
                    style={{ padding: "2px 6px", fontSize: "10px", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none" }}
                    title="Copy URL"
                  >
                    <Copy size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "8px" }}>
          <button className="btn btn-ol btn-sm" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
            Previous
          </button>
          <span style={{ alignSelf: "center", fontSize: "12px", color: "var(--tx3)" }}>
            Page {page} of {totalPages}
          </span>
          <button className="btn btn-ol btn-sm" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
            Next
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-ov" onClick={() => setShowUploadModal(false)}>
          <div className="modal" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <span className="modal-title">Upload Images</span>
              <button className="modal-x" onClick={() => setShowUploadModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: "12px", fontSize: "12px", color: "var(--tx3)" }}>
                Supports: JPG, PNG, WebP, AVIF, GIF. Max 10MB per file. Max 20 files per upload.
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                disabled={uploading}
                className="fi"
                style={{ width: "100%" }}
              />
              {uploading && <div style={{ marginTop: "8px", color: "var(--tx3)" }}>Uploading and processing...</div>}
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="modal-ov" onClick={() => setShowFolderModal(false)}>
          <div className="modal" style={{ maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <span className="modal-title">Create New Folder</span>
              <button className="modal-x" onClick={() => setShowFolderModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateFolder}>
              <div className="modal-body">
                <input type="text" name="folderName" className="fi" placeholder="Folder name" required style={{ width: "100%" }} />
              </div>
              <div className="modal-ft">
                <button type="button" className="btn btn-ol" onClick={() => setShowFolderModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-pr">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMedia && (
        <div className="modal-ov" onClick={() => setPreviewMedia(null)}>
          <div className="modal" style={{ maxWidth: "700px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <span className="modal-title">Image Preview</span>
              <button className="modal-x" onClick={() => setPreviewMedia(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <img
                  src={previewMedia.optimized_url || previewMedia.original_url}
                  alt={previewMedia.alt_text || previewMedia.original_name}
                  style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "var(--r)", objectFit: "contain" }}
                />
              </div>
              <div style={{ display: "grid", gap: "8px", fontSize: "13px" }}>
                <div><strong>File:</strong> {previewMedia.original_name}</div>
                <div><strong>Size:</strong> {(previewMedia.file_size / 1024 / 1024).toFixed(2)} MB</div>
                {previewMedia.width && previewMedia.height && (
                  <div><strong>Dimensions:</strong> {previewMedia.width} × {previewMedia.height}</div>
                )}
                <div><strong>Type:</strong> {previewMedia.mime_type}</div>
                <div>
                  <strong>Folder:</strong> {previewMedia.folder_name || "Uncategorized"} {previewMedia.folder_path ? `(${previewMedia.folder_path})` : ""}
                </div>
                <div>
                  <strong>Alt Text:</strong> {previewMedia.alt_text || "—"}
                </div>
                <div>
                  <strong>Caption:</strong> {previewMedia.caption || "—"}
                </div>
              </div>
            </div>
            <div className="modal-ft" style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button className="btn btn-ol" onClick={() => copyUrl(previewMedia.optimized_url || previewMedia.original_url)}>
                <Copy size={14} /> Copy URL
              </button>
              {!onSelectMedia && (
                <button className="btn btn-ol" onClick={() => handleDelete(previewMedia.id)} style={{ color: "var(--er)", borderColor: "var(--er)" }}>
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button className="btn btn-ol" onClick={() => setPreviewMedia(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
