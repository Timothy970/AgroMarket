# AgroMarket - Agricultural E-commerce Platform

## Overview
AgroMarket is a mobile-first agricultural e-commerce platform connecting farmers (sellers) with buyers. The platform features dual purchase modes (small unit purchases and bulk orders with tiered pricing), role-based authentication, admin-approved product listings, seller payout preferences, and comprehensive order management with tracking.

**Last Updated:** December 23, 2025

## Key Features

### 🔐 Authentication & Roles
-   **Role-Based Access:** Distinct roles for **Buyers**, **Sellers**, and **Admins**.
-   **Secure Login:** Email-based OTP verification for passwordless, secure access.
-   **Registration:** tailored flows for Buyers and Sellers.
-   **Authorization:** Protected routes and API endpoints ensuring users only access allowed resources.

### 🛒 Shopping Experience
-   **Dual Purchase Modes:**
    -   **Small Purchase:** Buy in small units (e.g., kg) for individual consumption.
    -   **Bulk Purchase:** Buy in large quantities (e.g., crates, sacks) with tiered pricing.
-   **Shopping Cart:**
    -   Real-time updates.
    -   Persistent cart for logged-in users.
    -   Calculated totals including subtotal, tax (16%), and delivery fees.
-   **Product Discovery:**
    -   Category-based browsing.
    -   Advanced filtering (Price, Location, Seller Type, Organic Certification).

### 👨‍🌾 Seller Features
-   **Dashboard:** Overview of earnings, orders, and products.
-   **Product Management:** Create and manage product listings (subject to admin approval).
-   **Payout Preferences:** Configure Mobile Money, Bank Transfer, or PayPal details.

### 🛡️ Admin Features
-   **Dashboard:** High-level view of platform activity.
-   **Product Moderation:** Approve or reject new product listings to ensure quality.
-   **User Management:** Oversee user roles and permissions.

## Tech Stack

-   **Frontend:** React, TypeScript, Wouter (Routing), TanStack Query, shadcn/ui, Tailwind CSS
-   **Backend:** Express.js, TypeScript
-   **Database:** PostgreSQL, Drizzle ORM
-   **State Management:** Zustand (Auth), React Query (Server State)
-   **Styling:** Tailwind CSS, Lucide React (Icons)

## Project Structure

```
client/
  src/
    components/   # Reusable UI components (Header, ProductCard, etc.)
    hooks/        # Custom hooks (useAuth, use-toast)
    lib/          # Utilities (API client, axios, queryClient)
    pages/        # Application routes/pages
      auth/       # Login, Register, VerifyOtp
      category/   # Category-specific product lists
    store/        # Global state stores (authStore)
server/
  routes.ts       # API Route definitions
  storage.ts      # Database interaction layer
  db.ts           # Database connection
shared/
  schema.ts       # Drizzle ORM schemas and Zod types
```

## Recent Updates

### ✅ Authentication System
-   Implemented complete auth flow: Login, Register, OTP Verification.
-   Added `VerifyOtp` page handling role assignment.
-   Secured backend endpoints with JWT verification.

### ✅ Cart Functionality
-   Implemented full cart CRUD operations (Add, Update, Remove).
-   Added backend logic for calculating totals (Subtotal, Tax, Delivery).
-   Refactored frontend to use `useQuery` for consistent cart state and badge counts, resolving re-render issues.

### ✅ UI/UX Improvements
-   **Toast Notifications:** Configured default duration to 4 seconds for better readability.
-   **Responsive Design:** Enhanced mobile navigation and dashboard layouts.
-   **Dashboards:** Created responsive layouts for Seller and Admin dashboards with sidebars.

## Roadmap / TODO

- [ ] **Search Functionality:** Implement global search for products.
- [ ] **Order Processing:** Complete the checkout flow and order creation.
- [ ] **Payment Integration:** Integrate Stripe or Mobile Money APIs.
- [ ] **Image Uploads:** Allow sellers to upload real product images.
- [ ] **Notifications:** Email/SMS updates for order status changes.
- [ ] **Profile Management:** Allow users to update their details and addresses.

## Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the root directory and set the `DATABASE_URL` (and other credentials if needed).

3.  **Run Database Migrations:**
    To apply existing migrations to the database, run:
    ```bash
    npm run db:migrate
    ```
    For local development, you can also push schema changes directly without generating migrations:
    ```bash
    npm run db:push
    ```

4.  **Run Development Server:**
    To launch both the backend API server (running standalone on port `8010` or as configured in `.env`) and the Vite frontend dev server (running standalone on port `5173` with auto-proxying) concurrently:
    ```bash
    npm run dev
    ```
    Alternatively, you can run them individually in separate terminal sessions:
    *   **Backend API Server:** `npm run dev:server`
    *   **Frontend Client:** `npm run dev:client`
    
    Always access and test the application at **`http://localhost:5173`** in development.

5.  **Build for Production:**
    ```bash
    npm run build
    ```
