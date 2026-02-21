# 🦅 BizNest

**A robust, multi-role E-commerce Marketplace built with the MERN Stack.**

BizNest connects **Customers**, **Sellers**, and **Admins** in a seamless, secure, and modern web environment. Whether you are shopping for products, managing your online store, or overseeing platform operations, BizNest provides the tools you need.

---

## 🚀 Overview

BizNest utilizes a modern technology stack to deliver a high-performance experience:
- **Client**: React (Vite) + Tailwind CSS + TanStack Query
- **Server**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: Firebase Auth + JWT
- **Payments**: Stripe

---

## ✨ Key Features

### 🛍️ For Customers
*   **Intuitive Shopping**: Browse "Featured" and "Trending" products with advanced filtering.
*   **Smart Cart System**: Real-time stock checks and easy checkout.
*   **Secure Payments**: Integrated Stripe gateway for safe transactions.
*   **User Dashboard**: Track order history and manage your wishlist.

### 💼 For Sellers
*   **Seller Dashboard**: A centralized hub to manage your business.
*   **Inventory Management**: Add, update, and track your products effortlessly.
*   **Sales Insights**: Monitor your performance and sales data.

### 🛡️ For Admins
*   **Admin Dashboard**: comprehensive control over the entire platform.
*   **User Management**: Oversee sellers and customers.
*   **Content Moderation**: Manage product listings and user feedback.

---

## 🏗️ Architecture Highlights

BizNest is built with scalability and performance in mind:
*   **Server-State First**: Utilizes **TanStack Query (v5)** for efficient data fetching, caching, and background updates.
*   **Secure by Design**: Implements a centralized **Axios Security Facade** that automatically handles JWT injection and auto-logouts on expired sessions.
*   **Optimized Performance**: Features aggressive caching strategies (e.g., 5-minute stale times for product feeds) to minimize server load.

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, DaisyUI, Emotion |
| **State & Data** | TanStack Query, Axios, Context API |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Native Driver) |
| **Auth & Security** | Firebase Auth, JWT, BCrypt |
| **Payments** | Stripe API |
| **Tools** | Chart.js, SweetAlert2, Swiper |

---

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v16+)
*   MongoDB Connection String
*   Firebase Project Credentials
*   Stripe Account

### 1. Clone the Repository
```bash
git clone https://github.com/Shahriar1638/Biznest.git
cd Biznest
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd BizNest-server
npm install
```
Create a `.env` file in `BizNest-server`:
```env
PORT=5000
DB_USER=your_mongo_user
DB_PASS=your_mongo_pass
ACCESS_TOKEN_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
```
Start the server:
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd Biznest-client
npm install
```
Create a `.env` file in `Biznest-client`:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_key
# ... add other Firebase config keys
VITE_PAYMENT_GATEWAY_PK=your_stripe_publishable_key
```
Start the development server:
```bash
npm run dev
```

---

## 🤝 Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any features, bug fixes, or improvements.

---

*Verified by Antigravity*
