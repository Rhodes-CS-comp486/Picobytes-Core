import sqlite3
import os
import psycopg
from psycopg.rows import dict_row
from Picobytes.backend.db_info import *

class QuestionService:
    def __init__(self, db_filename="pico.db"):
        """Initialize the connection to the SQLite database located one directory above."""
        self.db_url = f"host=dbclass.rhodescs.org dbname=pico user={DBUSER} password={DBPASS}"

    def _connect(self):
        """Establish and return a database connection."""
        return psycopg.connect(self.db_url)


    def pull_questions(self):
        try:
            conn = self._connect()
            c = conn.cursor()
            c.execute('''
                SELECT q.qid, q.qtext, q.qlevel, tf.correct 
                FROM questions q 
                JOIN true_false tf ON q.qid = tf.qid 
                WHERE q.qtype = 'tf' AND q.qactive = True
            ''')
            questions = c.fetchall()
            conn.close()
            return questions
        
        except Exception as e:
            print(f"Error fetching questions: {e}")
            return []


    def get_question_by_id(self, question_id):
        """Fetch a specific question by its ID."""
        conn =  psycopg.connect(self.db_url, row_factory=dict_row)
        cursor = conn.cursor()
        cursor.execute("select qid, qtext, correct, qtype, qlevel, qtopic from true_false natural join questions where qactive = True and true_false.qid = %s", (question_id,))
        question = cursor.fetchone()
        conn.close()
        return question

#if __name__ == '__main__':
    #service = QuestionService()
    #questions = service.pull_questions()
    # Commenting out the loop that prints each question
    # for question in questions:
    #     print(question)