import unittest
import sqlite3
import os
import sys

# Add the parent directory of 'services' to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.tf_question_pull import QuestionService
from services.mc_question_pull import MC_QuestionFetcher
from create_test_db import Test_DB_Setup

class TestTFQuestionPull(unittest.TestCase):
    def setUp(self):
        # Set up a test database
        def create_table():
            try:
                # creating questions table
                connection = sqlite3.connect("test_qa.db")
                cursor = connection.cursor()

                cursor.execute("""
                            CREATE TABLE IF NOT EXISTS questions (
                            qid INTEGER PRIMARY KEY AUTOINCREMENT,
                            qtext TEXT NOT NULL,
                            qtype TEXT NOT NULL,
                            qlevel TEXT NOT NULL,
                            qtopic TEXT NOT NULL,
                            qactive BOOLEAN NOT NULL
                        );""")

                connection.commit()
                print("questions table created successfully")

                # creating True/False Table
                cursor.execute("""
                        CREATE TABLE IF NOT EXISTS true_false (
                            qid INTEGER PRIMARY KEY,  -- Matches qid from questions
                            correct BOOLEAN NOT NULL,
                            FOREIGN KEY (qid) REFERENCES questions(qid) ON DELETE CASCADE
                            );""")

                connection.commit()

                print("true_false table created successfully")

                # creating Multiple choice Table
                cursor.execute("""
                                CREATE TABLE IF NOT EXISTS multiple_choice (
                                    qid INTEGER PRIMARY KEY,  -- Matches qid from questions
                                    option1 STRING NOT NULL,
                                    option2 STRING NOT NULL,
                                    option3 STRING NOT NULL,
                                    option4 STRING NOT NULL,
                                    answer INTEGER CHECK (answer BETWEEN 1 AND 4),
                                    FOREIGN KEY (qid) REFERENCES questions(qid) ON DELETE CASCADE
                                    );""")

                connection.commit()

                print("true_false table created successfully")

            except Exception as e:
                print(f"Error creating table: {e}")



    def add_data(self):
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "qa_test.db"))
        self.connection = sqlite3.connect(self.db_path)
        self.cursor = self.connection.cursor()


        # Insert sample data
        self.cursor.execute("INSERT INTO questions (qtext, qtype, qlevel, qtopic, qactive) VALUES ('Is the sky blue?', 'tf', 'easy', 'test', 1)")
        self.cursor.execute("INSERT INTO true_false (qid, correct) VALUES (1, 1)")
        self.cursor.execute("INSERT INTO questions (qtext, qtype, qlevel, qtopic, qactive) VALUES ('Is fire cold?', 'tf', 'easy', 'test', 1)")
        self.cursor.execute("INSERT INTO true_false (qid, correct) VALUES (2, 0)")
        self.cursor.execute("INSERT INTO questions(qtext, qtype, qlevel, qtopic, qactive) VALUES('What color is the sky?', 'multiple_choice', 'easy', 'test', 1)")
        self.cursor.execute("INSERT INTO multiple_choice(qid, option1, option2, option3, option4, answer) VALUES((SELECT last_insert_rowid()), 'blue', 'green', 'red', 'yellow', 1)")
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
        (1, 'Is the sky blue?', 'easy', 'test', 1),
        (2, 'Is fire cold?', 'easy', 'test', 0)
    ]
    self.assertEqual(result, expected_result)

def test_mc_pull_questions(self):
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
    service = MC_QuestionFetcher(db_path=self.db_path)

    # Fetch questions and verify the results
    result = service.get_question_by_id(self, 2)
    expected_result = [
        (1, 'What color is the sky?', 'green', 1),
    ]
    self.assertEqual(result, expected_result)

if __name__ == '__main__':
    unittest.main()