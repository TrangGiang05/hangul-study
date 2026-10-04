import time
import uuid
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ChatSession:
    """
    In-memory representation of an AI Tutor conversation session.

    Fields
    ------
    id                  : Application-generated UUID identifying the conversation.
    last_interaction_id : The final Gemini interaction ID from the previous turn.
                          None for the very first turn of a new conversation.
    context             : The most recent LearningContext dict associated with this session.
    turn_count          : Number of completed turns in this conversation.
    created_at          : Unix timestamp when the session was created.
    updated_at          : Unix timestamp when the session was last active.
    """

    id: str
    last_interaction_id: Optional[str] = None
    context: dict = field(default_factory=dict)
    turn_count: int = 0
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)


class InMemorySessionStore:
    """
    Lightweight, thread-safe in-memory session store for Phase 7.6.
    Enforces TTL expiration (24h) and a maximum capacity limit (1000 sessions).
    """

    def __init__(self, ttl_seconds: int = 86400, max_sessions: int = 1000):
        self.ttl_seconds = ttl_seconds
        self.max_sessions = max_sessions
        self._sessions: dict[str, ChatSession] = {}

    def get(self, session_id: Optional[str]) -> Optional[ChatSession]:
        """Retrieve a session if it exists and is not expired."""
        if not session_id or session_id not in self._sessions:
            return None

        session = self._sessions[session_id]
        if time.time() - session.updated_at > self.ttl_seconds:
            del self._sessions[session_id]
            return None

        return session

    def get_or_create(self, session_id: Optional[str], context: Optional[dict] = None) -> ChatSession:
        """
        Retrieve an active session by session_id, or safely create a new one.
        Never crashes or raises 404 on unknown or expired session_id.
        """
        now = time.time()

        if session_id and session_id in self._sessions:
            session = self._sessions[session_id]
            if now - session.updated_at <= self.ttl_seconds:
                if context:
                    session.context = context
                session.updated_at = now
                return session
            # Expired session
            del self._sessions[session_id]

        # Enforce capacity
        self.cleanup()
        if len(self._sessions) >= self.max_sessions:
            # Evict least recently updated session
            oldest_id = min(self._sessions, key=lambda sid: self._sessions[sid].updated_at)
            del self._sessions[oldest_id]

        new_id = str(uuid.uuid4())
        session = ChatSession(id=new_id, context=context or {}, created_at=now, updated_at=now)
        self._sessions[new_id] = session
        return session

    def update_last_interaction(self, session_id: str, last_interaction_id: str) -> None:
        """Update the session with the latest interaction ID from Gemini."""
        if session_id in self._sessions:
            session = self._sessions[session_id]
            session.last_interaction_id = last_interaction_id
            session.turn_count += 1
            session.updated_at = time.time()

    def cleanup(self) -> int:
        """Purge sessions that have exceeded the TTL limit."""
        now = time.time()
        expired_ids = [
            sid for sid, session in self._sessions.items()
            if now - session.updated_at > self.ttl_seconds
        ]
        for sid in expired_ids:
            del self._sessions[sid]
        return len(expired_ids)


# Global singleton instance for application use
session_store = InMemorySessionStore()
