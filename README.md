# E-Commerce Website (MERN)

A full-stack e-commerce application with separate customer and admin experiences.

- Customer side: browse products, filter and sort listings, search, manage cart and addresses, place orders, pay with PayPal, and track orders.
- Admin side: manage products, feature banners, and order statuses.

## Tech Stack

### Frontend (client)
- React 19
- Vite 7
- Redux Toolkit + React Redux
- React Router DOM
- Axios
- Tailwind CSS 4
- Radix UI + Lucide Icons
- PayPal React SDK

### Backend (server)
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication (cookie-based)
- bcryptjs (password hashing)
- Cloudinary + Multer (image upload)
- PayPal Checkout API integration
- dotenv, cors, cookie-parser

## Project Structure

```text
E-Commerce-Website/
|- client/  # React frontend (shop + admin UI)
|- server/  # Express API + MongoDB models/controllers/routes
```

## Core Features

- Authentication
- User registration and login
- Cookie-based auth check middleware
- Forgot-password and reset-password flow

- Shopping
- Product listing with category/brand filters and sorting
- Product search by keyword
- Product detail view
- Cart add/update/delete
- Address add/edit/delete
- Product review and rating

- Checkout and Orders
- PayPal order creation and capture
- Order history for user
- Payment success/cancel handling

- Admin Panel
- Product CRUD
- Product image upload to Cloudinary
- Featured banner/image management
- View all orders
- Update order status

## High-Level Flow

1. Frontend sends requests to the Express API (`http://localhost:5000/api/...`).
2. Auth endpoints set/read an HTTP-only `token` cookie.
3. Shop/admin Redux slices call route-specific APIs.
4. Server controllers read/write MongoDB via Mongoose models.
5. Product images are uploaded to Cloudinary.
6. Checkout uses PayPal APIs for order creation and payment capture.

## API Route Groups

- `/api/auth` -> register, login, logout, check-auth, forgot-password, reset-password
- `/api/admin/products` -> upload-image, add/edit/delete, fetch products
- `/api/admin/orders` -> list all orders, order details, update order status
- `/api/shop/products` -> filtered listing, product details
- `/api/shop/cart` -> cart CRUD operations
- `/api/shop/address` -> address CRUD operations
- `/api/shop/order` -> PayPal config, create order, capture payment, user orders
- `/api/shop/review` -> add and fetch reviews
- `/api/shop/search` -> keyword search
- `/api/common/feature` -> feature/banner image operations

## Prerequisites

- Node.js 18+ (recommended)
- npm
- MongoDB connection string (local or Atlas)
- Cloudinary account
- PayPal developer account (sandbox/live)

## Environment Variables

Create `server/.env` and add:

```env
PORT=5000
MONGODB_URL=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret
CLIENT_BASE_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
PAYPAL_CURRENCY=USD
PAYPAL_TIMEOUT_MS=15000
PAYPAL_RETRY_COUNT=1
```

Notes:
- Frontend API URLs are currently hardcoded to `http://localhost:5000` in Redux slices/components.
- If you deploy, update those URLs or move them to frontend environment variables.

## Installation and Local Setup

### 1) Install server dependencies

```bash
cd server
npm install
```

### 2) Install client dependencies

```bash
cd ../client
npm install
```

### 3) Run backend

```bash
cd ../server
npm run dev
```

### 4) Run frontend

Open a second terminal:

```bash
cd client
npm run dev
```

### 5) Open app

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Available Scripts

### Server
- `npm run dev` -> run with nodemon
- `npm start` -> run with node

### Client
- `npm run dev` -> Vite dev server
- `npm run build` -> production build
- `npm run preview` -> preview production build
- `npm run lint` -> run ESLint

## How To Explain This On GitHub Profile

Use this project summary:

"Built a full-stack MERN e-commerce platform with role-based admin/shop flows, JWT cookie authentication, Cloudinary media uploads, PayPal checkout integration, and Redux-managed state for products, cart, addresses, reviews, and orders."

## Current Notes / Limitations

- Client currently uses hardcoded API base URLs.
- Forgot-password flow generates reset URL in API response; email delivery is not configured yet.
- No automated tests are configured yet.

## Author

Mahir Aziz
