# 💳 ExpenseIQ — MERN Expense Tracker

![MERN Stack](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=nodedotjs)
![Express.js](https://img.shields.io/badge/Express.js-Framework-lightgrey?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-success?style=for-the-badge&logo=mongodb)
![Vite](https://img.shields.io/badge/Vite-Bundler-purple?style=for-the-badge&logo=vite)

A sleek, full-stack Expense Tracker application developed using the **MERN** stack (MongoDB, Express.js, React, Node.js). ExpenseIQ helps you seamlessly track your income and expenses, offering insightful visualizations and a premium dark-themed user interface.

**🌍 Live Demo:** [https://expense-tracker-main-1-np9f.onrender.com](https://expense-tracker-main-1-np9f.onrender.com)  
**🔌 Live API:** [https://expense-tracker-main-q41q.onrender.com](https://expense-tracker-main-q41q.onrender.com)

---

## ✨ Features

- **🔐 Secure Authentication:** JWT-based user registration and login with protected endpoints.
- **📊 Interactive Dashboard:** Provides real-time insights with Total Balance, Income, and Expense summary cards.
- **📈 Data Visualizations:** Beautiful area charts for Income vs. Expense and pie charts for Category breakdowns.
- **💰 Transaction Management:** Add, delete, and filter transactions instantly.
- **🎨 Premium UI/UX:** Responsive, modern dark theme built for an excellent user experience with smooth micro-animations.
- **⚡ Fast & Optimized:** Powered by Vite on the frontend and Express on the backend.

---

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Axios (API requests)
- Tailwind CSS (or Vanilla CSS for styling)
- Recharts (Data visualization)

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose ORM)
- JSON Web Token (JWT Auth)
- bcryptjs (Password Hashing)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and run the server.

```bash
cd backend
npm install
```

**Environment Variables (`backend/.env`):**
Create a `.env` file in the `backend` directory and add the following:
```env
MONGO_URI=<YOUR_MONGODB_ATLAS_URI>
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
NODE_ENV=production
```

**Start the Backend Server:**
```bash
npm start       # Starts server for production
```
*API is running live at: `https://expense-tracker-main-q41q.onrender.com`*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, install dependencies, and run the app.

```bash
cd frontend
npm install
npm run build
```
*Application is running live at: `https://expense-tracker-main-1-np9f.onrender.com`*

---

## 🔌 API Reference

### Authentication Endpoints
| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate & get token |
| `GET`  | `/api/auth/me` | Get current logged-in user details |

### Transaction Endpoints (Requires Bearer Token)
| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/transactions` | Retrieve all transactions |
| `POST` | `/api/transactions` | Add a new transaction |
| `DELETE`| `/api/transactions/:id`| Delete a specific transaction |
| `GET` | `/api/transactions/summary`| Get balance, total income, and total expense |
| `GET` | `/api/transactions/monthly`| Retrieve data for monthly charts |
| `GET` | `/api/transactions/category-stats`| Retrieve data for category breakdown charts |

---

## 📁 Project Structure

```text
expense-tracker/
│
├── backend/                  # Node.js & Express API
│   ├── controllers/          # Request handlers
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API route declarations
│   ├── middleware/           # Auth and error handling
│   └── server.js             # Entry point
│
└── frontend/                 # React & Vite application
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Application views (Dashboard, Login, etc.)
    │   ├── context/          # React Context (Auth, Global State)
    │   └── App.jsx           # Main React component
    └── index.html
```

---

## 🚢 Deployment

The application is deployed live using the following stack:

| Layer      | Platform |
| :--------- | :------- |
| **Frontend** | [Render](https://render.com/) |
| **Backend**  | [Render](https://render.com/) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Cloud Database) |

*Note: The frontend consumes the backend API running at its respective Render URL, and the backend connects to MongoDB Atlas using its connection string.*

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
