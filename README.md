# 📡 Channel Pro — MERN Stack News Platform

Clean, modern, fully-featured news platform.  
**React 19 frontend + Node.js/Express backend — completely separate.**

---

## 📁 Structure

```
channelpro/
├── backend/      ← Node.js + Express + MongoDB
│   ├── server.js
│   ├── .env
│   ├── seed.js          ← Run once to fill DB with 12 articles
│   ├── models/          User.js, Article.js
│   ├── controllers/     auth.js, articles.js
│   ├── routes/          auth.js, articles.js
│   └── middleware/      auth.js (JWT + rate limit)
│
└── frontend/     ← React 19
    ├── src/
    │   ├── App.js
    │   ├── pages/       Home, Articles, Article, Write, Login, Signup, Profile
    │   ├── components/  Navbar, ArticleCard
    │   ├── context/     AuthContext
    │   └── hooks/       useApi (axios)
    └── public/
```

---

## 🚀 Setup — Step by Step

### 1. Start MongoDB
Make sure MongoDB is running on your machine:
```bash
# Windows
net start MongoDB

# Mac/Linux
mongod
```

### 2. Setup & run Backend
```bash
cd backend
npm install
npm run seed      # ← IMPORTANT: fills DB with 12 sample articles
npm run dev       # runs on http://localhost:5000
```

### 3. Setup & run Frontend (new terminal)
```bash
cd frontend
npm install
npm start         # runs on http://localhost:3000
```

---

## 🔑 Demo Login
After running seed:
- **Username:** `admin`
- **Password:** `admin123`

---

## 📡 API Endpoints

### Auth
| Method | Route | Auth |
|--------|-------|------|
| POST | /api/auth/signup | ❌ |
| POST | /api/auth/login | ❌ |
| GET  | /api/auth/me | ✅ |
| PUT  | /api/auth/profile | ✅ |

### Articles
| Method | Route | Auth |
|--------|-------|------|
| GET    | /api/articles | ❌ |
| GET    | /api/articles/search?q= | ❌ |
| GET    | /api/articles/:id | ❌ |
| POST   | /api/articles | ✅ |
| PUT    | /api/articles/:id | ✅ |
| DELETE | /api/articles/:id | ✅ |
| POST   | /api/articles/:id/like | ✅ |
| POST   | /api/articles/:id/bookmark | ✅ |
| POST   | /api/articles/:id/comments | ✅ |
| DELETE | /api/articles/:id/comments/:cid | ✅ |

---

## 🔒 Security Features

- **Helmet** — secure HTTP headers
- **Rate limiting** — 200 req/15min globally, 20 req/15min on auth routes
- **Brute force protection** — account locks after 5 failed logins for 15 min
- **JWT** — expires in 7 days, verified on every protected route
- **XSS sanitization** — all user input cleaned via `xss` library
- **Payload size limit** — max 10kb JSON body
- **CORS** — only allows your frontend origin

---

## ✨ Features

- 🔐 JWT auth with brute-force protection
- 📝 Write, edit, delete articles
- ❤️ Like & 🔖 Bookmark articles
- 💬 Comments (add & delete)
- 🔍 Live search in navbar
- 🗂 Category + tag + sort filtering
- 📄 Pagination
- 🔥 Trending articles section
- ⭐ Featured article on homepage
- 📱 Fully responsive dark UI
- 👤 Profile page (edit bio & email)
- 🌱 12 real sample articles via seed script
