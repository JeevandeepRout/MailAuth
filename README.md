# 🔐 MailAuth

MailAuth is a complete, production-ready **MERN Stack** (MongoDB, Express, React, Node.js) authentication system built from the ground up to handle secure email-based user registration, verification, login, and password recovery. 

It uses **6-digit cryptographic OTPs (One-Time Passwords)** for email verification and password resets, **JWTs (JSON Web Tokens)** stored securely in **HTTP-only cookies** for session management, and **bcrypt** for password hashing.

## ✨ Features

- **User Registration:** Secure account creation with password hashing (bcrypt).
- **Email Verification (OTP):** Requires users to verify their email address via a 6-digit OTP sent to their inbox before they can log in.
- **Secure Login & Logout:** Session management using JWTs in HTTP-only cookies (immune to XSS attacks).
- **Password Recovery:** "Forgot Password" and "Reset Password" workflows using secure OTPs.
- **Send Custom Emails:** An integrated dashboard form allowing authenticated users to send custom emails through the app's mailer.
- **Protected Routes:** Both React frontend and Express backend implement protected routes and middleware.
- **Resilient Database Connections:** Seamlessly connects to MongoDB Atlas (Cloud), Local MongoDB, or automatically falls back to an in-memory database for instant local development without setup.
- **Flexible SMTP Mailer:** Easily connects to Gmail SMTP for real-world email delivery, with built-in fallbacks to Ethereal Email and local console logging.

## 🛠️ Tech Stack

**Frontend:**
- React 18 (Vite)
- Tailwind CSS
- React Router DOM
- Axios (for API requests with credentials)
- Lucide React (Icons)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- bcryptjs (Password Hashing)
- Nodemailer (Email Delivery)
- cookie-parser (HTTP-only cookie handling)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mailauth
```

### 2. Install Dependencies

You need to install packages for both the backend and frontend.

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

Navigate to the `server/` directory and rename the `.env.example` file to `.env` (or create a new `.env` file).

```bash
cd server
cp .env.example .env
```

**Required Database Setup:**
By default, the application will attempt to connect to a local MongoDB instance (`mongodb://127.0.0.1:27017/mailauth`). If that fails, it will brilliantly fall back to an **In-Memory Development Database**, so the app runs instantly!

To connect your own persistent database, update `MONGODB_URI` in `server/.env`:
```env
# For MongoDB Atlas (Cloud):
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/mailauth?retryWrites=true&w=majority

# For Local MongoDB:
MONGODB_URI=mongodb://127.0.0.1:27017/mailauth
```

**Required Email (SMTP) Setup:**
To send *actual* OTP emails to real user inboxes, add your Gmail SMTP credentials. 
*(Note: You need to generate a 16-character **App Password** from your Google Account settings -> Security -> 2-Step Verification -> App Passwords)*

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_real_gmail_address@gmail.com
SMTP_PASS=your_16_character_app_password
EMAIL_FROM="MailAuth <your_real_gmail_address@gmail.com>"
```
*(If you leave these empty, the app will simulate emails and print the OTPs in your terminal).*

### 4. Run the Application

You'll need two terminal windows to run both servers concurrently.

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
```
*(Runs on http://localhost:5000)*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*(Runs on http://localhost:3000)*

---

## 🗂️ Project Structure

```
mailauth/
├── client/                     # React Frontend
│   ├── index.html              # Vite entry HTML
│   ├── src/
│   │   ├── App.jsx             # Main Router & Layout
│   │   ├── context/            # Global state (AuthContext)
│   │   ├── pages/              # UI Views (Login, Signup, Dashboard, etc.)
│   │   ├── components/         # Reusable UI components (OtpInput, ProtectedRoute)
│   │   └── services/           # API integration (axios config)
│   └── package.json            
│
└── server/                     # Express Backend
    ├── server.js               # Application entry point
    ├── config/                 # DB and Mailer configurations
    ├── controllers/            # Request handlers (authController)
    ├── middleware/             # Express middlewares (authMiddleware)
    ├── models/                 # Mongoose schemas (User)
    ├── routes/                 # API route definitions
    └── package.json            
```

## 🔒 Security Specifications

- **No LocalStorage for Tokens:** JWTs are intentionally NOT stored in `localStorage` to prevent Cross-Site Scripting (XSS) attacks. They are stored in `httpOnly` cookies.
- **Cryptographic OTPs:** 6-digit OTPs are generated using Node's native `crypto` module for secure randomness.
- **Password Salting:** Passwords are never stored in plain text. They are salted and hashed with 10 rounds using bcrypt.
- **CORS Protection:** Cross-Origin Resource Sharing is strictly configured to only accept requests from the designated client URL and allows credentials.

