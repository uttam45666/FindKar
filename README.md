# Findkar 🔧
### "Ask your neighbor. We already did."

A hyper-local home service discovery platform built on community trust.

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

---

## Backend Setup

```bash
cd backend
npm install
```

Edit `.env` and fill in your values:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/findkar
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

Seed the database with demo data:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Open http://localhost:5173

---

## Demo Credentials

All accounts use password: **Password@123**

| Role | Email | Notes |
|------|-------|-------|
| Admin | admin@findkar.com | Full platform access |
| Customer | amit@example.com | Book services |
| Plumber | ramesh@findkar.com | Approved provider |
| Electrician | suresh@findkar.com | Approved provider |
| Carpenter | mohan@findkar.com | Approved provider |

> **OTP:** Any 6-digit number works. The actual OTP is shown on screen for demo purposes.

---

## Features

### Customer
- Register/Login with email + mock OTP
- Browse service categories
- Search & filter providers
- View provider profiles with trust score bars
- Book services with scheduling
- Real-time booking tracking
- OTP door check-in (shown on customer screen)
- SOS emergency button
- Leave structured reviews (5 boolean tags)
- Booking history

### Provider
- Register/Login with email + mock OTP
- Complete shop profile setup
- Manage services with pricing
- Set working hours schedule
- Toggle online/offline availability
- Accept/decline bookings
- Update booking status (confirmed → departed → arrived → in_progress → completed)
- Enter OTP from customer to start work
- Enter job amount on completion
- View earnings with platform fee breakdown

### Admin
- Dashboard with platform stats
- Approve/block providers
- Manage customers
- View all bookings
- SOS monitor — full incident details, auto-block enforcement, resolve/false alarm

---

## Architecture

```
findkar/
├── backend/          # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── models/   # 6 Mongoose models
│   │   ├── features/ # auth, users, providers, bookings, reviews, notifications, admin
│   │   ├── middleware/
│   │   └── seed/
│   └── server.js
│
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── features/ # auth, customer, provider, admin, reviews
        ├── components/
        ├── context/  # AuthContext, NotificationContext
        └── api/
```

---

## Deployment

**Backend → Render.com**
1. Connect GitHub repo
2. Root directory: `/backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all env vars

**Frontend → Vercel**
1. Connect GitHub repo
2. Root directory: `/frontend`
3. Set `VITE_API_URL` to your Render URL

---

Built for Hack Energy 2.0 · Open Innovation Track
