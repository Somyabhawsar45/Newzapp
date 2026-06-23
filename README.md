# NewsSync 📰

> A full-stack AI-powered news aggregator with personalised recommendations, real-time trending, and Groq-powered article summarization.

🔗 **Live Demo:** [newzapp-nine.vercel.app](https://newzapp-nine.vercel.app)

---

## Features

- **✨ AI Summarization** — Summarize any article in 3 bullet points using Groq (LLaMA 3.1 8B). One click, instant insight.
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
| Auth | JWT, bcryptjs |
| ML Service | FastAPI, scikit-learn (TF-IDF + cosine similarity) |
| APIs | GNews API, Groq API (LLaMA 3.1 8B) |
| Deployment | Vercel (frontend), dotenvx |

---

## Architecture
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

│              │    │ Groq API            │

│ Users,       │    └─────────────────────┘

│ readHistory, │

│ savedArticles│

└──────────────┘

---

## Getting Started

### Prerequisites
- Node.js v18+, Python 3.9+, MongoDB Atlas account, GNews API key, Groq API key

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

---

## Key Implementation Details

**AI Summarization** — The ✨ button on every card calls Groq's LLaMA 3.1 8B via the backend and returns a 3-bullet summary. Cached in component state to avoid re-fetching.

**ML Recommendations** — FastAPI fetches the user's read history from MongoDB, builds a TF-IDF matrix, and scores candidate articles from 7 categories using cosine similarity. Gracefully falls back if history is insufficient.

**Trending Algorithm** — Aggregates read history across all users with a configurable time window (24h / 7d / all time). Surfaces keywords by article spread, not raw frequency, to avoid single-article spikes.

**Rate Limit Handling** — GNews responses cached server-side for 6 hours. Automatically falls back to a backup API key if the primary hits its daily limit.

------

## Author

**Somya Bhawsar** — IET DAVV Indore (2027)

*Built to demonstrate full-stack development, ML integration, and production-ready API design.*