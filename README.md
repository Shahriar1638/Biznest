# 🦅 BizNest

**A robust, multi-role E-commerce Marketplace built with the MERN Stack.**

BizNest connects **Customers**, **Sellers**, and **Admins** in a seamless, secure, and modern web environment. Whether you are shopping for products, managing your online store, or overseeing platform operations, BizNest provides the tools you need.

> 🌐 **Live Demo**: _[[BizNest](https://biznest-3c9b6.web.app/)]_

---

## 🚀 Overview

BizNest utilizes a modern technology stack to deliver a high-performance experience:

- **Client**: React 19 (Vite) + Tailwind CSS + TanStack Query v5
- **Server**: Node.js + Express.js + Mongoose ODM
- **Database**: MongoDB Atlas
- **Authentication**: Firebase Auth + JWT (jsonwebtoken)
- **Payments**: Stripe API

---

## ✨ Key Features

### 🛍️ For Customers

- **Intuitive Shopping**: Browse "Featured" and "Trending" products with advanced filtering and category search.
- **Smart Cart System**: Real-time cart management with automatic quantity deduction on checkout.
- **Secure Payments**: Integrated Stripe gateway with server-side price recalculation to prevent tampering.
- **User Dashboard**: Track full order history, manage your wishlist, and view contact message replies.

### 💼 For Sellers

- **Seller Dashboard**: A centralized hub to manage your entire business.
- **Inventory Management**: Add, update, and track your products with pending/approved/rejected status.
- **Sales Insights**: Monitor revenue performance updated in real time after every purchase.

### 🛡️ For Admins

- **Admin Dashboard**: Comprehensive control over the entire platform.
- **Product Moderation**: Approve or reject seller product listings with full audit trail (who updated, when).
- **Contact Management**: View, reply to, and toggle read/unread status on all user messages.

---

## 🏗️ Architecture Highlights

BizNest is built with scalability, security, and maintainability in mind:

- **Facade Pattern via Custom Hooks**: All API interactions are abstracted behind custom React hooks (`useProducts`, `useCart`, `useSecureQueries`, etc.). UI components remain completely decoupled from HTTP logic, caching rules, and auth injection.
- **Aggressive Client-Side Caching**: Utilizes **TanStack Query (v5)** with intentional `staleTime` and `gcTime` configurations (e.g. 5-min stale, 10-min cache for product feeds) to minimize redundant API calls and reduce server load.
- **Axios Security Facade**: A dedicated `useAxiosSecure` hook automatically injects a Bearer JWT token into every authenticated request and handles `401` auto-logouts on token expiry — keeping components entirely unaware of auth logic.
- **Mongoose-Based Data Validation**: All write operations (create user, add product, submit contact, process payment) flow through Mongoose models, replacing manual validation libraries with schema-level enforcement (required fields, enums, type casting).
- **Layered Backend Security**:
  - **Helmet.js** sets hardened HTTP response headers against XSS and clickjacking.
  - **express-rate-limit** restricts each IP to 100 requests per 15-minute window to mitigate abuse and brute-force attempts.
  - **JWT middleware** (`verifyToken`) guards all private routes, decoding the token and attaching user identity to `req.decoded`.
  - **Role-based middleware** (`verifyAdmin`, `verifySeller`) sits on top of token verification to enforce RBAC.
  - **BCrypt** (10 salt rounds) hashes all passwords before storage — plaintext passwords never reach the database.

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, DaisyUI, Material UI, Emotion |
| **State & Data** | TanStack Query v5, Axios, React Context API |
| **Backend** | Node.js, Express.js v5 |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Auth & Security** | Firebase Auth, JWT, BCrypt, Helmet.js, express-rate-limit |
| **Payments** | Stripe API (PaymentIntents) |
| **UI Tools** | Chart.js, SweetAlert2, Swiper, AOS |

---

## 📁 Project Structure

```
BizNest/
├── BizNest-server/         # Express.js backend
│   ├── Paths/              # Route handlers (Auth, Products, User, Seller, Admin, Public)
│   ├── middlewares/        # verifyToken, verifyAdmin, verifySeller
│   ├── models/             # Mongoose schemas (User, Product, Cart, Payment, Contact)
│   └── index.js            # Entry point, middleware setup, DB connections
│
└── Biznest-client/         # React (Vite) frontend
    └── src/
        ├── Hooks/          # Custom hooks (useAxiosSecure, useProducts, useCart, etc.)
        ├── Pages/          # Route-level page components
        └── Components/     # Reusable UI components
```

---

## 📦 Installation & Setup

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas connection string
- Firebase project credentials
- Stripe account (publishable + secret key)

### 1. Clone the Repository

```bash
git clone https://github.com/Shahriar1638/Biznest.git
cd Biznest
```

### 2. Backend Setup

```bash
cd BizNest-server
npm install
```

Create a `.env` file in `BizNest-server/`:

```env
PORT=3000
DB_URI=your_mongodb_atlas_connection_string
JWT_SECRET_TOKEN=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:5173
```

Start the backend with nodemon (hot reload):

```bash
nodemon index.js
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd Biznest-client
npm install
```

Create a `.env` file in `Biznest-client/`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_PAYMENT_GATEWAY_PK=your_stripe_publishable_key
```

Start the frontend dev server:

```bash
npm run dev
```

---

## 🚢 Deployment

| Service | Platform |
| :--- | :--- |
| **Frontend** | Firebase Hosting |
| **Backend** | Vercel (Serverless) |
| **Database** | MongoDB Atlas |
