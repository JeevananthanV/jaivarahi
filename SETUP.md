# Sri Varahi Jothida Vidyalayam — Setup & Operations Guide

Welcome to the **Sri Varahi Jothida Vidyalayam** full-stack setup guide. This document provides step-by-step instructions for running the astrology portal, academy course management, student admissions, digital certificate verification, and admin dashboard.

- **GitHub Repository**: [https://github.com/JeevananthanV/jaivarahi](https://github.com/JeevananthanV/jaivarahi)
- **Author**: Jeevananthan V

---

## 📋 System Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MySQL**: 8.0 or higher (or MariaDB 10.4+)
- **Git**: v2.30.0 or higher

---

## 📥 1. Clone the Repository

```bash
git clone https://github.com/JeevananthanV/jaivarahi.git
cd jaivarahi
```

---

## 🗄️ 2. Database Configuration

1. Launch your MySQL service (e.g. XAMPP or native MySQL).
2. Create the application database:

```sql
CREATE DATABASE IF NOT EXISTS jaivarahi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## ⚙️ 3. Environment Variables Configuration

### Backend Environment (`backend/.env`)

Create a `.env` file in `backend/`:

```env
PORT=5005
NODE_ENV=development
CLIENT_URL=http://localhost:5176

# Database Settings
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=jaivarahi_db
DB_PORT=3306

# Authentication & Security
JWT_SECRET=sri_varahi_jothida_vidyalayam_jwt_secret_2026
ADMIN_USER=admin
ADMIN_PASS=varahi@2026
```

### Frontend Environment (`frontend/.env`)

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5005
```

---

## 📦 4. Install Dependencies & Run Database Migrations

```bash
# 1. Backend dependencies and migration
cd backend
npm install
node migrations/vidyalayam_migration.js

# 2. Frontend dependencies
cd ../frontend
npm install
cd ..
```

---

## 🚀 5. Running the Application Locally

### Terminal 1: Backend Server (Port 5005)

```bash
cd backend
node server.js
```
The server will listen at: `http://localhost:5005`
- Vidyalayam API: `http://localhost:5005/api/vidyalayam`
- Admin Operations: `http://localhost:5005/api/admin`

### Terminal 2: Frontend Client (Port 5176)

```bash
cd frontend
npm run dev -- --port 5176
```
Open your browser at: `http://localhost:5176`

---

## 🔐 6. Portals & Access Endpoints

| Feature | URL | Description |
|---|---|---|
| **Vidyalayam Public Portal** | `http://localhost:5176/vidyalayam` | Course brochure & student enrollment |
| **Astrology Consultation** | `http://localhost:5176/jothidam` | Horoscope booking & consultations |
| **Certificate Verification** | `http://localhost:5176/verify-certificate` | Public QR code verification |
| **Admin Operations Center** | `http://localhost:5176/admin` | Admissions, syllabus, certificate manager |

---

## 🏗️ 7. Production Build

```bash
cd frontend
npm run build
```
Output is compiled into `frontend/dist/`.

---

## 🛠️ Troubleshooting

- **Database Table Not Found**: Run `node backend/migrations/vidyalayam_migration.js` to ensure all courses and admissions tables are created.
- **Port Conflict (5005)**: Change `PORT=5005` in `backend/.env` and update `VITE_API_URL` in `frontend/.env`.

