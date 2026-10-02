from fastapi import FastAPI
from pydantic import BaseModel

from app.services.gemini import ask_gemini

app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok"}


class ChatContext(BaseModel):
    type: str
    vocab: str
    meaning: str


class ChatRequest(BaseModel):
    message: str
    context: ChatContext


@app.post("/ai/chat")
def chat(request: ChatRequest):
    answer = ask_gemini(
        request.message,
        request.context.model_dump()
    )

    return {
        "answer": answer
    }