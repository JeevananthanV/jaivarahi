# Varahi React Backend

## Overview
This is the Node.js Express backend for the Varahi application. It handles payment processing, event bookings, donations, sponsorships, and user registrations, securely communicating with a MySQL database and integrating with external payment gateways like Razorpay.

## Database Schema (MySQL)

### Tables Overview
- **donations**: Stores donation records, user details, and payment status.
- **prasadham_bookings**: Detailed records of prasadham bookings and Razorpay transaction details.
- **special_royal_bookings**: Records for special royal event bookings.
- **bookings**: General event bookings.
- **booking_items**: Specific categories/items selected within a general booking.
- **av2_free_entries**: Free entry registrations for Asta Varahi events.
- **av2_stall_bookings**: Stall bookings for businesses during events.
- **av2_vip_access**: VIP access pass purchases including payment info.
- **av2_sponsorships**: Sponsorship interests and budgets.

### Relationships
- **bookings** have many **booking_items** (One-to-Many). Linked via `booking_id` in `booking_items` referencing `id` in `bookings`.

---

### Detailed Schema

#### `donations`
| Name | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary Key, Auto Increment |
| `order_id` | VARCHAR(64) | Unique order ID |
| `payment_id` | VARCHAR(64) | Payment Gateway ID (e.g., Razorpay) |
| `payment_signature` | VARCHAR(255) | Signature for payment verification |
| `amount_inr` | DECIMAL(10,2) | Donation amount in INR |
| `amount_paise` | INT | Amount in paise for gateway processing |
| `phone` | VARCHAR(20) | User phone number |
| `name` | VARCHAR(255) | User name |
| `city` | VARCHAR(255) | User city |
| `status` | ENUM | Payment status ('created', 'paid', 'failed') |
| `failure_reason` | VARCHAR(255) | Reason if payment failed |
| `created_at` | TIMESTAMP | Record creation time |
| `paid_at` | TIMESTAMP | Time of successful payment |
| `failed_at` | TIMESTAMP | Time of failed payment |

#### `bookings`
| Name | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary Key, Auto Increment |
| `primary_name` | VARCHAR(255) | Primary person's name |
| `phone` | VARCHAR(20) | Contact number |
| `address` | TEXT | Contact address |
| `pincode` | VARCHAR(12) | Area Pincode |
| `gothuram` | VARCHAR(255) | Spiritual lineage/Gothuram |
| `event_title` | VARCHAR(255) | Name of the event |
| `transaction_id` | VARCHAR(64) | Transaction reference |
| `total_amount` | DECIMAL(10,2) | Total booking amount |
| `order_id` | VARCHAR(64) | Gateway Order ID |
| `payment_id` | VARCHAR(64) | Gateway Payment ID |
| `razorpay_signature` | VARCHAR(255)| Razorpay verification signature |
| `created_at` | TIMESTAMP | Record creation time |

#### `booking_items`
| Name | Type | Description |
| :--- | :--- | :--- |
| `id` | INT | Primary Key |
| `booking_id` | INT | Foreign key to `bookings` table |
| `category_name` | VARCHAR(255) | Item/Category booked |
| `category_price` | DECIMAL(10,2) | Price of the specific item |
| `created_at` | TIMESTAMP | Record creation time |

*(Other tables such as `prasadham_bookings`, `special_royal_bookings`, `av2_free_entries`, etc., follow a similar structure containing event-specific registration and payment details).*

---

## Key SQL Queries to Document

### 1. Create a New Donation Record
```sql
INSERT INTO donations (order_id, amount_inr, amount_paise, phone, name, city, status) 
VALUES (?, ?, ?, ?, ?, ?, 'created');
```

### 2. Update Payment Status upon Success
```sql
UPDATE donations 
SET payment_id = ?, payment_signature = ?, status = 'paid', paid_at = CURRENT_TIMESTAMP 
WHERE order_id = ?;
```

### 3. Fetch Bookings with Items (JOIN)
```sql
SELECT b.primary_name, b.phone, b.total_amount, i.category_name, i.category_price
FROM bookings b
JOIN booking_items i ON b.id = i.booking_id
WHERE b.id = ?;
```

---

## Environment Variables (.env)

Create a `.env` file in the root of the backend directory with the following configuration:

```env
# Server Config
PORT=5000
NODE_ENV=production

# Database Config (MySQL)
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=varahi_db
DB_PORT=3306

# Razorpay Config
VITE_RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Admin Auth
ADMIN_JWT_SECRET=your_jwt_secret_key_min_32_chars_long
ADMIN_EMAIL=admin@jaivarahi.org
ADMIN_PASSWORD_HASH=bcrypt_hashed_password

# CORS Configuration
CORS_ORIGINS=https://jaivarahi.org,https://www.jaivarahi.org
FRONTEND_ORIGIN=https://jaivarahi.org
```

---

## Quick Start Guide

Follow these steps to set up the backend and database locally.

### 1. Database Setup
1. Ensure MySQL is installed and running on your local machine.
2. Log in to MySQL: `mysql -u root -p`
3. Create the database: `CREATE DATABASE varahi_db;`
4. Select the database: `USE varahi_db;`
5. Import the schema (from the backend directory):
   ```bash
   mysql -u root -p varahi_db < db/schema.sql
   ```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the frontend first:
   ```bash
   cd ../frontend
   npm install
   npm run build
   cd ../backend
   ```
4. Configure Environment Variables:
   - Create a `.env` file based on the environment variables section above.
   - Fill in your database credentials, Razorpay keys, and admin JWT secret.
5. Start the Server:
   - **Development**: `npm run dev`
   - **Production**: `NODE_ENV=production npm start`

The server will serve both the frontend (from `../frontend/dist`) and backend APIs. Ensure the frontend build exists before starting the server.

---

## Production Deployment Checklist

- [ ] Build frontend: `cd frontend && npm run build`
- [ ] Set `NODE_ENV=production` in environment
- [ ] Configure production database credentials in `.env`
- [ ] Set production Razorpay keys in `.env`
- [ ] Generate and set `ADMIN_JWT_SECRET` (32+ character random string)
- [ ] Hash admin password with bcrypt and set `ADMIN_PASSWORD_HASH`
- [ ] Update `CORS_ORIGINS` to production domain(s)
- [ ] Ensure `frontend/dist` exists and is deployed with the backend
- [ ] Test health endpoint: `GET /health`
- [ ] Verify admin login works: `POST /api/admin/login`
- [ ] Test payment endpoints with Razorpay production keys
- [ ] Set up database backups and monitoring
