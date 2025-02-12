import sqlite3
import os

class QuestionService:
    def __init__(self, db_filename='qa.db'):
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
        
if __name__ == '__main__':
    service = QuestionService()
    questions = service.pull_questions()
    for question in questions:
        print(question)

