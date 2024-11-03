from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
import pickle

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model and vectorizer
# Note: In a real application, you would have trained models saved
vectorizer = CountVectorizer()
vectorizer.fit(['spam example', 'ham example'])  # Simple example

class EmailRequest(BaseModel):
    content: str

@app.post("/classify")
async def classify_email(request: EmailRequest):
    # Transform the input text
    text_vectorized = vectorizer.transform([request.content])
    
    # Simple rule-based classification for demo
    # In a real application, you would use your loaded ML model here
    spam_keywords = ['buy now', 'free', 'winner', 'lottery', 'viagra', 'discount']
    is_spam = any(keyword in request.content.lower() for keyword in spam_keywords)
    
    return {
        "prediction": "spam" if is_spam else "ham",
        "confidence": 0.85 if is_spam else 0.92
    }