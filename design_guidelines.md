# AgroMarket Agricultural Ecommerce Platform - Design Guidelines

## Design Approach

**Selected Approach**: Reference-Based (E-commerce/Marketplace)
Drawing inspiration from Etsy's community marketplace feel, Shopify's clean product presentation, and Airbnb's trust-building design patterns. These references excel at connecting individual sellers with buyers while maintaining accessibility and trust.

**Design Principles**:
- **Accessibility First**: Large touch targets (min 44px), clear typography for rural and urban users
- **Trust & Transparency**: Prominent seller information, approval badges, clear pricing
- **Dual-Mode Clarity**: Visually distinct small vs bulk purchase experiences
- **Mobile-Primary**: Design for 375px viewport first, enhance upward

---

## Typography System

**Font Families**:
- Primary: Inter (via Google Fonts) - Clean, highly legible for product listings and data
- Accent: Poppins (via Google Fonts) - Friendly, approachable for headings and CTAs

**Hierarchy**:
- **Hero/Page Titles**: Poppins Bold, text-4xl (mobile) → text-5xl (desktop)
- **Section Headers**: Poppins SemiBold, text-2xl (mobile) → text-3xl (desktop)
- **Product Names**: Inter SemiBold, text-lg → text-xl
- **Body Text**: Inter Regular, text-base
- **Metadata** (seller info, location): Inter Regular, text-sm
- **Labels/Tags**: Inter Medium, text-xs → text-sm, uppercase tracking-wide
- **Pricing**: Inter Bold, text-xl (small mode) → text-2xl (bulk mode)

---

## Layout & Spacing System

**Spacing Primitives**: Use Tailwind units of **2, 3, 4, 6, 8, 12, 16**
- Component padding: p-4 (mobile), p-6 (tablet), p-8 (desktop)
- Section spacing: py-12 (mobile), py-16 (tablet), py-20 (desktop)
- Card gaps: gap-4 (mobile), gap-6 (desktop)
- Between-element spacing: mb-3, mt-6, mx-4 as needed

**Container System**:
- Page wrapper: max-w-7xl mx-auto px-4
- Product grids: max-w-6xl mx-auto
- Form containers: max-w-2xl mx-auto
- Content text: max-w-prose (for descriptions)

**Grid Layouts**:
- Product listings: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Category icons: grid-cols-4 gap-4 (mobile), grid-cols-6 gap-6 (desktop)
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

---

## Component Library

### Navigation
**Mobile**: Bottom navigation bar (fixed position)
- 4 icons: Home, Categories, Cart (with badge), Profile
- Icons: 24px, Labels: text-xs
- Active state: Icon emphasize with indicator

**Desktop**: Top horizontal navigation
- Logo left, Category links center, Cart + Profile right
- Sticky on scroll with subtle shadow

### Product Card
**Structure**:
- Image: aspect-ratio-square, rounded-lg, object-cover
- Seller badge: Absolute top-right, rounded-full with approval icon
- Content padding: p-4
- Product name: 2 lines max, truncate with ellipsis
- Seller info row: Flex with avatar (w-6 h-6), name, location icon
- Pricing section: 
  - Small mode: Single price, text-lg font-bold
  - Bulk mode: Stacked pricing, "from" text-sm, price text-xl, unit text-sm
- CTA button: Full width, rounded-lg, font-medium

**Hover State**: Subtle lift (shadow-lg transition)

### Purchase Mode Toggle
**Layout**: Segmented control pattern
- Two options side-by-side, equal width
- Selected state: Filled background with checkmark icon
- Unselected: Border outline only
- Labels: "Small Purchase" / "Bulk Purchase" with sub-text showing base unit
- Padding: p-4, rounded-xl, border-2

**Bulk Mode Additions** (conditional display):
- Minimum order badge: Inline after toggle
- Tiered pricing table: 2-column grid (quantity | price)
- Negotiation CTA: Secondary button style with chat icon

### Shopping Cart Items
**Structure**:
- Flex layout: Image (w-20 h-20) | Content | Quantity controls | Remove
- Purchase mode badge: Top of content, small pill style
- Price breakdown: Show unit price × quantity = subtotal
- Quantity controls: Outlined buttons with +/- icons, number input center
- Divider between items: border-b

**Cart Summary** (sticky bottom on mobile):
- Subtotal, delivery estimate, total
- Prominent checkout button: w-full, text-lg, py-4

### Order Tracking Timeline
**Layout**: Vertical stepper on mobile, horizontal on desktop
- Circles (w-10 h-10) connected by lines (border-l-2 on mobile, border-t-2 on desktop)
- Active step: Filled circle with icon
- Completed steps: Checkmark icon
- Future steps: Outlined circle, reduced opacity
- Labels below each step: text-sm font-medium
- Timestamps: text-xs

**Bulk-Specific Addition**:
- Extra step between Shipped and Delivered: "Awaiting Balance Payment"
- Payment reminder card with amount due and pay button

### Seller Payout Selector
**Layout**: Radio group with 3 cards
- Each card: p-6, rounded-lg, border-2, cursor-pointer
- Icon left (32px), Label + description right
- Selected state: Border highlight, checkmark badge top-right
- Conditional input fields appear below selected option:
  - Mobile Money: Phone input with country code selector
  - Bank Transfer: Account number + bank name inputs
  - PayPal: Email input with verification badge
- Spacing between cards: gap-4

### Admin Approval Card
**Structure**:
- Expandable accordion pattern
- Header: Product name, seller name, submission date, category badge
- Expanded content: Image gallery (horizontal scroll), full details grid
- Action bar (sticky bottom): Reject (secondary) | Approve (primary) buttons
- Rejection modal: Overlay with textarea (min h-32), character count, confirm/cancel

### Forms
**Input Fields**:
- Label: text-sm font-medium, mb-2
- Input: p-3, rounded-lg, border-2, text-base
- Focus state: Border emphasis, ring-2
- Error state: Border treatment, text-sm message below
- Required indicator: Asterisk in label

**File Upload** (Product Images):
- Drag-and-drop zone: border-dashed, border-2, p-8, rounded-lg
- Icon: 48px upload icon, centered
- Preview grid: grid-cols-3 gap-4 once uploaded
- Each preview: Relative container with remove button (X) top-right

---

## Key Screen Layouts

### Homepage (Buyer)
**Hero Section**: 80vh on desktop, 60vh on mobile
- Large hero image showcasing fresh produce/farmers
- Centered content overlay with blurred button backgrounds
- Headline: text-4xl md:text-6xl Poppins Bold
- Subheadline: text-lg md:text-xl max-w-2xl
- CTA buttons: Flex gap-4, primary + secondary

**Category Quick Access**: py-12
- Grid of 8 category cards (4 cols mobile, 6-8 cols desktop)
- Icon (48px), label below, rounded-2xl cards with hover lift

**Featured Products**: py-16
- Section header with "View All" link
- Product grid (2 cols mobile, 4 cols desktop)
- Featured badge on select items

**Seasonal Highlights**: py-16
- 2-column layout (image left, content right on desktop, stacked on mobile)
- Large supporting image
- Call-to-action to browse seasonal items

### Product Detail Page
**Layout**: 
- Mobile: Vertical stack
- Desktop: 2-column (60% image gallery, 40% content)

**Image Gallery**:
- Main image: aspect-video or aspect-square
- Thumbnail strip below: Horizontal scroll, gap-2
- Lightbox functionality on tap

**Content Section** (sticky on desktop):
- Product name: text-2xl md:text-3xl
- Seller card: Flex with avatar, name, rating stars, location
- Purchase mode toggle: mb-6
- Description: Expandable with "Read more" if over 200 chars
- Specifications grid: 2 cols (label | value)
- Quantity selector + Add to Cart: Fixed bottom mobile, inline desktop

### Seller Dashboard
**Stats Overview**: 
- Grid of 4 stat cards (1 col mobile, 4 cols desktop)
- Each card: Icon, label, large number, trend indicator
- p-6, rounded-xl, shadow

**Quick Actions**:
- 3 prominent action cards: Add Product, Manage Listings, Payout Settings
- Icon + label, p-8, rounded-xl

**Recent Orders Table**:
- Responsive table (card stack on mobile, table on desktop)
- Columns: Order ID, Product, Buyer, Amount, Status badge, Actions
- Status badges: Inline pill style with appropriate styling

### Admin Dashboard
**Pending Approvals Queue**:
- List view with expandable cards
- Priority indicators for time-sensitive items
- Batch actions: Select multiple, approve/reject all

---

## Images Strategy

### Required Images:
1. **Homepage Hero**: Full-width landscape image (1920x1080) of vibrant fresh produce, farmers at market, or harvest scene - warm, inviting, authentic
2. **Category Icons**: 8 custom illustrated icons (Fruits, Vegetables, Grains, Dairy, Livestock, Herbs, Seeds, Equipment) - simple, recognizable, warm style
3. **Product Images**: Multiple angles per product, minimum 800x800, natural lighting, white or farm background
4. **Seller Avatars**: Profile photos or farm logos, circular crop, 200x200
5. **Seasonal Highlights**: Supporting lifestyle images of seasonal produce, 1200x800
6. **Empty States**: Friendly illustrations for empty cart, no orders, no products (warm, agricultural theme)

**Image Treatment**:
- Rounded corners throughout (rounded-lg for products, rounded-xl for heroes)
- Lazy loading for performance
- Placeholder gradients during load
- Aspect ratio preservation

---

## Responsive Breakpoints

- **Mobile**: 375px - 640px (base design)
- **Tablet**: 640px - 1024px (sm/md)
- **Desktop**: 1024px+ (lg/xl)

**Key Adaptations**:
- Navigation: Bottom bar → Top bar at md
- Product grid: 1-2 cols → 3-4 cols at lg
- Forms: Full width → max-w-2xl centered at md
- Sidebar filters: Drawer → Sidebar at lg

---

## Accessibility Features

- All interactive elements minimum 44x44px touch target
- Form inputs with clear labels and error messages
- High contrast ratios maintained throughout
- Skip to main content link
- Keyboard navigation support with visible focus states
- Screen reader friendly status announcements
- Alternative text for all product images
- ARIA labels for icon-only buttons