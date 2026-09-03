# Varahi Blog CMS — Media Storage Architecture

## Current State Analysis

### Database Schema (`backend/db/schema.sql`)

**blogs table (lines 383-406):**
- `thumbnail_url VARCHAR(500)` — single featured image URL
- `gallery_urls JSON` — JSON array of gallery image URLs
- Bilingual fields: `title_en`, `title_ta`, `content_en`, `content_ta`, `snippet_en`, `snippet_ta`
- Status workflow: `Draft → Pending → Approved → Published → Rejected`
- Review system: `review_notes`, `reviewed_by`, `reviewed_at`
- Audit logging via `audit_logs` table
- SSE real-time streaming for blog events

**Current problems:**
- No separate `media` table — images stored as plain URL strings
- No `alt_text`, `caption`, `folder_id`, or metadata on images
- No image optimization pipeline
- No image dimension tracking
- No delete protection (broken image references on delete)
- No media reuse across blogs/pages/events
- Flat file storage in `backend/uploads/` with no folder hierarchy

---

## Backend Upload Flow (`backend/routes/blogRoutes.js`)

```
POST /api/admin/blogs/upload
     │
     ▼
Multer diskStorage
     │
     ├── destination: backend/uploads/  (flat directory)
     ├── filename: {sanitized}-{timestamp}-{random}.{ext}
     └── limits: 5MB, jpeg/jpg/png/webp only
     │
     ▼
Returns: { url: "/api/uploads/{filename}" }
```

**Problems:**
- No image processing (no resize, no WebP/AVIF conversion)
- No magic bytes / MIME validation beyond extension check
- No dimension checking
- No folder/category organization
- No collision-safe naming (random suffix helps but not structured)
- No database record created — URL is just returned to frontend

---

## Frontend Image Handling

### BlogManagement.jsx
- `handleImageUpload`: uploads single thumbnail → sets `thumbnail_url`
- `handleGalleryUpload`: uploads multiple files → appends to `gallery_urls[]`
- Gallery images displayed as 80×50px thumbnails with remove button
- No preview of image metadata (size, dimensions, alt text)
- No folder/category selection during upload
- No image search/reuse from library

### BlogDetail.jsx (public)
- Gallery grid from `gallery_urls` JSON array
- No lazy loading, no srcset, no responsive images
- Thumbnail from `thumbnail_url` — full resolution image used everywhere

---

## Recommended Architecture

### 1. Media Database Schema

```sql
CREATE TABLE IF NOT EXISTS media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,

    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,

    width INT DEFAULT NULL,
    height INT DEFAULT NULL,

    storage_provider VARCHAR(50) DEFAULT 'local',
    storage_path TEXT NOT NULL,

    original_url TEXT NOT NULL,
    optimized_url TEXT DEFAULT NULL,
    thumbnail_url TEXT DEFAULT NULL,

    alt_text VARCHAR(500) DEFAULT NULL,
    caption TEXT DEFAULT NULL,

    folder_id BIGINT NULL,

    uploaded_by BIGINT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_media_folder (folder_id),
    INDEX idx_media_uploaded_by (uploaded_by),
    INDEX idx_media_type (mime_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Folder System Schema

```sql
CREATE TABLE IF NOT EXISTS media_folders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,

    parent_id BIGINT NULL,

    path TEXT NOT NULL,

    sort_order INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_media_folders_parent (parent_id),
    INDEX idx_media_folders_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Blog-Media Relationship

```sql
-- Replace gallery_urls JSON with proper relationship
CREATE TABLE IF NOT EXISTS blog_media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    blog_id BIGINT NOT NULL,
    media_id BIGINT NOT NULL,

    is_featured BOOLEAN DEFAULT FALSE,

    sort_order INT DEFAULT 0,
    caption TEXT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE RESTRICT,

    INDEX idx_blog_media_blog (blog_id),
    INDEX idx_blog_media_media (media_id),
    UNIQUE KEY uk_blog_media_unique (blog_id, media_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**blogs table changes:**
- Remove `gallery_urls` column (migrate data first)
- Keep `thumbnail_url` for backward compatibility or replace with `featured_media_id BIGINT NULL`

### 4. Image Processing Pipeline

```
USER UPLOAD
     │
     ▼
Validate
     │
     ├── Magic bytes (not just extension)
     ├── File size (max 10MB)
     ├── Dimensions (max 8000×8000)
     └── Security (no executable files)
     │
     ▼
Generate Safe Filename
     │
     └── media_{uuid4}.{ext}
     │
     ▼
Sharp Processing
     │
     ├── Original → preserve (max 8000×8000)
     ├── WebP @ 80% → ~300-800KB
     ├── Medium 1200px → ~150-300KB
     └── Thumbnail 400px → ~30-80KB
     │
     ▼
Storage (cPanel)
     │
     ├── /media/originals/{year}/{month}/
     ├── /media/optimized/{year}/{month}/
     └── /media/thumbnails/{year}/{month}/
     │
     ▼
Database Record
     │
     ├── original_url
     ├── optimized_url
     ├── thumbnail_url
     ├── width, height
     └── alt_text, caption, folder_id
```

**Sharp configuration:**
```javascript
// Generate WebP optimized version
await sharp(inputPath)
  .resize(1920, null, { withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile(optimizedPath);

// Generate medium version
await sharp(inputPath)
  .resize(1200, null, { withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile(mediumPath);

// Generate thumbnail
await sharp(inputPath)
  .resize(400, null, { withoutEnlargement: true })
  .webp({ quality: 80 })
  .toFile(thumbnailPath);
```

### 5. Folder Structure

```
/media
  /temple
      /history
      /architecture
      /darshan

  /festivals
      /panchami
      /navaratri
      /ashada-navaratri
      /tamil-new-year

  /pooja
      /abhishekam
      /homam
      /archana
      /special-poojas

  /events
      /2024
      /2025
      /2026

  /blogs
      /spiritual-wisdom
      /devotee-stories
      /festival-blogs

  /banners
      /homepage
      /sidebar

  /gallery
      /temple
      /festivals
      /devotees
```

### 6. Backend API Changes

**New endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/media/upload` | Upload single/multiple images with processing |
| GET | `/api/admin/media` | List media (filterable by folder, type, search) |
| GET | `/api/admin/media/:id` | Get single media details |
| PUT | `/api/admin/media/:id` | Update media metadata (alt_text, caption, folder) |
| DELETE | `/api/admin/media/:id` | Delete with usage check |
| POST | `/api/admin/media/folders` | Create folder |
| GET | `/api/admin/media/folders` | List folder tree |
| GET | `/api/admin/media/usage/:id` | Check where media is used |
| POST | `/api/admin/media/replace/:id` | Replace image (update all references) |

**Modified endpoints:**

| Endpoint | Change |
|----------|--------|
| `POST /api/admin/blogs` | Accept `featured_media_id` and `media_ids[]` instead of `thumbnail_url` + `gallery_urls[]` |
| `PUT /api/admin/blogs/:id` | Same — use media IDs |
| `GET /api/blogs/:id` | Return resolved media URLs |

### 7. Delete Protection Flow

```
Admin clicks Delete on Media
     │
     ▼
Check Usage
     │
     ├── blogs (thumbnail + blog_media)
     ├── events (banner images)
     ├── services (image_path)
     ├── banners table
     ├── pages table
     └── any other entity with media references
     │
     ▼
If used:
     │
     ├── Show modal: "This image is used in:"
     ├── List all usages (e.g., "Varahi Panchami Blog", "Homepage Banner")
     ├── Options:
     │   ├── [Cancel] — abort delete
     │   ├── [Replace References] — select replacement media
     │   └── [Force Delete] — only for Super Admin
     │
If unused:
     │
     └── Confirm delete → remove files + DB record
```

### 8. Image Reuse

```javascript
// Blog creation: pick from existing media library
{
  featured_media_id: 245,  // references existing media record
  media_ids: [245, 247, 248]  // gallery images
}

// Same media_id can be referenced by:
// - blogs (blog_media table)
// - events table (event_banner_media_id)
// - services table (service_image_id)
// - banners table
// - any page content
```

### 9. Frontend: Media Library Component

```
MEDIA LIBRARY

[ Upload ] [ Create Folder ] [ Search ] [ Filter: All | Images | Videos ]

Folders: [All] [Temple] [Festivals] [Pooja] [Events] [Blogs] [Banners]

┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ IMAGE  │ │ IMAGE  │ │ IMAGE  │ │ IMAGE  │
│ 400px  │ │ 400px  │ │ 400px  │ │ 400px  │
│        │ │        │ │        │ │        │
│ [x]   │ │ [x]   │ │ [x]   │ │ [x]   │
└────────┘ └────────┘ └────────┘ └────────┘

Clicking image opens detail panel:

┌───────────────────────────────────────────┐
│ IMAGE DETAIL                              │
│                                           │
│ [Large Preview]                           │
│                                           │
│ File: varahi-panchami.jpg                 │
│ Size: 2.4 MB → Optimized: 450KB           │
│ Dimensions: 4000 × 3000                   │
│ Type: image/jpeg                          │
│                                           │
│ Folder: [Festivals / Panchami ▼]          │
│                                           │
│ Alt Text                                  │
│ [ Varahi Amman Panchami Pooja ]           │
│                                           │
│ Caption                                  │
│ [ Panchami special pooja ceremony ]       │
│                                           │
│ Used in:                                  │
│ ✓ Varahi Panchami Blog                    │
│ ✓ Panchami Festival Page                  │
│ ✓ Homepage Banner                         │
│                                           │
│ [Copy URL] [Replace] [Delete]             │
└───────────────────────────────────────────┘
```

### 10. Security

```javascript
// Backend validation pipeline
const validateUploadedFile = (file) => {
  // 1. Check magic bytes (not just extension)
  const buffer = fs.readFileSync(file.path);
  const magicBytes = buffer.slice(0, 12);

  const validSignatures = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
  };

  // 2. Verify MIME matches magic bytes
  // 3. Check file size < 10MB
  // 4. Check dimensions < 8000×8000
  // 5. Rename to safe filename: media_{uuid4}.webp
  // 6. Never trust original filename
};
```

### 11. Migration Plan

**Phase 1 — Database:**
1. Create `media` table
2. Create `media_folders` table
3. Create `blog_media` table
4. Add `featured_media_id` to `blogs`
5. Migrate existing `thumbnail_url` → `media` record → `featured_media_id`
6. Migrate existing `gallery_urls` JSON → `blog_media` records
7. Keep `thumbnail_url` column temporarily (deprecated, read-only)

**Phase 2 — Backend:**
1. Install `sharp` (already in frontend devDependencies, add to backend)
2. Create `backend/controllers/mediaController.js`
3. Create `backend/routes/mediaRoutes.js`
4. Update `blogController.js` to accept `featured_media_id` + `media_ids[]`
5. Update `blogRoutes.js` with new media endpoints
6. Add delete protection logic

**Phase 3 — Frontend:**
1. Create `frontend/src/components/admin/MediaLibrary.jsx`
2. Create `frontend/src/components/admin/MediaDetailPanel.jsx`
3. Add Media Library to sidebar navigation
4. Update `BlogManagement.jsx` to use media picker instead of raw URL upload
5. Update `adminApi.js` with media endpoints
6. Update `BlogDetail.jsx` to serve optimized images via `srcset`

**Phase 4 — Storage (future):**
1. Migrate from `backend/uploads/` to Cloudflare R2
2. Add CDN layer
3. Update storage paths in `media` table

### 12. Files to Modify

| File | Action |
|------|--------|
| `backend/db/schema.sql` | Add `media`, `media_folders`, `blog_media` tables |
| `backend/package.json` | Add `sharp` dependency |
| `backend/routes/blogRoutes.js` | Add media upload endpoint |
| `backend/controllers/blogController.js` | Use media IDs instead of URLs |
| `backend/routes/mediaRoutes.js` | **NEW** — media API endpoints |
| `backend/controllers/mediaController.js` | **NEW** — media business logic |
| `backend/migrations/add_media_tables.sql` | **NEW** — migration script |
| `frontend/src/components/admin/MediaLibrary.jsx` | **NEW** — media library UI |
| `frontend/src/components/admin/BlogManagement.jsx` | Update to use media picker |
| `frontend/src/components/admin/AdminApp.jsx` | Add media library route |
| `frontend/src/components/admin/Sidebar.jsx` | Add Media Library nav item |
| `frontend/src/components/admin/adminApi.js` | Add media API methods |

---

## API Contract: New Media Upload Response

**Current:**
```json
{ "url": "/api/uploads/blog-image-1234567890-1234.jpg" }
```

**New:**
```json
{
  "id": 245,
  "original_name": "varahi-panchami.jpg",
  "file_name": "media_8f31c2a9.webp",
  "mime_type": "image/webp",
  "file_size": 2458624,
  "width": 4000,
  "height": 3000,
  "original_url": "/media/originals/2026/01/media_8f31c2a9.webp",
  "optimized_url": "/media/optimized/2026/01/media_8f31c2a9.webp",
  "thumbnail_url": "/media/thumbnails/2026/01/media_8f31c2a9.webp",
  "folder_id": 12,
  "folder_path": "festivals/panchami",
  "alt_text": "Varahi Amman Panchami Pooja",
  "caption": "Panchami special pooja ceremony"
}
```

---

## Implementation Checklist

- [ ] Create media, media_folders, blog_media tables
- [ ] Add featured_media_id to blogs
- [ ] Install sharp in backend
- [ ] Build image processing pipeline (original + optimized + thumbnail)
- [ ] Build media upload endpoint with validation
- [ ] Build media library frontend component
- [ ] Add folder management
- [ ] Add delete protection with usage check
- [ ] Migrate existing blog images to new system
- [ ] Update BlogManagement to use media picker
- [ ] Update BlogDetail to serve optimized images
- [ ] Add Media Library to admin sidebar
- [ ] Test with 1000+ images
