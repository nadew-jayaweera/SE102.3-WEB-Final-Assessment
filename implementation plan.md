# NSBM Green Mini Store — Complete Frontend Implementation

## Overview

The **NSBM Green Mini Store** is a university student marketplace platform with two distinct surfaces:
1. **Customer Storefront** — Public-facing pages for browsing and purchasing
2. **Admin Portal** — Protected management pages for staff/administrators

The Stitch project has **10 screens** across both surfaces. We will fetch every screen's HTML from Stitch, refactor it into a unified, multi-page HTML/JS/CSS codebase with a shared design system, client-side routing, and a mock data layer — producing a fully functional, navigable frontend without a backend.

---

## Screens Identified (from Stitch MCP)

| # | Screen Title | Screen ID | Surface | File |
|---|---|---|---|---|
| 1 | **NSBM Mini Store - Home** | `2c06af9c4c8d4a9184cdcf6dfe18f5df` | Storefront | `index.html` |
| 2 | **Browse Products - NSBM Mini Store** | `31e3794d617c4d1e838cf0ccc5bdcc44` | Storefront | `products.html` |
| 3 | **Product Details - NSBM Mini Store** | `0f35abba9dce411e8b8438b6c2a6d1e0` | Storefront | `product-detail.html` |
| 4 | **Checkout - NSBM Mini Store** | `a011be57a93443588dfee80ba6db127d` | Storefront | `checkout.html` |
| 5 | **NSBM Mini Store Flow** | `809d0125296a4dc6b139d6487ceeccb4` | Storefront | *(reference only)* |
| 6 | **Admin Login - NSBM Mini Store** | `6f5249facce24933ad9f0fcf5d5f6ad4` | Admin | `admin/login.html` |
| 7 | **Admin Dashboard - NSBM Mini Store** | `6353ef616f9a4f1fb25b2c59f1fabbb9` | Admin | `admin/dashboard.html` |
| 8 | **Manage Products - Admin Portal** | `83338d480e2a41b88c7e3d4fc4940b9a` | Admin | `admin/products.html` |
| 9 | **Add Product - Admin Portal** | `1830ae620e0e4527a1c74bde21bed9ab` | Admin | `admin/add-product.html` |
| 10 | **Purchase Requests - Admin Portal** | `df56a3582c2947c4855aeb171080d933` | Admin | `admin/purchase-requests.html` |

---

## Design System (extracted from Stitch)

- **Primary colour:** `#006A4E` (University heritage green)
- **Secondary colour:** `#4CAF50` (Fresh green accent)
- **Font:** `Inter` (all weights: 400, 500, 600, 700)
- **Corner radius:** `12px` (standard), `24px` (large containers)
- **Colour mode:** Light
- **Shadows:** `0 4px 12px rgba(0, 106, 78, 0.08)`
- **Surface/Background:** `#fcf9f8` / `#ffffff`
- **On-surface text:** `#1c1b1b`
- **On-surface-variant:** `#3f4944`
- **Outline:** `#6f7a73` / `#bec9c2`

---

## Project File Structure

```
d:\Work\Code\GitHubRepos\SE102.3-WEB-Final-Assessment\
├── index.html                    # Home / Landing page
├── products.html                 # Browse Products
├── product-detail.html           # Product Detail page
├── checkout.html                 # Checkout
├── admin/
│   ├── login.html                # Admin Login
│   ├── dashboard.html            # Admin Dashboard
│   ├── products.html             # Manage Products
│   ├── add-product.html          # Add/Edit Product form
│   └── purchase-requests.html    # Purchase Requests
├── css/
│   ├── design-system.css         # CSS custom properties, tokens, base resets
│   ├── components.css            # Reusable component styles (nav, cards, buttons, etc.)
│   ├── storefront.css            # Customer-facing page styles
│   └── admin.css                 # Admin portal page styles
└── js/
    ├── data.js                   # Mock data store (products, orders, users)
    ├── cart.js                   # Cart logic (add/remove/persist via localStorage)
    ├── router.js                 # Lightweight URL param / page state manager
    ├── storefront.js             # Home, products, product detail logic
    └── admin.js                  # Admin auth guard, dashboard, CRUD logic
```

---

## Proposed Changes

### Phase 1 — Design System Foundation

#### [NEW] `css/design-system.css`
Define all CSS custom properties from the Stitch design tokens:
- Color palette variables (`--color-primary`, `--color-surface`, etc.)
- Typography scale (`--font-headline-xl` through `--font-body-sm`)
- Spacing scale (`--space-xs` through `--space-xl`)
- Shadow & border-radius tokens
- Google Fonts import for Inter

#### [NEW] `css/components.css`
Shared, reusable UI components used across all pages:
- Navbar (logo, navigation links, cart icon badge, hamburger mobile menu)
- Footer
- Product cards (image, title, price, category chip, Add-to-Cart button)
- Buttons (primary, secondary, ghost)
- Input fields, labels
- Chips/badges (category, status)
- Modal/overlay
- Toast notification
- Admin sidebar navigation

---

### Phase 2 — Mock Data Layer

#### [NEW] `js/data.js`
A JavaScript module with all mock data:
- `products[]` — 12+ products with id, name, price, category, description, image URL (from Unsplash), seller, stock
- `categories[]` — Handmade Crafts, Digital Art & Prints, Baked Goods, Study Essentials, Accessories
- `orders[]` / `purchaseRequests[]` — sample orders with status (pending, approved, shipped)
- `adminUser` — mock credentials for demo login

#### [NEW] `js/cart.js`
Cart state management:
- `addToCart(productId, qty)` / `removeFromCart()` / `clearCart()`
- Persists to `localStorage`
- Emits `cart:updated` event for badge counter refresh
- `getCartTotal()`, `getCartItems()`

---

### Phase 3 — Customer Storefront Pages

#### [NEW] `index.html` — Home / Landing Page
Sections (from Stitch screen):
- Sticky header/navbar with cart badge
- Hero banner: headline, sub-headline, CTA "View All" button
- Featured products grid (3 cards)
- Category tiles (Handmade Crafts, Digital Art, Baked Goods, Study Essentials)
- "Study Essentials" promotional banner section
- Footer (quick links, copyright)

#### [NEW] `products.html` — Browse Products
- Header + nav
- Page title "Explore Products"
- Filter bar: category chips, search input, sort dropdown
- Responsive product grid (4 cols desktop → 2 cols tablet → 1 col mobile)
- "Add to Cart" with stock status chip per card
- Footer

#### [NEW] `product-detail.html` — Product Detail
- Fetches product by `?id=` URL param using `data.js`
- Large product image
- Product title, price, seller info, category chip
- Quantity selector + "Add to Cart" button
- Product description section
- Related products (same category, 3 cards)
- Footer

#### [NEW] `checkout.html` — Checkout
- Order summary sidebar (items, quantities, subtotal, delivery, total)
- Buyer details form (name, email, student ID, address)
- Payment method selection (mock)
- "Place Order" button → shows success toast/modal, clears cart

---

### Phase 4 — Admin Portal Pages

#### [NEW] `admin/login.html` — Admin Login
- Centered login card (NSBM green header)
- Email + password inputs
- Login button
- Mock auth: checks against `data.js` credentials, sets `sessionStorage` flag, redirects to dashboard

#### [NEW] `admin/dashboard.html` — Admin Dashboard
- Admin sidebar navigation (Dashboard, Products, Purchase Requests)
- Auth guard: redirects to login if not authenticated
- KPI stat cards: Total Products, Pending Orders, Total Revenue, Active Sellers
- Recent activity table
- Quick-action buttons

#### [NEW] `admin/products.html` — Manage Products
- Admin sidebar + header
- Data table: product name, category, price, stock, status, actions (Edit/Delete)
- "Add Product" button → links to `add-product.html`
- Inline delete with confirmation modal
- Search/filter bar above table

#### [NEW] `admin/add-product.html` — Add / Edit Product
- Admin sidebar + header
- Form: product name, description, price, category (dropdown), stock qty, image URL
- "Save Product" → updates mock data store, shows success toast, back to products list
- Pre-fills form when `?editId=` param is present (Edit mode)

#### [NEW] `admin/purchase-requests.html` — Purchase Requests
- Admin sidebar + header
- Requests table: order ID, buyer name, student ID, product, qty, total, status, date
- Status filter tabs: All, Pending, Approved, Rejected
- Action buttons: Approve / Reject per row (updates status in mock store)
- Status chips with color coding

---

### Phase 5 — JavaScript Logic

#### [NEW] `js/storefront.js`
- On page load: reads `data.js`, renders product cards dynamically
- Category filter: filters `products[]`, re-renders grid
- Search: debounced real-time filter
- `product-detail.html`: reads `?id=` param, renders product data

#### [NEW] `js/admin.js`
- Auth guard: checks `sessionStorage`, redirects if unauthenticated
- Logout clears session
- Dashboard: computes stats from `data.js`
- Products table: renders rows, handles delete (removes from array)
- Add/Edit product: form submit handler, updates `data.js` in memory
- Purchase requests: status update handlers

#### [NEW] `js/router.js`
- Small utility to read/write URL params: `getParam('id')`, `setParam()`
- Manages active nav link highlighting across pages

---

## Key Technical Decisions

> [!IMPORTANT]
> **Pure HTML/CSS/JS only** — No frameworks, no build tools. Each page is a standalone `.html` file sharing the same CSS and JS modules via `<link>` / `<script>` tags. This keeps it deployable as a static site anywhere.

> [!NOTE]
> **Mock data is in-memory + localStorage.** No backend is required. `data.js` exports a global `NSBMStore` object. Cart persists across page loads via `localStorage`. Admin state persists within a browser session via `sessionStorage`.

> [!TIP]
> **Images** — Product images will use high-quality placeholder images from `picsum.photos` or Unsplash source URLs initially. They can be swapped for real assets later.

---

## Verification Plan

### Manual Browser Testing
- [ ] Home page renders and all CTAs navigate correctly
- [ ] Products page filters by category and search
- [ ] Product detail loads from URL param `?id=`
- [ ] "Add to Cart" updates cart badge across pages
- [ ] Checkout page shows cart items and submits successfully
- [ ] Admin login rejects wrong credentials, accepts correct ones
- [ ] Admin pages redirect to login when unauthenticated
- [ ] Admin can add/edit/delete products (in-memory)
- [ ] Purchase requests can be approved/rejected
- [ ] Responsive layout at 375px, 768px, 1280px breakpoints

### Static Deployment Test
- Open `index.html` directly in the browser from the filesystem (no server needed)

---

## Open Questions

> [!IMPORTANT]
> **1. Target directory:** The workspace is `SE102.3-WEB-Final-Assessment` which is currently almost empty. Should all files be built there, or in a different directory?

> [!NOTE]
> **2. Backend integration scope:** This plan is for a fully static frontend with mock data. Do you eventually need real API calls (to a REST API or Supabase)? If yes, the JS modules should be structured to make that swap easy.

> [!NOTE]
> **3. Product images:** Shall we use Unsplash/picsum placeholders, or should I generate images with the AI image tool to match the product descriptions?

> [!NOTE]
> **4. Admin credentials:** For the mock login demo, what credentials should be used? (e.g. `admin@nsbm.ac.lk` / `admin123`)
