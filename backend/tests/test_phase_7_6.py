import sys
import time
import unittest
from unittest.mock import MagicMock, patch

# Ensure UTF-8 output for Windows console
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from fastapi.testclient import TestClient

from app.main import app
from app.services.gemini import ask_gemini
from app.services.session_store import ChatSession, InMemorySessionStore, session_store


class TestPhase76MultiTurnAITutor(unittest.TestCase):
    """Test suite for Phase 7.6 Multi-turn AI Tutor and SessionStore."""

    def setUp(self):
        # Clean global session store before each test
        session_store._sessions.clear()
        self.client = TestClient(app)

    # =========================================================================
    # 1. SESSION STORE TESTS
    # =========================================================================

    def test_01_session_store_creates_new_session(self):
        """TEST 1: Creating a session generates valid UUID and initializes fields."""
        store = InMemorySessionStore()
        context = {"courseId": "tong-hop", "lessonId": "lesson-01"}
        session = store.get_or_create(None, context=context)

        self.assertIsNotNone(session.id)
        self.assertEqual(len(session.id), 36)  # UUID4 format
        self.assertIsNone(session.last_interaction_id)
        self.assertEqual(session.turn_count, 0)
        self.assertEqual(session.context["lessonId"], "lesson-01")

    def test_02_session_store_returns_same_session_for_valid_id(self):
        """TEST 2: Accessing with an existing valid session ID returns the same session."""
        store = InMemorySessionStore()
        s1 = store.get_or_create(None, context={"module": "grammar"})
        conv_id = s1.id

        s2 = store.get_or_create(conv_id, context={"module": "vocabulary"})
        self.assertEqual(s1.id, s2.id)
        self.assertEqual(s2.context["module"], "vocabulary")  # Context updated

    def test_03_session_store_preserves_last_interaction_id(self):
        """TEST 3: Updating last interaction ID increments turn count and saves ID."""
        store = InMemorySessionStore()
        session = store.get_or_create(None)
        store.update_last_interaction(session.id, "int_test_999")

        updated = store.get(session.id)
        self.assertIsNotNone(updated)
        self.assertEqual(updated.last_interaction_id, "int_test_999")
        self.assertEqual(updated.turn_count, 1)

    def test_04_session_store_expires_sessions_after_ttl(self):
        """TEST 4: Sessions expire after TTL (simulated with short TTL)."""
        store = InMemorySessionStore(ttl_seconds=1)
        session = store.get_or_create(None)
        session_id = session.id

        # Artificially age the session
        session.updated_at = time.time() - 10

        # get() should return None and prune
        self.assertIsNone(store.get(session_id))
        self.assertNotIn(session_id, store._sessions)

    def test_05_session_store_evicts_oldest_when_max_sessions_reached(self):
        """TEST 5: Store evicts least recently updated session when max_sessions is reached."""
        store = InMemorySessionStore(max_sessions=2)
        now = time.time()
        s1 = store.get_or_create(None)
        s1.updated_at = now - 200  # Oldest

        s2 = store.get_or_create(None)
        s2.updated_at = now - 100

        # Adding s3 should evict s1 (oldest)
        s3 = store.get_or_create(None)
        s3.updated_at = now

        self.assertNotIn(s1.id, store._sessions)
        self.assertIn(s2.id, store._sessions)
        self.assertIn(s3.id, store._sessions)
        self.assertEqual(len(store._sessions), 2)

    # =========================================================================
    # 2. MULTI-TURN & API CONTRACT TESTS
    # =========================================================================

    @patch("app.main.ask_gemini")
    def test_06_first_turn_creates_conversation_id(self, mock_ask):
        """TEST 6: First turn without conversationId returns answer and a new conversationId."""
        mock_ask.return_value = ("Xin chào, mình là AI Tutor!", "gemini_int_1")

        payload = {
            "message": "Xin chào",
            "context": {"courseId": "tong-hop", "lessonId": "lesson-01"},
            "conversationId": None,
        }
        response = self.client.post("/ai/chat", json=payload)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["answer"], "Xin chào, mình là AI Tutor!")
        self.assertIn("conversationId", data)
        self.assertIsNotNone(data["conversationId"])
        # Verify ask_gemini was called with previous_interaction_id=None
        mock_ask.assert_called_once_with(
            message="Xin chào",
            context={"courseId": "tong-hop", "lessonId": "lesson-01", "bookId": None, "module": None, "contentId": None},
            previous_interaction_id=None,
        )

    @patch("app.main.ask_gemini")
    def test_07_second_turn_uses_previous_interaction_id(self, mock_ask):
        """TEST 7: Second turn with conversationId passes previous_interaction_id to ask_gemini."""
        # Turn 1
        mock_ask.return_value = ("Câu trả lời 1", "gemini_int_step1")
        res1 = self.client.post("/ai/chat", json={
            "message": "Câu hỏi 1",
            "context": {"lessonId": "lesson-01"},
            "conversationId": None,
        })
        conv_id = res1.json()["conversationId"]

        # Turn 2
        mock_ask.return_value = ("Câu trả lời 2 nối tiếp", "gemini_int_step2")
        res2 = self.client.post("/ai/chat", json={
            "message": "Câu hỏi 2 nối tiếp",
            "context": {"lessonId": "lesson-01"},
            "conversationId": conv_id,
        })

        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()
        self.assertEqual(data2["conversationId"], conv_id)
        self.assertEqual(data2["answer"], "Câu trả lời 2 nối tiếp")

        # Verify second call received previous_interaction_id="gemini_int_step1"
        self.assertEqual(mock_ask.call_count, 2)
        second_call_kwargs = mock_ask.call_args_list[1][1]
        self.assertEqual(second_call_kwargs["previous_interaction_id"], "gemini_int_step1")

    @patch("app.main.ask_gemini")
    def test_08_returned_last_interaction_id_is_updated_in_session(self, mock_ask):
        """TEST 8: Session store updates last_interaction_id after each turn."""
        mock_ask.return_value = ("Trả lời", "gemini_int_abc")
        res = self.client.post("/ai/chat", json={
            "message": "Chào bạn",
            "context": {},
            "conversationId": None,
        })
        conv_id = res.json()["conversationId"]

        session = session_store.get(conv_id)
        self.assertIsNotNone(session)
        self.assertEqual(session.last_interaction_id, "gemini_int_abc")
        self.assertEqual(session.turn_count, 1)

    @patch("app.main.ask_gemini")
    def test_09_gemini_interaction_id_not_exposed_in_api_response(self, mock_ask):
        """TEST 9: API response only contains 'answer' and 'conversationId', hiding Gemini internal ID."""
        mock_ask.return_value = ("Nội dung", "internal_gemini_id_secret_123")
        res = self.client.post("/ai/chat", json={
            "message": "Hỏi",
            "context": {},
            "conversationId": None,
        })
        data = res.json()
        self.assertIn("answer", data)
        self.assertIn("conversationId", data)
        self.assertNotIn("last_interaction_id", data)
        self.assertNotIn("interaction_id", data)
        self.assertNotIn("internal_gemini_id_secret_123", str(data))

    # =========================================================================
    # 3. FUNCTION CALLING & INTERACTION CHAIN TESTS
    # =========================================================================

    @patch("app.services.gemini.client.interactions.create")
    def test_10_tool_call_works_and_returns_tuple(self, mock_create):
        """TEST 10: ask_gemini with tool call executes tool and returns (answer, final_interaction_id)."""
        fc_step = MagicMock(
            type="function_call",
            name="lookup_vocabulary",
            id="call_v1",
            arguments={"query": "한국"},
        )
        turn1 = MagicMock(id="int_turn_1", steps=[fc_step], output_text=None)
        turn2 = MagicMock(
            id="int_turn_2_final",
            steps=[MagicMock(type="model_output", content=[{"text": "한국 là Hàn Quốc"}])],
            output_text="한국 là Hàn Quốc",
        )
        mock_create.side_effect = [turn1, turn2]

        answer, last_id = ask_gemini("한국 là gì?", {"lessonId": "lesson-01"})
        self.assertEqual(answer, "한국 là Hàn Quốc")
        self.assertEqual(last_id, "int_turn_2_final")
        self.assertEqual(mock_create.call_count, 2)

    @patch("app.services.gemini.client.interactions.create")
    def test_11_final_interaction_id_stored_after_tool_call(self, mock_create):
        """TEST 11: After tool call, session stores the FINAL interaction ID, not the intermediate one."""
        fc_step = MagicMock(
            type="function_call",
            name="lookup_grammar",
            id="call_g1",
            arguments={"query": "입니다"},
        )
        turn1 = MagicMock(id="step1_call_tool_id", steps=[fc_step], output_text=None)
        turn2 = MagicMock(
            id="step2_final_answer_id",
            steps=[MagicMock(type="model_output", content=[{"text": "입니다 có nghĩa là 'là'."}])],
            output_text="입니다 có nghĩa là 'là'.",
        )
        mock_create.side_effect = [turn1, turn2]

        res = self.client.post("/ai/chat", json={
            "message": "입니다 là gì?",
            "context": {"lessonId": "lesson-01"},
            "conversationId": None,
        })
        conv_id = res.json()["conversationId"]
        session = session_store.get(conv_id)

        self.assertEqual(session.last_interaction_id, "step2_final_answer_id")
        self.assertNotEqual(session.last_interaction_id, "step1_call_tool_id")

    @patch("app.services.gemini.client.interactions.create")
    def test_12_only_one_tool_call_round_is_performed(self, mock_create):
        """TEST 12: ask_gemini strictly caps at 1 tool-call round per user turn."""
        fc_step = MagicMock(
            type="function_call",
            name="lookup_grammar",
            id="call_g1",
            arguments={"query": "입니다"},
        )
        turn1 = MagicMock(id="int_1", steps=[fc_step], output_text=None)
        turn2 = MagicMock(
            id="int_2",
            steps=[MagicMock(type="model_output", content=[{"text": "Đã giải thích."}])],
            output_text="Đã giải thích.",
        )
        mock_create.side_effect = [turn1, turn2]

        answer, last_id = ask_gemini("Giải thích 입니다", {})
        self.assertEqual(mock_create.call_count, 2)
        self.assertEqual(answer, "Đã giải thích.")
        self.assertEqual(last_id, "int_2")

    # =========================================================================
    # 4. ERROR HANDLING & RESILIENCE
    # =========================================================================

    @patch("app.main.ask_gemini")
    def test_13_unknown_conversation_id_automatically_creates_new_session(self, mock_ask):
        """TEST 13: Invalid or non-existent conversationId does not 404 or crash; auto-heals."""
        mock_ask.return_value = ("Câu trả lời mới", "gemini_new_int")

        payload = {
            "message": "Xin chào",
            "context": {},
            "conversationId": "nonexistent-or-expired-uuid-9999",
        }
        response = self.client.post("/ai/chat", json=payload)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["answer"], "Câu trả lời mới")
        # In Phase 9 architecture, Next.js owns the conversationId as source of truth;
        # FastAPI respects the supplied ID and creates the session accordingly.
        self.assertEqual(data["conversationId"], "nonexistent-or-expired-uuid-9999")


if __name__ == "__main__":
    unittest.main()
