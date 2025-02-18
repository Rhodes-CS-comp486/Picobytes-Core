import sqlite3
import os

class TF_QuestionFetcher:
    def __init__(self, db_filename="qa.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", db_filename))

    def pull_questions(self):
        try:
            conn = sqlite3.connect(self.db_path)
            c = conn.cursor()

            # Changed the query to join questions and true_false tables
            c.execute('''
                SELECT q.qid, q.qtext, q.qlevel, tf.correct 
                FROM questions q 
                JOIN true_false tf ON q.qid = tf.qid 
                WHERE q.qtype = 'tf' AND q.qactive = 1
            ''')
            questions = c.fetchall()
            conn.close()
            return questions

        except Exception as e:
            print(f"Error fetching questions: {e}")
            return []

    def get_question_by_id(self, qid):
        try:
            conn = sqlite3.connect(self.db_path)
            c = conn.cursor()

            # Query to fetch a specific question by ID
            c.execute('''
                SELECT q.qid, q.qtext, q.qlevel, tf.correct 
                FROM questions q 
                JOIN true_false tf ON q.qid = tf.qid 
                WHERE q.qid = ? AND q.qtype = 'tf' AND q.qactive = 1
            ''', (qid,))
            question = c.fetchone()
            conn.close()
            return question

        except Exception as e:
            print(f"Error fetching question by ID: {e}")
            return None

