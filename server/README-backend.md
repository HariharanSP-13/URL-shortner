# URL Shortener — Backend API

Backend service built with **Node.js + Express + MongoDB** for the URL Shortener hackathon project.

---

## 🛠️ Setup Instructions

### 1. Install dependencies
```bash
cd server
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Required `.env` variables
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/urlshortener
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

### 4. Start the development server
```bash
npm run dev
```

The server starts at `http://localhost:5000`

---

## 📡 API Endpoints

### 🔐 Auth Routes — `/api/auth`

| Method | Route | Auth | Description | Request Body | Response |
|--------|-------|------|-------------|--------------|----------|
| POST | `/api/auth/register` | ❌ | Register new user | `{ name, email, password }` | `{ success, data: { token, user } }` |
| POST | `/api/auth/login` | ❌ | Login user | `{ email, password }` | `{ success, data: { token, user } }` |
| GET | `/api/auth/me` | ✅ | Get current user | — | `{ success, data: { user } }` |

> Rate limited: **10 requests / 15 min** per IP on register and login.

---

### 🔗 URL Routes — `/api/urls`

All routes require `Authorization: Bearer <token>` header.

| Method | Route | Auth | Description | Request Body | Response |
|--------|-------|------|-------------|--------------|----------|
| POST | `/api/urls` | ✅ | Create short URL | `{ originalUrl, customAlias?, expiresAt? }` | `{ success, data: { url } }` |
| GET | `/api/urls` | ✅ | Get all user's URLs | — | `{ success, data: { urls, count } }` |
| DELETE | `/api/urls/:id` | ✅ | Delete URL + clicks | — | `{ success, message }` |
| PUT | `/api/urls/:id` | ✅ | Update URL | `{ originalUrl?, customAlias?, expiresAt? }` | `{ success, data: { url } }` |

---

### 📊 Analytics Routes — `/api/analytics`

All routes require `Authorization: Bearer <token>` header.

| Method | Route | Auth | Description | Request Body | Response |
|--------|-------|------|-------------|--------------|----------|
| GET | `/api/analytics/:urlId` | ✅ | Get analytics for URL | — | `{ success, data: { totalClicks, lastVisited, recentVisits, dailyClicks } }` |

**Analytics Response Shape:**
```json
{
  "success": true,
  "data": {
    "url": { "_id", "originalUrl", "shortUrl", "shortCode", "customAlias", "expiresAt", "createdAt" },
    "totalClicks": 142,
    "lastVisited": "2026-06-12T16:00:00Z",
    "recentVisits": [
      { "timestamp", "ip", "device", "browser", "userAgent" }
    ],
    "dailyClicks": [
      { "date": "2026-05-14", "count": 0 },
      { "date": "2026-05-15", "count": 3 }
    ]
  }
}
```

---

### 🔀 Redirect Route

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/:shortCode` | ❌ | Redirects to original URL, logs click analytics |

**Behavior:**
- Looks up by `customAlias` first, then `shortCode`
- Returns **404** if not found
- Returns **410 Gone** if link is expired
- Returns **302 redirect** to `originalUrl` if active
- Records click: timestamp, IP, device, browser

---

## 📐 Response Format

All API responses follow this consistent format:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": {}
}
```

Error responses include `errors` array for validation failures:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please enter a valid email address" }
  ]
}
```

---

## 📦 Tech Stack

| Package | Purpose |
|---------|---------|
| express | Web framework |
| mongoose | MongoDB ODM |
| bcryptjs | Password hashing (salt rounds: 10) |
| jsonwebtoken | JWT generation & verification |
| nanoid@3 | Short code generation (7 chars) |
| express-validator | Request validation |
| express-rate-limit | Auth route rate limiting |
| helmet | Security HTTP headers |
| cors | Cross-origin resource sharing |
| ua-parser-js | Parse device/browser from User-Agent |
| dotenv | Environment variable loading |
| nodemon | Dev auto-restart |

---

## 🔒 Security Features

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens expire based on `JWT_EXPIRES_IN` env var
- Auth routes rate-limited (10 req / 15 min)
- Helmet security headers on all responses
- URL ownership verified before any update/delete
- Password field excluded from all API responses
- Environment variables for all secrets

---

## 📁 Project Structure

```
server/
├── config/
│   └── db.js                   # MongoDB connection
├── controllers/
│   ├── authController.js       # Register, Login, GetMe
│   ├── urlController.js        # CRUD for URLs
│   └── analyticsController.js  # Analytics aggregation
├── middleware/
│   ├── authMiddleware.js       # JWT verification
│   └── validateUrl.js          # express-validator chains
├── models/
│   ├── User.js                 # User schema
│   ├── Url.js                  # URL schema
│   └── Click.js                # Click analytics schema
├── routes/
│   ├── auth.js                 # /api/auth/*
│   ├── url.js                  # /api/urls/*
│   ├── analytics.js            # /api/analytics/*
│   └── redirect.js             # /:shortCode
├── utils/
│   └── generateShortCode.js    # nanoid-based code generator
├── .env
├── .env.example
├── index.js                    # App entry point
└── package.json
```
