# AgroMarket - Agricultural E-commerce Platform

## Overview
AgroMarket is a mobile-first agricultural e-commerce platform connecting farmers (sellers) with buyers. The platform features dual purchase modes (small unit purchases and bulk orders with tiered pricing), role-based authentication, admin-approved product listings, seller payout preferences, and comprehensive order management with tracking.

**Last Updated:** October 25, 2025

## Recent Changes
- ✅ Implemented Replit Auth integration with Google, GitHub, and email/password login
- ✅ Created complete PostgreSQL database schema with proper relations and indexes
- ✅ Built comprehensive API endpoints with full authorization controls
- ✅ Fixed critical security vulnerabilities:
  - Role escalation (users can only upgrade buyer→seller, admin requires DB access)
  - Product CRUD authorization (seller/admin role checks)
  - Cart ownership verification
  - Order read/write permissions (buyer/seller/admin checks)
- ✅ Created Landing page for logged-out users
- ✅ Integrated frontend authentication with useAuth hook

## User Preferences
- **Design Style:** Mobile-first with earthy green color palette, large touch targets (44px min), clean white backgrounds
- **Authentication:** Replit Auth (supports Google, GitHub, email/password)
- **Database:** PostgreSQL via Replit (Neon-backed)

## Project Architecture

### Core Features
1. **Dual Purchase Modes**
   - Small unit purchases (e.g., buy 2 kg of tomatoes)
   - Bulk orders with tiered pricing and deposit options (e.g., 100 kg at ₦500/kg with 30% deposit)

2. **Role-Based Access Control**
   - **Buyer:** Browse products, add to cart, place orders
   - **Seller:** Manage products, view orders, set payout preferences
   - **Admin:** Approve/reject products, view all orders, manage users

3. **Product Approval Workflow**
   - Sellers create products (status: "pending")
   - Admins review and approve/reject
   - Only approved products visible to buyers

4. **Seller Payout System**
   - Mobile Money (M-Pesa, Airtel Money)
   - Bank Transfer
   - PayPal

### Database Schema
**Tables:**
- `users` - User accounts with roles (buyer, seller, admin)
- `products` - Product listings with approval status
- `cart_items` - Shopping cart items
- `orders` - Order records with status tracking
- `seller_payouts` - Seller payment preferences
- `product_approvals` - Product approval history

**Key Relations:**
- Products → Users (sellerId)
- Orders → Users (buyerId, sellerId)
- CartItems → Users (userId) and Products (productId)

### API Endpoints

**Authentication:**
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout user

**User Management:**
- `PATCH /api/user/role` - Upgrade buyer→seller (self-service)
- `PATCH /api/user/payout` - Update payout preferences (sellers)

**Products:**
- `POST /api/products` - Create product (sellers only)
- `GET /api/products` - List products (filtered by status/category/seller)
- `GET /api/products/:id` - Get single product
- `PATCH /api/products/:id` - Update product (owner or admin)
- `DELETE /api/products/:id` - Delete product (owner or admin)

**Admin Product Approval:**
- `POST /api/admin/products/:id/approve` - Approve product (admin only)
- `POST /api/admin/products/:id/reject` - Reject product (admin only)

**Cart:**
- `GET /api/cart` - Get user's cart items
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart/:id` - Update cart item quantity (owner only)
- `DELETE /api/cart/:id` - Remove cart item (owner only)
- `DELETE /api/cart` - Clear entire cart

**Orders:**
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders (filtered by buyer/seller, admins see all)
- `GET /api/orders/:id` - Get single order (buyer/seller/admin only)
- `PATCH /api/orders/:id/status` - Update order status (seller/admin only)
- `PATCH /api/orders/:id/payment` - Update payment info (buyer/seller/admin only)

### Security Model
- **Authentication:** Replit Auth via OIDC (OAuth with Google/GitHub + email/password)
- **Authorization:** Role-based access control on all sensitive endpoints
- **Data Isolation:** Users can only access their own cart items and orders (unless admin)
- **Product Ownership:** Sellers can only modify their own products (admins have override)
- **Admin Controls:** Admin role can only be set via direct database access

### Frontend Structure
- **Pages:**
  - Landing (logged-out users)
  - Home (product browsing for buyers)
  - ProductDetail (product details with dual purchase modes)
  - Cart (shopping cart management)
  - SellerDashboard (seller product management)
  - AddProduct (create new products)
  - AdminDashboard (product approval queue)
  - OrderTracking (order status tracking)

- **Components:**
  - Header (navigation with cart count, auth controls)
  - ProductCard (product display with purchase modes)
  - ThemeToggle (dark/light mode)

### Tech Stack
- **Frontend:** React, TypeScript, Wouter (routing), TanStack Query, shadcn/ui, Tailwind CSS
- **Backend:** Express, TypeScript, Drizzle ORM
- **Database:** PostgreSQL (Neon)
- **Authentication:** Replit Auth (OIDC)
- **Deployment:** Replit (development database + workflow)

## Development Notes

### Role Management
- Users start as "buyer" by default
- Buyers can self-upgrade to "seller" via `PATCH /api/user/role`
- Admin role requires direct database access for security

### Product Lifecycle
1. Seller creates product (status: "pending")
2. Admin reviews and approves/rejects
3. Approved products visible to all buyers
4. Rejected products only visible to seller

### Order Flow
1. Buyer adds products to cart
2. Buyer creates order from cart
3. Order created with status: "pending"
4. Seller updates status: pending → processing → shipped → delivered
5. Buyer can track order status

## Known Issues / TODO
- [ ] Need to generate hero/category images for Landing page
- [ ] Implement search functionality
- [ ] Add pagination for product listings
- [ ] Implement order payment processing (Stripe integration)
- [ ] Add email notifications for order status changes
- [ ] Implement product image uploads
