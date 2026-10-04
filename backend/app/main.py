from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.gemini import ask_gemini

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


class LearningContext(BaseModel):
    """
    Structured learning context sent from the frontend to the AI Tutor.

    Fields
    ------
    courseId  : Identifies the course (e.g. "tong-hop").
    bookId    : Identifies the book inside the course (e.g. "book-01").
    lessonId  : Identifies the lesson (e.g. "lesson-01").
    module    : The active learning module ("vocabulary" | "grammar" | "practice" | "lesson").
    contentId : The stable ID of the specific item being studied (e.g. "L01-V001").
                Empty string means the user is asking a general question, not about a specific item.
    """

    courseId: Optional[str] = None
    bookId: Optional[str] = None
    lessonId: Optional[str] = None
    module: Optional[str] = None
    contentId: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    context: LearningContext


@app.post("/ai/chat")
def chat(request: ChatRequest):
    answer = ask_gemini(
        request.message,
        request.context.model_dump(),
    )

    return {"answer": answer}