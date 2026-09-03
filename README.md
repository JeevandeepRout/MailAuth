# MailAuth — Full-Stack Email-Based Authentication System

A secure, production-ready MERN stack authentication system with 6-digit email OTP verification, password hashing with bcrypt, JWT sessions secured via HTTP-only cookies, and password recovery.

---

## 🌟 Key Features

* **User Registration & Validation**: Name, unique normalized email, and password complexity enforcement (min 8 chars, uppercase, lowercase, number).
* **6-Digit OTP Email Verification**: Single-use, time-limited (10 min expiry) OTP generated cryptographically and delivered via Nodemailer.
* **Resend OTP Flow**: Automatic invalidation of previous OTP with 60-second cooldown timer.
* **Secure Login**: Credentials comparison using `bcrypt.compare`. Blocks unverified accounts with an informative action prompt.
* **HTTP-Only Cookie JWT Storage**: Eliminates XSS attack vectors; tokens cannot be accessed by client-side JavaScript (`document.cookie`).
* **Protected Dashboard & Routes**: Route guard on frontend with `/api/auth/me` session validation and private API route protection middleware.
* **Password Recovery (Forgot & Reset)**: Expiring single-use reset OTP with generic responses to prevent user enumeration attacks.
* **Zero-Setup Local Dev**: Automatic fallback to in-memory MongoDB and Nodemailer Ethereal preview links if local MongoDB / SMTP are not configured.

---

## 📂 Project Architecture

```text
mailauth/
├── package.json               # Root scripts (npm run dev, etc.)
├── server/
│   ├── config/
│   │   ├── db.js              # Mongoose DB connection + dev fallback
│   │   └── mailer.js          # Nodemailer SMTP transporter + Ethereal fallback
│   ├── controllers/
│   │   └── authController.js  # All authentication business logic
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT cookie verification middleware
│   ├── models/
│   │   └── User.js            # User Mongoose model with safe schema helpers
│   ├── routes/
│   │   └── authRoutes.js      # REST API route endpoints
│   ├── utils/
│   │   ├── generateOtp.js     # Cryptographic 6-digit OTP generator
│   │   ├── generateToken.js   # JWT signing utility
│   │   └── sendEmail.js       # Transactional HTML email templates
│   ├── .env.example
│   ├── .env
│   ├── server.js              # Express app entrypoint
│   └── test-auth-flow.js      # Full automated integration test suite
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Alert.jsx          # Reusable alert notifications
    │   │   ├── Layout.jsx         # App layout with dynamic navigation & footer
    │   │   ├── Navbar.jsx         # Header with auth state & logout
    │   │   ├── OtpInput.jsx       # 6-box OTP input with auto-paste support
    │   │   └── ProtectedRoute.jsx # Route guard for private pages
    │   ├── context/
    │   │   └── AuthContext.jsx    # React authentication context provider
    │   ├── pages/
    │   │   ├── Home.jsx           # Landing page with feature highlights
    │   │   ├── Signup.jsx         # Registration form with password requirements
    │   │   ├── VerifyEmail.jsx    # 6-digit OTP verification with resend timer
    │   │   ├── Login.jsx          # Login form with unverified email warning
    │   │   ├── ForgotPassword.jsx # Request password reset code
    │   │   ├── ResetPassword.jsx  # Submit reset OTP & new password
    │   │   └── Dashboard.jsx      # Protected user profile & security details
    │   ├── services/
    │   │   └── api.js             # Axios instance with withCredentials: true
    │   ├── App.jsx                # React Router setup
    │   ├── index.css              # Tailwind CSS styles
    │   └── main.jsx
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# In the project root (C:\Users\jeeva\.gemini\antigravity\scratch\mailauth):
npm run install:all
```

### 2. Configure Environment Variables
Copy `server/.env.example` to `server/.env` (pre-configured with sensible defaults):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/mailauth
JWT_SECRET=super_secret_mailauth_jwt_key_2026_production_ready
JWT_EXPIRES_IN=7d
OTP_EXPIRE_MINUTES=10

# Optional custom SMTP (if empty, Ethereal test mailer is used with clickable preview URLs):
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="MailAuth <noreply@mailauth.local>"
```

### 3. Run Backend & Frontend Concurrently
```bash
npm run dev
```
* **Frontend**: `http://localhost:3000`
* **Backend API**: `http://localhost:5000`

---

## 🧪 Automated Testing

Run the automated backend test suite covering all 19 verification scenarios (registration, invalid credentials, duplicate prevention, OTP expiration, resend OTP, email verification, cookie sessions, `/me`, password reset, and logout):

```bash
cd server
node test-auth-flow.js
```

---

## 📡 API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | API health check |
| `POST` | `/api/auth/register` | Public | Register new user & send verification OTP |
| `POST` | `/api/auth/verify-email` | Public | Verify email using 6-digit OTP |
| `POST` | `/api/auth/resend-otp` | Public | Resend fresh verification OTP |
| `POST` | `/api/auth/login` | Public | Login with email/password & receive auth cookie |
| `GET` | `/api/auth/me` | Protected | Retrieve authenticated user session |
| `POST` | `/api/auth/logout` | Protected | Clear session cookie & log out |
| `POST` | `/api/auth/forgot-password` | Public | Send password reset OTP |
| `POST` | `/api/auth/reset-password` | Public | Reset password using OTP |
