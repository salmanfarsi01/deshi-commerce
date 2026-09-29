# Deshi Commerce — Frontend Implementation Architecture & UI/UX Blueprint

This document is the definitive master blueprint for engineering the frontend of **Deshi Commerce**. It translates all **38 Spring Boot backend REST endpoints** into a high-converting, professional, and visually stunning e-commerce storefront and admin dashboard.

---

## 1. Frontend Architecture & Design Philosophy

### 1.1 Recommended Tech Stack
* **Framework:** Next.js (App Router) or React (Vite) with TypeScript
* **State Management:** Zustand or Redux Toolkit (for Cart, Auth, and Filter states)
* **Styling:** Tailwind CSS + Vanilla CSS Variables (or CSS Modules) for fluid responsive design
* **Data Fetching & Caching:** TanStack Query (React Query) or SWR with Axios interceptors
* **Icons:** Lucide React / Heroicons
* **Animation:** Framer Motion (for page transitions, cart drawer slide-ins, and toast notifications)
* **Notifications:** Sonner or React Hot Toast

### 1.2 Design System & Aesthetics (Bangladesh Retail Specific)
* **Color Palette:**
  * **Primary Brand:** Deep Emerald (`#0F766E` / `#0D9488`) — conveys trust, freshness, and national resonance.
  * **Accent / Action:** Vibrant Tangerine / Coral (`#F97316` / `#FB923C`) — for "Add to Cart", "Order Now", and discounts.
  * **Backgrounds:** Clean Arctic White (`#F8FAFC`) with subtle Dark Mode capability (`#0F172A`).
  * **Text:** Charcoal Black (`#0F172A`) for high contrast readability.
* **Typography:** `Inter` or `Plus Jakarta Sans` for English figures & headings; `Hind Siliguri` support for Bengali labels.
* **Currency Formatting:** All monetary amounts must format with the Bangladeshi Taka symbol: `৳ 1,620` or `BDT 1,620`.
* **Mobile-First UX:** Over 75% of Bangladeshi e-commerce traffic is mobile. Sticky bottom navigation, slide-over cart drawers, and tap-friendly touch targets are mandatory.

---

## 2. API Client & Authentication Layer

### 2.1 Axios Client with Silent Refresh Token Rotation
The frontend maintains two tokens: `accessToken` (short-lived, in memory or secure cookie) and `refreshToken` (in HttpOnly cookie or secure storage).

```typescript
// src/services/apiClient.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Injects Bearer JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Auto Refresh on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post('http://localhost:8080/api/v1/auth/refresh', {
          refreshToken,
        });

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 3. Customer-Facing Storefront: View by View

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER STOREFRONT                             │
├───────────────────┬───────────────────┬───────────────────┬────────────┤
│ 1. Home / Catalog │ 2. Product Detail │ 3. Cart & Checkout│ 4. Account │
│ - Top Promo Banner│ - Image Gallery   │ - Slide Drawer    │ - Orders   │
│ - Header / Search │ - Price & Discount│ - Address Picker  │ - Tracking │
│ - Category Ribbon │ - Stock Badge     │ - Inside/Outside  │ - Profile  │
│ - Product Cards   │ - Sticky Buy Bar  │ - SSLCommerz / COD│ - Address  │
└───────────────────┴───────────────────┴───────────────────┴────────────┘
```

---

### View 1: Header & Global Navigation Bar

#### Endpoints Connected:
* `GET /api/v1/categories` — Fetches active categories for top navigation ribbon.
* `GET /api/v1/cart` — Fetches cart badge count and subtotal.
* `GET /api/v1/auth/profile` — Checks active login status & role.

#### UI Layout & Components:
1. **Top Notice Bar:** "Free delivery across Bangladesh on orders over ৳5,000! 🇧🇩"
2. **Main Navigation Row:**
   * **Logo:** *Deshi Commerce* with brand emblem.
   * **Search Bar:** Real-time debounce search input (`GET /api/v1/products?search=...`).
   * **Location Indicator:** "Deliver to Dhaka / Outside Dhaka".
   * **Auth Widget:**
     * If Logged Out: `[Login / Sign Up]` button opening modal.
     * If Logged In: User avatar dropdown with *My Orders*, *Saved Addresses*, *Admin Dashboard* (if role is `ADMIN`), and *Logout*.
   * **Cart Trigger:** Floating bag icon with vibrant badge displaying item count (e.g. `2`) and dynamic subtotal.
3. **Category Ribbon:** Horizontal scrollable category pill tags:
   * `[ All ]` `[ 📱 Mobile ]` `[ 💻 Electronics ]` `[ 👗 Fashion ]` `[ 🏠 Home Appliance ]`

---

### View 2: Product Catalog & Filtering Grid (`/products` or `/`)

#### Endpoints Connected:
* `GET /api/v1/products` with query params:
  * `category` (category slug)
  * `search` (text query)
  * `minPrice` & `maxPrice`
  * `availability` (boolean: in stock only)
  * `sort` (`price_asc`, `price_desc`, `rating_desc`, `newest`)
  * `page` and `size`

#### UI Layout & Components:
```
┌──────────────────────┬─────────────────────────────────────────────────┐
│ FILTER SIDEBAR       │ CATALOG GRID & SORTING                          │
├──────────────────────┼─────────────────────────────────────────────────┤
│ • Categories (List)  │ Sort by: [ Popular ▼ ]    Showing 1-20 of 48    │
│   ☑ Mobile           │                                                 │
│   ☐ Electronics      │ ┌───────────────┐ ┌───────────────┐ ┌─────────┐ │
│   ☐ Fashion          │ │ [IMG] -7% OFF │ │ [IMG] -9% OFF │ │ [IMG]   │ │
│ • Price Range (BDT)  │ │ Galaxy A55 5G │ │ Redmi Note 13 │ │ Sony XM5│ │
│   [ 1,000 - 50,000 ] │ │ ৳ 41,999      │ │ ৳ 29,999      │ │ ৳ 35,000│ │
│ • In Stock Only [✓]  │ │ ⭐ 4.8 (42)   │ │ ⭐ 4.6 (38)   │ │ ⭐ 4.9  │ │
│ • Reset Filters      │ │ [Add to Cart] │ │ [Add to Cart] │ │[Add Cart]││
│                      │ └───────────────┘ └───────────────┘ └─────────┘ │
│                      │ ◄ [ 1 ]  [ 2 ]  [ 3 ] ►                         │
└──────────────────────┴─────────────────────────────────────────────────┘
```

#### Micro-Interactions & States:
* **Product Card:**
  * Discount percentage badge (e.g., `-10% OFF` in bold red/orange).
  * Strikethrough original price if `discountPrice` is present (`৳ 44,999` `৳ 41,999`).
  * Rating pill with yellow star (`⭐ 4.8`).
  * "Add to Cart" button turns into a quantity stepper `[ - 1 + ]` when already in cart.
* **Skeleton Loading:** 8 animated shimmering placeholder cards while TanStack Query fetches data.
* **Empty State:** Illustrated graphic "No products match your filters" with a `[Clear Filters]` button.

---

### View 3: Product Detail Page (`/products/[slug]`)

#### Endpoints Connected:
* `GET /api/v1/products/{slug}`
* `POST /api/v1/cart/items`

#### UI Layout & Components:
1. **Breadcrumbs:** `Home > Electronics > Audio > Sony WH-1000XM5`
2. **Left Column (Media Gallery):**
   * High-resolution primary viewport with image zoom on hover.
   * Thumbnail carousel displaying all angles from `product.images`.
3. **Right Column (Product Metadata & Purchasing):**
   * **Product Title:** Large bold typography.
   * **Category & Availability Badge:** `In Stock (12 units left)` in emerald green or `Out of Stock` in muted gray.
   * **Pricing Display:** Prominent `৳ 35,000` with old price `৳ 38,500` and savings calculator: *"You save ৳ 3,500 (9%)"*.
   * **Delivery Estimate Banner:** *"Delivery inside Dhaka in 24-48 hrs (৳60) | Outside Dhaka in 3-5 days (৳120)"*.
   * **Quantity Stepper:** `[ - ]` `[ 1 ]` `[ + ]` bounded by `product.stock`.
   * **CTA Action Buttons:**
     * `[ Add to Cart ]` (Secondary outlined button with cart icon).
     * `[ Buy Now ]` (Primary vibrant button that adds item and immediately opens checkout).
4. **Bottom Tabs:** Product Description, Specifications, and Shipping & Return policy.

---

### View 4: Cart Slide-Over Drawer & Cart Page (`/cart`)

#### Endpoints Connected:
* `GET /api/v1/cart` — Retrieves cart items, subtotal, and automatic delivery charge.
* `POST /api/v1/cart/items` — Adds product.
* `PATCH /api/v1/cart/items/{itemId}` — Updates quantity.
* `DELETE /api/v1/cart/items/{itemId}` — Removes item.
* `DELETE /api/v1/cart` — Clears entire cart.

#### UI Layout & Components:
```
┌───────────────────────────────────────────────┐
│ Shopping Cart (2 items)                   [X] │
├───────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────┐ │
│ │ [IMG] Samsung Galaxy A55 5G               │ │
│ │ ৳ 41,999 x [ - 1 + ]       Trash: [🗑️]    │ │
│ └───────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────────┐ │
│ │ [IMG] Aarong Festive Panjabi              │ │
│ │ ৳ 3,999 x [ - 2 + ]        Trash: [🗑️]    │ │
│ └───────────────────────────────────────────┘ │
├───────────────────────────────────────────────┤
│ Subtotal:                           ৳ 49,997  │
│ Delivery Charge:                      FREE 🇧🇩 │
│ (Orders over ৳5,000 qualify for free delivery)│
│ Estimated Total:                    ৳ 49,997  │
├───────────────────────────────────────────────┤
│ [ Proceed to Checkout ➔ ]                     │
└───────────────────────────────────────────────┘
```

#### Smart Cart Features:
* **Free Delivery Progress Bar:** Shows progress toward ৳5,000 threshold: *"Add ৳1,001 more to get FREE Delivery!"*.
* **Instant Recalculation:** Subtotal and total recompute without full page reloads using optimistic UI updates.

---

### View 5: Seamless Checkout & Delivery Address (`/checkout`)

#### Endpoints Connected:
* `GET /api/v1/addresses` — Customer's saved addresses.
* `POST /api/v1/addresses` — Add new Bangladesh delivery address.
* `GET /api/v1/payments/methods` — Available payment methods (COD, SSLCommerz, bKash, Nagad).
* `POST /api/v1/orders` — Submits order.

#### UI Layout & Components:
1. **Step 1: Delivery Address (Bangladesh Geo Structure):**
   * Radio selection of existing saved addresses with a default highlighted.
   * `[ + Add New Address ]` expandable form:
     * Full Name & Contact Phone (`017XXXXXXXX` format validation).
     * **Division Dropdown:** Dhaka, Chittagong, Rajshahi, Sylhet, Khulna, Barisal, Rangpur, Mymensingh.
     * **District Dropdown:** Cascades dynamically based on selected Division.
     * **Upazila / Thana Input:** Specific local administrative unit.
     * **Detailed Street Address:** House, Road, Floor, Area.
     * Checkbox: `[✓] Save as default shipping address`.
2. **Step 2: Real-time Shipping Calculation Card:**
   * If District == `Dhaka`: Shows **Inside Dhaka Delivery: ৳ 60**.
   * If District != `Dhaka`: Shows **Outside Dhaka Delivery: ৳ 120**.
   * If Subtotal ≥ ৳ 5,000: Shows **Free Delivery: ৳ 0**.
3. **Step 3: Payment Method Selection:**
   * `(o) Cash on Delivery (COD)` — Pay cash when package arrives at your doorstep.
   * `( ) SSLCOMMERZ (Cards / bKash / Nagad / Rocket / Internet Banking)` — Instant online payment gateway.
4. **Step 4: Customer Note Input:**
   * "Please call before delivery" / "Deliver after 5 PM".
5. **Step 5: Order Submission Button:**
   * `[ Place Order • ৳ 42,059 ]`

---

### View 6: SSLCommerz Gateway Redirection & Callback Handling

#### Endpoints Connected:
* `POST /api/v1/payments/sslcommerz/init/{orderId}` — Generates session and returns `gatewayPageURL`.
* `POST /api/v1/payments/sslcommerz/simulate-success/{orderId}` — 1-click test simulation for sandbox testing.

#### Client Flow:
1. When user selects **SSLCOMMERZ** and clicks *Place Order*:
   * Order is created in state `PENDING`, payment status `INITIATED`.
   * Frontend invokes `POST /api/v1/payments/sslcommerz/init/{orderId}`.
   * Full-screen smooth loader displays: *"Redirecting to secure SSLCommerz payment portal..."*.
   * `window.location.href = data.gatewayPageURL`.
2. Customer completes payment on SSLCommerz portal (bKash/Visa/Mastercard).
3. Gateway redirects back to frontend routes:
   * **Success:** `/payment/success?tran_id=...` -> Shows animated green checkmark, invoice download, and order confirmation.
   * **Failure / Cancel:** `/payment/failed` or `/payment/cancelled` -> Shows retry payment button with payment method selector.

---

### View 7: Order Confirmation & Customer Live Tracking (`/orders/[id]`)

#### Endpoints Connected:
* `GET /api/v1/orders/{id}` — Order details, items, courier status, and tracking link.

#### UI Layout & Components:
```
┌────────────────────────────────────────────────────────────────────────┐
│ Order Confirmed! #BD-73029654                              [ Print 🖨️ ]│
├────────────────────────────────────────────────────────────────────────┤
│ ORDER STATUS TRACKER:                                                  │
│  [✓] Placed  ➔  [✓] Confirmed  ➔  [✓] Shipped  ➔  [ ] Out for Delivery │
│                                                                        │
│ Courier Partner: Steadfast Courier                                     │
│ Tracking Number: ST-889900                                             │
│ Live Tracking:   [ 🔗 Track on Steadfast Portal ↗ ]                    │
├────────────────────────────────────────────────────────────────────────┤
│ DELIVERY ADDRESS:                PAYMENT SUMMARY:                      │
│ Karim Ahmed                      Method: SSLCommerz (Visa •••• 4242)   │
│ 01722222222                      Status: PAID (Tx: SSLCZ_8DB2E921)     │
│ House 12, Road 5, Dhanmondi      Subtotal:        ৳ 41,999             │
│ Dhaka, Bangladesh                Delivery Charge: ৳ 0 (Free)           │
│                                  Total Paid:      ৳ 41,999             │
└────────────────────────────────────────────────────────────────────────┘
```

---

### View 8: Customer Profile & Auth Center (`/account`)

#### Endpoints Connected:
* `POST /api/v1/auth/login` (Supports login via phone or email)
* `POST /api/v1/auth/register` (Validates 11-digit Bangladeshi mobile)
* `POST /api/v1/auth/forgot-password` & `POST /api/v1/auth/reset-password`
* `GET /api/v1/orders` (Customer's complete order history)
* `GET /api/v1/addresses` & `DELETE /api/v1/addresses/{id}`

#### UI Tabs:
1. **My Orders:** List of all previous orders with status pills (`PENDING` in amber, `SHIPPED` in blue, `DELIVERED` in emerald, `CANCELLED` in red).
2. **Address Book:** Saved home and office addresses with 1-click default switcher.
3. **Security Settings:** Change password (`PUT /api/v1/user/profile/password`).

---

## 4. Admin Dashboard Blueprint (`/admin`)

The Admin Dashboard provides full visibility and control over products, categories, customer orders, and dispatch couriers. All routes are protected by role `ADMIN`.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD PORTAL                          │
├───────────────────┬───────────────────┬───────────────────┬────────────┤
│ 1. Metrics Hub    │ 2. Order Pipeline │ 3. Catalog Manage │ 4. Audits  │
│ - Total Revenue   │ - Status Tabs     │ - Products CRUD   │ - SMS Logs │
│ - Order Volumes   │ - Courier Assign  │ - Categories CRUD │ - Email Log│
│ - Pending Alerts  │ - Customer Profile│ - Stock Control   │ - Tenants  │
└───────────────────┴───────────────────┴───────────────────┴────────────┘
```

---

### Admin View 1: Executive KPI Dashboard (`/admin`)

#### Endpoint Connected:
* `GET /api/v1/admin/dashboard/summary`

#### UI Cards & Visuals:
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ TOTAL REVENUE   │ │ TOTAL ORDERS    │ │ PENDING ORDERS  │ │ LOW STOCK ALERT │
│ ৳ 1,482,900     │ │ 248 Orders      │ │ 14 Need Dispatch│ │ 3 Products      │
│ +18% this month │ │ 92% fulfilled   │ │ Action Required │ │ Restock Soon    │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```
* **Recent Orders Table:** Quick-look preview of the last 10 placed orders.
* **Quick Action Buttons:** `[ + New Product ]`, `[ Export Orders CSV ]`.

---

### Admin View 2: Order Management & Courier Dispatch (`/admin/orders`)

#### Endpoints Connected:
* `GET /api/v1/admin/orders` with query filters:
  * `status`: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`
  * `search`: Matches Order Number, Customer Name, Phone, or District
  * `userId`: Filter by specific customer
* `PATCH /api/v1/admin/orders/{id}/tracking`: Assigns courier & tracking link.
* `PATCH /api/v1/admin/orders/{id}/status`: Advances order pipeline.
* `GET /api/v1/admin/orders/customer/{userId}`: Inspects customer's lifetime value and order history.

#### UI Layout & Workflow:
1. **Status Filter Tabs:**
   `[ All (248) ]` `[ Pending (14) ]` `[ Confirmed (8) ]` `[ Processing (12) ]` `[ Shipped (45) ]` `[ Delivered (162) ]` `[ Cancelled (7) ]`
2. **Order Table Columns:**
   * **Order #:** `BD-73029654` (Clickable to open Order Details Modal).
   * **Customer:** Rahim Chowdhury (`01711111111`) | Dhaka.
   * **Items:** 2 items (Galaxy A55, Panjabi).
   * **Total:** ৳ 41,999 (`COD` or `PAID - SSLCommerz`).
   * **Status Badge:** Visual color-coded pill.
   * **Courier:** `Steadfast (ST-889900)` or `Unassigned`.
   * **Action Buttons:** `[ Assign Courier ]` `[ Update Status ]` `[ Customer History ]`.

#### Courier Assignment Modal:
```
┌────────────────────────────────────────────────────────┐
│ Assign Courier & Tracking — Order #BD-73029654     [X] │
├────────────────────────────────────────────────────────┤
│ Courier Partner:                                       │
│ [ Steadfast Courier                     ▼ ]            │
│ (Options: Steadfast, Pathao, Paperfly, RedX, In-House) │
│                                                        │
│ Tracking / Consignment Number:                         │
│ [ ST-889900                                 ]          │
│                                                        │
│ Tracking URL (Auto-generated if empty):                │
│ [ https://steadfast.com.bd/tracking/ST-889900 ]        │
│                                                        │
│ Estimated Delivery Date:                               │
│ [ 2026-10-02                                ]          │
│                                                        │
│ Status Transition:                                     │
│ [✓] Advance status to SHIPPED and trigger Customer SMS │
├────────────────────────────────────────────────────────┤
│ [ Cancel ]                       [ Save & Dispatch ➔ ] │
└────────────────────────────────────────────────────────┘
```

---

### Admin View 3: Customer 360° Order History (`/admin/customers/[id]`)

#### Endpoint Connected:
* `GET /api/v1/admin/orders/customer/{userId}`

#### UI Layout:
* **Customer Header:** Name, Phone, Email, Lifetime Spent (`৳ 84,998`), Completed Orders (`2`), Return Rate (`0%`).
* **Fraud Risk Assessment:** Verifies whether phone number has previous COD rejected deliveries.
* **Full Order Timeline:** Interactive list of all orders ever placed by this customer.

---

### Admin View 4: Product Inventory Management (`/admin/products`)

#### Endpoints Connected:
* `GET /api/v1/products` (Full catalog with pagination)
* `POST /api/v1/admin/products` (Create new product)
* `PUT /api/v1/admin/products/{id}` (Update price, stock, details)
* `DELETE /api/v1/admin/products/{id}` (Delete product)

#### Add / Edit Product Modal Fields:
* **Basic Info:** Product Name, URL Slug (auto-generated from name), Category selector.
* **Pricing & Inventory:** Price (BDT), Discounted Price (BDT), Stock Quantity.
* **Image Gallery Manager:** Multi-image URL inputs with preview thumbnails and Alt tags.
* **Availability Toggle:** Switch `In Stock` / `Unavailable`.
* **Rich Description:** Markdown / WYSIWYG editor.

---

### Admin View 5: Category Management (`/admin/categories`)

#### Endpoints Connected:
* `GET /api/v1/categories`
* `POST /api/v1/admin/categories`
* `PUT /api/v1/admin/categories/{id}`
* `DELETE /api/v1/admin/categories/{id}`

#### UI Layout:
* Grid / List view of all store categories with product count badges.
* Add Category drawer with Name, Slug, Description, and Active toggle.

---

### Admin View 6: SMS & Email Notification Audit Trail (`/admin/notifications`)

#### Endpoints Connected:
* `GET /api/v1/admin/notifications`
* `GET /api/v1/admin/notifications/order/{orderId}`

#### UI Table:
Displays an audit log of every communication dispatched to shoppers:
* **Timestamp:** `2026-09-29 15:44:28`
* **Channel:** `[ 📱 SMS ]` or `[ ✉️ EMAIL ]`
* **Event:** `ORDER_PLACED`, `ORDER_SHIPPED`, `PAYMENT_RECEIVED`
* **Recipient:** `88017XXXXXXXX` or `customer@example.com`
* **Message Preview:** *"Dear Tanvir, your order #BD-75068907 has been SHIPPED via Steadfast..."*
* **Status:** `[ SENT ]` in green or `[ SIMULATED ]` in blue.

---

## 5. End-to-End API Mapping Reference

| View / Component | User Action | HTTP Method & URL | Payload / Parameters |
| :--- | :--- | :--- | :--- |
| **Catalog Ribbon** | Page Load | `GET /api/v1/categories` | None |
| **Product Grid** | Filter / Search | `GET /api/v1/products` | `?category=mobile&search=galaxy&page=0` |
| **Product Detail** | View Item | `GET /api/v1/products/{slug}` | Slug path variable |
| **Product Detail** | Add To Cart | `POST /api/v1/cart/items` | `{"productId": "prd_01", "quantity": 1}` |
| **Cart Drawer** | Update Qty | `PATCH /api/v1/cart/items/{itemId}` | `{"quantity": 2}` |
| **Cart Drawer** | Remove Item | `DELETE /api/v1/cart/items/{itemId}` | None |
| **Cart Drawer** | Clear Cart | `DELETE /api/v1/cart` | None |
| **Checkout** | Load Saved Addr | `GET /api/v1/addresses` | Bearer Token |
| **Checkout** | Create Address | `POST /api/v1/addresses` | Name, Phone, Division, District, Upazila |
| **Checkout** | Submit Order | `POST /api/v1/orders` | `{"addressId": "addr_123", "paymentMethod": "COD"}` |
| **Payment Modal** | Pay SSLCommerz | `POST /api/v1/payments/sslcommerz/init/{orderId}` | Order ID |
| **Payment Test** | 1-Click Sandbox | `POST /api/v1/payments/sslcommerz/simulate-success/{orderId}` | Order ID |
| **Order Page** | Customer Cancel | `POST /api/v1/orders/{id}/cancel` | `{"reason": "Ordered wrong size"}` |
| **Admin Orders** | Filter by Status | `GET /api/v1/admin/orders` | `?status=PENDING&search=dhaka` |
| **Admin Orders** | Assign Courier | `PATCH /api/v1/admin/orders/{id}/tracking` | `{"courierName": "Steadfast", "trackingNumber": "ST-99"}` |
| **Admin Orders** | Advance Status | `PATCH /api/v1/admin/orders/{id}/status` | `{"status": "DELIVERED"}` |
| **Admin Cust.** | Lifetime Value | `GET /api/v1/admin/orders/customer/{userId}` | User ID |
| **Admin Stats** | Load Dashboard | `GET /api/v1/admin/dashboard/summary` | Bearer Token (ADMIN) |
| **Admin Notif.** | View Logs | `GET /api/v1/admin/notifications` | Bearer Token (ADMIN) |

---

## 6. Implementation Steps Checklist

- [ ] **Step 1:** Initialize Frontend Project (`npm create vite@latest deshi-frontend -- --template react-ts` or Next.js).
- [ ] **Step 2:** Configure API Client & JWT Interceptor with auto-refresh mechanism.
- [ ] **Step 3:** Implement Design Tokens (Emerald green `#0D9488`, Orange accent `#F97316`, Inter font).
- [ ] **Step 4:** Build Storefront Header, Category Ribbon, and Product Grid with filters.
- [ ] **Step 5:** Build Slide-Over Cart Drawer with dynamic inside/outside Dhaka threshold logic.
- [ ] **Step 6:** Build Checkout Form with Bangladesh Division/District selectors.
- [ ] **Step 7:** Connect SSLCommerz gateway redirect and payment verification routes.
- [ ] **Step 8:** Build Customer Order Confirmation & Tracking page.
- [ ] **Step 9:** Build Admin Dashboard with KPI counters, Order Dispatch modal, and Product CRUD.
- [ ] **Step 10:** Connect SMS & Email Audit log viewer.
