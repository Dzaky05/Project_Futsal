# Futsal Field Booking — Full-Stack Implementation Plan

## Background

The existing project has:
- **Laravel 12** backend at `futsal-app/server/` with basic register/login routes (no Sanctum tokens yet, no role system)
- **React 19** frontend at `futsal-app/client/` (CRA-based, not Vite) with a green/white login page
- **MySQL** database `futsal_db` with only `users` table (no `role`, `phone` columns)
- Empty model stubs: `Pemesanan.php`, `Pembayaran.php`, plus unused parking-related pages
- Existing packages: `axios`, `react-router-dom`, `recharts`

The goal is to build a **complete Futsal Field Booking** system with User and Admin roles, booking + payment flow, PDF receipts, admin management, and Indonesian language UI — all using the existing green/white design language.

---

## User Review Required

> [!IMPORTANT]
> **The existing parking-related pages** (`Dashboard.jsx`, `History.jsx`, `ParkingIn.jsx`, `ParkingOut.jsx`) and components (`BottomBar.jsx`, `Navbar.jsx`, `StatCard.jsx`, `VehicleBadge.jsx`, `Modal.jsx`) will be **replaced** with futsal booking pages. These appear to be from a previous project and are not needed.

> [!IMPORTANT]
> **Frontend stays as CRA (Create React App)** — the user specified "React 18 + Vite + Tailwind" in the spec, but the existing project uses **React 19 + CRA + vanilla CSS**. I will keep CRA and vanilla CSS to avoid breaking the project. The styling will follow the green/white theme using CSS custom properties and inline styles consistent with the existing login page.

> [!WARNING]
> **Database reset needed.** New migrations will add `role` and `phone` columns to `users`, create `fields`, `bookings`, `payments`, `blocked_slots`, and `operational_hours` tables. You'll need to run `php artisan migrate` (and possibly `migrate:fresh` if the parking tables cause conflicts).

---

## Open Questions

> [!IMPORTANT]
> 1. **Admin account creation:** Should I create a database seeder with a default admin account (e.g., `admin@futsalgo.com` / `password123`)? This is needed to test admin features.
> 2. **Field seeder:** Should I seed sample fields (Lapangan A, B, C) with prices and operational hours for testing?
> 3. **QRIS QR code:** For the QRIS payment option, should I use a placeholder QR code image, or do you have an actual QR image to use?
> 4. **Bank account numbers:** What account numbers should be displayed for BCA, Mandiri, BRI transfer options? I'll use placeholders like "1234567890" unless you provide real ones.

---

## Proposed Changes

### Phase 1: Database & Models

#### [MODIFY] [.env](file:///d:/Login%20Futsal%20React/futsal-app/server/.env)
- No changes needed (already configured for `futsal_db`)

#### [NEW] `database/migrations/2026_05_01_000001_add_role_phone_to_users_table.php`
- Add `role` (enum: user/admin, default: user) and `phone` columns to users table

#### [NEW] `database/migrations/2026_05_01_000002_create_fields_table.php`
- `id`, `name`, `description`, `price_per_hour`, `image`, `facilities` (JSON), `is_active` (boolean)

#### [NEW] `database/migrations/2026_05_01_000003_create_bookings_table.php`
- `id`, `field_id` (FK), `user_id` (FK), `booking_date`, `start_time`, `end_time`, `duration_hours`, `total_price`, `status` (enum), `notes`, timestamps

#### [NEW] `database/migrations/2026_05_01_000004_create_payments_table.php`
- `id`, `booking_id` (FK), `user_id` (FK), `payment_method` (enum), `payment_date`, `amount`, `payment_proof`, `status` (enum), `verified_by` (FK nullable), `verified_at`, `notes`

#### [NEW] `database/migrations/2026_05_01_000005_create_blocked_slots_table.php`
- `id`, `field_id` (FK), `date`, `start_time`, `end_time`, `reason` (enum), `description`, `created_by` (FK)

#### [NEW] `database/migrations/2026_05_01_000006_create_operational_hours_table.php`
- `id`, `field_id` (FK), `day_of_week` (0-6), `open_time`, `close_time`, `is_open`

#### [MODIFY] [User.php](file:///d:/Login%20Futsal%20React/futsal-app/server/app/Models/User.php)
- Add `HasApiTokens` trait for Sanctum
- Add `role`, `phone` to `$fillable`
- Add relationships: `bookings()`, `payments()`
- Add helper: `isAdmin()`

#### [MODIFY] [Pemesanan.php → Booking.php](file:///d:/Login%20Futsal%20React/futsal-app/server/app/Models/Pemesanan.php)
- Rename to `Booking.php` (English model name for consistency with migration table name `bookings`)
- Define relationships: `field()`, `user()`, `payment()`

#### [MODIFY] [Pembayaran.php → Payment.php](file:///d:/Login%20Futsal%20React/futsal-app/server/app/Models/Pembayaran.php)
- Rename to `Payment.php`
- Define relationships: `booking()`, `user()`, `verifier()`

#### [NEW] `app/Models/Field.php`
- Relationships: `bookings()`, `blockedSlots()`, `operationalHours()`

#### [NEW] `app/Models/BlockedSlot.php`
- Relationships: `field()`, `creator()`

#### [NEW] `app/Models/OperationalHour.php`
- Relationships: `field()`

#### [NEW] `database/seeders/AdminSeeder.php`
- Create default admin + sample fields with operational hours

---

### Phase 2: Authentication & Middleware

#### [NEW] `app/Http/Middleware/AdminMiddleware.php`
- Check if authenticated user has `role === 'admin'`

#### [MODIFY] [api.php](file:///d:/Login%20Futsal%20React/futsal-app/server/routes/api.php)
- Completely rewrite with proper Sanctum auth
- Public routes: `POST /register`, `POST /login`
- Protected routes (auth:sanctum): user profile, bookings, payments, schedule
- Admin routes (auth:sanctum + admin middleware): manage bookings, verify payments, block slots, manage fields, reports

#### [MODIFY] [composer.json](file:///d:/Login%20Futsal%20React/futsal-app/server/composer.json)
- Add `laravel/sanctum` and `barryvdh/laravel-dompdf` dependencies

---

### Phase 3: Backend Controllers (API)

#### [NEW] `app/Http/Controllers/AuthController.php`
- `register()` — create user + return Sanctum token
- `login()` — validate credentials + return token
- `logout()` — revoke token
- `profile()` — get current user

#### [NEW] `app/Http/Controllers/FieldController.php`
- `index()` — list active fields (public)
- `show()` — field detail with operational hours
- `store()` — admin: create field
- `update()` — admin: update field
- `uploadImage()` — admin: upload field image

#### [NEW] `app/Http/Controllers/ScheduleController.php`
- `getWeeklySchedule()` — return availability grid for a field/week
- `getAvailableSlots()` — return available slots for a date/field

#### [NEW] `app/Http/Controllers/BookingController.php`
- `store()` — create booking + payment in one transaction
- `index()` — user's booking history (or all for admin)
- `show()` — booking detail with payment info
- `updateStatus()` — admin: update booking status
- `downloadPdf()` — generate PDF receipt via DomPDF

#### [NEW] `app/Http/Controllers/PaymentController.php`
- `index()` — admin: list payments (filterable)
- `verify()` — admin: approve/reject payment
- `uploadProof()` — user: upload payment proof

#### [NEW] `app/Http/Controllers/BlockedSlotController.php`
- `index()` — list blocked slots
- `store()` — admin: block a slot
- `destroy()` — admin: unblock a slot

#### [NEW] `app/Http/Controllers/OperationalHourController.php`
- `index()` — get operational hours for a field
- `update()` — admin: update operational hours

#### [NEW] `app/Http/Controllers/ReportController.php`
- `monthly()` — admin: monthly revenue summary
- `exportPdf()` — admin: export financial report as PDF

---

### Phase 4: PDF Generation

#### [NEW] `resources/views/pdf/booking-receipt.blade.php`
- Professional invoice-style PDF template
- Green header with logo, booking details, payment details
- Watermark based on status (MENUNGGU VERIFIKASI / DIKONFIRMASI)

#### [NEW] `resources/views/pdf/financial-report.blade.php`
- Monthly revenue report template

---

### Phase 5: React Frontend — Core Setup

#### [MODIFY] [index.css](file:///d:/Login%20Futsal%20React/futsal-app/client/src/index.css)
- Add CSS custom properties for green/white theme
- Add utility classes for badges, buttons, cards, forms, tables
- Add responsive grid system
- Add animations for page transitions

#### [MODIFY] [App.js](file:///d:/Login%20Futsal%20React/futsal-app/client/src/App.js)
- Preserve existing `FutsalLogin` component (login page)
- Add Sanctum token-based auth state management
- Add route guards for protected/admin routes
- Add all new routes

#### [NEW] `src/api/axios.js`
- Axios instance with interceptors for auth token

#### [NEW] `src/utils/auth.js`
- Token storage, auth state helpers, role checks

---

### Phase 6: React Frontend — User Pages

#### [DELETE] `src/pages/Dashboard.jsx` (parking)
#### [DELETE] `src/pages/History.jsx` (parking)
#### [DELETE] `src/pages/ParkingIn.jsx`
#### [DELETE] `src/pages/ParkingOut.jsx`
#### [DELETE] `src/components/BottomBar.jsx` (parking)
#### [DELETE] `src/components/Navbar.jsx` (parking)
#### [DELETE] `src/components/StatCard.jsx` (parking)
#### [DELETE] `src/components/VehicleBadge.jsx` (parking)

#### [NEW] `src/components/UserLayout.jsx`
- Responsive layout with navbar (FutsalGo logo, nav links, user menu)
- Mobile hamburger menu
- Green/white theme

#### [NEW] `src/pages/user/Schedule.jsx`
- Weekly/monthly calendar grid showing field availability
- Color-coded slots: Available (green), Booked (red/gray), Blocked (orange)
- Field selector tabs (Lapangan A, B, etc.)
- Click available slot → navigate to booking page with pre-filled data

#### [NEW] `src/pages/user/BookingPayment.jsx`
- **Single page with two sections:**
  - Section 1: Booking data (auto-filled from selected slot)
  - Section 2: Payment method selector + proof upload
- Order summary sidebar (desktop) / bottom card (mobile)
- "KONFIRMASI PESANAN & BAYAR" button
- Success modal with PDF download

#### [NEW] `src/pages/user/BookingHistory.jsx`
- Table/card list of past and upcoming bookings
- Status badges (Pending=yellow, Confirmed=green, Cancelled=red, Completed=blue)
- "Lihat Detail" and "Download PDF" buttons

#### [NEW] `src/pages/user/BookingDetail.jsx`
- Full booking + payment detail view
- Download PDF button

---

### Phase 7: React Frontend — Admin Pages

#### [NEW] `src/components/AdminLayout.jsx`
- Dark green sidebar with navigation links
- White content area
- Responsive (collapsible sidebar on mobile)

#### [NEW] `src/pages/admin/AdminLogin.jsx`
- Separate admin login page at `/admin/login`
- Same green/white theme as user login

#### [NEW] `src/pages/admin/AdminDashboard.jsx`
- Summary cards: bookings today, pending bookings, pending payments, revenue today/month
- Recent bookings table with quick actions

#### [NEW] `src/pages/admin/ManageBookings.jsx`
- Full data table with filters (date, field, status)
- Booking detail modal
- Status update actions (Pending → Confirmed → Completed/Cancelled)

#### [NEW] `src/pages/admin/PaymentVerification.jsx`
- List of payments needing verification
- Image preview of payment proof
- Approve (Lunas) / Reject (Ditolak) buttons
- Filters by method, date, status

#### [NEW] `src/pages/admin/BlockSlots.jsx`
- Calendar view showing all fields
- Click slot → mark as Maintenance/Event/Rest
- Unblock existing blocks

#### [NEW] `src/pages/admin/ManageFields.jsx`
- CRUD for fields (name, description, price, facilities)
- Image upload
- Operational hours editor per day

#### [NEW] `src/pages/admin/FinancialReport.jsx`
- Monthly revenue summary with charts (recharts)
- Payment table
- Export PDF button

---

### Phase 8: Modal Component (reusable)

#### [MODIFY] `src/components/Modal.jsx`
- Replace parking modal with generic reusable modal component

---

## File Summary

| Category | New | Modify | Delete |
|----------|-----|--------|--------|
| Migrations | 6 | 0 | 0 |
| Models | 3 | 3 (User, rename Pemesanan→Booking, Pembayaran→Payment) | 0 |
| Controllers | 8 | 0 | 0 |
| Middleware | 1 | 0 | 0 |
| Routes | 0 | 1 (api.php) | 0 |
| Views (PDF) | 2 | 0 | 0 |
| React Pages | 11 | 2 (App.js, index.css) | 4 |
| React Components | 2 | 1 (Modal) | 4 |
| Utilities | 2 | 0 | 0 |
| Config | 0 | 1 (composer.json) | 0 |
| Seeders | 1 | 0 | 0 |
| **Total** | **36** | **8** | **8** |

---

## Verification Plan

### Automated Tests
1. Run `php artisan migrate` — verify all migrations apply cleanly
2. Run `php artisan db:seed` — verify admin and sample data seeded
3. Test API endpoints via browser subagent:
   - Register → Login → Get token
   - View schedule → Create booking → Upload proof → View history
   - Admin login → Verify payment → Update booking status → View reports
4. Run `npm start` in client — verify no build errors

### Manual Verification
1. Test complete user flow: Login → View schedule → Book slot → Pay → Download PDF
2. Test admin flow: Login → Dashboard → Verify payment → Block slots → View reports
3. Test responsive design on mobile viewport
4. Verify PDF download works correctly

---

## Execution Order

1. **Backend first:** Migrations → Models → Sanctum setup → Controllers → Routes → PDF templates → Seeders
2. **Frontend second:** Core setup (auth, axios) → User layout → User pages → Admin layout → Admin pages
3. **Integration testing** last
