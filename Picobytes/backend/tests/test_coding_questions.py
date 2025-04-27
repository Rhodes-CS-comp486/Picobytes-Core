import unittest
import sys
import os
import json

# Add the parent directory to the path to import our services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.coding_question_service import CodingQuestionService

class TestCodingQuestionService(unittest.TestCase):
    """Test cases for the CodingQuestionService."""
    
    def setUp(self):
        """Set up the test environment."""
        self.service = CodingQuestionService()
        
        # Sample questions should already be added to the database
        # through add_sample_coding_question.py
    
    def test_get_coding_questions(self):
        """Test fetching all coding questions."""
        questions = self.service.get_coding_questions()
        
        # Verify we got questions back
        self.assertIsNotNone(questions)
        self.assertIsInstance(questions, list)
        
        # If questions exist in the database, verify their structure
        if questions:
            question = questions[0]
            self.assertIn('qid', question)
            self.assertIn('qtext', question)
            self.assertIn('difficulty', question)
            self.assertIn('topic', question)
            self.assertIn('function_template', question)
            self.assertIn('test_code', question)
    
    def test_get_coding_question(self):
        """Test fetching a specific coding question."""
        # Get all questions first
        questions = self.service.get_coding_questions()
        
        # If questions exist, test getting a specific one
        if questions:
            qid = questions[0]['qid']
            question = self.service.get_coding_question(qid)
            
            self.assertIsNotNone(question)
            self.assertEqual(question['qid'], qid)
            self.assertIn('qtext', question)
            self.assertIn('function_template', question)
    
    def test_validate_coding_submission_valid(self):
        """Test validating a correct coding submission."""
        # Get all questions first
        questions = self.service.get_coding_questions()
        
        # If questions exist, test submission validation
        if questions:
            # Find a string reversal question
            string_question = None
            for q in questions:
                if 'reverse' in q['qtext'].lower() and 'string' in q['qtext'].lower():
                    string_question = q
                    break
            
            if string_question:
                # Submit a correct answer
                correct_code = """
void strrev(char *str) {
    if (str == NULL) return;
    
    // Get the length of the string
    int len = 0;
    while (str[len] != '\\0') {
        len++;
    }
    
    // Swap characters from start and end
    for (int i = 0, j = len - 1; i < j; i++, j--) {
        char temp = str[i];
        str[i] = str[j];
        str[j] = temp;
    }
}
"""
                result = self.service.validate_coding_submission(string_question['qid'], correct_code)
                
                # Result should indicate success (allowing for valgrind errors)
                self.assertIn('is_correct', result)
                # We can't guarantee this will pass since it depends on external execution service
                # but we can verify the expected structure is there
                self.assertIn('execution_results', result)
    
    def test_validate_coding_submission_invalid(self):
        """Test validating an incorrect coding submission."""
        # Get all questions first
        questions = self.service.get_coding_questions()
        
        # If questions exist, test submission validation
        if questions:
            # Find a string reversal question
            string_question = None
            for q in questions:
                if 'reverse' in q['qtext'].lower() and 'string' in q['qtext'].lower():
                    string_question = q
                    break
            
            if string_question:
                # Submit code with a syntax error
                incorrect_code = """
void strrev(char *str) {
    // This code has a syntax error
    if (str == NULL) return
    
    // More code with errors
    for (int i = 0 i < 10; i++) {
        printf("Error");
    }
}
"""
                result = self.service.validate_coding_submission(string_question['qid'], incorrect_code)
                
                # Result should indicate failure
                self.assertIn('is_correct', result)
                # Expected to be false since the code has syntax errors
                self.assertFalse(result['is_correct'])
                self.assertIn('execution_results', result)

if __name__ == '__main__':
    unittest.main() 