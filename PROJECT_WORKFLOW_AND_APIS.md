# Bangladesh E-Commerce Backend — Workflow & API Guide

Welcome to the documentation for our e-commerce backend platform. This system is designed specifically for the Bangladesh retail market, supporting local phone numbers, geographical address structures (Divisions, Districts, Upazilas), and popular local payment channels (bKash, Nagad, SSLCommerz, and Cash on Delivery).

---

## 1. Technology Stack Used

- **Language:** Java (JDK 27)
- **Framework:** Spring Boot (Spring Web MVC)
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
- **What it does:** Converts the shopping cart into a real order. It checks stock, calculates the final BDT total and delivery charge (BDT 60, or free if over BDT 5,000), decrements inventory, creates a payment intent, and empties the cart.
- **Why we built it:** This is the most critical transaction in the system. Everything happens in one coordinated flow to prevent overselling items.

#### 26. `GET /api/v1/orders` & `GET /api/v1/orders/{orderId}`
- **What it does:** Shows the customer their order history and order tracking status.
- **Why we built it:** Customers want to track their packages and review past purchases.

#### 27. `POST /api/v1/orders/{orderId}/cancel`
- **What it does:** Lets the customer cancel a pending order.
- **Why we built it:** If a customer changes their mind before the parcel is shipped, they can cancel it immediately. When cancelled, the reserved stock is automatically returned to the warehouse inventory.

#### 28. `GET /api/v1/admin/orders`
- **What it does:** Lets store managers see all customer orders across the platform, with a filter for order status (`PENDING`, `PROCESSING`, `SHIPPED`, etc.).
- **Why we built it:** Order fulfillment teams need a live queue to see which orders need to be packed and shipped next.

#### 29. `PATCH /api/v1/admin/orders/{orderId}/status`
- **What it does:** Moves an order forward along the pipeline (`CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED`).
- **Why we built it:** Regulates order dispatch. We built an internal state machine so an admin cannot accidentally mark a delivered order as "Pending", avoiding chaos in bookkeeping.

---

### H. Payment Gateway APIs (`/api/v1/payments`)

#### 30. `GET /api/v1/payments/methods`
- **What it does:** Returns the list of enabled payment channels: **Cash on Delivery (COD)**, **bKash**, **Nagad**, and **SSLCommerz**.
- **Why we built it:** The checkout screen dynamically renders only the payment options that are currently operational.

#### 31. `POST /api/v1/payments/verify`
- **What it does:** Verifies payment transaction codes returned by gateways like bKash or SSLCommerz webhooks.
- **Why we built it:** Guarantees that online payments are authenticated and legitimate before warehouse staff ship expensive items.

#### 32. `GET /api/v1/payments/order/{orderId}`
- **What it does:** Checks the payment status of any order.
- **Why we built it:** Useful for the frontend to poll payment confirmation screens after redirecting back from bKash or Nagad.

---

### I. Admin Dashboard APIs (`/api/v1/admin`)

#### 33. `GET /api/v1/admin/dashboard/summary`
- **What it does:** Calculates live business numbers: Total Revenue (in BDT), Total Orders, Pending Orders, Total Customers, and Low-Stock Alert Counts (items with < 15 units left).
- **Why we built it:** Gives business owners an instant snapshot of their store health every morning without needing to run manual database reports.

#### 34. `GET /api/v1/admin/users` & `PATCH /api/v1/admin/users/{userId}/status`
- **What it does:** Lists all registered users and lets administrators deactivate fraudulent accounts.
- **Why we built it:** Essential for trust and safety to prevent abusive fake orders.

---

## 4. Summary

Every endpoint above was built with a specific purpose: **protect data integrity, prevent fraud, match Bangladeshi shopping habits, and make the frontend developer's job effortless**.

When you are ready to connect a real database (PostgreSQL / MySQL), no REST API contracts or controllers need to change—only the underlying repository classes need to be pointed to database tables.
