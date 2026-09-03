# Temple Service Management System - Architecture Documentation

## 1. Enhanced Database Schema

### Core Tables

```sql
-- Service Categories (One-to-Many with Services)
CREATE TABLE service_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    status ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Services (Many-to-One with Categories)
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    short_description VARCHAR(500) DEFAULT NULL,
    duration VARCHAR(50) DEFAULT NULL,
    available_days VARCHAR(255) DEFAULT NULL,
    benefits TEXT DEFAULT NULL,
    things_to_bring TEXT DEFAULT NULL,
    dress_code VARCHAR(255) DEFAULT NULL,
    image_path VARCHAR(500) DEFAULT NULL,
    amount DECIMAL(10,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    status ENUM('active','inactive') NOT NULL DEFAULT 'active',
    dynamic_fields JSON DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
    UNIQUE KEY uk_service_category_slug (category_id, slug(255))
);

-- Service Bookings (One-to-Many with Members, Payments, Notifications)
CREATE TABLE service_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_number VARCHAR(32) NOT NULL UNIQUE,
    category_id INT DEFAULT NULL,
    service_id INT DEFAULT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    whatsapp_number VARCHAR(20) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    full_address TEXT DEFAULT NULL,
    door_no VARCHAR(50) DEFAULT NULL,
    street VARCHAR(255) DEFAULT NULL,
    area VARCHAR(255) DEFAULT NULL,
    city VARCHAR(255) DEFAULT NULL,
    district VARCHAR(100) DEFAULT NULL,
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(12) DEFAULT NULL,
    date_of_birth DATE DEFAULT NULL,
    gender ENUM('Male','Female','Other') DEFAULT NULL,
    gothram VARCHAR(255) DEFAULT NULL,
    nakshatram VARCHAR(255) DEFAULT NULL,
    rasi VARCHAR(255) DEFAULT NULL,
    preferred_language ENUM('Tamil','English','Sanskrit') DEFAULT 'Tamil',
    priest_preference ENUM('Temple Priest','Specific Priest','Online','Offline') DEFAULT 'Temple Priest',
    purpose ENUM('Marriage','Business','Health','Education','Child Birth','Career','Property','Peace','Other') DEFAULT NULL,
    num_participants INT DEFAULT 1,
    preferred_date DATE DEFAULT NULL,
    preferred_time VARCHAR(50) DEFAULT NULL,
    temple_performs_on VARCHAR(255) DEFAULT NULL,
    number_of_sankalpam_names INT DEFAULT 1,
    service_amount DECIMAL(10,2) DEFAULT 0.00,
    donation_amount DECIMAL(10,2) DEFAULT 0.00,
    coupon_code VARCHAR(50) DEFAULT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    gst_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_id VARCHAR(64) DEFAULT NULL,
    transaction_id VARCHAR(64) DEFAULT NULL,
    booking_metadata JSON DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    status ENUM('PENDING','VERIFIED','PAYMENT_PENDING','PAID','PRIEST_ASSIGNED','SCHEDULED','COMPLETED','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    payment_status ENUM('PENDING','PAID','FAILED','REFUNDED') DEFAULT 'PENDING',
    payment_method VARCHAR(50) DEFAULT NULL,
    priest_assigned_at TIMESTAMP NULL DEFAULT NULL,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    cancelled_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- Booking Members (Family members for sankalpam)
CREATE TABLE service_booking_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    gothram VARCHAR(255) DEFAULT NULL,
    nakshatram VARCHAR(255) DEFAULT NULL,
    rasi VARCHAR(255) DEFAULT NULL,
    relation VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE
);

-- Booking Payments
CREATE TABLE service_booking_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    transaction_id VARCHAR(64) DEFAULT NULL,
    razorpay_order_id VARCHAR(64) DEFAULT NULL,
    razorpay_payment_id VARCHAR(64) DEFAULT NULL,
    razorpay_signature VARCHAR(255) DEFAULT NULL,
    method ENUM('UPI','Card','Net Banking','Cash','Other') DEFAULT NULL,
    service_amount DECIMAL(10,2) DEFAULT 0.00,
    donation_amount DECIMAL(10,2) DEFAULT 0.00,
    coupon_code VARCHAR(50) DEFAULT NULL,
    coupon_discount DECIMAL(10,2) DEFAULT 0.00,
    gst_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('PENDING','PAID','FAILED','REFUNDED') DEFAULT 'PENDING',
    paid_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE service_booking_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    recipient_type ENUM('customer','admin','priest') NOT NULL,
    recipient_id INT DEFAULT NULL,
    channel ENUM('sms','whatsapp','email') NOT NULL,
    template_key VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('queued','sent','failed') DEFAULT 'queued',
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE
);

-- Notification Templates
CREATE TABLE notification_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    channel ENUM('sms','whatsapp','email') NOT NULL,
    subject VARCHAR(255) DEFAULT NULL,
    body_template TEXT NOT NULL,
    variables JSON DEFAULT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 2. Component Architecture

```
frontend/src/
├── components/
│   ├── services/
│   │   ├── DynamicCategoryFields.jsx    # Dynamic form fields by category
│   │   ├── ServiceCard.jsx              # Individual service card
│   │   ├── ServiceModal.jsx             # Service details modal
│   │   └── BookingWizard.jsx            # Multi-step booking flow
│   └── admin/
│       └── services/
│           ├── ServiceDashboard.jsx     # Analytics widgets
│           ├── ServiceBookingManager.jsx # Booking table with tabs
│           ├── ServiceCategoryManager.jsx # Category CRUD
│           ├── ServiceManager.jsx        # Service CRUD
│           └── ServiceReports.jsx        # Reports & export
├── pages/
│   └── Services.jsx                      # Main customer page
└── api/
    └── serviceBookingAPI.js              # API endpoints
```

## 3. API Endpoints

### Customer-Facing
- `POST /api/services/book` - Create booking
- `GET /api/services/categories/active` - List active categories
- `GET /api/services/categories/slug/:slug` - Get category by slug
- `GET /api/services/active` - List active services
- `GET /api/services/slug/:slug` - Get service by slug
- `POST /api/services/payment/create-order/:bookingId` - Create Razorpay order
- `POST /api/services/payment/verify/:bookingId` - Verify payment

### Admin
- `GET /api/admin/services/bookings` - List bookings (paginated, filterable)
- `GET /api/admin/services/bookings/:id` - Get booking details
- `PUT /api/admin/services/bookings/:id` - Update booking
- `POST /api/admin/services/bookings/:id/status` - Update status
- `POST /api/admin/services/bookings/:id/assign-priest` - Assign priest
- `POST /api/admin/services/bookings/:id/send-notification` - Send notification
- `GET /api/admin/services/dashboard` - Dashboard metrics
- `GET /api/admin/services/reports` - Booking reports
- `GET /api/admin/services/export/csv` - Export CSV
- `GET /api/admin/services/categories` - List categories
- `POST /api/admin/services/categories` - Create category
- `PUT /api/admin/services/categories/:id` - Update category
- `DELETE /api/admin/services/categories/:id` - Delete category
- `GET /api/admin/services/list` - List services
- `POST /api/admin/services/list` - Create service
- `PUT /api/admin/services/list/:id` - Update service
- `DELETE /api/admin/services/list/:id` - Delete service
- `GET /api/admin/services/notifications/templates` - List templates
- `PUT /api/admin/services/notifications/templates/:id` - Update template

## 4. Booking Workflow

```
PENDING → VERIFIED → PAYMENT_PENDING → PAID → PRIEST_ASSIGNED → SCHEDULED → COMPLETED
              ↓           ↓              ↓           ↓               ↓
          CANCELLED ← CANCELLED ← REFUNDED ← CANCELLED ← CANCELLED
```

## 5. Dynamic Fields Configuration

Each service category has specific fields stored in `services.dynamic_fields` JSON:

```json
{
  "Abishekam": [
    {"name": "abishekam_type", "label": "Abishekam Type", "type": "select", "options": ["Milk", "Honey", "Ghee"]},
    {"name": "sponsor_material", "label": "Sponsor Material", "type": "select", "options": ["Temple", "Devotee"]}
  ],
  "Homam": [
    {"name": "homam_purpose", "label": "Purpose", "type": "select", "options": ["Business", "Health"]},
    {"name": "people_attending", "label": "Attendees", "type": "number"}
  ]
}
```

## 6. Notification Templates

Pre-configured templates for automated notifications:
- `booking_received` - WhatsApp on booking creation
- `payment_success` - WhatsApp on payment
- `priest_assigned` - WhatsApp when priest assigned
- `booking_confirmed` - SMS confirmation
- `booking_reminder` - SMS reminder before date
- `booking_completed` - Email after completion
- `booking_cancelled` - Email on cancellation