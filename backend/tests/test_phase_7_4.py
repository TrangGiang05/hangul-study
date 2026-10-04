import io
import sys
import unittest
from unittest.mock import MagicMock, patch

# Ensure UTF-8 output for Windows console
if sys.stdout and hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from app.services.gemini import (
    LOOKUP_VOCABULARY_TOOL,
    _get_lesson_vocabulary,
    _is_safe_identifier,
    _load_content,
    ask_gemini,
    lookup_vocabulary,
)


class TestPhase74VocabularyTool(unittest.TestCase):
    """Test suite for Phase 7.4 AI Tool / Function Calling."""

    def test_01_lookup_by_korean_word(self):
        """TEST 1: lookup_vocabulary('한국') finds the correct vocabulary item."""
        result = lookup_vocabulary("한국")
        self.assertTrue(result["found"], "Should find vocabulary item for '한국'")
        self.assertGreater(result["count"], 0)
        items = result["items"]
        self.assertEqual(items[0]["korean"], "한국")
        self.assertEqual(items[0]["meaning"], "Hàn Quốc")
        self.assertEqual(items[0]["id"], "L01-V001")

    def test_02_lookup_by_vietnamese_meaning(self):
        """TEST 2: lookup_vocabulary('Hàn Quốc') finds the corresponding vocabulary item."""
        result = lookup_vocabulary("Hàn Quốc")
        self.assertTrue(result["found"], "Should find vocabulary item for 'Hàn Quốc'")
        self.assertGreater(result["count"], 0)
        items = result["items"]
        matched = any(item["korean"] == "한국" for item in items)
        self.assertTrue(matched, "Should include '한국' for meaning 'Hàn Quốc'")

    def test_03_lookup_by_id(self):
        """TEST 3: lookup_vocabulary('L01-V001') finds the correct item by ID."""
        result = lookup_vocabulary("L01-V001")
        self.assertTrue(result["found"], "Should find vocabulary item for 'L01-V001'")
        self.assertEqual(result["count"], 1)
        self.assertEqual(result["items"][0]["id"], "L01-V001")
        self.assertEqual(result["items"][0]["korean"], "한국")

    def test_04_lookup_non_existent(self):
        """TEST 4: lookup_vocabulary('something-that-does-not-exist') returns found=false."""
        result = lookup_vocabulary("something-that-does-not-exist")
        self.assertFalse(result["found"], "Should not find non-existent item")
        self.assertEqual(result["count"], 0)
        self.assertEqual(result["items"], [])
        self.assertIn("Không tìm thấy", result["message"])

    def test_05_security_and_sanitization(self):
        """Verify path traversal prevention and argument sanitization."""
        # Path traversal in lesson_id
        res_traversal = lookup_vocabulary("한국", lesson_id="../../secret")
        self.assertTrue(res_traversal["found"], "Should fall back safely to valid lessons without error")

        # Invalid identifier check
        self.assertFalse(_is_safe_identifier("../../etc/passwd"))
        self.assertFalse(_is_safe_identifier(""))
        self.assertFalse(_is_safe_identifier(None))
        self.assertTrue(_is_safe_identifier("lesson-01"))
        self.assertTrue(_is_safe_identifier("tong-hop"))

        # Empty and invalid queries
        self.assertFalse(lookup_vocabulary("")["found"])
        self.assertFalse(lookup_vocabulary("   ")["found"])
        self.assertFalse(lookup_vocabulary(None)["found"])
        self.assertFalse(lookup_vocabulary("a" * 150)["found"])

    def test_06_data_access_helpers(self):
        """Verify _get_lesson_vocabulary and _load_content refactoring."""
        # Valid lesson
        vocab = _get_lesson_vocabulary("tong-hop", "book-01", "lesson-01")
        self.assertIsInstance(vocab, list)
        self.assertGreater(len(vocab), 0)

        # Invalid lesson
        vocab_empty = _get_lesson_vocabulary("tong-hop", "book-01", "non-existent")
        self.assertEqual(vocab_empty, [])

        # _load_content with vocabulary
        context_vocab = {
            "courseId": "tong-hop",
            "bookId": "book-01",
            "lessonId": "lesson-01",
            "module": "vocabulary",
            "contentId": "L01-V001",
        }
        item_vocab = _load_content(context_vocab)
        self.assertIsNotNone(item_vocab)
        self.assertEqual(item_vocab["korean"], "한국")

        # _load_content with grammar (unchanged behavior)
        context_grammar = {
            "courseId": "tong-hop",
            "bookId": "book-01",
            "lessonId": "lesson-01",
            "module": "grammar",
            "contentId": "L01-G001",
        }
        item_grammar = _load_content(context_grammar)
        self.assertIsNotNone(item_grammar)
        self.assertEqual(item_grammar["title"], "입니다")

    def test_07_tool_schema_structure(self):
        """Verify the Gemini function tool declaration schema."""
        self.assertEqual(LOOKUP_VOCABULARY_TOOL["type"], "function")
        self.assertEqual(LOOKUP_VOCABULARY_TOOL["name"], "lookup_vocabulary")
        params = LOOKUP_VOCABULARY_TOOL["parameters"]
        self.assertEqual(params["type"], "object")
        self.assertIn("query", params["properties"])
        self.assertIn("lesson_id", params["properties"])
        self.assertEqual(params["required"], ["query"])

    @patch("app.services.gemini.client.interactions.create")
    def test_08_ask_gemini_without_tool_call(self, mock_create):
        """TEST 6 (Mock): Normal question without tool call returns direct answer."""
        mock_interaction = MagicMock()
        mock_interaction.output_text = "Xin chào! Mình có thể giúp gì cho bạn?"
        mock_interaction.steps = [
            MagicMock(type="model_output", content=[{"text": "Xin chào! Mình có thể giúp gì cho bạn?"}])
        ]
        mock_create.return_value = mock_interaction

        answer = ask_gemini("Xin chào bạn", {})
        self.assertEqual(answer, "Xin chào! Mình có thể giúp gì cho bạn?")
        self.assertEqual(mock_create.call_count, 1)

    @patch("app.services.gemini.client.interactions.create")
    def test_09_ask_gemini_with_tool_call(self, mock_create):
        """TEST 5 (Mock): Question triggers tool call, executes lookup, and returns final answer."""
        # Turn 1 response: model issues function_call
        fc_step = MagicMock()
        fc_step.type = "function_call"
        fc_step.name = "lookup_vocabulary"
        fc_step.id = "call_test_123"
        fc_step.arguments = {"query": "한국"}

        turn1_interaction = MagicMock()
        turn1_interaction.id = "interaction_1"
        turn1_interaction.steps = [fc_step]
        turn1_interaction.output_text = None

        # Turn 2 response: model receives function_result and outputs final text
        turn2_interaction = MagicMock()
        turn2_interaction.id = "interaction_2"
        turn2_interaction.steps = [
            MagicMock(type="model_output", content=[{"text": "Từ '한국' có nghĩa là Hàn Quốc."}])
        ]
        turn2_interaction.output_text = "Từ '한국' có nghĩa là Hàn Quốc."

        mock_create.side_effect = [turn1_interaction, turn2_interaction]

        answer = ask_gemini("Từ 한국 có nghĩa là gì?", {"lessonId": "lesson-01"})

        self.assertEqual(mock_create.call_count, 2)
        # Verify turn 2 was called with previous_interaction_id
        second_call_kwargs = mock_create.call_args_list[1][1]
        self.assertEqual(second_call_kwargs["previous_interaction_id"], "interaction_1")
        self.assertEqual(second_call_kwargs["input"][0]["type"], "function_result")
        self.assertEqual(second_call_kwargs["input"][0]["call_id"], "call_test_123")
        self.assertIn("Hàn Quốc", second_call_kwargs["input"][0]["result"][0]["text"])

        self.assertEqual(answer, "Từ '한국' có nghĩa là Hàn Quốc.")


if __name__ == "__main__":
    unittest.main()
