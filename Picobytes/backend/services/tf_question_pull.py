import sqlite3
import os

class QuestionService:
    def __init__(self, db_filename="qa.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", db_filename))

    def _connect(self):
        """Establish and return a database connection."""
        return sqlite3.connect(self.db_path)

    def pull_questions(self):
        try:
            conn = self._connect()
            c = conn.cursor()
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
            # Keep error logging
            print(f"Error fetching TF questions: {e}")
            return []


    def get_question_by_id(self, question_id):
        """Fetch a specific question by its ID."""
        conn = self._connect()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("select qid, qtext, correct, qtype, qlevel, qtopic from true_false natural join questions where qactive = 1 and true_false.qid = ?", (question_id,))
        question = cursor.fetchone()
        conn.close()
        return question

if __name__ == '__main__':
    service = QuestionService()
    questions = service.pull_questions()
    # Commenting out the loop that prints each question
    # for question in questions:
    #     print(question)