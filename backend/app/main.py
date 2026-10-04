from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.gemini import ask_gemini
from app.services.session_store import session_store

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
    conversationId: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    conversationId: str


@app.post("/ai/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    context_dict = request.context.model_dump()

    # Retrieve or create session via in-memory session store
    session = session_store.get_or_create(request.conversationId, context=context_dict)

    # Call Gemini with chaining to the last interaction ID
    answer, last_interaction_id = ask_gemini(
        message=request.message,
        context=context_dict,
        previous_interaction_id=session.last_interaction_id,
    )

    # Update session with the final interaction ID from this turn
    session_store.update_last_interaction(session.id, last_interaction_id)

    return {
        "answer": answer,
        "conversationId": session.id,
    }