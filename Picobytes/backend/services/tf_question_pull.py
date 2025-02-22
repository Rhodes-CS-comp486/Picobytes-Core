import sqlite3
import os

class QuestionService:
    def __init__(self, db_path=None):
        """Initialize the connection to the SQLite database.
        Args:
            db_path: Full path to database. If None, uses default location.
        """
        if db_path is None:
            # Use default path relative to service file
            self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "qa.db"))
        else:
            # Use provided path
            self.db_path = db_path

    def pull_questions(self):
        try:
            print(f"Using database path: {self.db_path}")
            conn = sqlite3.connect(self.db_path)
            c = conn.cursor()
            c.execute('''
                SELECT q.qid, q.qtext, q.qlevel, tf.correct 
                FROM questions q 
                JOIN true_false tf ON q.qid = tf.qid 
                WHERE q.qtype = 'tf' AND q.qactive = 1
            ''')
            questions = c.fetchall()
            print(f"Fetched t/f questions: {questions}")
            conn.close()
            return questions
        
        except Exception as e:
            print(f"Error fetching questions: {e}")
            return []

if __name__ == '__main__':
    service = QuestionService()
    questions = service.pull_questions()
    for question in questions:
        print(question)