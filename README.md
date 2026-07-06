# NewsSync 📰
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Live-brightgreen)

> A full-stack AI-powered news aggregator with personalised recommendations, real-time trending, Redis caching, and Groq-powered interactive AI features.

🔗 **Live Demo:** [newzapp-nine.vercel.app](https://newzapp-nine.vercel.app)

---

## Features

- **✨ AI Summarization** — Summarize any article in 3 bullet points using Groq (LLaMA 3.3 70B).
- **⚖️ Perspective Generator** — "Other Side" tab generates a balanced alternative viewpoint for any article.
- **💬 Ask the Article** — Context-aware Q&A chat. Ask any question about an article and get an AI answer grounded in its content.
- **⚡ Redis Caching** — News API responses cached in Upstash Redis (cloud) for 6 hours, with graceful fallback to in-memory Map cache if Redis is unavailable.
- **🧠 Personalised For You** — ML-based recommendation engine (TF-IDF + cosine similarity) built with FastAPI. Learns from your reading history.
- **🔥 Trending Dashboard** — Real-time trending topics and category breakdowns from aggregated read history via MongoDB.
- **🔖 Saved Articles** — Bookmark articles persisted per user in MongoDB, synced across devices and sessions.
- **🔐 JWT Authentication** — Secure signup/login with bcrypt password hashing and 7-day JWT tokens.
- **🌍 Region Toggle** — Switch between Global (US) and India news feeds.
- **🔍 Debounced Search** — Search across all news with 500ms debounce to minimise API calls.
- **🌙 Dark Mode** — Persistent dark/light mode toggle.
- **♾️ Infinite Scroll** — Seamless pagination with deduplication.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Context API |
| Backend | Node.js, Express, MongoDB Atlas, Mongoose |
| Caching | Redis (Upstash cloud) with in-memory fallback |
| Auth | JWT, bcryptjs |
| ML Service | FastAPI, scikit-learn (TF-IDF + cosine similarity) |
| AI | Groq API (LLaMA 3.3 70B) |
| News Data | GNews API (with backup key fallback) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Architecture

```
┌──────────────────────────────────────┐
│         React Frontend               │
│    newzapp-nine.vercel.app           │
└────────────┬─────────────┬───────────┘
             │             │
             ▼             ▼
┌────────────────┐  ┌─────────────────────┐
│ Node/Express   │  │ FastAPI Recommender  │
│ (port 5000)    │  │ (port 8000)          │
│                │  │ TF-IDF + Cosine      │
│ Auth, News,    │  │ Similarity on user   │
│ Saved, History,│  │ read history         │
│ Trending, AI   │  └─────────────────────┘
└──────┬─────────┘
       │
       ▼
┌──────────────┐    ┌─────────────────────┐
│ MongoDB Atlas│    │ GNews API           │
│              │    │ Groq API (LLaMA)    │
│ Users,       │    │ Upstash Redis       │
│ readHistory, │    └─────────────────────┘
│ savedArticles│
└──────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js v18+, Python 3.9+, MongoDB Atlas account, GNews API key, Groq API key, Upstash Redis URL

### Install & Run

```bash
# Clone
git clone https://github.com/Somyabhawsar45/newzapp.git
cd newzapp

# Install dependencies
npm install

# Terminal 1 — frontend + backend
npm run dev

# Terminal 2 — ML recommender
cd recommender
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Environment Variables (`.env`)
```
MONGODB_URL=your_mongodb_url
GNEWS_API_KEY=your_gnews_key
GNEWS_API_KEY_2=your_backup_gnews_key
GROQ_API_KEY=your_groq_key
JWT_SECRET=your_jwt_secret
REDIS_URL=rediss://your_upstash_redis_url
```

---

## 🧠 Engineering Decisions

**Redis Caching** — News API responses cached in Upstash Redis for 6 hours using the query string as cache key. If Redis is down, falls back to an in-memory `Map` cache automatically — zero downtime.

**AI Summarization** — The ✨ button calls Groq's LLaMA 3.3 70B and returns a 3-bullet summary. Cached in component state to avoid re-fetching.

**Perspective Generator** — The ⚖️ "Other Side" tab sends the article title and description to Groq and returns 3 concise counter-arguments or alternative viewpoints.

**Ask the Article** — The 💬 "Ask AI" tab maintains a chat history and sends each question along with the article context to Groq, which answers strictly based on available content.

**ML Recommendations** — FastAPI fetches the user's read history from MongoDB, builds a TF-IDF matrix, and scores candidate articles from 7 categories using cosine similarity. Gracefully falls back if history is insufficient.

**Trending Algorithm** — Aggregates read history across all users with a configurable time window (24h / 7d / all time). Surfaces keywords by article spread, not raw frequency, to avoid single-article spikes.

**Rate Limit Handling** — GNews responses cached for 6 hours. Automatically falls back to a backup API key if the primary hits its daily limit.

---

## Author

**Somya Bhawsar** — IET DAVV Indore (2027)

*Built to demonstrate full-stack development, ML integration, Redis caching, and production-ready AI-powered API design.*