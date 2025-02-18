import unittest
import sqlite3
import os
import sys

# Add the parent directory to the system path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend')))

from services.tf_question_pull import TF_QuestionFetcher as QuestionService

class TestTFQuestionPull(unittest.TestCase):
    def setUp(self):
        # Set up a test database
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "test_qa.db"))
        self.connection = sqlite3.connect(self.db_path)
        self.cursor = self.connection.cursor()
        
        # Create tables
        self.cursor.execute("""
            CREATE TABLE questions (
                qid INTEGER PRIMARY KEY AUTOINCREMENT,
                qtext TEXT NOT NULL,
                qtype TEXT NOT NULL,
                qlevel TEXT NOT NULL,
                qactive BOOLEAN NOT NULL
            );
        """)
        self.cursor.execute("""
            CREATE TABLE true_false (
                qid INTEGER PRIMARY KEY,
                correct BOOLEAN NOT NULL,
                FOREIGN KEY (qid) REFERENCES questions(qid) ON DELETE CASCADE
            );
        """)
        self.connection.commit()

        # Insert sample data
        self.cursor.execute("INSERT INTO questions (qtext, qtype, qlevel, qactive) VALUES ('Is the sky blue?', 'tf', 'easy', 1)")
        self.cursor.execute("INSERT INTO true_false (qid, correct) VALUES (1, 1)")
        self.cursor.execute("INSERT INTO questions (qtext, qtype, qlevel, qactive) VALUES ('Is fire cold?', 'tf', 'easy', 1)")
        self.cursor.execute("INSERT INTO true_false (qid, correct) VALUES (2, 0)")
        self.connection.commit()

    def tearDown(self):
        # Close and remove the test database
        self.connection.close()
        os.remove(self.db_path)

    def test_pull_questions(self):
        # Initialize the QuestionService with the test database path
        service = QuestionService(db_filename="test_qa.db")
        
        # Fetch questions and verify the results
        result = service.pull_questions()
        expected_result = [
            (1, 'Is the sky blue?', 'easy', 1),
            (2, 'Is fire cold?', 'easy', 0)
        ]
        self.assertEqual(result, expected_result)

    def test_get_question_by_id(self):
        # Initialize the QuestionService with the test database path
        service = QuestionService(db_filename="test_qa.db")
        
        # Fetch a question by ID and verify the result
        result = service.get_question_by_id(1)
        expected_result = (1, 'Is the sky blue?', 'easy', 1)
        self.assertEqual(result, expected_result)

    def test_get_question_by_invalid_id(self):
        # Initialize the QuestionService with the test database path
        service = QuestionService(db_filename="test_qa.db")
        
        # Fetch a question by an invalid ID and verify the result
        result = service.get_question_by_id(999)
        self.assertIsNone(result)

    def test_pull_questions_empty_db(self):
        # Set up an empty test database
        self.cursor.execute("DELETE FROM questions")
        self.cursor.execute("DELETE FROM true_false")
        self.connection.commit()

        # Initialize the QuestionService with the test database path
        service = QuestionService(db_filename="test_qa.db")
        
        # Fetch questions and verify the results
        result = service.pull_questions()
        expected_result = []
        self.assertEqual(result, expected_result)

if __name__ == '__main__':
    unittest.main()