# BizNest Client

A robust client-side application for the BizNest platform, serving as a multi-role marketplace connecting Customers, Sellers, and Administrators. Built with modern web technologies for a seamless experience.

## 🚀 Features

This application supports multiple user roles with distinct functionalities:

### 🛍️ Customers
- **Browse & Shop**: Explore a wide range of products (`AllProducts`).
- **Shopping Cart**: Manage selected items and proceed to checkout.
- **Secure Payments**: Integrated Stripe payment processing.
- **Profile Management**: Update personal details and view history.

### 💼 Sellers
- **Seller Dashboard**: A dedicated workspace to manage business operations.
- **Product Management**: Add new products, view product listings, and manage inventory.
- **Sales Insights**: (Implied) Access tools relevant to selling on the platform.

### 🛡️ Admins
- **Admin Dashboard**: Comprehensive control over the platform.
- **User Management**: Register new admins.
- **Platform Oversight**: View all products across the system.
- **Feedback System**: Review and manage user feedback.

## 🛠️ Tech Stack

- **Frontend Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: 
  - [Tailwind CSS](https://tailwindcss.com/) & [DaisyUI](https://daisyui.com/)
  - [Material UI](https://mui.com/) (Component library)
  - [Emotion](https://emotion.sh/) (CSS-in-JS)
- **State Management & Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest) & Axios
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Authentication**: Firebase Auth
- **Payments**: Stripe Elements
- **Utilities**: 
  - `sweetalert2` for notifications
  - `chart.js` for data visualization
  - `aos` for scroll animations
  - `swiper` for carousels

## 📦 Installation & Setup

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory based on `.env.example`. You will need your Firebase configuration and Backend API URL.

   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # API Base URL (Backend)
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Preview the production build locally.
- `npm run lint`: Run ESLint to check for code quality issues.
