# 🎬 MOVEXA — Next-Generation Cinema Booking & Theater Management System

> **College Project Submission**  
> **Production-Ready Full-Stack Web Application**  
> Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, MongoDB Atlas (Mongoose), and JWT Cookie Authentication.

---

## 🌟 Project Overview

**Movexa** is a modern, high-performance cinema reservation web platform engineered to deliver a seamless movie ticket booking experience for audiences and an all-in-one management control center for cinema administrators.

The application features an interactive graphical seat matrix with real-time seat locking, dynamic date and showtime selection, instant digital pass generation with scannable QR codes, and a fully featured administrative back-office for managing movie titles, auditoriums, show schedules, customers, and box office revenue analytics.

---

## 🔑 Demo & Evaluation Credentials

For testing and evaluation during project examination:

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@gamil.com` | `admin123` | Full Admin Dashboard, Movies, Showtimes, Bookings, Customers, Settings |
| **Alternate Admin** | `admin@gmail.com` | `admin123` | Identical Administrator Access |
| **Student / Customer Demo** | `student@demo.com` | `student123` | Normal Customer (Seat Booking, Ticket Passes, My Bookings) |
| **New Customer** | *Any registered email* | *User choice (min 8 chars)* | Can register directly via `/register` |

> 💡 **One-Click Auto Fill**: On the [Sign In Page (`/login`)](http://localhost:3000/login), an **"Auto Fill Admin"** banner button is provided to instantly populate the credentials for testing convenience!

---

## 🚀 Key Features

### 1. 🎟️ Interactive Seat Choosing & Real-Time Booking Engine
- **Curved Glowing Cinema Screen**: Atmospheric visual header orienting the audience towards the front of the auditorium.
- **Multi-Tier Seating Layout**:
  - **Regular Standard Seats (Rows A–E)**: ₹250 per ticket.
  - **Premium VIP Recliners (Rows F–G)**: ₹450 per ticket with extra legroom indicator.
- **Seat Status Legend**:
  - `Available`: Neutral/Dark border with interactive hover highlights.
  - `Selected`: Radiant orange (`#ff5500`) with glow elevation.
  - `Booked / Sold Out`: Grayed out with strike-through, permanently locked against duplicate reservations.
- **Live Transaction Sidebar**:
  - Dynamically calculates ticket subtotal, technology & convenience fee, and grand total.
  - Allows selecting up to 8 seats per booking transaction.
- **Integrated Mock Checkout & Payment Modal**:
  - Supports **Credit/Debit Card** (prefilled demo card), **UPI / QR Code Scan**, and **Pay at Box Office Counter**.
- **Instant Digital E-Ticket Pass**:
  - Issues unique Reference ID (e.g. `MVX-849201`).
  - Scannable dynamic QR Code.
  - Movie title, auditorium, screening date, time slot, and allocated seat numbers.

### 2. 📱 Audience Portal & "My Bookings"
- **Personalized Reservation Ledger (`/bookings`)**:
  - Displays all digital passes booked by the customer.
  - Printable boarding-pass style format via **"Print Pass"** (`window.print()`).
  - **Self-Service Cancellation**: Customers can cancel tickets prior to showtime; seats are automatically released back to `available` status in MongoDB.

### 3. 🛡️ Comprehensive 100% Working Admin Control Panel (`/admin`)
- **Real-Time Analytics Dashboard (`/admin`)**:
  - Live Gross Revenue counter (sum of confirmed admissions).
  - Total reservations counter and today's tickets counter.
  - Active movies count and scheduled showtime slots.
  - Recent bookings ledger table with live status tags.
- **Movies Directory (`/admin/movies`)**:
  - Searchable and filterable by status (`all`, `now_showing`, `coming_soon`, `ended`).
  - View full metadata, runtime, age ratings, and genre tags.
  - Instant movie deletion (cascades to related showtimes).
- **Add New Movie Wizard (`/admin/movies/new`)**:
  - Auto-generating URL slug with availability checker.
  - Poster image upload to Cloudinary or 1-click preset poster selection (`Dune`, `Oppenheimer`, `Noir City`, `Sci-Fi Rift`).
  - Multi-genre selector and dynamic cast manager.
- **Auditorium Showtimes Manager (`/admin/showtimes`)**:
  - Visual schedule matrix showing theater halls, start/end times, and live occupancy bars (e.g. `12/70 seats booked • 17%`).
  - **"Schedule New Showtime" Modal**: Assign movie, cinema, screen, date, times, and custom pricing.
  - Delete showtime action.
- **Bookings Management (`/admin/bookings`)**:
  - Search reservations by customer name, email, or booking reference.
  - Filter by status (`all`, `confirmed`, `cancelled`).
  - Admin override to cancel or reactivate tickets.
- **Customer Directory (`/admin/customers`)**:
  - Lists all registered users, roles, account creation timestamps, total orders, and lifetime box office spend.
- **System Settings & Showcase Seeder (`/admin/settings`)**:
  - **1-Click "Seed / Sync Showcase Data"**: Restores pristine college presentation data with 6 blockbuster movies, 2 cinemas, multiple showtimes, and sample bookings.
  - **Clean Reset & Re-Seed**: Wipes test data and returns system to perfect demonstration state.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16.4.2](https://nextjs.org/) (App Router Architecture) |
| **UI Library & Components** | [React 19.3.0](https://react.dev/), [Lucide React](https://lucide.dev/) (Modern Icons) |
| **Styling Engine** | [Tailwind CSS v4](https://tailwindcss.com/) with native CSS variables |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) via [Mongoose 9.11.2](https://mongoosejs.com/) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password hashing, Secure HTTP-Only Cookies |
| **Image Storage** | Cloudinary API integration + Local Next.js optimized public assets |
| **Validation** | [Zod 4](https://zod.dev/) Schema Validation |
| **Language** | TypeScript 5 (Strict Mode, 100% Type-Safe) |

---

## 🏛️ Database Schema Architecture

```
                      ┌───────────────┐
                      │     User      │
                      │  (role/auth)  │
                      └───────┬───────┘
                              │
                    places 1..* bookings
                              │
                              ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Movie     │◀──────│     Show     │──────▶│    Screen    │
│ (slug/media) │       │ (date/seats) │       │ (seat matrix)│
└──────────────┘       └──────┬───────┘       └──────▲───────┘
                              │                      │ belongs to
                       1 show has 1..*               │
                              ▼                      ▼
                       ┌──────────────┐       ┌──────────────┐
                       │   Booking    │       │    Cinema    │
                       │ (ref/tickets)│       │  (locations) │
                       └──────────────┘       └──────────────┘
```

### Models:
1. **User (`src/models/User.ts`)**: `name`, `email`, `password`, `role` (`user` | `admin`).
2. **Movie (`src/models/Movie.ts`)**: `title`, `slug`, `shortDescription`, `longDescription`, `thumbnail`, `trailerUrl`, `genre`, `language`, `duration`, `releaseDate`, `director`, `cast`, `rating`, `status`.
3. **Cinema (`src/models/Cinema.ts`)**: `name`, `location`, `address`, `description`, `isActive`.
4. **Screen (`src/models/Screen.ts`)**: `cinema`, `name`, `seats` (`row`, `number`, `type`), `isActive`.
5. **Show (`src/models/Show.ts`)**: `movie`, `cinema`, `screen`, `date`, `startTime`, `endTime`, `seats` (`row`, `number`, `type`, `price`, `status`).
6. **Booking (`src/models/Booking.ts`)**: `bookingReference`, `user`, `show`, `seats`, `totalAmount`, `bookingStatus`, `paymentStatus`, `customerName`, `customerEmail`, `movieTitle`, `cinemaName`, `showDate`, `showTime`.

---

## 📡 Complete REST API Reference

### 🔐 Authentication Endpoints
- `POST /api/auth/login`: Authenticates user or admin mock credentials (`admin@gamil.com`/`admin123`) and sets secure HTTP-only cookie.
- `POST /api/auth/register`: Creates new user account with encrypted password.
- `GET /api/auth/me`: Retrieves current session profile.
- `POST /api/auth/logout`: Clears authorization token cookie.

### 🎥 Movies Endpoints
- `GET /api/movies`: Retrieves movie catalog (supports `?status=now_showing` and `?query=dune`).
- `POST /api/movies`: Admin creates a new movie.
- `GET /api/movies/[id]`: Retrieves movie details and upcoming showtimes.
- `PUT /api/movies/[id]`: Admin updates movie metadata.
- `DELETE /api/movies/[id]`: Admin deletes movie and cleans up related shows.

### 📅 Showtimes Endpoints
- `GET /api/shows`: Retrieves shows filtered by movie, cinema, or date.
- `POST /api/shows`: Admin schedules a new showtime with auto-generated seat matrix.
- `GET /api/shows/[id]`: Retrieves specific showtime with real-time seat status.
- `DELETE /api/shows?id=[id]`: Admin deletes a scheduled showtime.

### 🎟️ Bookings Endpoints
- `GET /api/bookings`: Returns bookings for the logged-in user (or all bookings if admin).
- `POST /api/bookings`: Atomically locks selected seats, records transaction, and returns confirmed E-Ticket.
- `GET /api/bookings/[id]`: Retrieves individual booking ticket pass.
- `PATCH /api/bookings/[id]`: Cancels booking and releases seats back to available.

### 🏢 Cinemas Endpoints
- `GET /api/cinemas`: Lists all active theaters with their screens.
- `POST /api/cinemas`: Admin adds a cinema location.

### 📊 Admin Analytics & Utilities
- `GET /api/admin/stats`: Calculates total revenue, reservation counts, active movies, and recent orders.
- `GET /api/admin/customers`: Returns customer list with order history and total spend.
- `POST /api/seed`: Seeds or resets database with sample demonstration catalog.

---

## ⚡ Setup & Installation Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) package manager
- Internet access for MongoDB Atlas cloud connectivity

### 2. Environment Variables Configuration
The `.env` file in the project root is already preconfigured with MongoDB Atlas and JWT Secret:

```env
MONGODB_URI=
JWT_SECRET=zRTwkgoghJXvXA1ENEqCDlTlM6biD9GaH3nE4ACVlQ4
NODE_ENV="dev"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 5. Seed Showcase Data (1 Click)
To immediately populate the site with movies, screens, showtimes, and sample bookings for demonstration:
1. Navigate to [http://localhost:3000/login](http://localhost:3000/login)
2. Click **"Auto Fill"** (or enter `admin@gamil.com` / `admin123`) and log in.
3. In the sidebar, click **Settings** (`/admin/settings`).
4. Click **"Seed / Sync Showcase Data"**.
5. All movies, auditoriums, shows across today & tomorrow, and reservations are instantly populated!

---

## 🧪 College Presentation Demonstration Checklist

When presenting this project to your evaluators or professor:

- [x] **1. Home Page Showcase**: Present the responsive hero slider, Now Showing / Coming Soon filters, and movie catalog.
- [x] **2. Movie Detail Page**: Click any movie (e.g. *Dune: Part Two*), view synopsis, cast, ratings, and choose a date tab (Today, Tomorrow, etc.).
- [x] **3. Interactive Seat Matrix**: Click a showtime, view the curved glowing screen, click multiple regular and VIP recliner seats, and watch the live summary calculate prices in real time.
- [x] **4. Payment & E-Ticket Generation**: Click "Book Seats", select a mock payment method (Card / UPI), submit, and showcase the instant boarding pass with QR Code and Reference code.
- [x] **5. Customer Bookings ("My Bookings")**: Go to "My Bookings", show the confirmed pass, click "Print Pass", or demonstrate cancellation with automatic seat release.
- [x] **6. Admin Login**: Show login with `admin@gamil.com` / `admin123`.
- [x] **7. Admin Dashboard Analytics**: Highlight live gross revenue calculation, real-time ticket counts, and recent bookings table.
- [x] **8. Admin Showtimes & Movies Management**: Create or delete a showtime, view occupancy rates, add a movie, or use the 1-click database reset utility in Settings.

---

## 📄 License & Attribution
Designed & developed as a collegiate project for software engineering and full-stack web development coursework.
© 2026 MOVEXA. All rights reserved.
