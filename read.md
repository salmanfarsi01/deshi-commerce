# Bangladesh E-Commerce Backend — Workflow & API Guide

Welcome to the documentation for our e-commerce backend platform. This system is designed specifically for the Bangladesh retail market, supporting local phone numbers, geographical address structures (Divisions, Districts, Upazilas), and popular local payment channels (bKash, Nagad, SSLCommerz, and Cash on Delivery).

---

## 1. Technology Stack Used

- **Language:** Java (JDK 27)
- **Framework:** Spring Boot (Spring Web MVC)
- **Security & Authentication:** Spring Security with BCrypt password hashing & HMAC-SHA256 Stateless JWT Filter
- **Data Validation:** Jakarta Bean Validation (Hibernate Validator)
- **Storage Layer (Agile Phase):** Thread-safe in-memory repositories with pre-loaded mock data (fully decoupling the API layer from the database so frontend development and testing can happen immediately)
- **Build Tool:** Maven with Maven Wrapper (`mvnw`)
- **Testing:** JUnit 5 and Spring Boot Test

---

## 2. Complete Customer & System Workflow

Here is how a real shopper and store admin interact with the platform from start to finish:

```
[Customer Signs Up / Logs In]
         │
         ▼
[Browses Products & Categories]
         │
         ▼
[Adds Products to Shopping Cart]
         │  (Server calculates price & BDT 60 delivery charge)
         ▼
[Saves Bangladesh Delivery Address]
         │  (Division, District, Upazila, Area)
         ▼
[Places Order & Selects Payment]
         │  (COD, bKash, Nagad, or SSLCommerz)
         ├────────────────────────────────────────┐
         ▼                                        ▼
[Cash on Delivery (COD)]             [Online Payment Gateway]
Order is PENDING                     Redirect to bKash/Nagad
Delivery agent collects cash         Payment verified via webhook
         │                                        │
         └──────────────────┬─────────────────────┘
                            ▼
           [Admin Updates Order Pipeline]
       PENDING ➔ CONFIRMED ➔ PROCESSING ➔ SHIPPED ➔ DELIVERED
                            │
              (If cancelled at any time,
              items return to stock automatically)
```

---

## 3. Why We Built Each API (Logical Explanation)

Below is every REST endpoint we built, along with the plain-English reason why it exists and what problem it solves.

---

### A. Authentication APIs (`/api/v1/auth`)

#### 1. `POST /api/v1/auth/register`
- **What it does:** Creates a new customer account using their name, phone number, optional email, and password.
- **Why we built it:** Customers need an identity to store addresses and view orders. In Bangladesh, many shoppers don't use email regularly, so this endpoint automatically formats all mobile numbers (like `+88017...`, `017...`, `01712-345678`) into a standard 11-digit number (`01XXXXXXXXX`) so duplicate accounts are never created.

#### 2. `POST /api/v1/auth/login`
- **What it does:** Authenticates a user using either their mobile number or email address, plus their password. Returns an Access Token and Refresh Token.
- **Why we built it:** Gives customers a secure session token to browse and buy without retyping credentials on every click. It supports logging in with either phone or email for maximum convenience.

#### 3. `POST /api/v1/auth/refresh`
- **What it does:** Issues a fresh access token when the current token expires, using the secure refresh token.
- **Why we built it:** Security best practice. Short-lived access tokens prevent unauthorized access if intercepted, while refresh tokens keep the user logged in without forcing them to re-enter their password.

#### 4. `POST /api/v1/auth/logout`
- **What it does:** Ends the active session and invalidates the authentication token.
- **Why we built it:** Gives users security and privacy control, especially when using shared computers or family phones.

#### 5. `POST /api/v1/auth/forgot-password` & `POST /api/v1/auth/reset-password`
- **What it does:** Sends a 6-digit verification code (OTP) to the user's mobile number, then lets them set a new password.
- **Why we built it:** Users frequently forget passwords. Mobile OTP is the industry standard for fast password recovery across Bangladesh.

---

### B. Customer Profile APIs (`/api/v1/users`)

#### 6. `GET /api/v1/users/me`
- **What it does:** Returns the currently logged-in customer's profile (name, phone, email, account status).
- **Why we built it:** Allows mobile apps and web frontends to display the customer's name on the header and fill in profile forms.

#### 7. `PUT /api/v1/users/me`
- **What it does:** Updates the customer's display name or email address.
- **Why we built it:** Gives customers full control to update their personal information as needed.

#### 8. `PATCH /api/v1/users/me/password`
- **What it does:** Allows a customer to change their password by confirming their old password first.
- **Why we built it:** Standard account security hygiene to prevent account takeovers.

---

### C. Category APIs (`/api/v1/categories` & `/api/v1/admin/categories`)

#### 9. `GET /api/v1/categories`
- **What it does:** Returns a list of all active categories (e.g., Mobile, Electronics, Fashion, Home Appliance).
- **Why we built it:** The frontend needs this to build navigation menus, category filters, and homepage badges.

#### 10. `GET /api/v1/categories/{id}`
- **What it does:** Returns detailed information about one specific category.
- **Why we built it:** Used when a shopper lands on a category landing page to show its title, banner, and description.

#### 11. `POST /api/v1/admin/categories`
- **What it does:** Allows store managers to add a new category with an automatic URL slug.
- **Why we built it:** The store catalog changes often as new seasonal items arrive. Admins need an easy way to expand catalog departments without touching code.

#### 12. `PUT /api/v1/admin/categories/{id}` & `DELETE /api/v1/admin/categories/{id}`
- **What it does:** Updates category names/descriptions or deletes an unused category.
- **Why we built it:** Routine catalog maintenance and content cleanup.

---

### D. Product Catalog APIs (`/api/v1/products` & `/api/v1/admin/products`)

#### 13. `GET /api/v1/products`
- **What it does:** A search and filter endpoint that accepts category, search keywords, price ranges (minPrice/maxPrice), in-stock flags, sorting options, and pagination.
- **Why we built it:** Shoppers rarely scroll through thousands of items. Instead of creating 5 different endpoints, one flexible query endpoint handles search bars, price filters, and sorting ("lowest price first", "highest rating", "newest arrivals").

#### 14. `GET /api/v1/products/{id}` & `GET /api/v1/products/slug/{slug}`
- **What it does:** Fetches all details of a single product (images, price, discount price, stock level, description).
- **Why we built it:** Powers the Product Details Page (PDP). The slug version (e.g. `/slug/samsung-galaxy-a55`) is crucial for clean Google SEO indexing and shareable social media links.

#### 15. `POST /api/v1/admin/products`
- **What it does:** Lets admins add a new product with images, stock counts, price, and category.
- **Why we built it:** Allows store owners to list new inventory into the store.

#### 16. `PUT /api/v1/admin/products/{id}` & `DELETE /api/v1/admin/products/{id}`
- **What it does:** Updates prices, modifies descriptions, edits stock numbers, or de-lists products.
- **Why we built it:** Allows inventory managers to update stock counts after warehouse arrivals and run price promotions.

---

### E. Shopping Cart APIs (`/api/v1/cart`)

#### 17. `GET /api/v1/cart`
- **What it does:** Retrieves the user's active cart with itemized subtotals, calculated delivery fee, and grand total in BDT.
- **Why we built it:** Keeps the shopping cart persistent so the user can leave and return without losing selected items.

#### 18. `POST /api/v1/cart/items`
- **What it does:** Adds an item and quantity to the cart.
- **Why we built it:** Core e-commerce feature. The server checks live warehouse stock and pulls the authoritative product price from the database—meaning a malicious user cannot alter prices from the browser.

#### 19. `PATCH /api/v1/cart/items/{productId}`
- **What it does:** Changes the quantity of an item already in the cart (e.g. from 1 to 3).
- **Why we built it:** Lets shoppers adjust quantities on the fly with real-time stock availability validation.

#### 20. `DELETE /api/v1/cart/items/{productId}` & `DELETE /api/v1/cart`
- **What it does:** Removes one item or clears the entire cart.
- **Why we built it:** Gives customers an easy way to discard unwanted items before checkout.

---

### F. Bangladesh Address APIs (`/api/v1/addresses`)

#### 21. `GET /api/v1/addresses`
- **What it does:** Returns all saved delivery addresses for the logged-in customer.
- **Why we built it:** Returning customers shouldn't have to re-enter their home or office address every time they buy something.

#### 22. `POST /api/v1/addresses`
- **What it does:** Saves a shipping address tailored to Bangladesh: Division (e.g. Dhaka, Chittagong), District, Upazila/Thana (e.g. Dhanmondi, Gulshan), detailed road/house info, and phone number.
- **Why we built it:** Standard Western address fields ("State/Zip") do not work in Bangladesh. Having local administrative subdivisions ensures couriers (like Steadfast, Pathao, RedX) deliver parcels to the right doorstep without getting lost.

#### 23. `PUT /api/v1/addresses/{id}` & `DELETE /api/v1/addresses/{id}`
- **What it does:** Updates or removes a saved address.
- **Why we built it:** Lets users fix typos or remove old addresses after moving houses. Built with strict security checks so users can only touch their own addresses.

#### 24. `PATCH /api/v1/addresses/{id}/default`
- **What it does:** Selects which address should be pre-selected during checkout.
- **Why we built it:** Saves the user time during 1-click checkout.

---

### G. Orders & Checkout APIs (`/api/v1/orders` & `/api/v1/admin/orders`)

#### 25. `POST /api/v1/orders`
- **What it does:** Converts the shopping cart into a real order. It checks live stock, decrements inventory, creates a payment intent, and empties the cart.
- **Dynamic Delivery Fee Calculation (Inside vs Outside Dhaka):**
  - **Inside Dhaka:** **60 BDT** (applied when the shipping address district is Dhaka).
  - **Outside Dhaka:** **120 BDT** (applied for all other districts across Bangladesh, e.g., Chittagong, Sylhet, Rajshahi, Khulna).
  - **Free Shipping Threshold:** Orders of **5,000 BDT or more** qualify for **FREE Delivery (0 BDT)** anywhere in Bangladesh!
- **Why we built it:** Protects against incorrect delivery rates and standardizes courier fees matching Bangladeshi courier realities (Steadfast, Pathao, RedX).

#### 26. `GET /api/v1/orders` & `GET /api/v1/orders/{orderId}`
- **What it does:** Shows the customer their order history, courier assignment (`Steadfast`, `Pathao`), tracking code, and live tracking link.
- **Why we built it:** Gives customers peace of mind by allowing them to track parcels directly on courier websites.

#### 27. `POST /api/v1/orders/{orderId}/cancel`
- **What it does:** Lets the customer cancel a pending order.
- **Why we built it:** If cancelled, reserved stock automatically returns to store inventory.

#### 28. `GET /api/v1/admin/orders`
- **What it does:** Lets store managers see and search customer orders across the platform.
- **Search & Filters:**
  - `status`: filter by `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`
  - `userId`: track all orders belonging to one specific customer
  - `search`: search by order number (e.g. `BD-73029654`) or customer phone/name/district.
- **Why we built it:** Order fulfillment teams need flexible lookup tools to process orders swiftly.

#### 29. `GET /api/v1/admin/orders/customer/{userId}`
- **What it does:** Returns an in-depth customer order tracking profile: total lifetime orders, total amount spent in BDT, count of pending vs delivered orders, and complete order history.
- **Why we built it:** Store owners can instantly identify VIP repeat customers and track high-value shopping patterns.

#### 30. `PATCH /api/v1/admin/orders/{orderId}/status`
- **What it does:** Moves an order forward along the pipeline (`CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED`).
- **Why we built it:** Regulates order dispatch with state transition validation.

#### 31. `PATCH /api/v1/admin/orders/{orderId}/tracking`
- **What it does:** Assigns courier partner details: Courier Name (`Steadfast`, `Pathao`, `RedX`), Consignment/Tracking ID, Tracking URL, and Estimated Delivery Date. Automatically marks the order as `SHIPPED`.
- **Why we built it:** Bridges the gap between warehouse dispatch and customer courier tracking.

---

### H. Payment Gateway APIs (`/api/v1/payments`)

#### 32. `GET /api/v1/payments/methods`
- **What it does:** Returns the list of enabled payment channels: **Cash on Delivery (COD)**, **bKash**, **Nagad**, and **SSLCommerz**.
- **Why we built it:** The checkout screen dynamically renders available payment options.

#### 33. `POST /api/v1/payments/sslcommerz/init/{orderId}`
- **What it does:** Initializes an SSLCommerz unified gateway session for an order, returning a secure `gatewayPageURL` (supporting Visa, Mastercard, AMEX, and Bangladeshi Internet Banking/MFS).
- **Why we built it:** Standard online card checkout for Bangladesh.

#### 34. `POST /api/v1/payments/sslcommerz/success`, `/fail`, `/cancel`, `/ipn`
- **What it does:** Automated webhooks called by SSLCommerz. On success, it validates the transaction (`val_id`), updates the payment record to `SUCCESS`, and marks the order as `CONFIRMED` and `PAID`.
- **Why we built it:** Fully automated online payment confirmation without manual human intervention.

#### 35. `POST /api/v1/payments/sslcommerz/simulate-success/{orderId}`
- **What it does:** 1-click sandbox payment simulator. Instantly simulates a successful SSLCommerz transaction without having to leave Swagger or enter test credit cards on external gateways.
- **Why we built it:** Supercharges frontend development and manual QA testing.

#### 36. `POST /api/v1/payments/verify` & `GET /api/v1/payments/order/{orderId}`
- **What it does:** Verifies manual transaction codes and queries payment status for any order.

---

### I. Admin Dashboard APIs (`/api/v1/admin`)

#### 37. `GET /api/v1/admin/dashboard/summary`
- **What it does:** Calculates live business numbers: Total Revenue (in BDT), Total Orders, Pending Orders, Total Customers, and Low-Stock Alert Counts (items with < 15 units left).
- **Why we built it:** Gives business owners an instant snapshot of their store health every morning.

#### 38. `GET /api/v1/admin/users` & `PATCH /api/v1/admin/users/{userId}/status`
- **What it does:** Lists all registered users and lets administrators deactivate fraudulent accounts.
- **Why we built it:** Essential for trust and safety to prevent abusive fake orders.

---

---

## 4. Production Hardening & Data Authorization

Here is the finalized security implementation status across the backend architecture:

```
PRODUCTION HARDENING
────────────────────────
HTTPS                   ✅
Secret management       ✅
Rate limiting           ✅
Brute-force protection  ✅
Refresh-token rotation  ✅
Input validation        ✅
Security headers        ✅

DATA AUTHORIZATION
────────────────────────
Resource ownership      ✅
Tenant isolation        ✅
```

---

### A. Data Authorization (Tenant Isolation & Resource Ownership)

#### 1. Tenant Isolation (`TenantFilter` & `TenantContext`)
- **What it is:** A multi-tenant scoping barrier that ensures data from different merchant stores or platform tenants never leaks across boundaries.
- **How it works:**
  - Clients send an optional `X-Tenant-ID` header (e.g. `main-store`, `outlet-dhaka`, or `merchant-123`). If omitted, the request safely defaults to `main-store`.
  - The `TenantFilter` sanitizes the tenant string and registers it inside a thread-bound `TenantContext` (`ThreadLocal<String>`), automatically tagging outgoing responses with `X-Resolved-Tenant`.
  - All catalog repositories (`ProductRepository`, `CategoryRepository`, `OrderRepository`) filter records by the active tenant identifier.
  - When new products, categories, or orders are created, they are automatically stamped with the calling tenant's identity. One store can never see, modify, or checkout inventory belonging to another tenant.
  - The thread context is safely cleared in a `finally` block on every HTTP request cycle to prevent thread-pool memory contamination.

#### 2. Resource Ownership (Defense against IDOR Attacks)
- **What it is:** Insecure Direct Object Reference (IDOR) protection ensuring shoppers can only interact with resources that strictly belong to their own account.
- **How it works:**
  - **Orders (`OrderService`):** When a user requests `/api/v1/orders/{orderId}`, the backend validates that `order.userId` matches the authenticated JWT user ID. Only users with the `ADMIN` role can inspect orders belonging to other customers.
  - **Delivery Addresses (`AddressService`):** Every address modification (`PUT /api/v1/addresses/{id}` or `DELETE /api/v1/addresses/{id}`) ensures the targeted address ID belongs to the current user's profile before modifying.
  - **Shopping Cart (`CartService`):** Carts are strictly bound to the authenticated user ID extracted from the verified JWT payload.
  - **Customer Profile (`UserService`):** Users can only view and mutate their own profile details (`/api/v1/users/me`), preventing privilege escalation.

---

### B. Production Hardening Implementation

#### 1. HTTPS & HSTS Enforcement
- **Configuration:** Handled via Spring Security HTTP strict transport policy in `SecurityConfig`.
- **What it does:** Configures `Strict-Transport-Security: max-age=31536000; includeSubDomains`. This instructs all modern browsers to permanently communicate over encrypted HTTPS connections for at least 1 year, eliminating downgrade attacks (SSL stripping).

#### 2. Secret Management
- **Configuration:** Managed via `application.properties` with environment variable substitution:
  - `${JWT_SECRET}` (with secure fallback for local dev)
  - `${JWT_EXPIRATION_MS}` (access token lifespan)
  - `${JWT_REFRESH_EXPIRATION_MS}` (refresh token lifespan)
  - `${RATE_LIMIT_ENABLED}`, `${RATE_LIMIT_AUTH_RPM}`, `${RATE_LIMIT_GENERAL_RPM}`
  - `${MAX_LOGIN_ATTEMPTS}`, `${LOCKOUT_DURATION_MINUTES}`
- **Why we built it:** Prevents credentials or cryptographic secrets from ever being committed to Git or hardcoded in source files. Production deployments can inject secrets safely via Docker or Kubernetes environment secrets.

#### 3. Rate Limiting (`RateLimitingFilter` & `RateLimiterService`)
- **What it does:** Uses an in-memory sliding-window algorithm tracking request timestamps per client IP.
- **Rules applied:**
  - **Authentication endpoints (`/api/v1/auth/**`):** Limited to **30 requests per minute** to thwart automated credential stuffers.
  - **General endpoints (`/api/v1/**`):** Limited to **120 requests per minute** to protect the catalog against scrapers and denial-of-service attempts.
- **Client response:** When exceeded, the server returns **HTTP 429 Too Many Requests** with standard `Retry-After: 60`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining` headers, along with an intuitive JSON error response.

#### 4. Brute-Force & Credential Stuffing Protection (`LoginAttemptService`)
- **What it does:** Tracks consecutive failed login attempts keyed by both client IP address and account identifier (email/phone).
- **Rules applied:**
  - If a user or bot fails **5 consecutive login attempts**, the account identifier is temporarily locked for **15 minutes**.
  - During incorrect attempts before lockout, the API response informs the user of remaining attempts (e.g. *"Remaining attempts before temporary lockout: 3"*).
  - Any successful login immediately clears the failed attempt counter.

#### 5. Refresh-Token Rotation & Token Family Reuse Detection
- **What it does:** Ensures refresh tokens cannot be stolen and reused indefinitely.
- **Rules applied:**
  - **Single-use rotation:** Every time `/api/v1/auth/refresh` is called, the old refresh token is immediately revoked, and a brand-new refresh token (with a unique `jti` UUID nonce) is generated.
  - **Reuse attack detection:** If an old, already-revoked refresh token is presented again (indicating that an attacker intercepted or replayed an old token), the system triggers a **Security Alert** and automatically revokes **ALL active sessions** belonging to that user's token family, immediately locking out the attacker.

#### 6. Multi-Layer Input Validation & Sanitization
- **What it does:** Defends against Cross-Site Scripting (XSS), SQL injection patterns, and malformed inputs.
- **Layers implemented:**
  - **Jakarta Bean Validation:** Standard `@NotBlank`, `@Email`, `@Size`, `@Min`, `@Pattern` annotations across all incoming request DTOs.
  - **Bangladeshi Phone Normalization:** Strict regex verification `^(?:\+?88)?01[3-9]\d{8}$` ensuring all phone inputs are validated and formatted cleanly into 11 digits.
  - **Input Sanitizer (`InputSanitizer`):** Sanitizes free-text fields (such as user names, addresses, and comments) by stripping HTML script tags, dangerous `<iframe>` elements, malicious Javascript event handlers (`onerror`, `onload`), and dangerous SQL characters.

#### 7. Security Headers
- **Configuration:** Fully declared in `SecurityConfig`:
  - `X-Frame-Options: DENY` — Prevents clickjacking by blocking the app from being embedded inside any `<iframe>`.
  - `X-Content-Type-Options: nosniff` — Prevents browsers from MIME-sniffing a response away from the declared content-type.
  - `Content-Security-Policy: frame-ancestors 'none'` — Modern standard defense ensuring pages cannot be framed.
  - `Referrer-Policy: strict-origin-when-cross-origin` — Protects internal URI structures and tokens from leaking in referrer headers to external sites.

---

## 5. Summary

Every endpoint, filter, and security mechanism was built with a specific purpose: **protect data integrity, prevent fraud, match Bangladeshi shopping habits, provide multi-tenant capability, and make the platform completely production-ready**.

When you are ready to connect a real database (PostgreSQL / MySQL), no REST API contracts, security filters, or controllers need to change—only the underlying repository classes need to be pointed to real database tables.

