# ExpenseIQ — MERN Expense Tracker

A full-stack Expense Tracker built with **MongoDB + Express.js + React + Node.js (MERN)**

## 📁 Project Structure

```
expense-tracker/
├── backend/     → Express.js REST API
└── frontend/    → Vite + React SPA
```

## 🚀 Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd backend
npm install
```

Edit `.env`:
```
MONGO_URI=mongodb://localhost:27017/expense_tracker
JWT_SECRET=your_super_secret_key
PORT=5000
NODE_ENV=development
```

Start:
```bash
npm run dev     # development (nodemon)
npm start       # production
```

API runs at: `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user |

### Transactions (all require Bearer token)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/transactions` | List all transactions |
| POST | `/api/transactions` | Create transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/transactions/summary` | Balance/Income/Expense totals |
| GET | `/api/transactions/monthly` | Monthly chart data |
| GET | `/api/transactions/category-stats` | Category breakdown |

---

## ✨ Features

- **JWT Authentication** — Register, login, protected routes
- **Dashboard** — Total Balance, Income, Expense stat cards
- **Charts** — Income vs Expense area chart + Category pie chart
- **Transactions** — Add, filter by type/category, delete
- **Dark Theme** — Premium dark UI with animations

## 🚢 Deployment

| Layer | Platform |
|-------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

### Deploy to MongoDB Atlas
Replace `MONGO_URI` in `.env` with your Atlas connection string.
