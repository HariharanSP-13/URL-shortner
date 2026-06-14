# LinkSnip — A full-stack URL Shortener with analytics

LinkSnip is a production-grade URL shortening service that allows users to create short, manageable links, track their performance with real-time analytics, and generate downloadable QR codes for easy sharing.

## 🚀 Features
- **Bulk URL Shortening**: Process hundreds of links at once via CSV upload.
- **Public Statistics**: Share campaign performance publicly with high-fidelity charts.
- **Premium Landing Page**: A modern, conversion-focused home page for non-logged-in users.
- **URL Shortening**: Convert long URLs into compact links using unique codes or custom aliases.
- **Custom Aliases**: Choose your own branded short codes (e.g., `/my-promo`).
- **Real-time Analytics**: Track total clicks, unique visitors, and daily performance with interactive charts.
- **Detailed Click Logs**: View device type, browser, and IP address for every visitor.
- **Downloadable QR Codes**: Generate high-quality QR codes and download them as PNGs.
- **Expiration Dates**: Set links to expire automatically after a specific date.
- **Secure Auth**: Full user registration and login system with JWT session management.
- **Responsive Design**: Polished, mobile-first UI built with Tailwind CSS.
- **Database Seeding**: Easily populate your local environment with sample data for testing.

Demo video Link: https://youtu.be/kOmrMKcjLG8

## 🛠️ Tech Stack
| Frontend | Backend | Database | Auth | Other |
| :--- | :--- | :--- | :--- | :--- |
| React 18, Vite | Node.js, Express | MongoDB (Mongoose) | JWT, Bcrypt | Tailwind, Recharts, Lucide |

## 🏗️ Architecture Diagram
```ascii
Browser (User)
  │
  ├── [React Frontend (Port 5173)] ── Auth & URL Management API Requests ╮
  │                                                                       │
  ╰── [Express Backend (Port 5000)] ◀─────────────────────────────────────╯
        │
        ├── [MongoDB] (Stores Users, URLs, and Click Records)
        │
        └── [Short URL Redirect Flow]
              Browser ──▶ GET http://localhost:5000/:shortCode
                           │
                           ├─ Find URL Record & Check Expiry
                           ├─ Log Click (IP, Browser, Device)
                           ├─ 302 Redirect ──▶ Original Long URL
```

## 🧠 How this app was planned using AI
This project was developed through a structured AI-assisted workflow:
1. **Feature Planning**: Core requirements were defined and cross-referenced with modern UX patterns.
2. **Backend Blueprint**: The REST API was architected using Node.js and MongoDB, focusing on security (JWT) and data integrity.
3. **Frontend Implementation**: A high-fidelity React interface was built using a component-driven approach with mock data first to perfect the layout.
4. **Integration & Polish**: The frontend was wired to the real backend, replacing mocks with live API calls and adding "bonus" features like QR downloads and charts.
5. **Testing Strategy**: End-to-end verification covered the full flow from account creation to analytics tracking.

## ⚙️ Setup Instructions
1. **Clone the repository**
2. **Server Setup**:
   ```bash
   cd server
   npm install
   # Create .env based on .env.example
   npm run dev # Starts server on http://localhost:5000
   ```
3. **Client Setup**:
   ```bash
   cd ../client
   npm install
   # Create .env based on .env.example (ensure VITE_API_URL=http://localhost:5000)
   npm run dev # Starts frontend on http://localhost:5173
   ```
4. **Access the App**: Open http://localhost:5173 in your browser.

## 🔑 Environment Variables
| Variable | Description |
| :--- | :--- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing tokens |
| `BASE_URL` | The domain used for generating short links (e.g., http://localhost:5000) |
| `CLIENT_URL` | The domain of your frontend (for CORS) |

## 🗺️ API Endpoints
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | No | Create a new user account |
| POST | `/api/auth/login` | No | Authenticate and receive JWT |
| GET | `/api/urls` | Yes | List all links for the user |
| POST | `/api/urls` | Yes | Create a new shortened URL |
| PUT | `/api/urls/:id` | Yes | Update destination or alias |
| DELETE | `/api/urls/:id` | Yes | Delete a link and its data |
| GET | `/api/analytics/:id` | Yes | Get detailed click stats |
| GET | `/:shortCode` | No | Public redirect endpoint |

## 📝 Assumptions Made
- The app assumes a single-user context (no collaborative teams).
- No email verification is implemented for the hackathon version.
- Device detection relies on the `UA-Parser-JS` library on the backend.

---
This project is a part of a hackathon run by https://katomaran.com
