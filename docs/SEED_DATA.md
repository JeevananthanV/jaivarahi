# Seed Dummy Data for Testing

## Overview
This seed script generates 20 service bookings and 20 Jothidam bookings with realistic dummy data for testing and development purposes.

## Files
- `backend/migrations/002_seed_dummy_data.js` - Seed script for dummy data

## Prerequisites
1. Run migration `001_services_schema.js` first to create tables and seed initial categories/services
2. Ensure database connection is configured in `backend/db/pool.js`

## How to Run

```bash
# From the backend directory
cd backend

# Run the seed script
node migrations/002_seed_dummy_data.js
```

## What Gets Created

### Service Bookings (20 records)
- Random categories and services
- Random devotee names, phones, emails, cities
- Random Gothram, Nakshatram, Rasi
- Random preferred dates and time slots
- Random statuses (PENDING, VERIFIED, PAYMENT_PENDING, PAID, etc.)
- Random payment statuses
- Family members for ~50% of bookings
- Payment records for PAID bookings
- Notification records for each booking

### Jothidam Bookings (20 records)
- Random service types (Horoscope Reading, Match Making, etc.)
- Random customer details
- Random appointment dates and times
- Random pricing (service_price, consultation_charge, travel_charge, GST, discount)
- Random statuses (DRAFT, SUBMITTED, PAID, COMPLETED, etc.)
- Timeline entries for each booking
- Notifications for each booking

## Sample Data Generated

### Service Bookings
- Booking Numbers: `SVC-YYYYMMDD-0001` to `SVC-YYYYMMDD-0020`
- Names: Arun Kumar, Priya Lakshmi, Karthik R, etc.
- Cities: Vellore, Chennai, Bangalore, etc.
- Gothrams: Kashyapa, Bharadwaj, Gautam, etc.
- Nakshatrams: Aswini, Bharani, Karthigai, etc.

### Jothidam Bookings
- Service Types: Horoscope Reading, Match Making, Numerology, etc.
- Astrologers: Sri R. Krishnan, Dr. S. Namboothiri, Pandit M. Sharma
- Consultation Modes: Online, In-Person, Phone
- Statuses: DRAFT, SUBMITTED, PAID, COMPLETED, etc.

## Notes
- All dates are within 2024
- Phone numbers are valid Indian mobile numbers (starting with 9)
- Email addresses follow the pattern `firstname.lastname@example.com`
- All foreign key references are valid (existing categories, services, astrologers)
- The script uses transactions to ensure data consistency