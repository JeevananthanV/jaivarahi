-- 1. General Donations Table
CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL UNIQUE,
    payment_id VARCHAR(64) DEFAULT NULL,
    payment_signature VARCHAR(255) DEFAULT NULL,
    amount_inr DECIMAL(10,2) NOT NULL,
    amount_paise INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(255) DEFAULT NULL,
    city VARCHAR(255) DEFAULT NULL,
    status ENUM('created','paid','failed') NOT NULL DEFAULT 'created',
    failure_reason VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL DEFAULT NULL,
    failed_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_donations_order (order_id),
    INDEX idx_donations_payment (payment_id),
    INDEX idx_donations_phone (phone),
    INDEX idx_donations_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Prasadham Bookings Table
CREATE TABLE IF NOT EXISTS prasadham_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_title VARCHAR(255) DEFAULT NULL,
    primary_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    pincode VARCHAR(12) NOT NULL,
    gothuram VARCHAR(255) DEFAULT NULL,
    family_members JSON NOT NULL,
    selected_categories JSON NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING|PROCESSING|DISPATCHED|DELIVERED|CANCELLED',
    order_id VARCHAR(64) NOT NULL,
    payment_id VARCHAR(64) NOT NULL,
    razorpay_signature VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_prasadham_phone (phone),
    INDEX idx_prasadham_order (order_id),
    INDEX idx_prasadham_payment (payment_id),
    INDEX idx_prasadham_status (booking_status),
    INDEX idx_prasadham_delivery (delivery_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Special Royal Bookings Table
CREATE TABLE IF NOT EXISTS special_royal_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_title VARCHAR(255) DEFAULT NULL,
    primary_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    pincode VARCHAR(12) NOT NULL,
    gothuram VARCHAR(255) DEFAULT NULL,
    family_members JSON NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    order_id VARCHAR(64) NOT NULL,
    payment_id VARCHAR(64) NOT NULL,
    razorpay_signature VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_royal_phone (phone),
    INDEX idx_royal_order (order_id),
    INDEX idx_royal_payment (payment_id),
    INDEX idx_royal_status (booking_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Unified Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    primary_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    pincode VARCHAR(12) NOT NULL,
    gothuram VARCHAR(255) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    package_tier INT DEFAULT NULL,
    event_title VARCHAR(255) DEFAULT NULL,
    transaction_id VARCHAR(64) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    order_id VARCHAR(64) NOT NULL,
    payment_id VARCHAR(64) NOT NULL,
    razorpay_signature VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_bookings_phone (phone),
    INDEX idx_bookings_order (order_id),
    INDEX idx_bookings_payment (payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Booking Items (Breakdown for 'bookings' table)
CREATE TABLE IF NOT EXISTS booking_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    category_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_items_booking_id FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_items_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5a. Package Categories (Ashada Navarathiri / Packages)
CREATE TABLE IF NOT EXISTS package_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  items JSON NOT NULL,
  sort_order INT DEFAULT 0,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_package_cats_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. AV2 Free Entries
CREATE TABLE IF NOT EXISTS av2_free_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    av2_full_name VARCHAR(255) NOT NULL,
    av2_phone VARCHAR(20) NOT NULL,
    av2_email VARCHAR(255) DEFAULT NULL,
    av2_city VARCHAR(255) NOT NULL,
    av2_tickets INT NOT NULL,
    ticket_code VARCHAR(20) UNIQUE DEFAULT NULL,
    booking_status VARCHAR(20) DEFAULT 'CONFIRMED',
    attendance_status ENUM('PENDING', 'CHECKED_IN') NOT NULL DEFAULT 'PENDING',
    check_in_time TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_av2_free_phone (av2_phone),
    INDEX idx_av2_free_ticket (ticket_code),
    INDEX idx_av2_free_attendance (attendance_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. AV2 Stall Bookings
CREATE TABLE IF NOT EXISTS av2_stall_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    av2_full_name VARCHAR(255) NOT NULL,
    av2_phone VARCHAR(20) NOT NULL,
    av2_email VARCHAR(255) DEFAULT NULL,
    av2_city VARCHAR(255) NOT NULL,
    av2_business_name VARCHAR(255) NOT NULL,
    av2_product_type VARCHAR(255) NOT NULL,
    av2_stall_preference VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_av2_stalls_phone (av2_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. AV2 VIP Access
CREATE TABLE IF NOT EXISTS av2_vip_access (
    id INT AUTO_INCREMENT PRIMARY KEY,
    av2_full_name VARCHAR(255) NOT NULL,
    av2_phone VARCHAR(20) NOT NULL,
    av2_email VARCHAR(255) DEFAULT NULL,
    av2_city VARCHAR(255) NOT NULL,
    av2_vip_passes INT NOT NULL,
    ticket_code VARCHAR(20) UNIQUE DEFAULT NULL,
    order_id VARCHAR(64) DEFAULT NULL,
    payment_id VARCHAR(64) DEFAULT NULL,
    amount DECIMAL(10,2) DEFAULT NULL,
    booking_status VARCHAR(20) DEFAULT 'PENDING',
    attendance_status ENUM('PENDING', 'CHECKED_IN') NOT NULL DEFAULT 'PENDING',
    check_in_time TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_av2_vip_phone (av2_phone),
    INDEX idx_av2_vip_ticket (ticket_code),
    INDEX idx_av2_vip_order (order_id),
    INDEX idx_av2_vip_payment (payment_id),
    INDEX idx_av2_vip_attendance (attendance_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. AV2 Sponsorships
CREATE TABLE IF NOT EXISTS av2_sponsorships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    av2_full_name VARCHAR(255) NOT NULL,
    av2_phone VARCHAR(20) NOT NULL,
    av2_email VARCHAR(255) DEFAULT NULL,
    av2_city VARCHAR(255) NOT NULL,
    av2_company_name VARCHAR(255) NOT NULL,
    av2_budget VARCHAR(255) NOT NULL,
    av2_message TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_av2_spons_phone (av2_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Super Admin', 'Admin', 'Event Manager', 'Viewer') NOT NULL DEFAULT 'Viewer',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL DEFAULT NULL,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    action VARCHAR(255) NOT NULL,
    target_resource VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_audit_admin (admin_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_refresh_admin (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Event Entries
CREATE TABLE IF NOT EXISTS event_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_code VARCHAR(20) UNIQUE NOT NULL,
    visitor_name VARCHAR(255) NOT NULL,
    visitor_type ENUM('Free', 'VIP') NOT NULL,
    attendance_status ENUM('PENDING', 'CHECKED_IN') NOT NULL DEFAULT 'PENDING',
    check_in_time TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entries_ticket (ticket_code),
    INDEX idx_entries_attendance (attendance_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Service Bookings (Temple Services / Pooja Bookings)
CREATE TABLE IF NOT EXISTS service_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    preferred_date DATE DEFAULT NULL,
    additional_details TEXT DEFAULT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    email VARCHAR(255) DEFAULT NULL,
    city VARCHAR(255) DEFAULT NULL,
    gothram VARCHAR(255) DEFAULT NULL,
    nakshatram VARCHAR(255) DEFAULT NULL,
    rasi VARCHAR(255) DEFAULT NULL,
    family_members JSON DEFAULT NULL,
    preferred_time VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_svc_bookings_phone (phone),
    INDEX idx_svc_bookings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Jothidam Bookings
CREATE TABLE IF NOT EXISTS jothidam_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_type VARCHAR(50) NOT NULL,
  purpose VARCHAR(255) DEFAULT NULL,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  whatsapp_number VARCHAR(20) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  gender VARCHAR(20) DEFAULT NULL,
  date_of_birth DATE DEFAULT NULL,
  time_of_birth VARCHAR(50) DEFAULT NULL,
  birth_place VARCHAR(255) DEFAULT NULL,
  current_location VARCHAR(255) DEFAULT NULL,
  preferred_language VARCHAR(50) DEFAULT NULL,
  gothram VARCHAR(255) DEFAULT NULL,
  nakshatra VARCHAR(255) DEFAULT NULL,
  rasi VARCHAR(255) DEFAULT NULL,
  occupation VARCHAR(255) DEFAULT NULL,
  marital_status VARCHAR(50) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  alternate_number VARCHAR(20) DEFAULT NULL,
  existing_horoscope VARCHAR(500) DEFAULT NULL,
  consultation_mode VARCHAR(50) NOT NULL,
  mode_detail_json JSON DEFAULT NULL,
  appointment_date DATE DEFAULT NULL,
  appointment_time VARCHAR(50) DEFAULT NULL,
  alternative_date DATE DEFAULT NULL,
  alternative_time VARCHAR(50) DEFAULT NULL,
  urgency VARCHAR(20) DEFAULT 'Medium',
  special_notes TEXT DEFAULT NULL,
  documents_json JSON DEFAULT NULL,
  service_price DECIMAL(10,2) DEFAULT 0,
  consultation_charge DECIMAL(10,2) DEFAULT 0,
  travel_charge DECIMAL(10,2) DEFAULT 0,
  gst DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  coupon_code VARCHAR(50) DEFAULT NULL,
  grand_total DECIMAL(10,2) DEFAULT 0,
  order_id VARCHAR(64) DEFAULT NULL,
  payment_id VARCHAR(64) DEFAULT NULL,
  razorpay_signature VARCHAR(255) DEFAULT NULL,
  payment_status ENUM('PENDING','PAID','FAILED','REFUNDED') DEFAULT 'PENDING',
  status ENUM('DRAFT','SUBMITTED','PAYMENT_PENDING','PAYMENT_VERIFIED','ASSIGNED','SCHEDULED','CONSULTATION_IN_PROGRESS','REPORT_GENERATED','QUALITY_REVIEW','DELIVERED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  assigned_astrologer_id INT DEFAULT NULL,
  meeting_link VARCHAR(500) DEFAULT NULL,
  meeting_password VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_jothidam_phone (phone),
  INDEX idx_jothidam_status (status),
  INDEX idx_jothidam_payment (payment_status),
  INDEX idx_jothidam_order (order_id),
  INDEX idx_jothidam_pay_id (payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Astrologers
CREATE TABLE IF NOT EXISTS astrologers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  experience_years INT DEFAULT 0,
  specialization JSON DEFAULT NULL,
  languages JSON DEFAULT NULL,
  working_hours JSON DEFAULT NULL,
  leaves JSON DEFAULT NULL,
  consultation_modes JSON DEFAULT NULL,
  rating DECIMAL(3,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_astrologers_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Jothidam Pricing Rules
CREATE TABLE IF NOT EXISTS jothidam_pricing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_type VARCHAR(50) NOT NULL,
  consultation_mode VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_jothidam_pricing_lookup (service_type, consultation_mode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking Timeline (audit trail)
CREATE TABLE IF NOT EXISTS jothidam_booking_timeline (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  status ENUM('DRAFT','SUBMITTED','PAYMENT_PENDING','PAYMENT_VERIFIED','ASSIGNED','SCHEDULED','CONSULTATION_IN_PROGRESS','REPORT_GENERATED','QUALITY_REVIEW','DELIVERED','COMPLETED','CANCELLED') NOT NULL,
  actor VARCHAR(50) NOT NULL COMMENT 'customer|admin|astrologer',
  actor_id INT DEFAULT NULL,
  note TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES jothidam_bookings(id) ON DELETE CASCADE,
  INDEX idx_jothidam_timeline_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications
CREATE TABLE IF NOT EXISTS jothidam_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  recipient_type ENUM('customer','astrologer','admin') NOT NULL,
  recipient_id INT DEFAULT NULL,
  type ENUM('booking_confirmed','payment_received','consultation_scheduled','meeting_reminder','report_ready','booking_completed','new_booking','payment_pending','payment_success','report_uploaded','refund_request') NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES jothidam_bookings(id) ON DELETE CASCADE,
  INDEX idx_jothidam_notif_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports
CREATE TABLE IF NOT EXISTS jothidam_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  astrologer_id INT NOT NULL,
  report_type ENUM('PDF','AUDIO','VIDEO','IMAGE','NOTES') NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  notes TEXT DEFAULT NULL,
  status ENUM('PENDING','APPROVED','REJECTED','CHANGES_REQUESTED') DEFAULT 'PENDING',
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES jothidam_bookings(id) ON DELETE CASCADE,
  INDEX idx_jothidam_reports_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Blog Management System
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content MEDIUMTEXT NOT NULL,
    snippet VARCHAR(1000) DEFAULT NULL,
    thumbnail_url VARCHAR(500) DEFAULT NULL,
    author_id INT NULL,
    category VARCHAR(255) DEFAULT NULL,
    tags VARCHAR(500) DEFAULT NULL,
    slug VARCHAR(255) DEFAULT NULL UNIQUE,
    status ENUM('Draft', 'Pending', 'Approved', 'Published', 'Rejected') NOT NULL DEFAULT 'Draft',
    review_notes TEXT DEFAULT NULL,
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_blogs_author FOREIGN KEY (author_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    CONSTRAINT fk_blogs_reviewer FOREIGN KEY (reviewed_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_blogs_status (status),
    INDEX idx_blogs_slug (slug),
    INDEX idx_blogs_created (created_at),
    INDEX idx_blogs_reviewed_by (reviewed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Devotee Details Registration
CREATE TABLE IF NOT EXISTS devotee_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    postal_address TEXT DEFAULT NULL,
    gothram VARCHAR(100) DEFAULT NULL,
    family_members JSON DEFAULT NULL,
    married_status VARCHAR(20) DEFAULT 'unmarried',
    wedding_date DATE DEFAULT NULL,
    email_address VARCHAR(255) DEFAULT NULL,
    father_name VARCHAR(255) DEFAULT NULL,
    mother_name VARCHAR(255) DEFAULT NULL,
    note TEXT DEFAULT NULL,
    added_by VARCHAR(255) DEFAULT 'Public',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_devotee_contact (contact),
    INDEX idx_devotee_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 1. Add missing status columns to prasadham_bookings
ALTER TABLE `prasadham_bookings`
ADD COLUMN IF NOT EXISTS `booking_status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS `delivery_status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING|PROCESSING|DISPATCHED|DELIVERED|CANCELLED';

-- 2. Add missing status column to special_royal_bookings
ALTER TABLE `special_royal_bookings`
ADD COLUMN IF NOT EXISTS `booking_status` VARCHAR(20) NOT NULL DEFAULT 'PENDING';

ALTER TABLE `blogs`
ADD COLUMN IF NOT EXISTS `title_en` VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `title_ta` VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `content_en` MEDIUMTEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `content_ta` MEDIUMTEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `snippet_en` VARCHAR(1000) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `snippet_ta` VARCHAR(1000) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `gallery_urls` JSON DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `meta_title` VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `meta_description` VARCHAR(500) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `focus_keyword` VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `review_notes` TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `reviewed_by` INT NULL,
ADD COLUMN IF NOT EXISTS `reviewed_at` TIMESTAMP NULL DEFAULT NULL,
MODIFY COLUMN `status` ENUM('Draft', 'Pending', 'Approved', 'Published', 'Rejected') NOT NULL DEFAULT 'Draft';

-- 16. Razorpay Webhook Logs (Idempotency, Audit, & Replay Tracking)
CREATE TABLE IF NOT EXISTS webhook_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    order_id VARCHAR(100) DEFAULT NULL,
    payment_id VARCHAR(100) DEFAULT NULL,
    payload JSON NOT NULL,
    status ENUM('PENDING', 'PROCESSED', 'FAILED', 'IGNORED') NOT NULL DEFAULT 'PENDING',
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_webhook_event_id (event_id),
    INDEX idx_webhook_order_id (order_id),
    INDEX idx_webhook_payment_id (payment_id),
    INDEX idx_webhook_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

