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


Project Title: AgroMarket – Agricultural Ecommerce Platform
Project Goal:
 Design a mobile-first, responsive web application for an agricultural ecommerce marketplace that connects farmers directly with buyers.
 The platform must support two buying modes — Bulk Purchase (for wholesalers, retailers, or large orders) and Small Purchase (for individuals or smaller quantities).
The app should also let sellers choose their preferred mode of payment for receiving funds (e.g., Mobile Money, Bank Transfer, or PayPal).

🌽 Project Description
AgroMarket provides a dual experience for buyers and farmers, supervised by an admin.
 Farmers list their produce, which must be approved by an admin before going live. Buyers can browse, buy in bulk or small quantities, and track their orders.
The system has three main roles:
Buyer – purchases items (small or bulk).


Seller (Farmer) – lists, manages, and gets paid for products.


Admin – reviews and approves/rejects submissions.



🧺 Buying Modes
1. Small Purchase
Intended for individual consumers or small buyers.


Price shown per basic unit (e.g., per kg, per liter).


Normal checkout and payment flow.


2. Bulk Purchase
Intended for wholesalers or large buyers.


Offers tiered or negotiated pricing:


e.g., KES 4,500 per 25kg sack or Contact seller for custom price.


May require deposit payment (e.g., 30%) with remaining balance on delivery confirmation.


Supports direct messaging between buyer and seller for negotiation before checkout.


Example Product Detail Layout
[ Product Name ]
[ Product Images Carousel ]
[ Description, Seller Info, Location ]

Select Purchase Mode:
( ) Small Purchase - KES 200 per kg
( ) Bulk Purchase - KES 4,500 per 25kg sack

If Bulk is selected:
→ Show: Minimum Order Quantity
→ Show: "Request Negotiation" or "Pay Deposit"
→ Show: Seller Contact Option

[ Quantity Selector ]
[ Add to Cart ] or [ Proceed to Checkout ]

💳 Seller Payment Preferences
When a seller creates or edits a product listing, they can choose their preferred payout method:
Mobile Money (e.g., M-Pesa)


Bank Transfer


PayPal


Each option will require relevant details (e.g., phone number, account number, or email).
Sellers can view and update their payout preferences anytime from their Profile / Wallet section.

🧭 User Flows & Wireframes
1. Buyer Flow
Screen 1: Onboarding & Homepage
Welcoming splash / landing screen with hero section promoting fresh produce.


Navigation: Home | Categories | Cart | Profile.


Category icons for quick access (Fruits, Vegetables, Grains, Dairy).


Featured and seasonal product highlights.


Screen 2: Category / Listing Page
Product cards showing:


Image, Name, Seller, Location, Small & Bulk pricing options.


Filters: Price, Location, Type (Small / Bulk), Organic.


Sort: Low → High, Nearest → Farthest, Most Popular.


Screen 3: Product Detail Page
Product gallery, description, and seller details.


Toggle between Small and Bulk Purchase modes.


For bulk mode:


Show minimum order quantity.


Option to negotiate or pay deposit.


Add to Cart or Wishlist.


Ratings and Reviews section.


Screen 4: Shopping Cart
Shows purchase mode (Small / Bulk) for each item.


Quantity, Price, Subtotal.


Option to switch mode or edit quantity.


Checkout button.


Screen 5: Checkout Flow
Step 1: Delivery Address


Step 2: Payment Options


Mobile Money, Card, Cash on Delivery, or Negotiated Payment (for bulk).


If bulk mode + negotiation, show partial payment option (deposit field).


Step 3: Order Confirmation


Show order summary, total cost, deposit (if any), and payment status.


Button: “Track My Order”


Screen 6: Order Tracking
Visual progress bar:
 Placed → Approved → Packed → Shipped → Delivered


For bulk, include: “Awaiting Balance Payment” before “Delivered”.


Screen 7: Profile & Wishlist
Manage details, addresses, payment methods.


View active and completed orders.


Wishlist grid with add-to-cart shortcuts.



2. Seller Flow
Screen 1: Seller Dashboard
Overview: Total Earnings, Pending Orders, Products, Payout Method.


Quick actions: Add Product | Manage Listings | Update Payout Info.


Screen 2: Add New Product
Fields:


Product Name, Category, Description.


Price (Small unit price + optional Bulk price tier).


Quantity, Harvest Date.


Upload Product Images.


Select Payout Method:


Mobile Money → enter phone number


Bank Transfer → enter account details


PayPal → enter email


Submit for Approval button.


Note: “All products are reviewed by an admin before going live.”


Screen 3: My Products
List of submissions with status: Pending | Approved | Rejected.


Each product shows approval status and action buttons (Edit, Deactivate, View Feedback).


Screen 4: Wallet / Payout Settings
Shows earnings summary and withdrawal history.


Edit preferred payment method.



3. Admin Flow
Screen 1: Admin Dashboard
Overview cards: Total Sales | New Sellers | Pending Approvals.


Screen 2: Pending Product Approvals
List of all pending submissions.


Expandable view with full details, images, and pricing.


Approve / Reject buttons.


Screen 3: Rejection Modal
Text field for “Reason for Rejection”.


Confirm / Cancel buttons.


Screen 4: Payment & Dispute Management (Optional)
Manage large (bulk) order payments.


Approve deposit clearances and final payment confirmations.



🎨 Design Guidelines
Mobile-first layout with simple navigation and large touch targets.


Use an earthy green color palette with clean white backgrounds.


Use illustrations and icons that appeal to both rural and urban users.


Include low-data mode or offline placeholder recommendations for rural connectivity.


Please generate:
Wireframes for all major screens and flows (Buyer, Seller, Admin).


Components for:


Product Card (dual pricing display)


Purchase Mode Toggle (Small / Bulk)


Payment Method Selector (Seller payout)


Order Tracking Timeline


Responsive layout recommendations (mobile → tablet → desktop).


Optional UX notes on simplifying bulk purchase negotiation and payout setup.
