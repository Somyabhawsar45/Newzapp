import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient(os.getenv("MONGODB_URL"))
db = client["newzapp"]
users = db["users"]


class Article(BaseModel):
    title: Optional[str] = ""
    description: Optional[str] = ""
    url: Optional[str] = ""
    urlToImage: Optional[str] = ""
    publishedAt: Optional[str] = ""
    source: Optional[dict] = {}


class RecommendRequest(BaseModel):
    user_id: str
    candidate_articles: List[Article]


@app.get("/")
def root():
    return {"status": "Recommender running"}


@app.post("/recommend")
def recommend(req: RecommendRequest):
    # 1. Fetch user history from MongoDB
    user = users.find_one({"_id": __import__('bson').ObjectId(req.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    history = user.get("readHistory", []) + user.get("savedArticles", [])

    # 2. Need at least 2 history items for meaningful recommendations
    if len(history) < 2:
        return {"recommendations": [], "reason": "not_enough_history"}

    # 3. Build corpus: history + candidates
    history_texts = [
        f"{a.get('title', '')} {a.get('description', '')}".strip()
        for a in history
    ]
    candidate_texts = [
        f"{a.title} {a.description}".strip()
        for a in req.candidate_articles
    ]

    # Filter out empty candidates
    valid_indices = [i for i, t in enumerate(candidate_texts) if t.strip()]
    if not valid_indices:
        return {"recommendations": []}

    corpus = history_texts + [candidate_texts[i] for i in valid_indices]

    # 4. TF-IDF vectorization
    vectorizer = TfidfVectorizer(stop_words='english', max_features=500)
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
    except ValueError:
        return {"recommendations": []}

    # 5. User profile = mean of history vectors
    history_vectors = tfidf_matrix[:len(history_texts)]
    candidate_vectors = tfidf_matrix[len(history_texts):]
    user_profile = np.asarray(history_vectors.mean(axis=0))

    # 6. Cosine similarity between user profile and each candidate
    scores = cosine_similarity(user_profile, candidate_vectors)[0]

    # 7. Rank and return top 5
    scored = sorted(
        [(valid_indices[i], float(scores[i])) for i in range(len(valid_indices))],
        key=lambda x: x[1], reverse=True
    )

    top5 = [
        {**req.candidate_articles[idx].dict(), "score": score}
        for idx, score in scored[:5]
        if score > 0.01  # filter truly irrelevant
    ]

    return {"recommendations": top5}