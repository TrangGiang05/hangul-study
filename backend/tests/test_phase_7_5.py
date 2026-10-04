import io
import sys
import unittest
from unittest.mock import MagicMock, patch

# Ensure UTF-8 output for Windows console
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.services.gemini import (
    LOOKUP_GRAMMAR_TOOL,
    LOOKUP_VOCABULARY_TOOL,
    _get_lesson_grammar,
    _is_safe_identifier,
    _load_content,
    ask_gemini,
    lookup_grammar,
    lookup_vocabulary,
)


class TestPhase75GrammarTool(unittest.TestCase):
    """Test suite for Phase 7.5 Grammar AI Tool / Function Calling."""

    def test_01_exact_grammar_title(self):
        """TEST 1: Exact grammar title search finds correct item."""
        result = lookup_grammar("입니다")
        self.assertTrue(result["found"], "Should find grammar point for '입니다'")
        self.assertGreater(result["count"], 0)
        item = result["items"][0]
        self.assertEqual(item["id"], "L01-G001")
        self.assertEqual(item["title"], "입니다")
        self.assertIn("Danh từ + 입니다", item["pattern"])
        self.assertIn("Là...", item["meaning"])
        self.assertGreater(len(item["examples"]), 0)

    def test_02_grammar_punctuation_and_particles(self):
        """TEST 2: Grammar with punctuation/pattern such as '은/는' and '입니까?'."""
        # Query with slash and Korean particles: '은/는'
        res_slash = lookup_grammar("은/는")
        self.assertTrue(res_slash["found"], "Should find grammar point for '은/는'")
        self.assertEqual(res_slash["items"][0]["id"], "L01-G003")

        # Query with particle '은'
        res_particle = lookup_grammar("은")
        self.assertTrue(res_particle["found"], "Should find grammar point for '은'")
        self.assertEqual(res_particle["items"][0]["id"], "L01-G003")

        # Query with question mark: '입니까?'
        res_question = lookup_grammar("입니까?")
        self.assertTrue(res_question["found"], "Should find grammar point for '입니까?'")
        self.assertEqual(res_question["items"][0]["id"], "L01-G002")

        # Query without question mark: '입니까'
        res_no_question = lookup_grammar("입니까")
        self.assertTrue(res_no_question["found"], "Should find grammar point for '입니까'")
        self.assertEqual(res_no_question["items"][0]["id"], "L01-G002")

    def test_03_vietnamese_meaning_search(self):
        """TEST 3: Vietnamese meaning search."""
        # Search by meaning keywords
        result = lookup_grammar("tiểu từ chủ đề")
        self.assertTrue(result["found"], "Should find grammar point by meaning 'tiểu từ chủ đề'")
        self.assertEqual(result["items"][0]["id"], "L01-G003")

        # Search by meaning 'Là...'
        result_meaning = lookup_grammar("Là...")
        self.assertTrue(result_meaning["found"], "Should find grammar point by meaning 'Là...'")

    def test_04_grammar_pattern_search(self):
        """TEST 4: Grammar pattern search."""
        result = lookup_grammar("Danh từ + 입니다")
        self.assertTrue(result["found"], "Should find grammar point by pattern 'Danh từ + 입니다'")
        self.assertEqual(result["items"][0]["id"], "L01-G001")

        result_q = lookup_grammar("Danh từ + 입니까?")
        self.assertTrue(result_q["found"], "Should find grammar point by pattern 'Danh từ + 입니까?'")
        self.assertEqual(result_q["items"][0]["id"], "L01-G002")

    def test_05_grammar_id_search(self):
        """TEST 5: Grammar ID search."""
        result = lookup_grammar("L01-G001")
        self.assertTrue(result["found"], "Should find grammar point for 'L01-G001'")
        self.assertEqual(result["items"][0]["id"], "L01-G001")
        self.assertEqual(result["items"][0]["title"], "입니다")

        result_g2 = lookup_grammar("l01-g002")
        self.assertTrue(result_g2["found"], "Should find grammar point for case-insensitive 'l01-g002'")
        self.assertEqual(result_g2["items"][0]["id"], "L01-G002")

    def test_06_not_found_result(self):
        """TEST 6: Not-found result."""
        result = lookup_grammar("ngữ pháp tương lai không tồn tại")
        self.assertFalse(result["found"], "Should return found=False for non-existent grammar")
        self.assertEqual(result["count"], 0)
        self.assertEqual(result["items"], [])
        self.assertIn("Không tìm thấy", result["message"])

    def test_07_path_traversal_and_unsafe_identifier_rejection(self):
        """TEST 7: Path traversal and argument sanitization."""
        # Unsafe lesson_id
        res_traversal = lookup_grammar("입니다", lesson_id="../../secret")
        self.assertTrue(res_traversal["found"], "Should safely ignore traversal lesson_id and fall back safely")

        # Empty/invalid queries
        self.assertFalse(lookup_grammar("")["found"])
        self.assertFalse(lookup_grammar("   ")["found"])
        self.assertFalse(lookup_grammar(None)["found"])
        self.assertFalse(lookup_grammar("a" * 150)["found"])

        # Data access helper directly with invalid path
        self.assertEqual(_get_lesson_grammar("tong-hop", "book-01", "../../secret"), [])
        self.assertEqual(_get_lesson_grammar("../../etc", "book-01", "lesson-01"), [])

    def test_08_maximum_two_results(self):
        """TEST 8: Enforce maximum 2 results returned."""
        # Query that could match multiple entries (e.g. 'Danh từ' matches all 3 patterns)
        result = lookup_grammar("Danh từ")
        self.assertTrue(result["found"])
        self.assertLessEqual(result["count"], 2, "Must return at most 2 grammar results")
        self.assertLessEqual(len(result["items"]), 2, "Items array must have at most 2 elements")

    @patch("app.services.gemini.client.interactions.create")
    def test_09_correct_tool_dispatch_for_grammar(self, mock_create):
        """TEST 9: Multi-tool dispatcher routes correctly to lookup_grammar."""
        # Turn 1: model returns function_call for lookup_grammar
        fc_step = MagicMock()
        fc_step.type = "function_call"
        fc_step.name = "lookup_grammar"
        fc_step.id = "call_grammar_1"
        fc_step.arguments = {"query": "입니다"}

        turn1 = MagicMock(id="int_1", steps=[fc_step], output_text=None)

        # Turn 2: model generates final explanation
        turn2 = MagicMock(
            id="int_2",
            steps=[MagicMock(type="model_output", content=[{"text": "Cấu trúc 입니다 dùng để giới thiệu."}])],
            output_text="Cấu trúc 입니다 dùng để giới thiệu.",
        )

        mock_create.side_effect = [turn1, turn2]

        answer = ask_gemini("Ngữ pháp 입니다 là gì?", {"lessonId": "lesson-01"})

        self.assertEqual(mock_create.call_count, 2)
        # Verify turn 2 was called with previous_interaction_id
        second_call = mock_create.call_args_list[1][1]
        self.assertEqual(second_call["previous_interaction_id"], "int_1")
        self.assertEqual(second_call["input"][0]["name"], "lookup_grammar")
        self.assertIn("Danh từ + 입니다", second_call["input"][0]["result"][0]["text"])
        self.assertEqual(answer, "Cấu trúc 입니다 dùng để giới thiệu.")

    @patch("app.services.gemini.client.interactions.create")
    def test_10_vocabulary_tool_regression(self, mock_create):
        """TEST 10: Multi-tool dispatcher continues to correctly route lookup_vocabulary."""
        fc_step = MagicMock()
        fc_step.type = "function_call"
        fc_step.name = "lookup_vocabulary"
        fc_step.id = "call_vocab_1"
        fc_step.arguments = {"query": "한국"}

        turn1 = MagicMock(id="int_v1", steps=[fc_step], output_text=None)
        turn2 = MagicMock(
            id="int_v2",
            steps=[MagicMock(type="model_output", content=[{"text": "한국 nghĩa là Hàn Quốc."}])],
            output_text="한국 nghĩa là Hàn Quốc.",
        )

        mock_create.side_effect = [turn1, turn2]

        answer = ask_gemini("Từ 한국 nghĩa là gì?", {"lessonId": "lesson-01"})

        self.assertEqual(mock_create.call_count, 2)
        second_call = mock_create.call_args_list[1][1]
        self.assertEqual(second_call["previous_interaction_id"], "int_v1")
        self.assertEqual(second_call["input"][0]["name"], "lookup_vocabulary")
        self.assertIn("Hàn Quốc", second_call["input"][0]["result"][0]["text"])
        self.assertEqual(answer, "한국 nghĩa là Hàn Quốc.")

    @patch("app.services.gemini.client.interactions.create")
    def test_11_one_tool_call_round_only(self, mock_create):
        """TEST 11: Enforces strictly maximum one tool-call round per user request."""
        # Even if Turn 2 returns another function_call, ask_gemini returns immediately without looping
        fc_step1 = MagicMock()
        fc_step1.type = "function_call"
        fc_step1.name = "lookup_grammar"
        fc_step1.id = "call_1"
        fc_step1.arguments = {"query": "입니다"}

        turn1 = MagicMock(id="int_1", steps=[fc_step1], output_text=None)

        # In turn 2, imagine model outputs text along with another step
        turn2 = MagicMock(
            id="int_2",
            steps=[MagicMock(type="model_output", content=[{"text": "Giải thích ngữ pháp 입니다."}])],
            output_text="Giải thích ngữ pháp 입니다.",
        )

        mock_create.side_effect = [turn1, turn2]

        answer = ask_gemini("Giải thích 입니다", {})
        # Must execute exactly 2 interactions (Turn 1 and Turn 2), no Turn 3
        self.assertEqual(mock_create.call_count, 2)
        self.assertEqual(answer, "Giải thích ngữ pháp 입니다.")


if __name__ == "__main__":
    unittest.main()
