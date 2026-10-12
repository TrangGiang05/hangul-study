import sys
import unittest
from unittest.mock import MagicMock, patch

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from fastapi.testclient import TestClient

from app.main import app
from app.services.gemini import (
    _build_prompt,
    _build_turn_input,
    _load_content,
    ask_gemini,
)
from app.services.mock_ai import mock_ask_gemini
from app.services.session_store import session_store


class TestContextAnchoring(unittest.TestCase):
    """
    Test suite for AI Tutor Context Anchoring and Conversation Isolation.
    Verifies that questions with demonstratives ('từ này', 'cấu trúc này')
    faithfully anchor to the currently active learning item rather than drifting.
    """

    def setUp(self):
        session_store._sessions.clear()
        self.client = TestClient(app)
        self.vocab_context = {
            "courseId": "tong-hop",
            "bookId": "book-01",
            "lessonId": "lesson-01",
            "module": "vocabulary",
            "contentId": "L01-V001",
            "itemTitle": "한국",
        }
        self.grammar_context = {
            "courseId": "tong-hop",
            "bookId": "book-01",
            "lessonId": "lesson-01",
            "module": "grammar",
            "contentId": "L01-G001",
            "itemTitle": "입니다",
        }

    # =========================================================================
    # 1. CONTENT LOADING & ANCHORING PROMPTS
    # =========================================================================

    def test_load_content_finds_real_vocab_item(self):
        """Verify _load_content retrieves 한국 for L01-V001 in lesson-01."""
        item = _load_content(self.vocab_context)
        self.assertIsNotNone(item)
        self.assertEqual(item.get("korean"), "한국")
        self.assertEqual(item.get("meaning"), "Hàn Quốc")

    def test_load_content_finds_real_grammar_item(self):
        """Verify _load_content retrieves 입니다 for L01-G001 in lesson-01."""
        item = _load_content(self.grammar_context)
        self.assertIsNotNone(item)
        self.assertIn("입니다", item.get("title", ""))

    def test_load_content_returns_none_for_invalid_content_id(self):
        """Verify _load_content does not guess or return first item when ID is invalid."""
        invalid_ctx = dict(self.vocab_context)
        invalid_ctx["contentId"] = "INVALID_ID_9999"
        item = _load_content(invalid_ctx)
        self.assertIsNone(item)

    def test_build_prompt_anchors_vocabulary_turn_1(self):
        """Verify turn-1 prompt explicitly designates the active vocabulary item and anchoring rule."""
        prompt = _build_prompt("Ý nghĩa của từ này", self.vocab_context)
        self.assertIn("한국", prompt)
        self.assertIn("Hàn Quốc", prompt)
        self.assertIn("từ này", prompt)
        self.assertIn("mặc định đối tượng được hỏi chính là mục trong 'Ngữ cảnh học tập hiện tại'", prompt)

    def test_build_turn_input_anchors_vocabulary_subsequent_turns(self):
        """Verify multi-turn turn_input embeds active context header even with previous_interaction_id."""
        turn_input = _build_turn_input("Đặt 2 câu ví dụ thực tế", self.vocab_context)
        self.assertIn("[NGỮ CẢNH ĐANG MỞ: Người học đang xem thẻ từ vựng '한국'", turn_input)
        self.assertIn("nghĩa: Hàn Quốc", turn_input)
        self.assertIn("Quy tắc neo ngữ cảnh", turn_input)
        self.assertIn("Đặt 2 câu ví dụ thực tế", turn_input)

    def test_build_prompt_handles_invalid_content_id_safely(self):
        """Verify invalid contentId triggers warning and instruction not to invent content."""
        invalid_ctx = dict(self.vocab_context)
        invalid_ctx["contentId"] = "L01-NONEXISTENT"
        prompt = _build_prompt("Giải thích từ này", invalid_ctx)
        self.assertIn("L01-NONEXISTENT", prompt)
        self.assertIn("CẢNH BÁO: Không tìm thấy mục này", prompt)
        self.assertIn("tuyệt đối không tự bịa thông tin", prompt)

    # =========================================================================
    # 2. MOCK AI DETERMINISTIC CONTEXT TESTS (E2E simulation)
    # =========================================================================

    def test_mock_ai_test_a_vocab_anchoring(self):
        """
        Test A: User was discussing other words previously, now opens 한국 card and asks 'Ý nghĩa của từ này'.
        Must explain 한국 (Hàn Quốc). Then asks 'Đặt 2 câu ví dụ thực tế', must provide 2 examples for 한국.
        """
        # Turn 1:
        ans1, int1 = mock_ask_gemini("Ý nghĩa của từ này", self.vocab_context)
        self.assertIn("한국", ans1)
        self.assertIn("Hàn Quốc", ans1)

        # Turn 2:
        ans2, int2 = mock_ask_gemini("Đặt 2 câu ví dụ thực tế", self.vocab_context, previous_interaction_id=int1)
        self.assertIn("한국", ans2)
        self.assertIn("1.", ans2)
        self.assertIn("2.", ans2)

    def test_mock_ai_test_d_grammar_anchoring(self):
        """
        Test D: User opens grammar item 입니다 and asks 'Cấu trúc này dùng thế nào?'.
        Must explain 입니다 structure and meaning.
        """
        ans, _ = mock_ask_gemini("Cấu trúc này dùng thế nào?", self.grammar_context)
        self.assertIn("입니다", ans)
        self.assertIn("Cấu trúc kết hợp", ans)

    def test_mock_ai_test_e_invalid_content_id(self):
        """
        Test E: Invalid contentId does NOT pick first item or invent words.
        """
        invalid_ctx = dict(self.vocab_context)
        invalid_ctx["contentId"] = "UNKNOWN_ITEM_X"
        ans, _ = mock_ask_gemini("Ý nghĩa của từ này", invalid_ctx)
        self.assertIn("Không tìm thấy mục nội dung có mã 'UNKNOWN_ITEM_X'", ans)
        self.assertNotIn("Hàn Quốc", ans)

    # =========================================================================
    # 3. FASTAPI ENDPOINT INTEGRATION & MULTI-TURN CONVERSATION ISOLATION
    # =========================================================================

    @patch("app.main.ask_gemini")
    def test_chat_endpoint_turn_1_passes_full_context(self, mock_ask):
        """Verify /ai/chat passes all context fields including itemTitle to ask_gemini."""
        mock_ask.return_value = ("Giải thích về 한국", "int_vocab_turn_1")

        res = self.client.post("/ai/chat", json={
            "message": "Ý nghĩa của từ này",
            "context": self.vocab_context,
            "conversationId": None,
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["answer"], "Giải thích về 한국")
        self.assertIsNotNone(data["conversationId"])

        # Check call arguments
        mock_ask.assert_called_once_with(
            message="Ý nghĩa của từ này",
            context=self.vocab_context,
            previous_interaction_id=None,
        )

    @patch("app.main.ask_gemini")
    def test_chat_endpoint_turn_2_reuses_interaction_id_with_context(self, mock_ask):
        """Verify turn 2 in same conversation maintains previous_interaction_id."""
        mock_ask.side_effect = [
            ("Giải thích về 한국", "int_vocab_turn_1"),
            ("2 ví dụ về 한국", "int_vocab_turn_2"),
        ]

        res1 = self.client.post("/ai/chat", json={
            "message": "Ý nghĩa của từ này",
            "context": self.vocab_context,
            "conversationId": None,
        })
        conv_id = res1.json()["conversationId"]

        res2 = self.client.post("/ai/chat", json={
            "message": "Đặt 2 câu ví dụ",
            "context": self.vocab_context,
            "conversationId": conv_id,
        })
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.json()["answer"], "2 ví dụ về 한국")

        # Second call must have previous_interaction_id="int_vocab_turn_1"
        self.assertEqual(mock_ask.call_count, 2)
        second_kwargs = mock_ask.call_args_list[1][1]
        self.assertEqual(second_kwargs["previous_interaction_id"], "int_vocab_turn_1")


if __name__ == "__main__":
    unittest.main()
