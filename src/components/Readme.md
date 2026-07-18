# NewsSync


**NewsSync** is a full-stack live news aggregator with personalised recommendations, trending analytics, and a clean responsive UI.

🔗 **Live Demo** → [newzapp-nine.vercel.app](https://newzapp-nine.vercel.app)

---

## Features

- 🌍 **Global & India news feeds** across 8 categories — General, Business, Sports, Technology, Entertainment, Health, Science
- 🔥 **Trending Dashboard** — live analytics showing trending topics, category breakdowns, and hot articles (24h / 7 days / All time)
- 🧠 **Personalised For You** — ML-powered recommendations using TF-IDF + cosine similarity via a FastAPI microservice
- 🔍 **Debounced search** across all news with instant results
- 🔖 **Save articles** — bookmark articles and access them anytime
- 🌗 **Dark / Light mode** — persistent theme toggle
- 👤 **User auth** — JWT-based login/signup with avatar and profile dropdown
- ⚡ **AI Summarizer** — one-click article summaries powered by Groq (llama3-8b-8192)
- 📱 **Fully responsive** — works on mobile, tablet, and desktop

---

## Tech Stack

### Frontend
| Tech | Usage |
|------|-------|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Bootstrap 5 | Layout & responsive grid |
| CSS Variables | Light/dark theming |

### Backend
| Tech | Usage |
|------|-------|
| Node.js + Express | REST API server |
| MongoDB Atlas | User data & read history |
| JWT | Authentication |
| GNews API | Live news source |
| Groq API | AI article summarizer |

### ML Microservice
| Tech | Usage |
|------|-------|
| FastAPI | Python microservice |
| TF-IDF + Cosine Similarity | Personalised recommendations |
| scikit-learn | Vectorization |

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Frontend │────▶│  Express Backend  │────▶│  MongoDB Atlas  │
│   (Vercel)       │     │  (Render)         │     │                 │
└────────┬────────┘     └────────┬─────────┘     └─────────────────┘
         │                       │
         │                       ▼
         │              ┌──────────────────┐
         └─────────────▶│ FastAPI ML Service│
                        │ (Render)          │
                        └──────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB Atlas account
- GNews API key
- Groq API key

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/newssync.git
cd newssync
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
GNEWS_API_KEY=your_gnews_key
GROQ_API_KEY=your_groq_key
```

```bash
npm start
```

### 3. Frontend setup

```bash
cd client
npm install
```

Create a `.env` file:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_RECOMMENDER_URL=http://localhost:8000
```

```bash
npm start
```

### 4. ML microservice setup

```bash
cd recommender
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| ML Service | Render |
| Database | MongoDB Atlas |

---

## Screenshots

> _Add screenshots here_

---

## License

MIT © 2025 Somya