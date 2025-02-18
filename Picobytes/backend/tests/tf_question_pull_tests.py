import unittest
import sqlite3
import os
import sys

# Add the parent directory of 'services' to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.tf_question_pull import QuestionService

class TestTFQuestionPull(unittest.TestCase):
    def setUp(self):
        # Set up a test database
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "qa.db"))
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
        # Debug prints to verify database setup
        print(f"Test DB Path: {self.db_path}")
        print("Database contents:")
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT * FROM questions")
        print("Questions table:", c.fetchall())
        c.execute("SELECT * FROM true_false")
        print("True_false table:", c.fetchall())
        conn.close()
        
        # Initialize the QuestionService with the test database path
        service = QuestionService(db_path=self.db_path)
        
        # Fetch questions and verify the results
        result = service.pull_questions()
        expected_result = [
            (1, 'Is the sky blue?', 'easy', 1),
            (2, 'Is fire cold?', 'easy', 0)
        ]
        self.assertEqual(result, expected_result)

if __name__ == '__main__':
    unittest.main()