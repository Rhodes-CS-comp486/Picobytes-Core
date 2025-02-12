import sqlite3
import os

class QuestionService:
    def __init__(self), db_filename='qa.db'):
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".." db_filename))

    def pull_questions(self):
        try:
            conn = sqlite3.connect('self.db_path')
            c = conn.cursor()

            c.execute('SELECT * FROM tf_questions')
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

